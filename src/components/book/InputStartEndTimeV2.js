import moment from "moment";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";

const DropdownTime = ({
  title = "시간 선택",
  min,
  max,
  onSelect,
  disabled,
}) => {
  const items = [];

  const start_value = Math.floor((min.hour() * 60 + min.minute()) / 30);
  const end_value = Math.floor((max.hour() * 60 + max.minute()) / 30);

  let i;
  for (i = start_value; i <= end_value; i++) {
    const hour = (i - (i % 2)) / 2;
    const minute = (i % 2) * 30;
    items.push(
      <Dropdown.Item onClick={() => onSelect(hour, minute)}>
        {hour}:{minute === 0 ? "00" : "30"}
      </Dropdown.Item>,
    );
  }

  return (
    <DropdownButton
      variant="outline-secondary"
      drop="end"
      title={title}
      id={`InputDate${title}`}
      disabled={disabled}
    >
      {items}
    </DropdownButton>
  );
};

const InputStartEndTimeV2 = ({
  min_time = moment("12:00", "hh:mm"),
  max_time = moment("22:00", "hh:mm"),
  start_time = moment("12:00", "hh:mm"),
  end_time = moment("12:00", "hh:mm"),
  onSelectStartTime = ({ hour = 0, minute = 0 }) => {},
  onSelectEndTime = ({ hour = 0, minute = 0 }) => {},
  disabled = false,
}) => {
  return (
    <Form.Group as={Row} controlId="modalFormDT">
      <Form.Label as={Col} sm={2}>
        입실/퇴실 시간
      </Form.Label>
      <Col sm={10}>
        <InputGroup>
          <DropdownTime
            title={start_time ? start_time.format("HH:mm") : undefined}
            min={min_time}
            max={end_time ? end_time : max_time}
            onSelect={onSelectStartTime}
            disabled={disabled}
          />
          <InputGroup.Text>-</InputGroup.Text>
          <DropdownTime
            title={end_time ? end_time.format("HH:mm") : undefined}
            min={start_time ? start_time : min_time}
            max={max_time}
            onSelect={onSelectEndTime}
            disabled={disabled}
          />
        </InputGroup>
      </Col>
    </Form.Group>
  );
};

export default InputStartEndTimeV2;
