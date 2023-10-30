import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import DepartmentDropdownSelectorComponent from "../bookModal/DepartmentSelector";

const InputDepartment = ({department, setDepartment, disabled=false}) => {
    return <Form.Group as={Row} controlId={`InputDepartment`}>
        <Form.Label column sm="2">{"지역"}</Form.Label>
        <Col sm="10">
            <DepartmentDropdownSelectorComponent region={department} setRegion={setDepartment} disabled={disabled} />
        </Col>
    </Form.Group>
}

export default InputDepartment;