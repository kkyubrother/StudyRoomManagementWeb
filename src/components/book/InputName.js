import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const InputName = ({ value, onChange, disabled = false }) => {
  return (
    <Form.Group
      // style={{width: "60vw"}}
      as={Row}
      controlId={`InputName`}
    >
      <Form.Label as={Col} sm="2">
        이름
      </Form.Label>
      <Col sm="10">
        <Form.Control
          type="text"
          placeholder="이름"
          value={value}
          readOnly={!Boolean(onChange)}
          onChange={onChange}
          disabled={disabled}
        />
      </Col>
    </Form.Group>
  );
};

export default InputName;
