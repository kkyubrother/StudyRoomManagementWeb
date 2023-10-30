import moment from "moment";
import DatePicker from 'react-datepicker';
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";


const CustomDatePickerInput = ({value, onClick}) => {
    return (<InputGroup.Text onClick={onClick}>{value}</InputGroup.Text>);
}

const InputDateV3 = (
    {
        value = moment().format("YYYY-MM-DD"),
        setValue = null,
    }
) => {
    return <Form.Group as={Row} controlId="InputDate">
        <Form.Label as={Col} sm="2">날짜</Form.Label>
        <Col sm="10">
            <InputGroup>
                <DatePicker
                    dateFormat="yyyy-MM-dd"
                    selected={moment(value, "YYYY-MM-DD").toDate()}
                    onChange={setValue}
                    customInput={<CustomDatePickerInput/>}
                    popperPlacement="top-end"
                />
            </InputGroup>
        </Col>
    </Form.Group>
}

export default InputDateV3;