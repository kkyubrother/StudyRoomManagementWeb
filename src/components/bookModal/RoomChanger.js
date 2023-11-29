import { useEffect, useState } from "react";
import { getRooms } from "../../api/rooms";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Alert from "react-bootstrap/Alert";

const RoomChangerComponent = ({
  book_id,
  room,
  handleChangeRoom,
  book_date,
}) => {
  const [result_good, setResultGood] = useState(true);
  const [result, setResult] = useState("");
  const [room_data, setRoomData] = useState(room);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    getRooms({ date: book_date }).then((result) => {
      setRooms(result);
    });
  }, []);

  const handleSelectRoom = (room_type, room_no) => {
    handleChangeRoom(book_id, room_type, room_no)
      .then((room) => {
        setResultGood(true);
        setResult("방 변경 성공");
        setRoomData(room);
      })
      .catch((error) => {
        setResultGood(false);
        let reason = "방 변경 실패: ";
        if (error.response.status / 100 === 4) {
          reason += `응답 오류: [400] ${error.response.data.message}`;
        } else if (error.response.status / 100 === 5) {
          reason += `서버 오류: [500] ${error.response.data}`;
        }
        setResult(reason);
      });
  };

  return (
    <Form.Group as={Row} className="mb-3" controlId="modalFormRoomDropdown">
      <Form.Label column sm="2">
        장소
      </Form.Label>
      <Col sm={"10"}>
        <InputGroup>
          <DropdownButton
            variant="outline-secondary"
            title={room_data.name}
            id="input-group-dropdown-RoomDropdown"
          >
            {rooms
              .filter((value) => value.type === room_data.type)
              .map((value) => (
                <Dropdown.Item
                  disabled={!value.available}
                  key={`${value.type}-${value.no}`}
                  onClick={() => handleSelectRoom(value.type, value.no)}
                >
                  {value.name}
                </Dropdown.Item>
              ))}
          </DropdownButton>
          <Alert sm={3} variant={result_good ? "success" : "danger"}>
            {result}
          </Alert>
        </InputGroup>
      </Col>
    </Form.Group>
  );
};

export default RoomChangerComponent;
