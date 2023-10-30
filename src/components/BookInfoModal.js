import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import moment from "moment";
import {useState} from "react";
import {calcPaid} from "../utils";

import RoomSelectorComponent from "./bookModal/RoomChanger";
import PayTypeSelectorComponent from "./bookModal/PayTypeSelector";

const REGION_INITIAL_STATE = "지역을 선택하세요";



const BookInfoModal = ({data, handleModalClose, handlePayed, handleChangeRoom, setBook}) => {
    const [pay_type, setPayType] = useState("card")
    const [region, setRegion] = useState(REGION_INITIAL_STATE);
    const [etc_reason, setEtcReason] = useState("");

    const start_time = moment(`${data.book_date}T${data.start_time}`, "YYYY-MM-DDTHH:mm:ss");
    const end_time = moment(`${data.book_date}T${data.end_time}`, "YYYY-MM-DDTHH:mm:ss");

    const [paid, setPaid] = useState(calcPaid(data.room.type, start_time, end_time))

    const title = `[${data.department}] ${data.user.username} 포함 ${data.people_no}명\n${start_time.format("HH:mm")} - ${end_time.format("HH:mm")}`;

    const handleOnClickPayed = e => {
        handlePayed(
            data.user.user_id,
            data.book_id,
            paid,
            pay_type,
            region,
            etc_reason
        )
    }

    return (
        <Modal show={true} onHide={handleModalClose}>
            <Modal.Header>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <RoomSelectorComponent book_id={data.book_id} room={data.room} handleChangeRoom={handleChangeRoom} />
                <PayTypeSelectorComponent pay={data.pay} paid={paid} pay_type={pay_type} region={region} etc_reason={etc_reason} setPayType={setPayType} setRegion={setRegion} setEtcReason={setEtcReason} />
                </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleModalClose}>
                    닫기
                </Button>
                {!data.pay && <Button variant="primary" onClick={handleOnClickPayed}>
                    저장
                </Button>}
            </Modal.Footer>
        </Modal>
    );
}

export default BookInfoModal;