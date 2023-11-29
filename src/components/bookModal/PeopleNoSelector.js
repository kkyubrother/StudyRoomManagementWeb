import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const PEOPLE_NO = [1, 2, 3, 4, 5, 6, 7, 8];

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

const PeopleNoSelectorComponent = ({ people_no, setPeopleNo }) => {
  return (
    <Form.Group
      as={Row}
      className="mb-3"
      controlId={`BookModalCustomInput인원`}
    >
      <Form.Label column sm="2">
        {"인원"}
      </Form.Label>
      <Col sm="10">
        <DropdownButton title={getPeopleNoTitle(people_no)}>
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

export default PeopleNoSelectorComponent;
