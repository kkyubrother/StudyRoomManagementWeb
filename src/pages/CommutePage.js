import React, {useEffect, useState} from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Badge from 'react-bootstrap/Badge';
import Navi from "../components/Navbar";
import {getUserQr, getUsers} from "../api/users";
import {getCommute, postCommute} from "../api/commute";
import moment from "moment";
import DatePicker from "react-datepicker";
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';


// https://sewonzzang.tistory.com/28
const UserStatus = {
    ERROR: "error",
    NOT_ENTER: "not_enter",
    NOT_EXIT: "not_exit",
    EXITED: "exited",

    toColor: status => {
        switch (status) {
            case "error": return "danger"
            case "not_enter": return "secondary"
            case "not_exit": return "primary"
            case "exited": return "success"
            default: return null;
        }
    }
}
Object.freeze(UserStatus);



const CommuteAuthComponent = props => {

    const {update, setUpdate} = props;
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const today = moment().format("YYYY-MM-DD");

    useEffect(() => {
        getUsers(sessionStorage.getItem("Authorization"))
            .then(users => users.filter(user => user.grade >= 15))
            .then(users => users.filter(user => user.user_id !== 1))
            .then(updateUserCommuteState)
    }, []);

    const updateUserCommuteState = users => {
        Promise
            .allSettled(users.map(async v => {return await getCommute("person", today, v.user_id)}))
            .then(result => {
                return result.map((v, i) => {
                    const user = users[i];
                    if (v.status !== "fulfilled") user.status = UserStatus.ERROR;
                    else if (v.value.data.length === 0) user.status = UserStatus.NOT_ENTER;
                    else {
                        const last_commute = v.value.data.pop();
                        user.status = last_commute.exit_time ? UserStatus.EXITED : UserStatus.NOT_EXIT;

                        user.enter_time = last_commute.enter_time ? moment(last_commute.enter_time).subtract(9, "hour") : null;
                        user.exit_time = last_commute.exit_time ? moment(last_commute.exit_time).subtract(9, "hour") : null;
                    }
                    return user;
                })
            })
            .then(result => setUsers(result))
            .then(() => setLoading(false))
    }

    const handleName = async user => {
        const isExit = user.status === UserStatus.NOT_EXIT;
        const action = user.status === UserStatus.NOT_EXIT ? "exit" : "enter";
        const message = `${user.username}님, ${user.status === UserStatus.NOT_EXIT ? "퇴근" : "출근"}하시나요?`

        if (!window.confirm(message)) {
            return;
        }

        let record = "모름"
        if (user.status !== UserStatus.NOT_EXIT) {
            if (window.confirm("오픈인가요?")) {
                record = "오픈"
            }
            else if (window.confirm("미들인가요?")) {
                record = "미들"
            }
            else if (window.confirm("마감인가요?")) {
                record = "마감"
            }
            else {
                return window.alert("올바른 선택이 아닙니다.");
            }
        }

        const user_qr = await getUserQr(user.user_id);
        const commute_result = await postCommute(action, user_qr, record);

        if (commute_result.message === "okay") {
            const header = `${isExit?"퇴근":"출근"}!`
            let body = "확인되었습니다.";
            props.showToast(header, body)
        }
        else {
            const header = `${isExit?"퇴근":"출근"} 오류!`
            let body = `${isExit?"퇴근":"출근"}에 실패하였습니다. 다시 시도해주세요.`;
            props.showToast(header, body, "danger")
        }

        setLoading(true);
        updateUserCommuteState(users);
        setUpdate(update + 1);
    }

    const convertBadge = user => {
        switch (user.status) {
            case "error": return <Badge bg="danger">에러</Badge>
            case "not_enter": return <Badge bg="secondary">모름</Badge>
            case "not_exit": return <Badge bg="primary">출근</Badge>
            case "exited": return <Badge bg="success">퇴근</Badge>
            default: return null;
        }
    }


    return <Col>
        <Row><h1 className="text-center">근태 관리</h1></Row>
        <Table>
            <thead><th>이름</th><th>상태</th><th>출근 시간</th><th>퇴근 시간</th></thead>
            <tbody>
            {
                (!loading && users) ? users.map(user => {
                    let variant = "";
                    try {
                        variant = `outline-${UserStatus.toColor(user.status)}`;
                    } catch (e) {
                        console.error(e);
                    }
                    return <tr>
                        <td><Button size="sm" variant={variant} onClick={() => handleName(user)}>{user.username}</Button></td>
                        <td>{convertBadge(user)}</td>
                        <td>{user.enter_time ? user.enter_time.format("HH:mm") : "-"}</td>
                        <td>{user.exit_time ? user.exit_time.format("HH:mm") : "-"}</td>
                    </tr>
                }) : <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            }
            </tbody>
        </Table>
    </Col>
}
const CustomDatePickerInput = ({value, onClick}) => {
    return (<h1 style={{width: "100%", textAlign: "center"}} onClick={onClick}>
        {value}
    </h1>);
}
const CommuteTableComponent = props => {

    const {update} = props;
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(moment());
    const [result, setResult] = useState([]);
    const [monthOrDate, setMonthOrDate] = useState(false);

    const convertResult = res => {return {commute_id: res.commute_id, enter_time: moment(res.enter_time), exit_time: moment(res.exit_time), user: res.user, record: res.record}}

    useEffect(() => {
        getCommute(monthOrDate?"month":"date", date.format("YYYY-MM-DD"))
            .then(res => setResult(res.data.map(convertResult)))
            .then(() => setLoading(false));
    }, [date, monthOrDate, update]);

    return <Col>
        <Row><Col md={8}><DatePicker
            dateFormat="yyyy-MM-dd"
            selected={date.toDate()}
            onChange={date => {
                setLoading(true);
                setDate(moment(date));
            }}
            customInput={<CustomDatePickerInput />}
            disabled={loading}
        /></Col>
            <Col md={4}><Button onClick={() => {setLoading(true); setMonthOrDate(!monthOrDate)}} disabled={loading}>{monthOrDate?"일별로 변경" : "월별로 변경"}</Button></Col>
        </Row>
        <Table>
            <thead>
            <tr>
                <th>이름</th>
                {monthOrDate && <th>날짜</th>}
                <th>출근 시간</th>
                <th>퇴근 시간</th>
                <th>기록</th>
            </tr>
            </thead>
            <tbody>
            {
                (loading) ? <tr><td></td>{monthOrDate && <td></td>}<td></td><td></td></tr> : result.map(res => {
                    return <tr>
                        <td>{res.user.username}</td>
                        {monthOrDate && <td>{res.enter_time.subtract(9, "hour").format("YYYY-MM-DD")}</td>}
                        <td>{res.enter_time.subtract(9, "hour").format("HH:mm")}</td>
                        <td>{res.exit_time.isValid() ? res.exit_time.subtract(9, "hour").format("HH:mm") : "-"}</td>
                        <td>{res.record}</td>
                    </tr>
                })
            }
            </tbody>
        </Table>
    </Col>
}


const CommutePage = props => {

    const [update, setUpdate] = useState(1);
    const [headerMessage, setHeaderMessage] = useState("");
    const [bodyMessage, setBodyMessage] = useState("");
    const [bg, setBg] = useState("light");
    const [showToast, setShowToast] = useState(false);

    const handleToast = (header, body, bg = null) => {
        setHeaderMessage(header);
        setBodyMessage(body);
        setBg(bg?bg:"light");
        setShowToast(true);
    }

    return <div>
        <Navi />
        <ToastContainer position="top-start">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={10000} autohide bg={bg}>
          <Toast.Header>
            <strong className="me-auto">{headerMessage}</strong>
            <small></small>
          </Toast.Header>
          <Toast.Body>{bodyMessage}</Toast.Body>
        </Toast>
            </ToastContainer>
        <Container><Row>
            <CommuteAuthComponent showToast={handleToast} update={update} setUpdate={setUpdate}/>
            <CommuteTableComponent update={update} />
                </Row>
        </Container>
    </div>
}

export default CommutePage;