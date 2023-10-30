import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import {useEffect, useState} from "react";
import {getRooms} from "../../api/rooms";

const RoomSelectorComponent = ({room, setRoom, date, start_time, end_time, disabled}) => {

    const [rooms, setRooms] = useState([])

    useEffect(() => {
        getRooms({date, start_time, end_time})
            .then(result => {
                setRooms(result);
                setRoom(result[0])
            })
    }, [date, start_time, end_time])

    return (
        <Form.Group as={Row} className="mb-3" controlId="modalFormRoomDropdown">
            <Form.Label column sm="2">장소</Form.Label>
            <Col sm={"10"}>
                <DropdownButton
                    variant="outline-secondary"
                    title={room?room.name:room}
                    id="input-group-dropdown-RoomDropdown"
                    disabled={disabled}
                >
                    {rooms
                        .filter(value => value.available)
                        .map(value => <Dropdown.Item disabled={!value.available} key={`${value.type}-${value.no}`} onClick={() => setRoom(value)}>{value.name}</Dropdown.Item>)
                    }
                </DropdownButton>
            </Col>
        </Form.Group>
    )
}


export default RoomSelectorComponent;