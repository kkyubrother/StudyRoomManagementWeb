import { useEffect, useState } from "react";
import { calcPaid } from "../utils";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import InputName from "../components/book/InputName";
import InputStartEndTime from "../components/book/InputStartEndTime";
import InputRoom from "../components/book/InputRoom";
import InputDepartment from "../components/book/InputDepartment";
import InputPay from "../components/book/InputPay";
import {
  getPay,
  PAY_STATUS_CONFIRM,
  PAY_STATUS_REJECT,
  PAY_STATUS_WAITING,
  postPay,
} from "../api/pays";
import { useLocation } from "react-router-dom";
import axios from "axios";
import InputPeopleNoV2 from "../components/book/InputPeopleNoV2";
import InputPurpose from "../components/book/InputPurpose";
import { getRooms } from "../api/rooms";
import { changeRoom } from "../store/GuestReducer";
import InputRoomV3 from "../components/book/InputRoomV3";
import { putBookChangeRoom } from "../api/books";

const cancelBookByAdmin = (book_id, Authorization) => {
  return axios
    .delete(`/api/books/${book_id}/admin`, { headers: { Authorization } })
    .then((response) => response.data);
};

const GuestBookInfoContainer = ({
  book,
  disabled,
  pay_options = ["card", "saved_money.d"],
}) => {
  const timer = 60;
  const location = useLocation();
  const [show_spinner, setShowSpinner] = useState(false);
  const [paid, setPaid] = useState(0);
  const [pay_type, setPayType] = useState(null);
  const [etc_reason, setEtcReason] = useState("");
  const [message, setMessage] = useState(null);
  useEffect(() => {
    if (book.start_time && book.end_time && book.room)
      setPaid(calcPaid(book.room.type, book.start_time, book.end_time));
  }, [book]);

  const handleOnClickDelete = () => {
    const book_id = book.book_id;
    const authorization = sessionStorage.getItem("Authorization");
    cancelBookByAdmin(book_id, authorization).then((result) =>
      setMessage(result.message),
    );
  };

  const handleOnClickPay = () => {
    const user_id = book.user.user_id;
    const book_id = book.book_id;
    const cashier = "web.guard";
    const pays_pay_type =
      pay_type + (book.department ? "." + book.department : "");
    const client_name = "plin.kiosk.book";

    if (!pay_type) return alert("결제 수단을 선택하세요");
    postPay(
      user_id,
      book_id,
      cashier,
      pays_pay_type,
      paid,
      etc_reason,
      client_name,
    )
      .then((pay) => {
        setMessage(`결제 대기중입니다(${Math.round(timer / 2)} 초)`);

        const wait_transaction = (pay_id, timer) => {
          setMessage(`결제 대기중입니다(${Math.round(timer / 2)} 초)`);
          if (timer > 0) {
            getPay(pay_id)
              .then((pay_result) => {
                if (pay_result.status.startsWith(PAY_STATUS_CONFIRM)) {
                  setMessage(`결제되었습니다.`);
                } else if (pay_result.status.startsWith(PAY_STATUS_REJECT)) {
                  setMessage(
                    pay_result.comment
                      ? pay_result.comment
                      : "다시 결제바랍니다.",
                  );
                } else if (pay_result.status.startsWith(PAY_STATUS_WAITING)) {
                  setTimeout(wait_transaction, 500, ...[pay_id, timer - 1]);
                }
              })
              .catch((e) =>
                setMessage(e ? e.response.message : "다시 결제바랍니다."),
              );
          } else {
            setMessage("결제 대기 시간 초과하였습니다. 다시 결제바랍니다.");
          }
        };
        setTimeout(wait_transaction, 500, ...[pay.pay_id, timer]);
      })
      .catch((e) => setMessage(e ? e.response.message : "다시 결제바랍니다."));
  };

  const [changeRoomText, setChangeRoomText] = useState("");
  const handleChangeRoom = async (room) => {
    try {
      const response = await putBookChangeRoom(
        book.book_id,
        room.type,
        room.no,
      );
      setChangeRoomText(`${response.name}으로 변경 성공`);
      console.log(response);
    } catch (e) {
      setChangeRoomText(e.response.data.message);
    }
  };

  return (
    <Container fluid>
      <InputName value={book.user.username} />
      <InputStartEndTime
        book_date={book.book_date}
        start_time={book.start_time}
        end_time={book.end_time}
        disabled
      />
      <InputRoomV3
        room={book.room}
        setRoom={(room) => handleChangeRoom(room)}
        date={book.book_date}
        start_time={book.start_time}
        end_time={book.end_time}
        disabled={false}
      />

      {changeRoomText ? (
        <span style={{ color: "red" }}>{changeRoomText}</span>
      ) : null}
      <InputPurpose purpose={book.purpose} disabled />
      <InputPay
        pay={book.pay}
        paid={paid}
        pay_type={pay_type}
        region={book.department}
        etc_reason={etc_reason}
        setPayType={setPayType}
        setEtcReason={setEtcReason}
        disabled={disabled}
        options={pay_options}
      />
      <Row>
        <Col>
          {message &&
            message !== "결제되었습니다." &&
            message !== "삭제 성공" && (
              <Spinner animation={"border"} variant={"primary"} />
            )}
          {message && message}
        </Col>
      </Row>
      <Row>
        <Col sm={6}>{show_spinner && <Spinner animation={"border"} />}</Col>
        {!message && !disabled ? (
          <Button as={Col} sm={2} onClick={handleOnClickPay}>
            결제
          </Button>
        ) : (
          <Col sm={2}>{""}</Col>
        )}
        <Col sm={2}>{""}</Col>
        <Button
          variant={"danger"}
          as={Col}
          sm={2}
          onClick={handleOnClickDelete}
        >
          삭제
        </Button>
      </Row>
    </Container>
  );
};

export default GuestBookInfoContainer;
