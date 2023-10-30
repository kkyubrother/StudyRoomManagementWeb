import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Overlay from "react-bootstrap/Overlay";
import Row from "react-bootstrap/Row";
import Tooltip from "react-bootstrap/Tooltip";
import {useRef, useState} from "react";

const FilterComponent = ({filterText, onFilter, onClear }) => {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    return (
        <Container>
            <Row>
                <Col md={{span: 2, offset: 8}}>
                    <Form.Control
                        ref={target}
                        id="search"
                        type="text"
                        placeholder="검색"
                        aria-label="Search Input"
                        value={filterText}
                        onChange={onFilter}
                        onFocus={() => setShow(true)}
                        onBlur={() => setShow(false)}
                    />
                    <Overlay target={target.current} show={show} placement="bottom">
                        {(props) => (
                            <Tooltip id="overlay-example" {...props}>
                                숫자만 입력: ID 검색<br/>
                                문자: 이름으로 검색<br/>
                                "등급:[
                                <span className={"text-white"}>회원</span>
                                |<span className={"text-info"}>원장</span>
                                |<span className={"text-success"}>매니저</span>
                                |<span className={"text-danger"}>관리자</span>]": 등급으로 검색<br/>
                            </Tooltip>
                        )}
                    </Overlay>
                </Col>
                <Col md={{span: 1, offset: 12}}>
                    <Button type="button" onClick={onClear}>
                        초기화
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default FilterComponent;