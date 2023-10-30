import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import {BsFillCreditCard2BackFill, BsPiggyBankFill} from "react-icons/bs";
// import NumPad from 'react-numpad';
import DepartmentDropdownSelectorComponent from "../bookModal/DepartmentSelector";


const INITIAL_TITLE = "지불 방법을 선택하세요."
const payTypeName = pay_type => {
    if (/^card.*/.test(pay_type)) return "카드"
    else if (/^transfer.*/.test(pay_type)) return "이체"
    else if (/^saved_money\.d.*/.test(pay_type)) return "적립금"
    else if (/^notion.*/.test(pay_type)) return "노션"
    else if (/^etc.*/.test(pay_type)) return "기타"
    else return INITIAL_TITLE
}

const split_pay_type = pay => {
    if (!pay) {
        return {
            t: "",
            r: "",
        }
    }
    else if (/^saved_money\.d.*/.test(pay.pay_type)) {
        return {
            t: "saved_money.d",
            r: pay.pay_type.replace("saved_money.d.", "")
        }
    }
    else {
        return {
            t: pay.pay_type,
            r: pay.comment ? `(${pay.comment})` : ""
        }
    }
}


const InputPay = (
    {pay, paid, pay_type, region, etc_reason, setPayType, setRegion, setEtcReason, disabled = false, options=["card", "transfer", "saved_money.d", "saved_money.p", "etc"], setPaid = null
    }) => {

    const typeCard = null; // <Form.Control type="text" placeholder="카드" value={pay} readOnly />
    const typeTransfer = null; //<Form.Control type="text" placeholder="이체" value={pay} readOnly />
    const typeEtc = <Form.Control type="text" placeholder="사유" value={etc_reason} onChange={e => setEtcReason(e.target.value)}  />
    const typeNotion = null;

    const {t, r} = split_pay_type(pay)

    return <Form.Group
        as={Row}
        controlId="modalFormPay">
        <Form.Label column sm="2">지불</Form.Label>
        <Col sm="10">
            <InputGroup>
                <DropdownButton
                    variant={(pay && pay.status === "confirm")?"outline-success":"outline-secondary"}
                    title={(pay && pay.status === "confirm")? `정산됨-${payTypeName(t)}:${r}` : payTypeName(pay_type)}
                    id="input-group-dropdown-PayTypeComponent"
                    disabled={disabled}
                >
                    {options.includes("card")&&<Dropdown.Item key={"card"} onClick={() => setPayType("card")}><BsFillCreditCard2BackFill color={"#138d75"} />카드</Dropdown.Item>}
                    {options.includes("transfer")&&<Dropdown.Item key={"transfer"} onClick={() => setPayType("transfer")}>이체</Dropdown.Item>}
                    {options.includes("saved_money.d")&&<Dropdown.Item key={"saved_money.d"} onClick={() => setPayType("saved_money.d")}><BsPiggyBankFill color={"#138d75"} />적립금</Dropdown.Item>}
                    {(options.includes("etc") || options.includes("notion"))&&<Dropdown.Divider />}
                    {options.includes("notion")&&<Dropdown.Item key={"notion"} onClick={() => setPayType("notion")}>노션</Dropdown.Item>}
                    {options.includes("etc")&&<Dropdown.Item key={"etc"} onClick={() => setPayType("etc")}>기타</Dropdown.Item>}
                </DropdownButton>
                {pay_type === "card"? typeCard: null}
                {pay_type === "transfer"? typeTransfer: null}
                {pay_type === "saved_money.d"? (<DepartmentDropdownSelectorComponent region={region} setRegion={setRegion} disabled={true}/>): null}
                {pay_type === "notion"? typeNotion: null}
                {pay_type === "etc"? typeEtc: null}
                {setPaid?<Form.Control type="number" value={`${paid}`} onChange={e => setPaid(Number(e.target.value))} />:<Form.Control value={`${paid} 원`} readOnly/>}
            </InputGroup>
        </Col>
    </Form.Group>

}

export default InputPay;