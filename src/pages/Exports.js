import Navi from "../components/Navbar";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";
import Badge from "react-bootstrap/Badge";
import {useEffect, useState} from "react";
import QrAuth from "../components/qr/QrAuth";
import axios from "axios";
import moment from "moment";

const type_list = [
    {
    name: "전체",
    id: "all",
    grade: 20,
    available: false,
    tag: {
        variant: "secondary",
        text: "사용불가",
    }
}, {
    name: "가입일",
    id: "user.created",
    grade: 20,
    available: false,
    tag: {
        variant: "secondary",
        text: "사용불가",
    }
}, {
    name: "마지막 QR 인증",
    id: "log.qr.latest",
    grade: 20,
    available: false,
    tag: {
        variant: "secondary",
        text: "사용불가",
    }
}, {
    name: "미인증 사용자",
    id: "user.invalid",
    grade: 20,
    available: false,
    tag: {
        variant: "secondary",
        text: "사용불가",
    }
}, {
    name: "QR 인증",
    id: "log.auth",
    grade: 15,
    available: true,
    tag: {
        variant: "success",
        text: "매니저",
    }
}, {
    name: "메시지 기록",
    id: "log.message",
    grade: 20,
    available: false,
    tag: {
        variant: "secondary",
        text: "사용불가",
    }
}, {
    name: "에러 기록",
    id: "log.error",
    grade: 20,
    available: false,
    tag: {
        variant: "secondary",
        text: "사용불가",
    }
}, {
    name: "스터디룸 대관 기록",
    id: "log.study.usage",
    grade: 20,
    available: true,
    tag: {
        variant: "danger",
        text: "관리자",
    }
}, {
    name: "스터디룸 대관 기록(성공만)",
    id: "log.study.usage.only_success",
    grade: 20,
    available: true,
    tag: {
        variant: "danger",
        text: "관리자",
    }
}, {
    name: "적립 기록",
    id: "log.donation",
    grade: 20,
    available: true,
    tag: {
        variant: "danger",
        text: "관리자",
    }
}, {
    name: "적립 기록(성공만)",
    id: "log.donation.only_success",
    grade: 20,
    available: true,
    tag: {
        variant: "danger",
        text: "관리자",
    }
}, {
    name: "원장 목록",
    id: "user.grade.vip",
    grade: 20,
    available: true,
    tag: {
        variant: "danger",
        text: "관리자",
    }
}, ]
const getExport = (token, params) => axios.get("/api/exports", {params: params, responseType: "blob", headers: {"Authorization": token}})

const Exports = () => {
    const [show_qr, setShowQr] = useState(false);
    const [user, setUser] = useState(null);
    const [select, setSelect] = useState("");
    const [is_manager, setIsManager] = useState(false);
    const [is_admin, setIsAdmin] = useState(false);
    const [start_date, setStartDate] = useState(moment());
    const [end_date, setEndDate] = useState(moment())
    const [downloading, setDownloading] = useState(false);
    const [download_error, setDownloadError] = useState('');

    const items = type_list.map(value => {
        if (is_manager && value.grade <= 15) return <Dropdown.Item disabled={!value.available} onClick={() => setSelect(value.id)}><Badge bg={value.tag.variant}>{value.tag.text}</Badge>{value.name}</Dropdown.Item>;
        else if (is_admin && value.grade <= 20) return <Dropdown.Item disabled={!value.available} onClick={() => setSelect(value.id)}><Badge bg={value.tag.variant}>{value.tag.text}</Badge>{value.name}</Dropdown.Item>;
        return null
    }).filter(value => value !== null)

    useEffect(() => {
        if (user) {
            setIsManager(user.grade >= 15);
            setIsAdmin(user.grade >= 20);
        } else {
            setIsManager(false);
            setIsAdmin(false);
        }
    }, [user])

    const isManager = () => user && user.grade && user.grade >= 15;
    const isAdmin = () => user && user.grade && user.grade >= 20;

    const handleUser = (user) => {setUser(user); setShowQr(false); console.log(user)}
    const handleOnClickQr = e => setShowQr(true);
    const handleDownload = response => {
        const name = response.headers["content-disposition"]
            .split("filename=")[1]
            .replace(/"/g, "");
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", name);
        link.style.cssText = "display:none";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setDownloading(false);
    }
    const handleDownloadError = error => {
        setDownloading(false);
        if (error.response && error.response.status) {
            setDownloadError(`[${error.response.status}] ${error.response.statusText}`)
        }
        else {
            setDownloadError("알 수 없는 에러 발생")
        }
    }

    const handleOnClickDownload = () => {
        setDownloading(true);
        const params = {
            start_date: start_date.format("YYYY-MM-DD"),
            end_date: end_date.format("YYYY-MM-DD"),
            category: select,
        }
        getExport(`QR ${user.qr}`, params).then(handleDownload).catch(handleDownloadError)
    }

    return (<div>
        <Navi />
        <Container>
            <p>권한 인증</p>
            {show_qr && <QrAuth handleUser={handleUser} />}
            {(!show_qr && !user) && <Button variant={user?"success":"secondary"} onClick={handleOnClickQr}>QR 인증</Button>}
            {user && <p>
                {isAdmin()?<Badge bg="danger" pill>관리자</Badge>:(isManager()&&<span>플린이</span>)}
                {user.username} 님</p>}
            <Form.Group>
                <Form.Label>종류</Form.Label>
                <InputGroup>
                    <DropdownButton title={select? (<><Badge bg={type_list.find(v => v.id === select).tag.variant}>{type_list.find(v => v.id === select).tag.text}</Badge>{type_list.find(v => v.id === select).name}</>) : "선택하세요"}>
                        {items}
                    </DropdownButton>
                </InputGroup>
            </Form.Group>
            <Form.Group>
                <Form.Label>기간</Form.Label>
                <InputGroup>
                    <Form.Control type={"date"} onChange={e => setStartDate(moment(e.target.value))} value={start_date.format("YYYY-MM-DD")} placeholder={"시작"} />
                    <InputGroup.Text> - </InputGroup.Text>
                    <Form.Control type={"date"} onChange={e => setEndDate(moment(e.target.value))} value={end_date.format("YYYY-MM-DD")} placeholder={"끝"} />
                </InputGroup>
            </Form.Group>

            <Button onClick={handleOnClickDownload} disabled={!user || !type_list.find(v => v.id === select) || downloading}>
                {downloading && <Spinner animation={"border"} />}다운로드
            </Button>
            {download_error && <span className={"text-danger"}>{download_error}</span>}
        </Container>
    </div>)
}

export default Exports;