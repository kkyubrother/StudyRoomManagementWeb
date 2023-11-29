import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Navi from "../components/Navbar";
import { useEffect, useState } from "react";
import { getPays, getPaysByDate } from "../api/pays";
import moment from "moment";
import { splitPayType } from "../utils";
import DatePicker from "react-datepicker";
import { ProgressBar } from "react-bootstrap";

const demo_data = [
  {
    department: "정통",
    card: 10000,
    donation_card: 10000,
    donation_etc: 10000,
    saved_money: 5000,
    transfer: 1000,
    etc: 5000,
  },
];

const ACCOUNT_ITEM_OPTION = {
  maximumFractionDigits: 4,
};

const CustomDatePickerInput = ({ value, onClick }) => (
  <h1
    style={{ width: "100%", textAlign: "center" }}
    className={"button bg-primary text-white"}
    onClick={onClick}
  >
    {value}
    {"◀ 클릭시 변경 가능"}
  </h1>
);

const AccountTableItem = ({
  department,
  card = 0,
  donation_card = 0,
  donation_etc = 0,
  saved_money = 0,
  transfer = 0,
  etc = 0,
  variant = "white",
}) => (
  <tr>
    <td>{department}</td>
    <td>{card.toLocaleString("ko-KR", ACCOUNT_ITEM_OPTION)}</td>
    <td>{donation_card.toLocaleString("ko-KR", ACCOUNT_ITEM_OPTION)}</td>
    <td>{donation_etc.toLocaleString("ko-KR", ACCOUNT_ITEM_OPTION)}</td>
    <td>{saved_money.toLocaleString("ko-KR", ACCOUNT_ITEM_OPTION)}</td>
    <td>{transfer.toLocaleString("ko-KR", ACCOUNT_ITEM_OPTION)}</td>
    <td>{etc.toLocaleString("ko-KR", ACCOUNT_ITEM_OPTION)}</td>
  </tr>
);

const AccountsMain = (props) => {
  const [selected_date, setSelectedDate] = useState(Date.now());
  const [data, setData] = useState(demo_data);
  const [isLoadingPays, setIsLoadingPays] = useState(false);
  const [pays, setPays] = useState(
    new Array(31).fill({ date: moment(), value: 0 }),
  );
  const [progressNow, setProgressNow] = useState(0);

  const updateTodayPays = (result) => {
    setData(
      Object.entries(
        groupBy(
          result
            .filter((value) => value.status === "confirm")
            .filter((value) =>
              moment(value.created)
                .add(9, "hour")
                .isSame(moment(selected_date), "day"),
            )
            .map((value) => {
              const { t, department } = splitPayType(value);

              return {
                department: department,
                card: t === "card" ? value.paid : 0,
                donation_card: t === "donation.card" ? value.paid : 0,
                donation_etc: t === "donation.etc" ? value.paid : 0,
                saved_money: t === "saved_money.d" ? value.paid : 0,
                transfer: t === "transfer" ? value.paid : 0,
                etc: t === "etc" ? value.paid : 0,
              };
            }),
          "department",
        ),
      )
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map((value) => {
          return {
            department: value[0],
            card: sumDataReduce(value[1], "card"),
            donation_card: sumDataReduce(value[1], "donation_card"),
            donation_etc: sumDataReduce(value[1], "donation_etc"),
            saved_money: sumDataReduce(value[1], "saved_money"),
            transfer: sumDataReduce(value[1], "transfer"),
            etc: sumDataReduce(value[1], "etc"),
          };
        }),
    );
  };
  const updateMonthPays = (_) => {
    setPays([]);
    setProgressNow(0);
    const selectDate = moment(selected_date);
    const year = selectDate.year();
    const month = selectDate.month();
    const dateInMonth = [
      ...new Array(moment(selected_date).endOf("month").date()),
    ]
      .map((_, i) => i + 1)
      .map((d) =>
        moment().set("year", year).set("month", month).set("date", Number(d)),
      );

    const filterIsConfirm = (v) => v.status === "confirm";
    const toSplitByPayType = (v) => {
      const { t, department } = splitPayType(v);

      return {
        department: department,
        card: t === "card" ? v.paid : 0,
        donation_card: t === "donation.card" ? v.paid : 0,
        donation_etc: t === "donation.etc" ? v.paid : 0,
        saved_money: t === "saved_money.d" ? v.paid : 0,
        transfer: t === "transfer" ? v.paid : 0,
        etc: t === "etc" ? v.paid : 0,
      };
    };
    const mapReducer = (v) => {
      return {
        department: v[0],
        card: sumDataReduce(v[1], "card"),
        donation_card: sumDataReduce(v[1], "donation_card"),
        donation_etc: sumDataReduce(v[1], "donation_etc"),
        saved_money: sumDataReduce(v[1], "saved_money"),
        transfer: sumDataReduce(v[1], "transfer"),
        etc: sumDataReduce(v[1], "etc"),
      };
    };
    console.log(year, month, dateInMonth);

    (async () => {
      const result = [];
      for (const date of dateInMonth) {
        const pays = await getPays(date.format("yyyy-MM-DD"));
        const isCreatedSameDate = (v) =>
          moment(v.created).add(9, "hour").isSame(date, "day");

        const p = Object.entries(
          groupBy(
            pays
              .filter(filterIsConfirm)
              .filter(isCreatedSameDate)
              .map(toSplitByPayType),
            "department",
          ),
        )
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(mapReducer);

        const sumP = (key) =>
          p.map((v) => v[key]).reduce((prev, curr) => prev + curr, 0) -
          p
            .filter((value) => /refund.+/.test(value.department))
            .map((v) => v[key])
            .reduce((prev, curr) => prev + curr, 0) *
            2;

        result.push({
          date: date,
          study: sumP("card") + sumP("transfer"),
          donation: sumP("donation_card") + sumP("donation_etc"),
        });
        setProgressNow(Math.round((result.length / dateInMonth.length) * 100));
      }
      setPays(result);
      setIsLoadingPays(false);
    })();
  };

  useEffect(() => {
    setIsLoadingPays(true);
    (async () => {
      const date = moment(selected_date).format("yyyy-MM-DD");
      const pays = await getPays(date);
      updateTodayPays(pays);
      updateMonthPays(pays);
    })();
  }, [selected_date]);

  const sumData = (key) =>
    data.map((v) => v[key]).reduce((prev, curr) => prev + curr, 0) -
    data
      .filter((value) => /refund.+/.test(value.department))
      .map((v) => v[key])
      .reduce((prev, curr) => prev + curr, 0) *
      2;
  const sumDataReduce = function (data, key) {
    return data
      .map((value) => value[key])
      .reduce((prev, curr) => prev + curr, 0);
  };
  const groupBy = function (data, key) {
    return data.reduce(function (carry, el) {
      const group = el[key];

      if (carry[group] === undefined) {
        carry[group] = [];
      }

      carry[group].push(el);
      return carry;
    }, {});
  };

  return (
    <>
      <Navi />
      <Container>
        <Row>
          <Col lg={{ span: 8, offset: 1 }}>
            <DatePicker
              dateFormat="yyyy-MM-dd"
              selected={selected_date}
              onChange={setSelectedDate}
              customInput={<CustomDatePickerInput />}
            />
          </Col>
        </Row>
        <ProgressBar now={progressNow} />

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>이름</th>
              <th>총 매출</th>
              <th>순이익</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={1}>스터디룸</td>
              <td colSpan={1}>
                {(
                  sumData("card") +
                  // sumData('donation_card') +
                  // sumData('donation_etc') +
                  sumData("transfer")
                ).toLocaleString("ko-KR", ACCOUNT_ITEM_OPTION)}
              </td>
              <td colSpan={1}>-</td>
            </tr>
            <tr>
              <td colSpan={1}>적립</td>
              <td colSpan={1}>
                {(
                  sumData("donation_card") + sumData("donation_etc")
                ).toLocaleString("ko-KR", ACCOUNT_ITEM_OPTION)}
              </td>
              <td colSpan={1}>-</td>
            </tr>
          </tbody>
        </Table>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>지역</th>
              <th>카드 결제</th>
              <th>적립(카드)</th>
              <th>적립(기타)</th>
              <th>적립금 사용</th>
              <th>이체</th>
              <th>기타</th>
            </tr>
          </thead>

          <tbody>
            {data.map((value) => (
              <AccountTableItem
                department={value.department}
                card={value.card}
                donation_card={value.donation_card}
                donation_etc={value.donation_etc}
                saved_money={value.saved_money}
                transfer={value.transfer}
                etc={value.etc}
              />
            ))}
            <tr>
              <td colSpan={7}>{""}</td>
            </tr>
            <AccountTableItem
              department={"전체"}
              card={sumData("card")}
              donation_card={sumData("donation_card")}
              donation_etc={sumData("donation_etc")}
              saved_money={sumData("saved_money")}
              transfer={sumData("transfer")}
              etc={sumData("etc")}
            />
            <tr>
              <td colSpan={4}>
                전체 합(카드 + 적립(카드 + 기타) + 이체 - 적립 금액 제외)
              </td>
              <td colSpan={3}>
                {(
                  sumData("card") +
                  sumData("donation_card") +
                  sumData("donation_etc") +
                  sumData("transfer")
                ).toLocaleString("ko-KR", ACCOUNT_ITEM_OPTION)}
              </td>
            </tr>
          </tbody>
        </Table>
        <Table>
          <thead>
            <th>날짜</th>
            <th>대관</th>
            <th>적립</th>
          </thead>
          <tbody>
            {isLoadingPays ? (
              <tr>
                <td>
                  <Spinner animation={"border"} />
                </td>
                <td>
                  <Spinner animation={"border"} />
                </td>
                <td>
                  <Spinner animation={"border"} />
                </td>
              </tr>
            ) : (
              pays.map((v, i) => (
                <tr>
                  <td>{v.date.format("yyyy-MM-DD")}</td>
                  <td>{v.study}</td>
                  <td>{v.donation}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default AccountsMain;
