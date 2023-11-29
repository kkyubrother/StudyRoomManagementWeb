import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";

import { useLocation, useNavigate } from "react-router-dom";
import InputStartEndTime from "../../components/book/InputStartEndTime";
import InputRoom from "../../components/book/InputRoom";
import { calcPaid } from "../../utils";
import InputDepartment from "../../components/book/InputDepartment";
import InputPeopleNo from "../../components/book/InputPeopleNo";
import InputPay from "../../components/book/InputPay";
import { useEffect, useState } from "react";
import { getBooksBy } from "../../api/books";
import moment from "moment";
import {
  PAY_STATUS_CONFIRM,
  PAY_STATUS_REJECT,
  PAY_STATUS_WAITING,
  postPay,
} from "../../api/pays";
import WaitTransaction, {
  isPayConfirm,
} from "../../controller/WaitTransactionController";
import cancelBookControl from "../../controller/BookCancel";
import InputNameV2 from "../../components/book/InputNameV2";

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "inherit",
    justifyContent: "center",
  },
  containerInfo: {
    marginTop: 25,
  },
  rowBooks: {
    border: "solid #32a1ce",
    // padding: "7px",
  },
  colBooks: {
    margin: "2px",
    padding: "4px",
    transition: "0.5s",
    backgroundColor: "#D7EDFD",
  },
  colBooksActive: {
    margin: "2px",
    padding: "4px",
    border: "1px solid #34495e",
    transition: "0.5s",
    backgroundColor: "#A9DFBF",
  },
  colBooksPaid: {
    margin: "2px",
    padding: "4px",
    border: "1px solid #34495e",
    transition: "0.5s",
    backgroundColor: "#85C1E9",
  },
};

const getTitleFromBook = (book) =>
  `[${book.department}] ${book.user.username} ${
    book.people_no
  } 명  ${book.start_time.format("HH:mm")}~${book.end_time.format("HH:mm")}`;
const ModalWaitPay = ({ show, handleClose, title, message }) => (
  <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
    <Modal.Header>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      <Button onClick={handleClose}>{"확인"}</Button>
    </Modal.Footer>
  </Modal>
);

const GuestBookInfoComponent = ({
  book,
  pay_type,
  setPayType,
  etc_reason,
  setEtcReason,
  disabled,
}) => {
  const [paid, setPaid] = useState(0);
  useEffect(() => {
    if (book.start_time && book.end_time && book.room)
      setPaid(calcPaid(book.room.type, book.start_time, book.end_time));
  }, [book]);

  return (
    <Container>
      <InputNameV2 value={book.user.username} />
      <InputStartEndTime
        book_date={book.book_date}
        start_time={book.start_time}
        end_time={book.end_time}
        disabled={true}
      />
      <InputRoom room={book.room} disabled={true} />
      <InputDepartment department={book.department} disabled={true} />
      <InputPeopleNo people_no={book.people_no} disabled={true} />
      <InputPay
        pay={disabled ? book.pay : null}
        paid={paid}
        pay_type={pay_type}
        region={book.department}
        etc_reason={etc_reason}
        setPayType={setPayType}
        setEtcReason={setEtcReason}
        disabled={disabled}
        options={["card", "saved_money.d"]}
      />
    </Container>
  );
};

const BookItem = ({ book, handleSelectBook, selected_book }) => {
  const is_selected =
    book && selected_book && selected_book.book_id === book.book_id;
  const is_paid = book && book.pay && book.pay.status === PAY_STATUS_CONFIRM;

  const style = is_selected
    ? { ...styles.colBooksActive }
    : is_paid
      ? { ...styles.colBooksPaid }
      : { ...styles.colBooks };

  return (
    <Col sm style={style} onClick={book ? () => handleSelectBook(book) : null}>
      {book ? getTitleFromBook(book) : null}
    </Col>
  );
};

const GuestBookCheckPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [book, setBook] = useState(null);
  const [title, setTitle] = useState("예약을 선택하세요.");
  const [pay_type, setPayType] = useState(null);
  const [etc_reason, setEtcReason] = useState("");
  const [modal, setModal] = useState(null);
  const [paid, setPaid] = useState(0);

  const [is_active_paying, setIsActivePaying] = useState(false);

  const [message, setMessage] = useState(null);
  const [show_spinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (book && book.start_time && book.end_time && book.room)
      setPaid(calcPaid(book.room.type, book.start_time, book.end_time));
  }, [book]);

  useEffect(() => {
    if (!location.state || !location.state.user || !location.state.user.user_id)
      navigate("/");
    const today_moment = moment();
    getBooksBy(location.state.user.user_id).then((results) => {
      setBooks(
        results
          .map((value) => {
            return {
              ...value,
              start_time: moment(value.start_time, "hh:mm:ss"),
              end_time: moment(value.end_time, "hh:mm:ss"),
            };
          })
          .filter((value) =>
            moment(value.book_date).isSame(today_moment, "day"),
          ),
      );
    });
  }, [location.state, navigate]);

  const handleSelectBook = (book) => {
    setTitle(getTitleFromBook(book));
    if (book.pay && book.pay.status === "confirm") {
      setPayType(book.pay.pay_type);
      setEtcReason(book.pay.comment);
    } else {
      setPayType(null);
      setEtcReason(null);
    }
    setBook(book);
  };
  const setModalPayError = (error) => {
    setModal(
      <ModalWaitPay
        show={true}
        title={"오류 발생"}
        message={error ? error.response.message : "다시 결제바랍니다."}
        handleClose={() => setModal(null)}
      />,
    );

    setIsActivePaying(false);
  };
  const handleOnClickPay = () => {
    const user_id = location.state.user.user_id;
    const book_id = book.book_id;
    const cashier = "web.guard";
    const pays_pay_type =
      pay_type + (book.department ? "." + book.department : "");
    const client_name = "plin.kiosk.book";

    if (!pay_type) return alert("결제 수단을 선택하세요");
    if (is_active_paying) return;
    else setIsActivePaying(true);

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
                handleClose={() => navigate("/")}
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

        setTimeout(WaitTransaction, 500, ...[pay_id, timer, callback]);
      })
      .catch(setModalPayError);
  };
  const handleOnClickCancel = () => {
    const book_id = book.book_id;
    const qr_code = location.state.qr_code;
    const cashier = "plin.kiosk.book";

    cancelBookControl(
      book_id,
      qr_code,
      cashier,
      (m, s) => {
        setMessage(m);
        setShowSpinner(s);
      },
      () => null,
    );
  };

  return (
    <Container style={styles.container}>
      <h1>{books.length > 0 ? title : "예약이 없습니다"}</h1>
      <Container>
        {books.map((value, index) => {
          if (index * 3 >= books.length) return null;
          else {
            return (
              <Row style={styles.rowBooks}>
                <BookItem
                  book={books[index * 3]}
                  handleSelectBook={handleSelectBook}
                  selected_book={book}
                />
                <BookItem
                  book={books[index * 3 + 1]}
                  handleSelectBook={handleSelectBook}
                  selected_book={book}
                />
                <BookItem
                  book={books[index * 3 + 2]}
                  handleSelectBook={handleSelectBook}
                  selected_book={book}
                />
              </Row>
            );
          }
        })}
      </Container>
      <Container style={styles.containerInfo} fluid>
        {book && (
          <GuestBookInfoComponent
            book={book}
            pay_type={pay_type}
            setPayType={setPayType}
            etc_reason={etc_reason}
            setEtcReason={setEtcReason}
            disabled={isPayConfirm(book.pay)}
          />
        )}
      </Container>
      <Row>
        <Button as={Col} onClick={() => navigate("/")} variant={"secondary"}>
          홈으로
        </Button>
        {book && (
          <Button as={Col} variant={"danger"} onClick={handleOnClickCancel}>
            예약취소
          </Button>
        )}
        {book ? (
          isPayConfirm(book.pay) ? (
            <Button as={Col} variant={"primary"} onClick={() => setBook(null)}>
              확인
            </Button>
          ) : (
            <Button as={Col} variant={"primary"} onClick={handleOnClickPay}>
              결제
            </Button>
          )
        ) : null}
      </Row>
      {modal}
      {message && (
        <Modal show={true}>
          <Modal.Body>
            {show_spinner && <Spinner animation={"border"} />}
            {message}
          </Modal.Body>
          <Modal.Footer>
            {!show_spinner && (
              <Button onClick={() => setMessage(null)}>확인</Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default GuestBookCheckPage;
