import Navi from "../components/Navbar";
import AsyncImage from "../components/AsyncImage";
import { useEffect, useState } from "react";
import InputNameV2 from "../components/book/InputNameV2";
import InputDateV3 from "../components/book/InputDateV3";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Table from "react-bootstrap/Table";
import moment from "moment/moment";
import InputStartEndTimeV2 from "../components/book/InputStartEndTimeV2";
import InputDepartment from "../components/book/InputDepartment";
import InputPay from "../components/book/InputPay";
import { calcPaid } from "../utils";
import { deleteBook, getBooksByBookDate, postBook } from "../api/books";
import {
  getPay,
  PAY_STATUS_CONFIRM,
  PAY_STATUS_REJECT,
  PAY_STATUS_WAITING,
  postPay,
} from "../api/pays";
import axios from "axios";

const cancelBookByAdmin = (book_id, Authorization) => {
  return axios
    .delete(`/api/books/${book_id}/admin`, { headers: { Authorization } })
    .then((response) => response.data);
};

const styles = {
  container: {
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: "50vh",
    width: "80wh",
  },
};
function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

const convertRoomToString = (room) => {
  const [type, no] = room.split("_");

  if (type === "1") return `스 ${no}`;
  else if (type === "2") return "세미나룸";
  else if (type === "3") return "스튜디오";
  else if (type === "4") return "홀";
  else return "기타";
};

const user = {
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
};
const BlockerPage = () => {
  const peopleNo = -5;
  const purpose = "block";

  const [bookDate, setBookDate] = useState(moment().format("YYYY-MM-DD"));
  const [startTime, setStartTime] = useState(moment("07:00", "HH:mm"));
  const [endTime, setEndTime] = useState(moment("23:00", "HH:mm"));
  const [department, setDepartment] = useState("기타");
  const [imgSrc, setImgSrc] = useState("");
  const [paid, setPaid] = useState(0);
  const [room, setRoom] = useState({});
  const [blockStrategy, setBlockStrategy] = useState(0);

  const [payType, setPayType] = useState("");
  const [payTypeEtcReason, setPayTypeEtcReason] = useState("");

  const [blockResult, setBlockResult] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setImgSrc(`/api/books/${bookDate}.png?_=${new Date().valueOf()}`);
  }, [bookDate]);
  useEffect(() => {
    if (!startTime) {
    } else if (!endTime) {
    } else if (!room) {
    } else setPaid(calcPaid(room.type, startTime, endTime));
  }, [endTime, room, startTime]);

  const handleOnSelectDate = (year, month, date) => {
    const t = moment(`${year}:${month}:${date}`, "YYYY:MM:DD");
    if (t.isBefore(moment(), "date")) alert("올바르지 않은 날짜입니다.");
    else setBookDate(t.format("YYYY-MM-DD"));
  };
  const handleOnSelectStartTime = (hour, minute) => {
    const t = moment(`${hour}:${minute}`, "HH:mm");
    if (endTime && t.isSameOrAfter(endTime)) alert("올바르지 않은 시간입니다.");
    else setStartTime(t);
  };
  const handleOnSelectEndTime = (hour, minute) => {
    const t = moment(`${hour}:${minute}`, "HH:mm");
    if (startTime && t.isSameOrBefore(startTime))
      alert("올바르지 않은 시간입니다.");
    else setEndTime(t);
  };
  const handleOnSelectRoom = (type, no, enable) => {
    const key = `${type}_${no}`;
    const newRoom = { ...room };
    newRoom[key] = { type: type, no: no, enable: enable };
    setRoom(newRoom);
  };

  const handlePostPay = async (result) => {
    if (result.status === "rejected") {
      return { result: false, message: result.reason.response.data.message };
    }

    const user_id = user.user_id;
    const book_id = result.book_id;

    const pay_ready = await postPay(
      user.user_id,
      result.book_id,
      "web.guard",
      payType + (department ? "." + department : ""),
      paid,
      payTypeEtcReason,
      "plin.pos.book",
    );

    let pay_result;
    for (let i = 0; i < 60; i++) {
      await sleep(1);

      pay_result = await getPay(pay_ready.pay_id);
      if (pay_result.status.startsWith(PAY_STATUS_CONFIRM))
        return { result: true, message: "성공" };
      else if (pay_result.status.startsWith(PAY_STATUS_REJECT)) {
        if (user_id && book_id)
          deleteBook(user_id, book_id, `Pay.${PAY_STATUS_REJECT}`).then((res) =>
            console.log(res),
          );

        return { result: false, message: pay_result.comment };
      } else if (pay_result.status.startsWith(PAY_STATUS_WAITING)) {
      }
    }
    return { result: false, message: "대기 시간 초과" };
  };

  const handleStrategyStartToEnd = async (room) => {
    return await handlePostPay(
      await postBook(
        null,
        user.user_id,
        bookDate,
        startTime.format("HH:mm:ss"),
        endTime.format("HH:mm:ss"),
        room.type,
        room.no,
        peopleNo,
        department,
        payType,
        payTypeEtcReason,
        purpose,
      ),
    );
  };

  const handleStrategyStartToEndIncludeExist = async (
    room,
    start_time,
    end_time,
  ) => {
    return await handlePostPay(
      await postBook(
        null,
        user.user_id,
        bookDate,
        start_time.format("HH:mm:ss"),
        end_time.format("HH:mm:ss"),
        room.type,
        room.no,
        peopleNo,
        department,
        payType,
        payTypeEtcReason,
        purpose,
      ),
    );
  };

  const handleStrategyDeleteAndBlock = async (room, books) => {
    let room_key = "r_01";
    if (room.type === 2) room_key = "seminar";
    else if (room.type === 3) room_key = "studio";
    else if (room.type === 4) room_key = "hall";
    else room_key = "r_" + `${room.no}`.padStart(2, "0");

    const authorization = sessionStorage.getItem("Authorization");
    const filterTime = (v) => {
      const f = (x) =>
        ((m) => m.hour() + m.minute() / 60)(
          ((t) => moment(moment(t).format("HH:mm"), "HH:mm"))(x),
        );
      const rb_s = f(v.startTime);
      const rb_e = f(v.endTime);

      const s = f(startTime);
      const e = f(endTime);

      return rb_e > s && rb_s < e;
    };
    const book_keys = books[room_key].filter(filterTime).map((book) => book.id);

    await Promise.allSettled(
      book_keys.map((book_id) => cancelBookByAdmin(book_id, authorization)),
    );

    return await handleStrategyStartToEnd(room);
  };

  const handleOnClickBlock = (_) => {
    if (!bookDate) alert("날짜 설정 필요");
    else if (!startTime) alert("시간 설정 필요");
    else if (!endTime) alert("시간 설정 필요");
    else if (!department) alert("지역 설정 필요");
    else if (!room) alert("장소 설정 필요");
    else if (Object.values(room).length === 0) alert("장소 설정 필요");
    else if (Object.values(room).filter((v) => v.enable).length === 0)
      alert("장소 설정 필요");
    else if (!blockStrategy) alert("막기 전략 설정 필요");
    else if (!payType) alert("결제 방법 설정 필요");
    else {
      setIsProcessing(true);
      const rooms = Object.values(room).filter((v) => v.enable);
      const parseResult = (v, i) => {
        if (v.status === "rejected") {
          return {
            result: false,
            room: `${rooms[i].type}_${rooms[i].no}`,
            message: v.reason.response.data.message,
          };
        } else {
          return {
            result: true,
            room: `${rooms[i].type}_${rooms[i].no}`,
            message: v.value.message,
          };
        }
      };

      if (blockStrategy === 1) {
        Promise.allSettled(rooms.map(handleStrategyStartToEnd))
          .then((results) => setBlockResult(results.map(parseResult)))
          .then(() =>
            setImgSrc(`/api/books/${bookDate}.png?_=${new Date().valueOf()}`),
          )
          .then(() => setIsProcessing(false));
      } else if (blockStrategy === 2) {
        const time_gap = Number(
          (endTime.hour() - startTime.hour()) * 2 +
            (endTime.minute() - startTime.minute()) / 30,
        );
        const time_list = [...new Array(time_gap)].map((_, i) => {
          const start_time = startTime.clone();
          start_time.add(30 * i, "minute");

          const end_time = start_time.clone();
          end_time.add(30, "minute");

          return { start_time, end_time };
        });

        // eslint-disable-next-line array-callback-return
        time_list.map((value) => {
          Promise.allSettled(
            rooms.map((room) =>
              handleStrategyStartToEndIncludeExist(
                room,
                value.start_time,
                value.end_time,
              ),
            ),
          )
            .then((results) => setBlockResult(results.map(parseResult)))
            .then(() =>
              setImgSrc(`/api/books/${bookDate}.png?_=${new Date().valueOf()}`),
            )
            .then(() => setIsProcessing(false));
        });
      } else if (blockStrategy === 3) {
        //    1. 입실 시간이 설정한 퇴실 시간 이전인 예약
        //    2. 퇴실 시간이 설정한 입실 시간 이후인 예약
        //    3. 1번과 2번이 참인 예약
        const loadBookData = (data) => {
          const temp_books = {
            r_01: [],
            r_02: [],
            r_03: [],
            r_04: [],
            r_05: [],
            r_06: [],
            r_07: [],
            r_08: [],
            r_09: [],
            r_10: [],
            seminar: [],
            studio: [],
            hall: [],
          };

          data.forEach((value, index) => {
            if (
              !moment(value.book_date).isSame(
                moment(bookDate).format("YYYY-MM-DD"),
              )
            )
              return console.log(moment(bookDate).format("YYYY-MM-DD"));

            const startTime = new Date(
              `${value.book_date}T${value.start_time}`,
            );
            const endTime = new Date(`${value.book_date}T${value.end_time}`);
            const s = moment(startTime).format("HH:mm");
            const e = moment(endTime).format("HH:mm");

            const v = {
              id: value.book_id,
              name: `[${value.department}] ${value.user.username} 포함 ${value.people_no}명\n${s} - ${e}`,
              type: "book",
              startTime: startTime,
              endTime: endTime,
              data: value,
            };

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

          return temp_books;
        };

        getBooksByBookDate(moment(bookDate).format("YYYY-MM-DD"))
          .then(loadBookData)
          .then((books) => {
            Promise.allSettled(
              rooms.map((room) => handleStrategyDeleteAndBlock(room, books)),
            )
              .then((results) => setBlockResult(results.map(parseResult)))
              .then(() =>
                setImgSrc(
                  `/api/books/${bookDate}.png?_=${new Date().valueOf()}`,
                ),
              )
              .then(() => setIsProcessing(false));
          });
      }
    }
  };

  const blockStrategyTitle =
    blockStrategy === 0
      ? "막기 전략을 선택하세요."
      : blockStrategy === 1
        ? '"시작 ~ 끝" 시간이 비어있다면 막기'
        : blockStrategy === 2
          ? '"시작 ~ 끝" 시간 중에서 비어있는 곳 막기'
          : blockStrategy === 3
            ? '"시작 ~ 끝" 시간 중에서 겹치는 예약을 취소시키고 막기'
            : "다시 선택하세요.";

  return (
    <div>
      <Navi />
      <div style={styles.container}>
        <AsyncImage style={styles.image} src={imgSrc} />
        <div
          style={{
            maxWidth: "768px",
          }}
        >
          <InputNameV2 value={user.username} />
          <InputDateV3
            value={bookDate}
            setValue={(v) =>
              handleOnSelectDate(v.getFullYear(), v.getMonth() + 1, v.getDate())
            }
          />
          <InputStartEndTimeV2
            min_time={moment("07:00", "hh:mm")}
            max_time={moment("23:00", "hh:mm")}
            book_date={bookDate}
            start_time={startTime}
            end_time={endTime}
            onSelectStartTime={handleOnSelectStartTime}
            onSelectEndTime={handleOnSelectEndTime}
          />
          <Form.Group as={Row} controlId="room">
            <Form.Label column sm="2">
              대여 장소
            </Form.Label>
            <Col sm="10">
              <Col style={{ backgroundColor: "#82e0aa" }}>
                <span>스터디 룸: </span>
                {[...new Array(10)].map((_, i) => (
                  <Form.Check
                    inline
                    label={i + 1}
                    name="group1"
                    type="checkbox"
                    checked={room[`1_${i + 1}`] && room[`1_${i + 1}`].enable}
                    onChange={(e) =>
                      handleOnSelectRoom(1, i + 1, e.target.checked)
                    }
                  />
                ))}
                <Form.Check
                  inline
                  label="전체"
                  name="group1"
                  type="checkbox"
                  checked={
                    room[`1_1`] &&
                    room[`1_1`].enable &&
                    room[`1_2`] &&
                    room[`1_2`].enable &&
                    room[`1_3`] &&
                    room[`1_3`].enable &&
                    room[`1_4`] &&
                    room[`1_4`].enable &&
                    room[`1_5`] &&
                    room[`1_5`].enable &&
                    room[`1_6`] &&
                    room[`1_6`].enable &&
                    room[`1_7`] &&
                    room[`1_7`].enable &&
                    room[`1_8`] &&
                    room[`1_8`].enable &&
                    room[`1_9`] &&
                    room[`1_9`].enable &&
                    room[`1_10`] &&
                    room[`1_10`].enable
                  }
                  onChange={(e) => {
                    const newRoom = { ...room };

                    [...new Array(10)].forEach((_, i) => {
                      const type = 1;
                      const no = i + 1;
                      const enable = e.target.checked;
                      const key = `${type}_${no}`;
                      newRoom[key] = { type: type, no: no, enable: enable };
                    });
                    setRoom(newRoom);
                  }}
                />
              </Col>

              <Col style={{ backgroundColor: "#DAF7A6" }}>
                <span>기타 장소: </span>
                <Form.Check
                  inline
                  label="세미나실"
                  name="group1"
                  type="checkbox"
                  onChange={(e) => handleOnSelectRoom(2, 1, e.target.checked)}
                />
                <Form.Check
                  inline
                  label="홀"
                  name="group1"
                  type="checkbox"
                  onChange={(e) => handleOnSelectRoom(4, 1, e.target.checked)}
                />
              </Col>
            </Col>
          </Form.Group>
          <InputPay
            paid={paid}
            pay_type={payType}
            region={department}
            etc_reason={payTypeEtcReason}
            setPayType={setPayType}
            setEtcReason={setPayTypeEtcReason}
            options={["card", "saved_money.d", "transfer", "etc"]}
          />
          <Form.Group as={Row}>
            <Form.Label column sm="2">
              막기 전략
            </Form.Label>
            <Col>
              <DropdownButton
                as={ButtonGroup}
                variant="outline-secondary"
                title={blockStrategyTitle}
                onSelect={(e) => setBlockStrategy(parseInt(e))}
              >
                <Dropdown.Item eventKey={1}>
                  "시작 ~ 끝" 시간 전체가 비어있는 것만 막기
                </Dropdown.Item>
                <Dropdown.Item eventKey={2}>
                  "시작 ~ 끝" 시간 중에서 비어있는 곳만 막기
                </Dropdown.Item>
                <Dropdown.Item eventKey={3}>
                  "시작 ~ 끝" 시간 중에서 겹치는 예약을 취소시키고 막기
                </Dropdown.Item>
              </DropdownButton>
            </Col>
          </Form.Group>
          <Button
            as={Col}
            onClick={handleOnClickBlock}
            variant={"primary"}
            disabled={isProcessing}
          >
            신청
          </Button>
        </div>
        <Modal show={blockResult.length > 0} onHide={() => setBlockResult([])}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table>
              <thead>
                <tr>
                  <th>상태</th>
                  <th>대상</th>
                  <th>상세</th>
                </tr>
              </thead>
              <tbody>
                {blockResult.length === 0
                  ? null
                  : blockResult.map((v) => {
                      return (
                        <tr>
                          <td>{v.result ? "성공" : "실패"}</td>
                          <td>{convertRoomToString(v.room)}</td>
                          <td>{v.message}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setBlockResult([])}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default BlockerPage;
