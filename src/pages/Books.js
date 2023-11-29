import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Timetable from "../components/timetable";
import DatePicker from "react-datepicker";

import moment from "moment";
import "moment/locale/ko";

import Navi from "../components/Navbar";
import { useEffect, useState } from "react";

import { getBooksByBookDate } from "../api/books";
import GuestBookInfoContainer from "../containers/GuestBookInfoContainer";
import { useNavigate } from "react-router-dom";
import {
  getConfigBookWeekdaysClose,
  getConfigBookWeekdaysOpen,
  getConfigBookWeekendClose,
  getConfigBookWeekendOpen,
} from "../api/config";
import {
  convertConfigHourToHour,
  convertRoomToRoomName,
} from "../util/convert";
import { getUsers } from "../api/users";
import { convertBookItem, getDefaultRoom } from "../util/book";

const CustomDatePickerInput = ({ value, onClick }) => {
  return (
    <h1 style={{ width: "100%", textAlign: "center" }} onClick={onClick}>
      {value}
    </h1>
  );
};
const CustomRenderHour = (props) => {
  const { hour, style, className } = props;

  return (
    <div
      className={className}
      style={{
        ...style,
        fontSize: "1.2rem",
      }}
      key={hour}
    >
      {hour}
    </div>
  );
};
const CustomDayHeader = (props) => {
  const { day, rowHeight, className } = props;

  return (
    <div
      className={className}
      style={{ height: rowHeight, fontSize: "1.4rem" }}
    >
      {convertRoomToRoomName(day)}
    </div>
  );
};

const TimetableItemWithText = ({ event, defaultAttributes, classNames }) => {
  const text_first = event.data.department ? `[${event.data.department}]` : "";
  const text_second = `${event.data.user.username} 포함 ${event.data.people_no}명`;
  const text_third =
    moment(event.startTime).format("HH:mm") +
    " - " +
    moment(event.endTime).format("HH:mm");

  return (
    <div
      {...defaultAttributes}
      style={{
        ...defaultAttributes.style,
        background: "#2b463c",
        color:
          event.data.pay && event.data.pay.status === "confirm"
            ? "#9ba9b4"
            : "#cbe541",
        border: "solid",
        fontSize: "1.2rem",
      }}
      title={event.name}
      key={event.id}
      onClick={event.onClick}
    >
      <span className={classNames.event_info}>{text_first}</span>
      <span className={classNames.event_info}>{text_second}</span>
      <span className={classNames.event_info}>{text_third}</span>
    </div>
  );
};

const Books = (props) => {
  const navigate = useNavigate();

  const [books, setBooks] = useState({});
  const [book_date, setBookDate] = useState(Date.now());
  const [hourInterval, setHourInterval] = useState({ from: 9, to: 22 });

  const [show_modal, setShowModal] = useState(false);
  const [book_data, setBookData] = useState({});

  const [users, setUsers] = useState([]);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [username, setUsername] = useState("");
  const [user, setUser] = useState();

  useEffect(() => {
    getUsers(sessionStorage.getItem("Authorization")).then((users) =>
      setUsers(users),
    );
  }, []);

  useEffect(() => {
    try {
      setUser(users.find((value) => username === value.username));
    } catch (e) {
      console.log(e);
    }
  }, [username, users]);

  useEffect(() => {
    (async () => {
      try {
        let open_time, close_time;

        if (moment(book_date).isoWeekday() >= 6) {
          open_time = convertConfigHourToHour(await getConfigBookWeekendOpen());
          close_time = convertConfigHourToHour(
            await getConfigBookWeekendClose(),
          );
        } else {
          open_time = convertConfigHourToHour(
            await getConfigBookWeekdaysOpen(),
          );
          close_time = convertConfigHourToHour(
            await getConfigBookWeekdaysClose(),
          );
        }

        setHourInterval({ from: open_time, to: close_time });
      } catch (e) {
        console.log(e);
      }
    })();
  }, [book_date]);

  const handleChangeDate = (date) => setBookDate(date);
  const updateBookData = async () => {
    const loadBookData = (data) => {
      const temp_books = getDefaultRoom();

      data.forEach((value, index) => {
        const v = convertBookItem(value, book_date, (data) => {
          setBookData(data);
          setShowModal(true);
        });

        if (value.room.type === 3) temp_books.studio.push(v);
        else if (value.room.type === 2) temp_books.seminar.push(v);
        else if (value.room.type === 4) temp_books.hall.push(v);
        else if (value.room.type === 1) {
          const room_no = value.room.no;
          if (room_no === 1) temp_books.r_01.push(v);
          else if (room_no === 2) temp_books.r_02.push(v);
          else if (room_no === 3) temp_books.r_03.push(v);
          else if (room_no === 4) temp_books.r_04.push(v);
          else if (room_no === 5) temp_books.r_05.push(v);
          else if (room_no === 6) temp_books.r_06.push(v);
          else if (room_no === 7) temp_books.r_07.push(v);
          else if (room_no === 8) temp_books.r_08.push(v);
          else if (room_no === 9) temp_books.r_09.push(v);
          else if (room_no === 10) temp_books.r_10.push(v);
        }
      });

      if (temp_books.studio.length === 0) delete temp_books.studio;

      setBooks(temp_books);
    };

    const books = await getBooksByBookDate(
      moment(book_date).format("YYYY-MM-DD"),
    );
    loadBookData(books);
  };

  useEffect(() => {
    if (show_modal) {
    } else updateBookData();
  }, [book_date, show_modal]);

  const handleOnClickNewBook = () => {
    navigate("/staff/book", {
      replace: true,
      state: {
        user: {
          age: null,
          birthday: null,
          chat_id: -1001583498229,
          created: "2022-01-31T23:54:44",
          delete_que: null,
          department: null,
          gender: null,
          grade: 20,
          modified: "2022-01-31T23:54:44",
          num: null,
          sms: 1,
          status: null,
          tg_name: null,
          user_id: 1,
          username: "웹사이트",
          valid: true,
        },
        qr_code:
          "100001xJemApdrPDbgLOy5t0IgdpzkU6xX7iDzBpmc8VRtAty7MhjTwEXy-xIp1C2gyPCeeFcXZSJIqeTkTJ3FqWPMRQ",
      },
    });
  };

  const handleOnClickDonation = (user) => {
    navigate("/donation", {
      replace: true,
      state: { user: user, qr_code: "" },
    });
  };

  return (
    <div>
      <Navi />
      <Container>
        <Row>
          <Col sm={9}>
            <DatePicker
              dateFormat="yyyy-MM-dd"
              selected={book_date}
              onChange={handleChangeDate}
              customInput={<CustomDatePickerInput />}
            />
          </Col>
          <Col sm={1} style={{ marginTop: "8px" }}>
            <Button onClick={handleOnClickNewBook}>예약</Button>
          </Col>
          <Col sm={1} style={{ marginTop: "8px" }}>
            <Button
              disabled={users.length === 0}
              onClick={() => setShowDonationModal(true)}
            >
              적립
            </Button>
          </Col>
          <Col sm={1} style={{ marginTop: "8px" }}>
            <Button onClick={() => updateBookData()}>갱신</Button>
          </Col>
        </Row>
      </Container>
      <Timetable
        events={books}
        style={{ height: "80vh" }}
        hoursInterval={hourInterval}
        renderDayHeader={CustomDayHeader}
        renderHour={CustomRenderHour}
        renderEvent={TimetableItemWithText}
      />

      {show_modal && (
        <Modal show>
          <Modal.Header>정보</Modal.Header>
          <Modal.Body>
            <GuestBookInfoContainer
              book={book_data}
              disabled={book_data.pay && book_data.pay.status === "confirm"}
              pay_options={["card", "transfer", "saved_money.d", "etc"]}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowModal(false)} variant={"secondary"}>
              닫기
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {
        <Modal
          show={showDonationModal}
          onClose={() => setShowDonationModal(false)}
        >
          <Modal.Header>대상 선택</Modal.Header>
          <Modal.Body>
            회원 이름
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {user && user.username ? `사용자 tel: ${user.num}` : "없음"}
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => handleOnClickDonation(user)}
              variant={"primary"}
              disabled={!(user && user.username)}
            >
              적립
            </Button>

            <Button
              onClick={() => setShowDonationModal(false)}
              variant={"secondary"}
            >
              닫기
            </Button>
          </Modal.Footer>
        </Modal>
      }
    </div>
  );
};

export default Books;
