import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";

import DepartmentDropdownSelectorComponent from "./DepartmentSelector";

const payTypeName = pay_type => {
    switch (pay_type) {
        case "card": return "카드"
        case "transfer": return "이체"
        case "region": return "적립금"
        case "etc": return "기타"
        default: return pay_type
    }
}


const PayTypeSelectorComponent = (
    {pay, paid, pay_type, region, etc_reason, setPayType, setRegion, setEtcReason
    }) => {
    // const pay_type = pay_type;

    const typeCard = null; // <Form.Control type="text" placeholder="카드" value={pay} readOnly />
    const typeTransfer = null; //<Form.Control type="text" placeholder="이체" value={pay} readOnly />
    const typeEtc = <Form.Control type="text" placeholder="사유" value={etc_reason} onChange={e => setEtcReason(e.target.value)}  />

    let t = pay ? pay.pay_type.split(".")[0] : ""
    let r = pay ? pay.pay_type.split(".")[1] : ""
    if (t !== "region") r = ""
    if (pay && pay.comment) r = `(${pay.comment})`

    return (
        <Form.Group as={Row} className="mb-3" controlId="modalFormPay">
            <Form.Label column sm="2">지불</Form.Label>
            <Col sm="10">
                <InputGroup>
                    <DropdownButton
                        variant={pay?"outline-success":"outline-secondary"}
                        title={pay? `정산됨-${payTypeName(t)}:${r}` : payTypeName(pay_type)}
                        id="input-group-dropdown-PayTypeComponent"
                        disabled={pay}
                    >
                        <Dropdown.Item key={"card"} onClick={() => setPayType("card")}>카드</Dropdown.Item>
                        <Dropdown.Item key={"transfer"} onClick={() => setPayType("transfer")}>이체</Dropdown.Item>
                        <Dropdown.Item key={"region"} onClick={() => setPayType("region")}>적립금</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item key={"etc"} onClick={() => setPayType("etc")}>기타</Dropdown.Item>
                    </DropdownButton>
                    {pay_type === "card"? typeCard: null}
                    {pay_type === "transfer"? typeTransfer: null}
                    {pay_type === "region"? (<DepartmentDropdownSelectorComponent region={region} setRegion={setRegion} disabled={true}/>): null}
                    {pay_type === "etc"? typeEtc: null}
                    <Form.Control value={paid + " 원"} readOnly />
                </InputGroup>
            </Col>

        </Form.Group>
    )
}

export default PayTypeSelectorComponent;