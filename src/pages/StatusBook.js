import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import { useEffect, useState } from "react";
import Navi from "../components/Navbar";
import moment from "moment";
import DatePicker from "react-datepicker";
import { getBooksByBookDate } from "../api/books";
import { Accordion, ProgressBar } from "react-bootstrap";
import { ko } from "date-fns/esm/locale";

const CustomDatePickerInput = ({ value, onClick }) => {
  return (
    <span
      className={"h1 d-inline-block bg-primary rounded text-white"}
      onClick={onClick}
    >
      {value}
    </span>
  );
};

const SUNDAY = 0;
const SATURDAY = 6;

const UserStatus = {
  ERROR: "error",
  NOT_ENTER: "not_enter",
  NOT_EXIT: "not_exit",
  EXITED: "exited",

  toColor: (status) => {
    switch (status) {
      case "error":
        return "danger";
      case "not_enter":
        return "secondary";
      case "not_exit":
        return "primary";
      case "exited":
        return "success";
      default:
        return null;
    }
  },
};
Object.freeze(UserStatus);
const DUE_TYPE = {
  WEEK: 1,
  MONTH: 2,
};
Object.freeze(DUE_TYPE);

const StatusBook = (props) => {
  const [startDate, setStartDate] = useState(Date.now());
  const [endDate, setEndDate] = useState(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [bookStatus, setBookStatus] = useState([]);
  const [bookDetailStatus, setBookDetailStatus] = useState([]);
  const [dueType, setDueType] = useState(DUE_TYPE.WEEK);
  const [progressNow, setProgressNow] = useState(0);

  const filterBook = (value) => {
    if (value.status === 400) return false;
    else if (value.pay && value.pay.pay_type.startsWith("etc.")) return false;
    return true;
  };

  const fetchData = async (selectDate, selectDateDuration) => {
    const dateArray = [...new Array(selectDateDuration)].map((_, i) =>
      moment(selectDate).add(i, "day").format("YYYY-MM-DD"),
    );
    const newDataList = (
      await Promise.allSettled(
        dateArray.map(async (v) => getBooksByBookDate(v)),
      )
    ).map((v) => v.value);

    let rental = {
      start_date: dateArray[0],
      end_date: dateArray[selectDateDuration - 1],
      seminar_total_count: 0,
      hall_total_count: 0,
      study_total_count: 0,
      study_total_sec: 0,
    };
    newDataList.forEach((valueAtDate) => {
      valueAtDate.filter(filterBook).forEach((v) => {
        if (!v.room) {
        } else if (v.room.type === 1) {
          rental.study_total_count++;
          const start_time_sec =
            Number(v.start_time.split(":")[0]) * 60 +
            Number(v.start_time.split(":")[1]);
          let end_time_sec =
            Number(v.end_time.split(":")[0]) * 60 +
            Number(v.end_time.split(":")[1]);
          if (end_time_sec === 1339) {
            end_time_sec = 1440;
          }
          rental.study_total_sec += end_time_sec - start_time_sec;
        } else if (v.room.type === 2) {
          rental.seminar_total_count++;
        } else if (v.room.type === 4) {
          rental.hall_total_count++;
        }
      });
    });
    return rental;
  };
  useEffect(() => {
    (async () => {
      setProgressNow(0);
      let progress_count = 0;
      const start_date = moment(startDate);
      const end_date = moment(endDate);
      const date_due = end_date.diff(start_date, "day") + 1;
      const readyList = [];

      for (let i = 0; i <= date_due; i++) {
        const date_in_for = moment(startDate).add(i, "day");

        // 하루씩 더하며 토요일이 있다면 추가함
        // 시작일과 끝 일을 포함해야 함으로, due + 1

        if (
          (dueType === DUE_TYPE.MONTH
            ? date_in_for.date() ===
              moment(date_in_for.format("yyyy-MM-DD")).endOf("month").date()
            : date_in_for.day() === SATURDAY) ||
          date_in_for.isSame(end_date, "day")
        ) {
          const result = {
            start_date: start_date.format("YYYY-MM-DD"),
            end_date: date_in_for.format("YYYY-MM-DD"),
            due: date_in_for.diff(start_date, "day") + 1,
          };
          readyList.push(result);
          start_date.add(result.due, "day");
        }
      }

      const result = [];
      for (const v of readyList) {
        progress_count++;
        setProgressNow(Math.round((progress_count / readyList.length) * 100));
        result.push({
          status: "fulfilled",
          value: await fetchData(v.start_date, v.due),
        });
      }

      setBookStatus(
        result.map((v, i) => {
          if (v.status !== "fulfilled") {
            return {
              start_date: readyList[i].start_date,
              end_date: readyList[i].end_date,
              due: readyList[i].due,
              seminar_total_count: -1,
              hall_total_count: -1,
              study_total_count: -1,
              study_total_sec: -1,
            };
          }
          return { ...v.value, due: readyList[i].due };
        }),
      );
    })();
  }, [startDate, endDate, dueType]);

  const updateDetailData = (selectDate, selectDateDuration) =>
    fetchDetailData(selectDate, selectDateDuration).then(setBookDetailStatus);
  const fetchDetailData = async (selectDate, selectDateDuration) => {
    const dateArray = [...new Array(selectDateDuration)].map((_, i) =>
      moment(selectDate).add(i, "day").format("YYYY-MM-DD"),
    );
    const newDataList = (
      await Promise.allSettled(
        dateArray.map(async (v) => getBooksByBookDate(v)),
      )
    ).map((v) => v.value);

    return newDataList.map((valueAtDate, i) => {
      const detail = valueAtDate.filter(filterBook).map((v) => {
        const result = {
          date: v.book_date.slice(5).replace("-", "/"),
          start_time: v.start_time.slice(0, 5),
          end_time: v.end_time.slice(0, 5),
          due_hour: "0",
          department: v.department ? v.department : "-",
          place: "-",
        };
        if (!v.room) {
          result.due_hour = "0";
        } else {
          const start_time_minute =
            Number(v.start_time.split(":")[0]) * 60 +
            Number(v.start_time.split(":")[1]);
          let end_time_minute =
            Number(v.end_time.split(":")[0]) * 60 +
            Number(v.end_time.split(":")[1]);
          if (end_time_minute === 1339) {
            end_time_minute = 1440;
          }
          result.due_hour = (
            (end_time_minute - start_time_minute) /
            60
          ).toFixed(1);

          if (v.room.type === 1) {
            result.place = `스터디룸 ${v.room.no}`;
          } else if (v.room.type === 2) {
            result.place = "세미나";
          } else if (v.room.type === 3) {
            result.place = "컨퍼런스";
          } else if (v.room.type === 4) {
            result.place = "홀";
          }
        }

        return result;
      });
      return {
        date: dateArray[i],
        detail,
      };
    });
  };

  return (
    <Container>
      <Navi />
      <div className={"text-center d-flex flex-row"}>
        <span className={"h3"} style={{ minWidth: "8rem" }}>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="sumDuration"
              id="sumDurationWeek"
              value="week"
              checked={dueType === DUE_TYPE.WEEK}
              onChange={() => setDueType(DUE_TYPE.WEEK)}
            />
            <label className="form-check-label" htmlFor="sumDurationWeek">
              주간
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="sumDuration"
              id="sumDurationMonth"
              value="month"
              checked={dueType === DUE_TYPE.MONTH}
              onChange={() => setDueType(DUE_TYPE.MONTH)}
            />
            <label className="form-check-label" htmlFor="sumDurationMonth">
              월간
            </label>
          </div>
        </span>

        <DatePicker
          dateFormat={dueType === DUE_TYPE.MONTH ? "yyyy-MM" : "yyyy-MM-dd"}
          selected={startDate}
          onChange={setStartDate}
          customInput={<CustomDatePickerInput />}
          locale={ko}
          showMonthYearPicker={dueType === DUE_TYPE.MONTH}
        />

        <span className={"h1"}>~</span>
        <DatePicker
          dateFormat={dueType === DUE_TYPE.MONTH ? "yyyy-MM" : "yyyy-MM-dd"}
          selected={endDate}
          onChange={
            dueType === DUE_TYPE.MONTH
              ? (d) => setEndDate(moment(d).endOf("month").toDate())
              : setEndDate
          }
          customInput={<CustomDatePickerInput />}
          locale={ko}
          showMonthYearPicker={dueType === DUE_TYPE.MONTH}
        />
      </div>
      <ProgressBar now={progressNow} />
      <Table bordered={true}>
        <thead className={"text-center"}>
          <tr>
            <th colSpan={2}>기간</th>
            <th>홀</th>
            <th>세미나실</th>
            <th colSpan={4}>스터디룸</th>
          </tr>
          <tr>
            <th>시작일</th>
            <th>마감일</th>
            <th>대여횟수</th>
            <th>대여횟수</th>
            <th>총 시간</th>
            <th>평균 시간</th>
            <th>총 횟수</th>
            <th>평균 횟수</th>
          </tr>
        </thead>
        <tbody className={"text-center"} style={{ fontSize: "20px" }}>
          {bookStatus.map((v) => (
            <tr onClick={() => updateDetailData(v.start_date, v.due)}>
              <td>{v.start_date.replaceAll("-", "/")}</td>
              <td>{v.end_date.replaceAll("-", "/")}</td>
              <td>{v.hall_total_count}</td>
              <td>{v.seminar_total_count}</td>
              <td>{v.study_total_sec / 60}</td>
              <td>{(v.study_total_sec / (60 * v.due)).toFixed(2)}</td>
              <td>{v.study_total_count}</td>
              <td>{(v.study_total_count / 7).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {bookDetailStatus.map((data, eventKey) => {
        return (
          <Accordion>
            <Accordion.Item eventKey={`${eventKey}`}>
              <Accordion.Header>
                {data.date} ({data.detail.length}건)
              </Accordion.Header>
              <Accordion.Body>
                <Table>
                  <thead>
                    <tr>
                      <th>일자</th>
                      <th>입실 시간</th>
                      <th>~</th>
                      <th>퇴실 시간</th>
                      <th>사용 시간</th>
                      <th>장소</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: "20px" }}>
                    {data.detail.map((v) => (
                      <tr>
                        <td>{v.date}</td>
                        <td>{v.start_time}</td>
                        <td>~</td>
                        <td>{v.end_time}</td>
                        <td>{v.due_hour}</td>
                        <td>{v.place}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        );
      })}
    </Container>
  );
};

export default StatusBook;
