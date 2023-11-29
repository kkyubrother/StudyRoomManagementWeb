import { useEffect, useReducer, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import GuestReducer, {
  changeBookDate,
  changeDepartment,
  changeEndTime,
  changePayType,
  changePayTypeEtcReason,
  changePeopleNo,
  changePurpose,
  changeRoom,
  changeStartTime,
  changeUsername,
  initial_guest,
} from "../../store/GuestReducer";
import InputDepartment from "../../components/book/InputDepartment";
import InputPay from "../../components/book/InputPay";
import { calcPaid } from "../../utils";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import { deleteBook, postBook } from "../../api/books";
import {
  PAY_STATUS_CONFIRM,
  PAY_STATUS_REJECT,
  PAY_STATUS_WAITING,
  postPay,
} from "../../api/pays";
import WaitTransaction from "../../controller/WaitTransactionController";
import InputNameV2 from "../../components/book/InputNameV2";
import InputDateV2 from "../../components/book/InputDateV2";
import InputDateV3 from "../../components/book/InputDateV3";
import InputStartEndTimeV2 from "../../components/book/InputStartEndTimeV2";
import InputRoomV2 from "../../components/book/InputRoomV2";
import InputRoomV3 from "../../components/book/InputRoomV3";
import {
  getConfigBookWeekdaysClose,
  getConfigBookWeekdaysOpen,
  getConfigBookWeekendClose,
  getConfigBookWeekendOpen,
} from "../../api/config";
import InputPeopleNoV2 from "../../components/book/InputPeopleNoV2";
import InputPurpose from "../../components/book/InputPurpose";
import AsyncImage from "../../components/AsyncImage";

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "inherit",
    justifyContent: "center",
  },
  image: {
    height: "50vh",
    width: "80wh",
  },
};

const ModalWaitPay = ({ show, handleClose, title, message }) => (
  <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
    <Modal.Header>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {message ? (
        message
      ) : (
        <>
          <Spinner animation={"border"} variant={"primary"} />
          예약중입니다...
        </>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={handleClose}>{"확인"}</Button>
    </Modal.Footer>
  </Modal>
);

const ModalBooked = ({ show, title, message, handleClose }) => (
  <Modal show={show} onClose={handleClose}>
    <Modal.Header>{title}</Modal.Header>
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      <Button onClick={handleClose}>{"확인"}</Button>
    </Modal.Footer>
  </Modal>
);

const GuestBookPage = (props) => {
  console.debug(`GuestBookPage::props::${JSON.stringify(props, null, 2)}`);
  const location = useLocation();
  const navigate = useNavigate();
  console.debug(
    `GuestBookPage::location::${JSON.stringify(location, null, 2)}`,
  );

  const [paid, setPaid] = useState(0);
  const [guest_state, dispatch] = useReducer(
    GuestReducer,
    initial_guest,
    undefined,
  );
  const [modal, setModal] = useState(null);
  const [is_active_paying, setIsActivePaying] = useState(false);

  const [min_time, setMinTime] = useState(moment());
  const [max_time, setMaxTime] = useState(moment("22:00", "hh:mm"));

  const isStaff = window.location.pathname === "/staff/book";
  const options = isStaff
    ? ["card", "saved_money.d", "transfer", "notion", "etc"]
    : ["card", "saved_money.d"];

  const [book_date, setBookDate] = useState(Date.now());
  // const book_date = guest_state.book_date ? moment(guest_state.book_date, "YYYY:MM:DD").toDate() : Date.now();

  const handleOnSelectDate = (year, month, date) => {
    const t = moment(`${year}:${month}:${date}`, "YYYY:MM:DD");
    if (t.isBefore(moment(), "date")) alert("올바르지 않은 날짜입니다.");
    else changeBookDate(dispatch, t.format("YYYY-MM-DD"));
  };
  const handleOnSelectStartTime = (hour, minute) => {
    const t = moment(`${hour}:${minute}`, "HH:mm");
    if (guest_state.end_time && t.isSameOrAfter(guest_state.end_time))
      alert("올바르지 않은 시간입니다.");
    else changeStartTime(dispatch, t);
  };
  const handleOnSelectEndTime = (hour, minute) => {
    const t = moment(`${hour}:${minute}`, "HH:mm");
    if (guest_state.start_time && t.isSameOrBefore(guest_state.start_time))
      alert("올바르지 않은 시간입니다.");
    else changeEndTime(dispatch, t);
  };

  useEffect(() => {
    const d = moment(guest_state.book_date, "YYYY:MM:DD");
    if (d.isoWeekday() >= 6) {
      getConfigBookWeekendOpen().then((value) => {
        const t = moment(value, "hh:mm:ss");
        if (moment().isAfter(t)) {
          setMinTime(moment());
        } else {
          setMinTime(t);
        }
      });

      getConfigBookWeekendClose().then((value) =>
        setMaxTime(moment(value, "hh:mm:ss")),
      );
    } else {
      getConfigBookWeekdaysOpen().then((value) => {
        const t = moment(value, "hh:mm:ss");
        if (moment().isAfter(t)) {
          setMinTime(moment());
        } else {
          setMinTime(t);
        }
      });

      getConfigBookWeekdaysClose().then((value) =>
        setMaxTime(moment(value, "hh:mm:ss")),
      );
    }
    setBookDate(Date.now());
  }, [guest_state.book_date]);

  useEffect(() => {
    if (guest_state.start_time && guest_state.end_time && guest_state.room)
      setPaid(
        calcPaid(
          guest_state.room.type,
          guest_state.start_time,
          guest_state.end_time,
        ),
      );
  }, [guest_state]);
  useEffect(() => {
    if (!location.state) navigate("/");
    else changeUsername(dispatch, location.state.user.username);
  }, [location.state, navigate]);
  useEffect(() => {
    changeBookDate(dispatch, moment().format("YYYY-MM-DD"));
  }, []);

  useEffect(() => {
    if (isStaff) {
      changePeopleNo(dispatch, -5);
      changePurpose(dispatch, "immediately");
    }
  }, [isStaff]);

  // 데모용
  useEffect(() => {
    if (!isStaff) {
      changeDepartment(dispatch, "기타");
      changePeopleNo(dispatch, -4);
      changePurpose(dispatch, "personal");
    }
  }, [isStaff]);

  const handleOnClickBook = () => {
    if (!guest_state) {
      alert("비정상 접근");
    } else if (!guest_state.username) {
      alert("QR 비인증 접근");
    } else if (!guest_state.start_time || !guest_state.end_time) {
      alert("시간 설정 필요");
    } else if (!guest_state.room) {
      alert("방 설정 필요");
    } else if (!guest_state.department) {
      alert("지역 설정 필요");
    } else if (!guest_state.people_no) {
      alert("인원 설정 필요");
    } else if (!guest_state.pay_type) {
      alert("결제 정보 설정 필요");
    } else {
      setModal(<ModalWaitPay show={true} title={"예약 시도중"} />);
      postBook(
        null,
        location.state.user.user_id,
        guest_state.book_date,
        guest_state.start_time.format("HH:mm:ss"),
        guest_state.end_time.format("HH:mm:ss"),
        guest_state.room.type,
        guest_state.room.no,
        guest_state.people_no,
        guest_state.department,
        guest_state.pay_type,
        guest_state.etc_reason,
        guest_state.purpose,
      )
        .then((result) => {
          console.debug(
            `GuestBookPage::handleOnClickBook::postBook::result::${JSON.stringify(
              result,
              null,
              2,
            )}`,
          );
          if (is_active_paying) return;
          else setIsActivePaying(true);
          postPay(
            location.state.user.user_id,
            result.book_id,
            "web.guard",
            guest_state.pay_type +
              (guest_state.department ? "." + guest_state.department : ""),
            paid,
            guest_state.pay_type_etc_reason,
            "plin.kiosk.book",
          )
            .then((pay) => {
              console.log(
                `GuestBookPage::handleOnClickBook::postBook::postPay::pay::${JSON.stringify(
                  pay,
                  null,
                  2,
                )}`,
              );

              const user_id = location.state.user.user_id;
              const book_id = result.book_id;
              const pay_id = pay.pay_id;
              const timer = 60;
              const callback = (data) => {
                if (data.status === PAY_STATUS_WAITING)
                  setModal(
                    <ModalWaitPay
                      show={true}
                      title={data.title}
                      message={data.message}
                    />,
                  );
                else if (data.status === PAY_STATUS_CONFIRM) {
                  setModal(
                    <ModalWaitPay
                      show={true}
                      title={data.title}
                      message={data.message}
                      handleClose={() =>
                        isStaff ? navigate("/books") : navigate("/")
                      }
                    />,
                  );
                  setIsActivePaying(false);
                } else if (data.status === PAY_STATUS_REJECT) {
                  setModal(
                    <ModalWaitPay
                      show={true}
                      title={data.title}
                      message={data.message}
                      handleClose={() => setModal(null)}
                    />,
                  );
                  setIsActivePaying(false);
                }
              };

              setTimeout(
                WaitTransaction,
                500,
                ...[pay_id, timer, callback, user_id, book_id],
              );
            })
            .catch((error) => {
              console.error(error);
              deleteBook(
                location.state.user.user_id,
                result.book_id,
                `Pay.Error`,
              ).then((res) => console.log(res));
              setModal(
                <ModalBooked
                  show={true}
                  title={"오류 발생"}
                  message={
                    error ? error.response.message : "다시 결제바랍니다."
                  }
                  handleClose={() => setModal(null)}
                />,
              );
            });
        })
        .catch((reason) => {
          console.log(reason.response.data);

          setModal(
            <ModalBooked
              show={true}
              title={"오류 발생"}
              message={
                reason ? reason.response.data.message : "다시 신청바랍니다."
              }
              handleClose={() => setModal(null)}
            />,
          );
        });
    }
  };

  return (
    <Container style={styles.container}>
      <AsyncImage
        style={styles.image}
        src={`/api/books/${guest_state.book_date}.png?_=${book_date.valueOf()}`}
      />
      <InputNameV2 value={guest_state.username} />
      {isStaff ? (
        guest_state.book_date ? (
          <InputDateV3
            value={guest_state.book_date}
            setValue={(v) =>
              handleOnSelectDate(v.getFullYear(), v.getMonth() + 1, v.getDate())
            }
          />
        ) : (
          "loading"
        )
      ) : (
        <InputDateV2 value={guest_state.book_date} />
      )}
      <InputStartEndTimeV2
        min_time={isStaff ? moment("07:00", "hh:mm") : min_time}
        max_time={isStaff ? moment("23:00", "hh:mm") : max_time}
        book_date={guest_state.book_date}
        start_time={guest_state.start_time}
        end_time={guest_state.end_time}
        onSelectStartTime={handleOnSelectStartTime}
        onSelectEndTime={handleOnSelectEndTime}
      />
      {isStaff ? (
        <InputRoomV3
          room={guest_state.room}
          setRoom={(room) => changeRoom(dispatch, room)}
          date={guest_state.book_date}
          start_time={guest_state.start_time}
          end_time={guest_state.end_time}
          disabled={!(guest_state.start_time && guest_state.end_time)}
        />
      ) : (
        <InputRoomV2
          room={guest_state.room}
          setRoom={(room) => changeRoom(dispatch, room)}
          date={guest_state.book_date}
          start_time={guest_state.start_time}
          end_time={guest_state.end_time}
          disabled={!(guest_state.start_time && guest_state.end_time)}
        />
      )}
      {/*<InputDepartment*/}
      {/*    department={guest_state.department}*/}
      {/*    setDepartment={(department) => changeDepartment(dispatch, department)}*/}
      {/*    disabled={!guest_state.room}*/}
      {/*    />*/}
      {/*{isStaff ? null : (*/}
      {/*  <InputPeopleNoV2*/}
      {/*    people_no={guest_state.people_no}*/}
      {/*    setPeopleNo={(people_no) => changePeopleNo(dispatch, people_no)}*/}
      {/*    disabled={!guest_state.department}*/}
      {/*  />*/}
      {/*)}*/}
      {/*{isStaff ? null : (*/}
      {/*  <InputPurpose*/}
      {/*    purpose={guest_state.purpose}*/}
      {/*    setPurpose={(purpose) => changePurpose(dispatch, purpose)}*/}
      {/*    disabled={!guest_state.people_no}*/}
      {/*  />*/}
      {/*)}*/}

      <InputPay
        paid={paid}
        pay_type={guest_state.pay_type}
        region={guest_state.department}
        etc_reason={guest_state.pay_type_etc_reason}
        setPayType={(pay_type) => changePayType(dispatch, pay_type)}
        setEtcReason={(etc_reason) =>
          changePayTypeEtcReason(dispatch, etc_reason)
        }
        disabled={!guest_state.purpose}
        options={options}
      />
      <Row>
        <Button
          as={Col}
          onClick={() =>
            navigate(
              window.location.pathname === "/staff/book" ? "/books" : "/",
            )
          }
          variant={"secondary"}
        >
          취소
        </Button>
        <Button as={Col} onClick={handleOnClickBook} variant={"primary"}>
          신청
        </Button>
      </Row>
      {modal}
    </Container>
  );
};

export default GuestBookPage;
