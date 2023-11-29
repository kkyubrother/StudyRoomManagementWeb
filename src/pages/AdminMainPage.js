import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useNavigate } from "react-router-dom";
import Navi from "../components/Navbar";
import "./AdminMainPage.css";

import {
  MdAirplaneTicket,
  MdBookOnline,
  MdCabin,
  MdCalculate,
  MdFilePresent,
  MdOutlineAppBlocking,
  MdOutlineClearAll,
  MdOutlineLogout,
  MdOutlineSettingsApplications,
  MdQrCode,
  MdSupervisedUserCircle,
  MdOutlineInsertChartOutlined,
} from "react-icons/md";
import axios from "axios";
import { isDebug } from "../utils";

const AdminMainPage = (props) => {
  const navigate = useNavigate();

  const [serverInfo, setServerInfo] = useState("");

  useEffect(() => {
    axios
      .get("/api/info", { timeout: 1000 })
      .then((response) => response.data)
      .then((result) => {
        setServerInfo(result.server_version);
        if (!result.login) {
          alert("로그인이 필요합니다!!!");
        }
      });
  }, []);

  const handleLogout = () => {
    axios.get("/api/logout", { timeout: 1000 }).then((response) => {
      window.location.href = "/logout";
    });
  };

  const rowStyle = { minHeight: "10vw", fontSize: "2rem", textAlign: "center" };
  const colStyle = { cursor: "pointer" };
  return (
    <Container>
      <Navi />
      <Row style={rowStyle}>
        <h1>
          서버 버전: {serverInfo} / 클라 버전:{" "}
          {document.querySelector('meta[name="description"]').content}
        </h1>
      </Row>
      <Container className={"admin-main-page-container"}>
        <Row style={rowStyle}>
          <Col
            style={{ ...colStyle, backgroundColor: "#5499c7" }}
            onClick={() => navigate("/qr")}
          >
            <MdQrCode />
            QR 인증
          </Col>
          <Col
            style={{ ...colStyle, backgroundColor: "#a9cce3" }}
            onClick={() => navigate("/users")}
          >
            <MdSupervisedUserCircle />
            회원
          </Col>
          <Col
            style={{ ...colStyle, backgroundColor: "#a3e4d7" }}
            onClick={() => navigate("/books")}
          >
            <MdBookOnline />
            예약
          </Col>
          <Col
            style={{ ...colStyle, backgroundColor: "#a2d9ce" }}
            onClick={() => navigate("/lockers")}
          >
            <MdCabin />
            사물함
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col
            style={{ ...colStyle, backgroundColor: "#a2d9ce" }}
            onClick={() => navigate("/configs")}
          >
            <MdOutlineSettingsApplications />
            설정
          </Col>
          <Col
            style={{ ...colStyle, backgroundColor: "#a9dfbf" }}
            onClick={() => navigate("/exports")}
          >
            <MdFilePresent />
            추출
          </Col>
          <Col
            style={{ ...colStyle, backgroundColor: "#d5dbdb" }}
            onClick={() => navigate("/commute")}
          >
            <MdCalculate />
            출퇴근 관리
          </Col>
          <Col
            style={{ ...colStyle, backgroundColor: "#e59866" }}
            onClick={() => navigate("/coupon")}
          >
            <MdAirplaneTicket />
            쿠폰
          </Col>
          <Col
            style={{ ...colStyle, backgroundColor: "#f5b7b1" }}
            onClick={() => navigate("/accounts")}
          >
            <MdCalculate />
            마감 정산
          </Col>
        </Row>
        <Row style={rowStyle}>
          <Col
            style={{ ...colStyle, backgroundColor: "#f9e79f" }}
            onClick={() => navigate("/statusBook")}
          >
            <MdOutlineClearAll />
            대관 정보
          </Col>
          <Col
            style={{ ...colStyle, backgroundColor: "#58d68d" }}
            onClick={() => navigate("/chart")}
          >
            <MdOutlineInsertChartOutlined />
            통계
          </Col>
          <Col
            style={{ ...colStyle, backgroundColor: "#e6b0aa" }}
            onClick={() => navigate("/blocker")}
          >
            <MdOutlineAppBlocking />
            막기
          </Col>
          <Col
            style={{ ...colStyle, backgroundColor: "#cd6155" }}
            onClick={handleLogout}
          >
            <MdOutlineLogout />
            로그아웃
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default AdminMainPage;
