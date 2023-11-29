import { useEffect, useState } from "react";
import { putUser } from "../../api/users";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import TableBook from "./TableBook";
import TableAuthQr from "./TableAuthQr";

const UserExpandedComponent = ({ data }) => {
  const MALE = 1;
  const FEMALE = 2;

  const [auth, setAuth] = useState({});
  const [user_id, setUserId] = useState(-1);
  const [username, setUsername] = useState("");
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState(0);
  const [birthday, setBirthday] = useState("");
  const [tel, setTel] = useState("010-xxxx-xxxx");
  const [grade, setGrade] = useState(0);
  const [department, setDepartment] = useState("");

  const [save_message, setSaveMessage] = useState("저장");

  const handleChangeUsername = (e) => setUsername(e.target.value);
  const handleGenderSelectMale = (e) => setGender(MALE);
  const handleGenderSelectFemale = (e) => setGender(FEMALE);
  const handleChangeBirthday = (e) => {
    if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6)
      setBirthday(e.target.value);
  };
  const handleAuthCheck = (e) => {
    setTel(data.num);
    setAuth(2);
  };
  const handleSave = (e) => {
    putUser(
      data.user_id,
      username !== data.username ? username : undefined,
      birthday !== data.birthday ? birthday : undefined,
      gender !== data.gender ? gender : undefined,
      age !== data.age ? age : undefined,
      tel === data.num || tel === "010-xxxx-xxxx" ? undefined : tel,
      grade !== data.grade ? grade : undefined,
      department !== data.department ? department : undefined,
    )
      .then((user) => {
        data.age = user.age;
        setAge(user.age);

        setSaveMessage("저장됨");
        setTimeout(() => setSaveMessage("저장"), 3000);
      })
      .catch((error) => {
        if (error.response) {
          alert(error.response.data.message);
        }
      });
  };

  const handleOnChangeGrade = (eventKey, event) => setGrade(eventKey);

  const getGradeTitle = (grade) => {
    switch (Number(grade)) {
      case 0:
        return "회원";
      case 10:
        return "특별회원";
      case 15:
        return "매니저";
      case 20:
        return "관리자";
      default:
        return "알 수 없음";
    }
  };
  const getGradeVariant = (grade) => {
    switch (Number(grade)) {
      case 0:
        return "white";
      case 10:
        return "info";
      case 15:
        return "success";
      case 20:
        return "danger";
      default:
        return "secondary";
    }
  };

  useEffect(() => {
    setAuth({});
    setUserId(data.user_id);
    setUsername(String(data.username));
    setAge(data.age ? Number(data.age) : undefined);
    setGender(Number(data.gender));
    setBirthday(String(data.birthday));
    setTel(String(data.num ? "010-xxxx-xxxx" : ""));
    setGrade(Number(data.grade));
    setDepartment(String(data.department));
  }, [data]);

  return (
    <Container style={{ background: "whitesmoke" }}>
      <Row>
        <Form.Group as={Col} controlId="formGridName" sm={4}>
          <Form.Label>이름</Form.Label>
          <Form.Control
            type="text"
            placeholder="이름"
            value={username}
            onChange={handleChangeUsername}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="formGridAge" sm={4}>
          <Form.Label>나이</Form.Label>
          <Form.Control
            type="text"
            placeholder="나이"
            value={data.age}
            readOnly
          />
        </Form.Group>
        <Form.Group as={Col} controlId="formGridGender" sm={2}>
          <p>성별</p>
          <Form.Check
            inline
            label={"남"}
            type={"radio"}
            checked={gender === 1}
            onChange={handleGenderSelectMale}
          />
          <Form.Check
            inline
            label={"여"}
            type={"radio"}
            checked={gender === 2}
            onChange={handleGenderSelectFemale}
          />
        </Form.Group>
        <Col sm={2}>
          <p>등급 설정</p>
          <DropdownButton
            title={getGradeTitle(grade)}
            variant={getGradeVariant(grade)}
            onSelect={handleOnChangeGrade}
          >
            <Dropdown.Item eventKey={0}>
              <Badge bg={getGradeVariant(0)}> </Badge>회원
            </Dropdown.Item>
            <Dropdown.Item eventKey={10}>
              <Badge bg={getGradeVariant(10)}> </Badge>특별회원
            </Dropdown.Item>
            <Dropdown.Item eventKey={15}>
              <Badge bg={getGradeVariant(15)}> </Badge>매니저
            </Dropdown.Item>
            <Dropdown.Item eventKey={20}>
              <Badge bg={getGradeVariant(20)}> </Badge>관리
            </Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>

      <Row>
        <Form.Group as={Col} controlId="formGridBirth" md={4}>
          <Form.Label>생년월일</Form.Label>
          <Form.Control
            type="text"
            placeholder="생년월일"
            value={birthday}
            onChange={handleChangeBirthday}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="formGridNum" md={4}>
          <Form.Label>전화번호</Form.Label>
          <Form.Control
            type="text"
            placeholder="전화번호"
            value={tel}
            className={
              data.valid ? "bg-success text-white" : "bg-danger text-white"
            }
            onChange={(e) => setTel(e.target.value)}
            readOnly={Boolean(auth)}
          />
        </Form.Group>
        <Col md={2}>
          <span style={{ display: "block" }}>권한 인증</span>
          <Button variant="info text-white" onClick={handleAuthCheck}>
            QR 인증
          </Button>
        </Col>
        <Col md={2}>
          <span style={{ display: "block" }}>저장</span>
          <Button
            variant={save_message === "저장" ? "primary" : "info text-white"}
            onClick={handleSave}
          >
            {save_message}
          </Button>
        </Col>
      </Row>
      <hr />

      <Row>
        <Container>
          <TableBook user_id={user_id} />
        </Container>
      </Row>
      <hr />

      <Row>
        <Container>
          <TableAuthQr user_id={user_id} />
        </Container>
      </Row>
      <hr />
    </Container>
  );
};

export default UserExpandedComponent;
