import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Modal from "react-bootstrap/Modal";
import { useLocation, useNavigate } from "react-router-dom";

const GuestSignUpPage = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [isRequestOtp, setRequestOtp] = useState(false);
  const [newUser, setUser] = useState({
    chat_id: Math.round(Math.random() * 10 ** 10),
    tg_name: "demo",
    username: "",
    age: "",
    gender: 0,
    tel: "",
    otp: "",
  });

  const handleRequestOtp = async () => {
    if (!newUser.username || !/[가-힣]+/.test(newUser.username)) {
      setMessage("한글 이름을 입력하세요.");
      setShow(true);
    } else if (!newUser.age || !/\d+/.test(newUser.age)) {
      setMessage("나이를 입력하세요.");
      setShow(true);
    } else if (!newUser.gender) {
      setMessage("성별을 선택하세요.");
      setShow(true);
    } else if (!newUser.tel || !/\d{3}-?\d{4}-?\d{4}/.test(newUser.tel)) {
      setMessage("올바른 휴대폰 번호를 입력하세요(예시: 010-1234-1234).");
      setShow(true);
    } else {
      const formData = new FormData();
      formData.append("chat_id", newUser.chat_id);
      formData.append("tg_name", newUser.tg_name);
      await (
        await fetch("/api/bot/users", {
          method: "POST",
          body: formData,
        })
      ).json();

      const signup_url = `/api/bot/users/by_chat_id/${newUser.chat_id}`;
      formData.append("username", newUser.username);
      formData.append("age", newUser.age);
      formData.append("gender", newUser.gender);
      formData.append("num", newUser.tel);

      await (
        await fetch(signup_url, {
          method: "PUT",
          body: formData,
        })
      ).json();

      const response = await (await fetch(`${signup_url}/sms`)).json();

      setUser({ ...newUser, otp: response.sms });
      setRequestOtp(true);
    }
  };

  const handleSignUpFinal = async () => {
    if (!newUser.otp || !/\d{6}/.test(newUser.username)) {
      setMessage("OTP를 입력하세요.");
      setShow(true);
    }

    const signup_url = `/api/bot/users/by_chat_id/${newUser.chat_id}/sms`;
    const formData = new FormData();
    formData.append("sms", newUser.otp);

    const response = await fetch(signup_url, {
      method: "POST",
      body: formData,
    });
    if (response.status !== 200) {
      setMessage("OTP를 올바르게 입력하였는지 확인하세요.");
      setShow(true);
    } else {
      navigate("/", {
        replace: true,
        state: { message: "가입되었습니다." },
      });
    }
  };

  return (
    <Container className={"g-1"}>
      <Row className={"my-2"}>
        <h1>회원가입</h1>
      </Row>
      <Row className={"my-2"}>
        <Form.Group as={Row} controlId={`InputName`}>
          <Form.Label as={Col} sm="2">
            이름
          </Form.Label>
          <Col sm="10">
            <Form.Control
              type="text"
              placeholder="이름"
              value={newUser.username}
              onChange={(e) =>
                setUser({ ...newUser, username: e.target.value })
              }
            />
          </Col>
        </Form.Group>
      </Row>
      <Row className={"my-2"}>
        <Form.Group as={Row} controlId={`InputAge`}>
          <Form.Label as={Col} sm="2">
            나이
          </Form.Label>
          <Col sm="10">
            <Form.Control
              type="number"
              placeholder="나이"
              value={newUser.age}
              onChange={(e) =>
                setUser({
                  ...newUser,
                  age: `${Number.parseInt(e.target.value)}`,
                })
              }
            />
          </Col>
        </Form.Group>
      </Row>

      <Row className={"my-2"}>
        <Form.Group as={Row} controlId={`inputGender`}>
          <Form.Label as={Col} sm="2">
            성별
          </Form.Label>
          <Col sm="10">
            <ButtonGroup className={"g-1"}>
              <Button
                onClick={() => setUser({ ...newUser, gender: 1 })}
                variant={newUser.gender === 1 ? "primary" : "outline-primary"}
              >
                남성
              </Button>
              <Button
                onClick={() => setUser({ ...newUser, gender: 2 })}
                variant={newUser.gender === 2 ? "primary" : "outline-primary"}
              >
                여성
              </Button>
            </ButtonGroup>
          </Col>
        </Form.Group>
      </Row>

      <Row className={"my-2"}>
        <Form.Group as={Row} controlId={`inputTel`}>
          <Form.Label as={Col} sm="2">
            전화번호
          </Form.Label>
          <Col sm="10">
            <Form.Control
              type="text"
              placeholder="전화번호"
              value={newUser.tel}
              onChange={(e) =>
                setUser({
                  ...newUser,
                  tel: e.target.value,
                })
              }
            />
          </Col>
        </Form.Group>
      </Row>

      <Row className={"my-2"}>
        <Button onClick={handleRequestOtp}>OTP 인증</Button>
      </Row>

      <Row className={"my-4"}>
        <Form.Group as={Row} controlId={`inputOTP`}>
          <Form.Label as={Col} sm="2">
            OTP
          </Form.Label>
          <Col sm="10">
            <Form.Control
              type="text"
              placeholder="OTP"
              disabled={!isRequestOtp}
              value={newUser.otp}
              onChange={(e) =>
                setUser({
                  ...newUser,
                  otp: e.target.value,
                })
              }
            />
          </Col>
        </Form.Group>
      </Row>

      <Row className={"my-2"}>
        <Button onClick={handleSignUpFinal} disabled={!isRequestOtp}>
          가입
        </Button>
      </Row>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>안내</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GuestSignUpPage;
