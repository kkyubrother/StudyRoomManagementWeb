import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import axios from "axios";
import { MdReportProblem } from "react-icons/md";
import { isDebug } from "../utils";

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    // backgroundColor: isDebug()? "#f1948a": "white",
  },
  rowAdmin: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "10vh",
    // backgroundColor: "skyblue",
    // backgroundColor: isDebug()? "skyblue": "white",
  },
  row: {
    // margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "85vh",
    // backgroundColor: "gray"
  },
  col: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "20vw",
    // height: "20vh",
    marginTop: 25,
  },
  card: {
    width: "30vw",
    height: "65vh",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    // backgroundColor: "mintcream"
  },
  text: {
    fontSize: "3em",
    fontWeight: "bold",
  },
  rowFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "5vh",
  },
  colFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const CardItem = ({ onClick, img_src, text }) => {
  return (
    <Card style={styles.card} onClick={onClick}>
      <Card.Img variant="top" src={img_src} style={styles.image} />
      <Card.Body>
        <Card.Text className="text-center" style={styles.text}>
          {text}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

const ModalMessage = ({ show, onHide, message }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header>
        <Modal.Title>{message}</Modal.Title>
      </Modal.Header>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const Main = (props) => {
  // console.debug(`Main::props::${JSON.stringify(props, null, 2)}`);

  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(
    Boolean(location.state && location.state.message),
  );

  const [server_title, setServerTitle] = useState("");
  const [server_version, setServerVersion] = useState("");
  const [copyright, setCopyRight] = useState("");
  const [server_alive, setServerAlive] = useState(false);

  const handleServerInfo = (result) => {
    setServerAlive(true);
    setServerTitle(result.title);
    setServerVersion(result.server_version);
    setCopyRight(result.copyright);
  };
  const handleErrorServerInfo = (error) => setServerAlive(false);

  useEffect(() => {
    axios
      .get("/api/info", { timeout: 5000 })
      .then((response) => response.data)
      .then(handleServerInfo)
      .catch(handleErrorServerInfo);
    const i = setInterval(() => {
      axios
        .get("/api/info", { timeout: 5000 })
        .then((response) => response.data)
        .then(handleServerInfo)
        .catch(handleErrorServerInfo);
    }, 1000 * 10);

    return () => {
      clearInterval(i);
    };
  }, []);

  return (
    <Container style={styles.container} fluid>
      <Row
        style={styles.rowAdmin}
        onClick={() =>
          navigate("/admin/login", { state: { backref: "/books" } })
        }
      >
        <h1 style={{ textAlign: "center", fontWeight: "bold" }}>
          {" "}
          {/*관리자 진입*/}
        </h1>{" "}
      </Row>
      <Row style={styles.row}>
        <Col style={styles.col}>
          <CardItem
            img_src={"img_guest/icon-book.png"}
            text={"현장 사용"}
            onClick={() =>
              navigate("/guest", { state: { backref: "/guest/book" } })
            }
          />
        </Col>
        <Col style={styles.col}>
          <CardItem
            img_src={"img_guest/icon-donation.png"}
            text={"가입"}
            onClick={() => navigate("/guest/signup")}
          />
        </Col>
        <Col style={styles.col}>
          <CardItem
            img_src={"img_guest/icon-find.png"}
            text={"예약 확인"}
            onClick={() =>
              navigate("/guest", { state: { backref: "/guest/book_check" } })
            }
          />
        </Col>
      </Row>
      <Row style={styles.rowFooter}>
        <Col style={styles.colFooter}>
          {server_title}({server_version})
          {!server_alive && <MdReportProblem style={{ color: "#B82647" }} />}
        </Col>
        <Col style={styles.colFooter}>{copyright}</Col>
        <Col style={styles.colFooter}>
          {document.querySelector('meta[name="description"]').content}
        </Col>
      </Row>
      <ModalMessage
        show={show}
        onHide={() => setShow(false)}
        message={location.state && location.state.message}
      />
    </Container>
  );
};

export default Main;
