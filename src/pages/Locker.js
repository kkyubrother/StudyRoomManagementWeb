import { useEffect, useState } from "react";
import Navi from "../components/Navbar";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import axios from "axios";
import { getUser, getUsers } from "../api/users";
import moment from "moment";
import LockerFormComponent from "../components/locker/LockerFormComponent";
import InputGroup from "react-bootstrap/InputGroup";

const getRental = (locker_rental_id) => {
  return axios.get(`/api/locker/${locker_rental_id}`);
};

const putRental = (
  locker_rental_id,
  locker_id,
  deadline,
  rental_key,
  payment_required,
  deposit,
) => {
  return axios.put(`/api/locker/${locker_rental_id}`, {
    deadline: deadline,
    locker_id,
    rental_key,
    payment_required,
    deposit,
  });
};

const putRentalVitalization = (locker_rental_id, vitalization) => {
  return axios.put(`/api/locker/${locker_rental_id}`, { vitalization });
};

const getLocker = (locker_id) => {
  return axios.get(`/api/locker`, { params: { locker_id } });
};

const postRental = (
  user_id,
  locker_id,
  department,
  rental_period,
  deposit,
  id_picture,
  rental_key,
  payment_required,
  licenser_id,
) => {
  return axios.post("/api/locker", {
    user_id,
    locker_id,
    department,
    rental_period,
    deposit,
    id_picture,
    rental_key,
    payment_required,
    licenser_id,
  });
};

const DUMMY_USER = {
  age: 27,
  birthday: "960306",
  chat_id: 123412345,
  created: "2023-01-01T00:00:00",
  delete_que: "",
  department: "",
  gender: 1,
  grade: 20,
  modified: "2023-01-01T00:01:01",
  num: "010-1234-1234",
  sms: 1,
  status: 0,
  tg_name: null,
  user_id: 2,
  username: "김규형",
  valid: true,
};
const DUMMY_LOCKER = {
  location_group: 1,
  location_x: 1,
  location_y: 1,
  locker_id: 1,
  locker_num: 1,
  main_key: 1,
  spare_key: 0,
  unavailable: false,
};

const DUMMY_RENTAL = {
  created: moment("2022-04-26T07:36:40"),
  deadline: moment("2022-05-15T07:36:40"),
  department: "테스트",
  deposit: 0,
  locker_id: 1,
  locker_rental_id: 1,
  payment_required: true,
  user_id: 2,
  user: DUMMY_USER,
  locker: DUMMY_LOCKER,
  vitalization: true,
};

const DUMMY_LOCKER_CONFIG = {
  location: [
    {
      group_id: 1,
      x: 4,
      y: 6,
    },
    {
      group_id: 2,
      x: 2,
      y: 2,
    },
  ],
};

const LockerPage = () => {
  const [editMode, setEditMode] = useState(false);
  const [deadlineValue, setDeadlineValue] = useState("");
  const [rentals, setRentals] = useState([DUMMY_RENTAL]);
  const [selectedRental, setSelectedRental] = useState(DUMMY_RENTAL);
  const [lockers, setLockers] = useState([]);
  const [users, setUsers] = useState([]);
  const [lockerConfig, setLockerConfig] = useState(DUMMY_LOCKER_CONFIG);
  const [locationGroupId, setLocationGroupId] = useState(1);

  useEffect(() => loadRental(), []);
  useEffect(() => loadLocker(), []);
  useEffect(() => loadUsers(), []);

  const isDisable = (locker_id) =>
    rentals.filter((rental) => rental.locker_id === locker_id).length !== 0;
  const lockerItemText = (locker) =>
    `[그룹:${locker.location_group} - ${locker.location_y}행 ${
      locker.location_x
    }열] ${locker.locker_num}번 사물함 ${
      isDisable(locker.locker_id) ? "(대여됨)" : ""
    }`;

  useEffect(() => {
    if (rentals.length > 0) {
      setSelectedRental(rentals[0]);
    }
  }, [rentals]);

  const loadUsers = () => {
    getUsers(sessionStorage.getItem("Authorization")).then((users) =>
      setUsers(users),
    );
  };

  const loadLocker = () => {
    getLocker(0)
      .then((response) => response.data)
      .then((result) => result.data)
      .then((value) => setLockers(value));
  };

  const loadRental = () => {
    getRental(0)
      .then((response) => response.data)
      .then((result) => result.data)
      .then((result) => result.filter((item) => item.vitalization))
      .then((result) => {
        result.forEach((rental) => {
          rental.created = moment(rental.created).add(9, "h");
          rental.deadline = moment(rental.deadline).add(9, "h");
        });

        Promise.all(
          result.map((item) => getLocker(item.locker_id).then((r) => r.data)),
        )
          .then((locker_result) => {
            result.forEach((rental) => {
              rental.locker = locker_result.filter(
                (locker) => locker.locker_id === rental.locker_id,
              )[0];
            });
          })
          .then(() => {
            Promise.all(
              result.map((item) =>
                getUser(sessionStorage.getItem("Authorization"), item.user_id),
              ),
            ).then((user_result) => {
              result.forEach((rental) => {
                rental.user = user_result.filter(
                  (user) => user.user_id === rental.user_id,
                )[0];
              });
              setRentals(result);
            });
          });
      });
  };

  const saveRental = (data) => {
    postRental(
      data.user_id,
      data.locker_id,
      data.department,
      data.rental_period,
      data.deposit,
      data.id_picture,
      data.rental_key,
      data.payment_required,
      data.licenser_id,
    ).then((response) => {
      loadRental();
      alert(`등록되었습니다(id: ${response.data.locker_rental_id})`);
    });
  };

  const getKeyStatus = (key_status) =>
    key_status === 0
      ? "보유"
      : key_status === 1
        ? "대여"
        : key_status === 2
          ? "분실"
          : "알 수 없음";
  const onEditValue = (rental) => {
    if (rental) {
      setDeadlineValue(rental.deadline.format("YYYY-MM-DD"));
    } else {
      setDeadlineValue(selectedRental.deadline.format("YYYY-MM-DD"));
    }
    setEditMode(true);
  };
  const onEditSave = (data) => {
    const deadlineText = `${deadlineValue}T${selectedRental.deadline
      .subtract(9, "h")
      .format("hh:mm:ss")}`;
    try {
      moment(deadlineText);
      putRental(
        selectedRental.locker_rental_id,
        data.locker_id,
        deadlineText,
        data.rental_key,
        data.payment_required,
        data.deposit,
      )
        .then(() => loadRental())
        .catch(() => {
          alert(`변경 실패`);
        });
      setEditMode(false);
    } catch (e) {
      alert(`올바른 입력이 아닙니다.`);
    }
  };
  const onEditEnd = () => {
    if (
      !window.confirm(
        `${selectedRental.user.username}님의 대여를 종료하시겠습니까?`,
      )
    )
      return;

    try {
      putRentalVitalization(selectedRental.locker_rental_id, false)
        .then(() => loadRental())
        .catch(() => {
          alert(`변경 실패`);
        });
      setEditMode(false);
    } catch (e) {
      alert(`올바른 입력이 아닙니다.`);
    }
  };

  const LockerContainer = (location_group) => {
    let x;
    let y;

    let location_group_config = lockerConfig.location.filter(
      (v) => v.group_id === location_group,
    );
    if (location_group_config.length === 0) {
      rentals
        .filter((v) => v.locker.location_group === location_group)
        .map((v) => {
          if (!x || v.locker.location_x > x) {
            x = v.locker.location_x;
          }
          if (!y || v.locker.location_y > y) {
            y = v.locker.location_y;
          }
        });
    } else {
      location_group_config = location_group_config[0];
      x = location_group_config.x;
      y = location_group_config.y;
    }

    // const result = [<Row style={{textAlign: "center"}}><h1>사물함 위치 그룹 {location_group}번</h1></Row>];
    const result = [];
    for (let i = 0; i < y; i++) {
      const result_x = [];
      for (let j = 0; j < x; j++) {
        let rental = rentals.filter(
          (v) =>
            v.locker.location_group === location_group &&
            v.locker.location_x === j + 1 &&
            v.locker.location_y === i + 1,
        );

        let r;
        const locker_num = i + 1 + j * y;

        if (rental.length) {
          rental = rental[0];
          const is_over_deadline = rental.deadline.isBefore(moment());
          const is_payment_required = rental.payment_required;

          let variant = "success";
          if (is_over_deadline) variant = "danger";
          if (!is_payment_required) variant = "secondary";
          const onClick = () => {
            setSelectedRental(rental);
            onEditValue(rental);
          };

          const text = editMode
            ? `${locker_num}`.padStart(2, "0")
            : `[${locker_num}번][${rental.department}] ${rental.user.username}`;
          const cardStyle = editMode ? { borderInlineWidth: "0.5rem" } : {};
          r = (
            <Card
              bg={variant}
              text="white"
              onClick={onClick}
              border={
                selectedRental.locker_rental_id === rental.locker_rental_id
                  ? "info"
                  : ""
              }
              style={cardStyle}
            >
              <Card.Body>
                <Card.Title>{text}</Card.Title>
              </Card.Body>
            </Card>
          );
        } else {
          const text = editMode
            ? `${locker_num}`.padStart(2, "0")
            : `[${locker_num}번]없음`;
          r = (
            <Card bg="dark" text="white">
              <Card.Body>
                <Card.Title>{text}</Card.Title>
              </Card.Body>
            </Card>
          );
        }

        const colStyle = editMode
          ? { paddingLeft: "1px", paddingRight: "1px" }
          : {};
        result_x.push(<Col style={colStyle}>{r}</Col>);
      }

      const rowStyle = editMode
        ? { marginTop: "1px", marginBottom: "1px" }
        : { marginTop: "5px", marginBottom: "5px" };
      result.push(<Row style={rowStyle}>{result_x}</Row>);
    }
    return result;
  };

  return (
    <div>
      <Navi />
      <Container>
        <Row style={{ textAlign: "center" }}>
          <h1>
            사물함 위치 그룹{" "}
            <Dropdown
              className={"d-inline-block"}
              onSelect={(e) => setLocationGroupId(Number(e))}
            >
              <Dropdown.Toggle size="lg">{`${locationGroupId}번`}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="1">1번</Dropdown.Item>
                <Dropdown.Item eventKey="2">2번</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </h1>
        </Row>
        {editMode ? null : (
          <Container>{LockerContainer(locationGroupId)}</Container>
        )}

        <Row>
          <Col>
            <div style={{ width: 10, height: 10 }}></div>
          </Col>
        </Row>
        <Row>
          {editMode && (
            <Col style={{ maxWidth: "300px" }}>
              {LockerContainer(locationGroupId)}
            </Col>
          )}
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>{lockerItemText(selectedRental.locker)}</Card.Title>
                {/*<Card.Subtitle>번호: {selectedRental.user.num}</Card.Subtitle>*/}
                {/*<Card.Text>사물함 위치: {lockerItemText(selectedRental.locker)}</Card.Text>*/}
                <Card.Text>대여 지역: {selectedRental.department}</Card.Text>
                <Card.Text>
                  대여 사용자:{" "}
                  {`${selectedRental.user.username}(${selectedRental.user.num})`}
                </Card.Text>
                <Card.Text>
                  열쇠: {getKeyStatus(selectedRental.locker.main_key)}
                </Card.Text>
                <Card.Text>
                  대여시작일: {selectedRental.created.format("YYYY-MM-DD")}
                </Card.Text>
                <Card.Text>
                  대여마감일:{" "}
                  {selectedRental.deadline.format("YYYY-MM-DD") + " 까지"}
                </Card.Text>
                {editMode && (
                  <InputGroup>
                    <Form.Control
                      value={deadlineValue}
                      onChange={(e) => setDeadlineValue(e.target.value)}
                      autoFocus={true}
                      placeholder="YYYY-MM-DD"
                    />
                    <InputGroup.Text>으로 수정</InputGroup.Text>
                  </InputGroup>
                )}
                <Card.Text>
                  대여: {selectedRental.vitalization ? "대여중" : "종료됨"}
                </Card.Text>
                <Card.Text>
                  비용:{" "}
                  {selectedRental.payment_required ? "지불함" : "지불안함"}
                </Card.Text>
                <Card.Text>보증금: {selectedRental.deposit} 원</Card.Text>
              </Card.Body>
            </Card>
            {editMode ? (
              <>
                <Button onClick={() => setEditMode(false)} variant="secondary">
                  취소
                </Button>
                <Button onClick={() => onEditEnd()} variant="danger">
                  대여종료
                </Button>
              </>
            ) : (
              <Button onClick={() => onEditValue()}>수정</Button>
            )}
          </Col>
          <Col>
            {editMode ? (
              <LockerFormComponent
                users={users}
                rentals={rentals}
                lockers={lockers}
                handleSave={onEditSave}
                defaultData={{
                  user_id: selectedRental.user_id,
                  locker_id: selectedRental.locker_id,
                  rental_period: 0,
                  department: selectedRental.department,
                  deposit: selectedRental.deposit,
                  id_picture: "EDIT",
                  rental_key: selectedRental.locker.main_key,
                  payment_required: selectedRental.payment_required,
                  licenser_id: 1,
                }}
              />
            ) : (
              <LockerFormComponent
                users={users}
                rentals={rentals}
                lockers={lockers}
                handleSave={saveRental}
              />
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LockerPage;
