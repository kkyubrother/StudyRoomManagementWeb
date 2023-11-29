import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const getPeopleNoTitle = (people_no) => {
  switch (people_no) {
    case -2:
      return " 팀 ";
    case -4:
      return "개인";
    case null:
      return "모임을 선택하시오.";
    case undefined:
      return "모임을 선택하시오.";
    default:
      return `${people_no} 명`;
  }
};

const InputPeopleNoV2 = ({ people_no, setPeopleNo, disabled = false }) => {
  return (
    <Form.Group as={Row} controlId={`InputPeopleNo`}>
      <Form.Label column sm="2">
        {"모임"}
      </Form.Label>
      <Col sm="10">
        <DropdownButton title={getPeopleNoTitle(people_no)} disabled={disabled}>
          <Dropdown.Item key={-2} onClick={() => setPeopleNo(-2)}>
            {" "}
            팀{" "}
          </Dropdown.Item>
          <Dropdown.Item key={-4} onClick={() => setPeopleNo(-4)}>
            개인
          </Dropdown.Item>
        </DropdownButton>
      </Col>
    </Form.Group>
  );
};

export default InputPeopleNoV2;
