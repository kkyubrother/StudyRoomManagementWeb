import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const PEOPLE_NO = [1, 2, 3, 4];

const InputPeopleNo = ({ people_no, setPeopleNo, disabled = false }) => {
  return (
    <Form.Group as={Row} controlId={`InputPeopleNo`}>
      <Form.Label column sm="2">
        {"인원"}
      </Form.Label>
      <Col sm="10">
        <DropdownButton
          title={people_no ? `${people_no} 명` : "인원을 선택하세요."}
          disabled={disabled}
        >
          {PEOPLE_NO.map((value) => (
            <Dropdown.Item key={value} onClick={() => setPeopleNo(value)}>
              {value} 명
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </Col>
    </Form.Group>
  );
};

export default InputPeopleNo;
