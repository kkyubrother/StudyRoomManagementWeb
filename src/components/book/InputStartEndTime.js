import moment from "moment";
import DatePicker from "react-datepicker";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";

const CustomDatePickerInput = ({ value, onClick }) => {
  return <InputGroup.Text onClick={onClick}>{value}</InputGroup.Text>;
};

const InputStartEndTime = ({
  min_time = moment("12:00", "hh:mm"),
  max_time = moment("22:00", "hh:mm"),
  book_date = moment().format("YYYY-MM-DD"),
  start_time = moment("12:00", "hh:mm"),
  end_time = moment("12:00", "hh:mm"),
  onSelectStartTime = ({ hour = 0, minute = 0 }) => {},
  onSelectEndTime = ({ hour = 0, minute = 0 }) => {},
  onSelectDate = null,
  disabled = false,
}) => {
  console.log(book_date);
  return (
    <Form.Group as={Row} controlId="modalFormDT">
      <Form.Label as={Col} sm={2}>
        일시
      </Form.Label>
      <Col sm={10}>
        <InputGroup>
          {onSelectDate === null || book_date === null ? (
            <InputGroup.Text>{book_date}</InputGroup.Text>
          ) : (
            <DatePicker
              dateFormat="yyyy-MM-dd"
              selected={moment(book_date, "YYYY-MM-DD").toDate()}
              onChange={onSelectDate}
              customInput={<CustomDatePickerInput />}
            />
          )}

          <InputGroup.Text>::</InputGroup.Text>
          <CustomTimeDropdown
            title={start_time ? start_time.format("HH:mm") : undefined}
            start_time={min_time}
            end_time={end_time ? end_time : max_time}
            onSelect={onSelectStartTime}
            disabled={disabled}
          />
          <InputGroup.Text>-</InputGroup.Text>
          <CustomTimeDropdown
            title={end_time ? end_time.format("HH:mm") : undefined}
            start_time={start_time ? start_time : min_time}
            end_time={max_time}
            onSelect={onSelectEndTime}
            disabled={disabled}
          />
        </InputGroup>
      </Col>
    </Form.Group>
  );
};

const CustomTimeDropdown = ({
  title = "시간 선택",
  start_time,
  end_time,
  onSelect,
  disabled = false,
}) => {
  // const value = moment().format("hh:mm");
  const items = [];

  const start_value = Math.floor(
    (start_time.hour() * 60 + start_time.minute()) / 30,
  );
  const end_value = Math.floor((end_time.hour() * 60 + end_time.minute()) / 30);

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
      title={title}
      id="input-group-dropdown-RoomDropdown"
      disabled={disabled}
    >
      {items}
    </DropdownButton>
  );
};

export default InputStartEndTime;
