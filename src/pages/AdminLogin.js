import icon_main from "../static/icon_main.png";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isDebug } from "../utils";

import { getOTPCodeDemo } from "../api/demo";
import { post_otp } from "../api/auth";

const styles = {
  container: {
    background: isDebug() ? "skyblue" : "#F0F0F0",
    // background: "#F0F0F0",
    width: "35%",
    marginTop: 50,
    borderRadius: "35px",
  },
};

function AdminLogin() {
  const navigate = useNavigate();

  const [timer, setTimer] = useState(30);
  const [client, setClient] = useState({ name: "관리", client: "admin" });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleFormOtpOnChange = (event) => {
    setOtp(event.target.value);
  };

  useEffect(() => {
    // for debug
    const timer_debug = window.setTimeout(
      async () => setOtp(await getOTPCodeDemo()),
      0,
    );

    let timer_timer;
    function t(time_count) {
      if (window.location.pathname !== "/admin/login") {
      } else if (time_count <= 0) navigate("/", { replace: true, state: {} });
      else {
        setTimer(time_count - 1);
        timer_timer = setTimeout(t, 1000, time_count - 1);
      }
    }
    timer_timer = setTimeout(t, 1000, timer);

    return () => {
      window.clearTimeout(timer_debug);
      window.clearTimeout(timer_timer);
    };
  }, []);

  const handleOnClickHome = () => navigate("/", { replace: true, state: {} });
  const handleOnClick = () => {
    post_otp(otp)
      .then((result) => {
        navigate("/admin", { replace: true, state: {} });
      })
      .catch((err) => {
        setOtp("");
        if (
          err &&
          err.response &&
          err.response.data &&
          err.response.data.message
        )
          setMessage(err.response.data.message);
      });
  };

  return (
    <div>
      <Container
        className={
          "d-flex flex-column justify-content-center align-items-center"
        }
        style={styles.container}
      >
        <img
          src={icon_main}
          alt="icon_main"
          style={{ width: 72, height: 72, marginTop: 150 }}
        />
        <h1>로그인이 필요합니다</h1>
        <div className="hr" />
        <Form>
          <Form.Group mb={4} controlId="formOTP">
            <Form.Label>코드를 입력하세요</Form.Label>
            <InputGroup>
              <DropdownButton
                title={client.name}
                variant="outline-secondary"
                id="admin-login-input-client-name"
              >
                <Dropdown.Item
                  onClick={() => setClient({ name: "관리", client: "admin" })}
                >
                  관리
                </Dropdown.Item>
              </DropdownButton>
              <Form.Control
                onChange={handleFormOtpOnChange}
                variant="outline-secondary"
                type="number"
                placeholder="OTP"
                value={otp}
                pattern="[0-9]*"
              />
            </InputGroup>
            <Form.Text muted>발급받은 OTP 코드를 입력해주세요.</Form.Text>
          </Form.Group>
          <p className={"text-center text-danger"}>{message}</p>
        </Form>
        <Col>
          <Button variant="secondary" size="lg" onClick={handleOnClickHome}>
            ({timer}초 후)홈으로
          </Button>
          <Button variant="primary" size="lg" onClick={handleOnClick}>
            확인
          </Button>
        </Col>
        <p className="mt-5 mb-3 text-muted">&copy; 2023</p>
      </Container>
    </div>
  );
}

export default AdminLogin;
