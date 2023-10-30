import {useEffect, useState} from "react";
import moment from "moment";
import {calcPaid} from "../utils";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import TimeSelectorComponent from "./bookModal/TimeSelector";
import PayTypeSelectorComponent from "./bookModal/PayTypeSelector";
import DepartmentDropdownSelectorComponent from "./bookModal/DepartmentSelector";
import PeopleNoSelectorComponent from "./bookModal/PeopleNoSelector";
import RoomSelectorComponent from "./bookModal/RoomSelector";
import {postBook} from "../api/books";


const CustomInput = ({label, value, onChange}) => (
    <Form.Group as={Row} className="mb-3" controlId={`BookModalCustomInput${label}`}>
        <Form.Label column sm="2">{label}</Form.Label>
        <Col sm="10">
            <Form.Control type="text" placeholder={label} value={value} readOnly={!Boolean(onChange)} onChange={onChange} />
        </Col>
    </Form.Group>
)

const REGION_INITIAL_STATE = "지역을 선택하세요";

const BookModal = ({getUser, data, book_date, handleModalClose, handlePayed, handleChangeRoom, setBook}) => {
    console.log(getUser());
    const user = getUser()
    const [pay_type, setPayType] = useState("card")
    const [region, setRegion] = useState(REGION_INITIAL_STATE);
    const [etc_reason, setEtcReason] = useState("");
    const [room_type, setRoomType] = useState(1);

    // const book_date = data.book_date;

    const [paid, setPaid] = useState(0)

    // const title = `[${data.department}] ${data.user.username} 포함 ${data.people_no}명\n${start_time.format("HH:mm")} - ${end_time.format("HH:mm")}`;

    const [selected_start_time, setSelectedStartTime] = useState(null);
    const [selected_end_time, setSelectedEndTime] = useState(null);
    const [people_no, setPeopleNo] = useState(0);
    const [username, setUsername] = useState(getUser().username);
    const [room, setRoom] = useState({no:1, type:1, name:"스터디룸 1번방", available: null, reason: null})

    const [title, setTitle] = useState("")

    // const min_time = moment("09:00", "hh:mm")
    const min_time = moment();
    const max_time = moment("22:00", "hh:mm");

    const handleOnClickPayed = e => {
        postBook(
            user.chat_id,
            user.user_id,
            book_date,
            selected_start_time.format("HH:mm:ssZ"),
            selected_end_time.format("HH:mm:ssZ"),
            room.type,
            room.no,
            people_no,
            region,
            pay_type,
            etc_reason,
        )
            .then(result => {
                handleModalClose()
                console.log(result)
            })
    }

    useEffect(() => {
        if (selected_start_time && selected_end_time) setPaid(calcPaid(room_type, selected_start_time, selected_end_time))
    }, [selected_start_time, selected_end_time])
    const handleOnSelectStartTime = (hour, minute) => {
        const t = moment(`${hour}:${minute}`, "HH:mm")
        if (selected_end_time && t.isSameOrAfter(selected_end_time)) alert("올바르지 않은 시간입니다.");
        else setSelectedStartTime(t);
    }
    const handleOnSelectEndTime = (hour, minute) => {
        const t = moment(`${hour}:${minute}`, "HH:mm")
        if (selected_start_time && t.isSameOrBefore(selected_start_time)) alert("올바르지 않은 시간입니다.");
        else setSelectedEndTime(t);
    }

    useEffect(() => {
        setTitle(
            `[${region}] ${username} 포함 ${people_no}명` +
            (selected_start_time && selected_end_time?`\n${selected_start_time.format("HH:mm")} - ${selected_end_time.format("HH:mm")}` : ""))
    }, [selected_start_time, selected_end_time, region, user, people_no])

    return (
        <Modal show={true} onHide={handleModalClose} size={"lg"}>
            <Modal.Header>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <CustomInput label={"이름"} value={username} onChange={undefined} />
                <TimeSelectorComponent
                    min_time={min_time}
                    max_time={max_time}
                    book_date={book_date}
                    start_time={selected_start_time}
                    end_time={selected_end_time}
                    onSelectStartTime={handleOnSelectStartTime}
                    onSelectEndTime={handleOnSelectEndTime}
                />
                <RoomSelectorComponent
                    room={room}
                    setRoom={setRoom}
                    date={book_date}
                    start_time={selected_start_time}
                    end_time={selected_end_time}
                    disabled={!(selected_start_time && selected_end_time)}
                />
                <Form.Group as={Row} className="mb-3" controlId={`BookModalCustomInput지역`}>
                    <Form.Label column sm="2">{"지역"}</Form.Label>
                    <Col sm="10">
                        <DepartmentDropdownSelectorComponent region={region} setRegion={setRegion} />
                    </Col>
                </Form.Group>
                <PeopleNoSelectorComponent people_no={people_no} setPeopleNo={setPeopleNo} />
                <PayTypeSelectorComponent
                    paid={paid}
                    pay_type={pay_type}
                    region={region}
                    etc_reason={etc_reason}
                    setPayType={setPayType}
                    setEtcReason={setEtcReason}
                />
                </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleModalClose}>
                    닫기
                </Button>
                <Button variant="primary" onClick={handleOnClickPayed}>
                    결제
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default BookModal;