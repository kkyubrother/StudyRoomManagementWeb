import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { useEffect, useState } from "react";
import { getRooms } from "../../api/rooms";

const InputRoom = ({
  room,
  setRoom,
  date,
  start_time,
  end_time,
  disabled = false,
}) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    getRooms({ date, start_time, end_time }).then((result) => {
      setRooms(result);
    });
  }, [date, start_time, end_time]);

  return (
    <Form.Group as={Row} controlId="modalFormRoomDropdown">
      <Form.Label column sm="2">
        장소
      </Form.Label>
      <Form.Label column sm="2">
        스터디룸
      </Form.Label>
      <Col sm={"3"}>
        <DropdownButton
          variant="outline-secondary"
          title={room ? room.name : "장소를 선택하세요."}
          id="input-group-dropdown-RoomDropdown"
          disabled={disabled}
        >
          {rooms
            .filter((value) => value.type === 1)
            .filter((value) => value.available)
            .map((value) => (
              <Dropdown.Item
                disabled={!value.available}
                key={`${value.type}-${value.no}`}
                onClick={() => setRoom(value)}
              >
                {value.name}
              </Dropdown.Item>
            ))}
        </DropdownButton>
      </Col>
      <Form.Label column sm="2">
        세미나/스터디
      </Form.Label>
      <Col sm={"3"}>
        <DropdownButton
          variant="outline-secondary"
          title={room ? room.name : "장소를 선택하세요."}
          id="input-group-dropdown-RoomDropdown"
          disabled={disabled}
        >
          {rooms
            .filter((value) => value.type === 2 || value.type === 3)
            .filter((value) => value.available)
            .map((value) => (
              <Dropdown.Item
                disabled={!value.available}
                key={`${value.type}-${value.no}`}
                onClick={() => setRoom(value)}
              >
                {value.name}
              </Dropdown.Item>
            ))}
        </DropdownButton>
      </Col>
    </Form.Group>
  );
};

export default InputRoom;
