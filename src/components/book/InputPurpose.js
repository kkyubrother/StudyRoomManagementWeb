import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";


const getPurposeTitle = purpose => {
    switch (purpose) {
        case "event":
            return "행사"
        case "seminar":
            return "세미나"
        case "meeting":
            return "모임"
        case "personal":
            return "개인목적"
        case null:
            return "목적을 선택하시오."
        default:
            return `${purpose}`
    }
}


const InputPurpose = ({purpose, setPurpose, disabled=false}) => {

    return <Form.Group
        as={Row}
        controlId={`InputPurpose`}>
        <Form.Label column sm="2">{"목적"}</Form.Label>
        <Col sm="10">
            <DropdownButton title={getPurposeTitle(purpose)} disabled={disabled}>
                <Dropdown.Item key={-1} onClick={() => setPurpose("event")}>행사</Dropdown.Item>
                <Dropdown.Item key={-2} onClick={() => setPurpose("seminar")}>세미나</Dropdown.Item>
                <Dropdown.Item key={-3} onClick={() => setPurpose("meeting")}>모임</Dropdown.Item>
                <Dropdown.Item key={-4} onClick={() => setPurpose("personal")}>개인목적</Dropdown.Item>
            </DropdownButton>
        </Col>
    </Form.Group>

}

export default InputPurpose;