import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useReducer, useState} from "react";
import GuestReducer, {
    changeDepartment,
    changePayType,
    changePayTypeEtcReason,
    changeUsername,
    initial_guest
} from "../../store/GuestReducer";
// import {Button, Col, Container, Modal, Row} from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import InputDepartment from "../../components/book/InputDepartment";
import InputPay from "../../components/book/InputPay";
import {getPay, PAY_STATUS_CONFIRM, PAY_STATUS_REJECT, PAY_STATUS_WAITING, postPayDonation} from "../../api/pays";
import InputNameV2 from "../../components/book/InputNameV2";


const styles = {
    container: {
        height: "100vh",
        display: 'flex',
        flexDirection: "column",
        alignItems: 'inherit',
        justifyContent: 'center',
    },
}
const ModalWaitPay = ({show, handleClose, title, message}) => (
    <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
    >
        <Modal.Header><Modal.Title>{title}</Modal.Title></Modal.Header>
        <Modal.Body>
            {message}
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={handleClose} >{"확인"}</Button>
        </Modal.Footer>
    </Modal>
)


const GuestDonationPage = props => {
    console.log(`GuestDonationPage::props::${JSON.stringify(props, null, 2)}`)
    const location = useLocation();
    const navigate = useNavigate();
    const [paid, setPaid] = useState(0)
    const [guest_state, dispatch] = useReducer(GuestReducer, initial_guest, undefined);
    const [modal, setModal] = useState(null);

    useEffect(() => {
        if (!location.state) navigate('/');
        else changeUsername(dispatch, location.state.user.username)
    }, [location.state, navigate])

    const handleOnClickDonation = () => {
        if (Number(paid) < 1000) {
            setModal(<ModalWaitPay
                show={true}
                title={"요청 실패"} message={"1000 원 부터 후원 가능합니다."}
                handleClose={() => setModal(null)} />)
            return
        }
        if (!guest_state.department) {
            setModal(<ModalWaitPay
                show={true}
                title={"요청 실패"} message={"지역을 선택하세요."}
                handleClose={() => setModal(null)} />)
            return
        }
        postPayDonation(
            location.state.user.user_id,
            "web.guard",
            guest_state.pay_type + (guest_state.department? "." + guest_state.department : ""),
            paid,
            guest_state.pay_type_etc_reason,
            "plin.kiosk.book"
        )
        .then(pay => {
            console.log(`GuestDonationPage::handleOnClickDonation::postPayDonation::pay::${JSON.stringify(pay, null, 2)}`)

            setModal(<ModalWaitPay show={true} title={"결제 대기중"} message={"결제해주세요"} />)
            const timer = 60;

            const wait_transaction = (pay_id, timer) => {
                console.log(`GuestDonationPage::handleOnClickDonation::postPayDonation::timer::${JSON.stringify(timer, null, 2)}`)
                setModal(<ModalWaitPay show={true} title={"결제 대기중"} message={`결제해주세요(${Math.round(timer/2)} 초)`} />)
                if (timer > 0) {
                    getPay(pay_id)
                        .then(pay_result => {
                            if (pay_result.status.startsWith(PAY_STATUS_CONFIRM)) {
                                console.log(`GuestBookPage::handleOnClickBook::postBook::postPay::pay_result::${JSON.stringify(pay_result, null, 2)}`)
                                setModal(<ModalWaitPay show={true} title={"결제 완료"} message={"결제되었습니다."} handleClose={() => navigate("/")} />)
                            }
                            else if (pay_result.status.startsWith(PAY_STATUS_REJECT)) {
                                setModal(<ModalWaitPay show={true} title={"결제 실패"} message={pay_result.comment?pay_result.comment:"다시 결제바랍니다."} handleClose={() => navigate("/")} />)
                            }

                            else if (pay_result.status.startsWith(PAY_STATUS_WAITING)) {
                                setTimeout(wait_transaction, 500, ...[pay_id, (timer - 1)])
                            }
                        })
                        .catch(error => {
                            console.error(error);
                            setModal(<ModalWaitPay show={true} title={"결제 실패"} message={error?error.response.message:"다시 결제바랍니다."} handleClose={() => navigate("/")} />)
                        })
                } else {
                    setModal(<ModalWaitPay show={true} title={"결제 대기 시간 초과"} message={"다시 결제바랍니다."} handleClose={() => navigate("/")} />)
                }
            }

            setTimeout(wait_transaction, 500, ...[pay.pay_id, timer])

        })
            .catch(error => {
                console.error(error);
                setModal(<ModalWaitPay
                    show={true}
                    title={"오류 발생"}
                    message={error?error.response.message:"다시 결제바랍니다."}
                    handleClose={() => navigate("/")}
                />)
            })
    }

    return <Container
        style={styles.container}
    >
        <InputNameV2
            value={guest_state.username} />
        <InputDepartment
            department={guest_state.department}
            setDepartment={(department) => changeDepartment(dispatch, department)}
            />
        <InputPay
            paid={paid}
            setPaid={setPaid}
            pay_type={guest_state.pay_type}
            region={guest_state.department}
            etc_reason={guest_state.pay_type_etc_reason}
            setPayType={(pay_type) => changePayType(dispatch, pay_type)}
            setEtcReason={(etc_reason) => changePayTypeEtcReason(dispatch, etc_reason)}
            options={["card"]}
        />
        <Row>
            <Button
                as={Col}
                onClick={() => navigate("/")}
                variant={"secondary"}>취소</Button>
            <Button
                as={Col}
                variant={"primary"}
                onClick={() => handleOnClickDonation()}
            >신청</Button>
        </Row>
        {modal}

    </Container>

}

export default GuestDonationPage;