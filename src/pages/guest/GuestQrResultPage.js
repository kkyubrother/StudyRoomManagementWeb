import {useEffect, useState} from "react";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import {getUserByQr} from "../../api/auth";
// import QrReader from "react-qr-reader";
import QrReader from 'react-qr-scanner';
import qr_success_url from "../../sound/qr-success.wav";
import qr_fail_url from "../../sound/qr-fail.wav";

const DEFAULT_MODAL_TIMER = 3;
const DEFAULT_REFRESH_TIMER = 60;

const styles = {
    container: {
        height: "100vh",
        display: 'flex',
        flexDirection: "column",
        alignItems: 'center',
        justifyContent: 'center',
    },
}

const GuestQrResultPage = () => {
    const qr_success_sound = new Audio(qr_success_url);
    const qr_fail_sound = new Audio(qr_fail_url);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [show, setShow] = useState(false);
    const [timer_count, setTimerCount] = useState(5);


    const handleScan = async data => {
        if (!data) return;

        try {
            const user = await getUserByQr(data.text);
            if (user) {
                setUser(user);
                setShow(true);
                qr_success_sound.play().catch(e => console.error(e));
            }
        } catch (e) {
            setError(error.response.data);
            setShow(true);
            qr_fail_sound.play().catch(e => console.error(e));
        }
    }

    const handleError = error => console.error(error);

    const handleClose = () => {
        setShow(false);
        setUser(null);
        setError(null);
        window.location.reload();
    }

    useEffect(() => {
        const original_pathname = window.location.pathname;
        let i = null;

        function tick(t) {
            if (original_pathname !== window.location.pathname) {}
            else if (!show) {}
            else if (t > 0) {
                setTimerCount(t);
                i = setTimeout(tick, 1000, t - 1);
            }
            else handleClose();
        }

        i = setTimeout(tick, 1000, DEFAULT_MODAL_TIMER)
        return () => clearTimeout(i)
    }, [show]);

    return <Container style={styles.container} fluid>
        <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '50%' }}
        />
        <Modal show={show}>
            <Modal.Header>
                {user ? <Modal.Title>결과: 성공</Modal.Title> : null}
                {error ? <Modal.Title>결과: 실패</Modal.Title> : null}
            </Modal.Header>
            {
                user ? <Modal.Body>
                    <Row><Col>이름:</Col><Col>{user.username}</Col></Row>
                    <Row><Col>성별:</Col><Col>{(user.gender % 2 ? "남성" : "여성")}</Col></Row>
                    <Row><Col>기타:</Col><Col>{""}</Col></Row>
                </Modal.Body> : null
            }
            {
                error ? <Modal.Body>
                    <Row><Col>안내:</Col><Col>{error.message}</Col></Row>
                </Modal.Body> : null
            }
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>닫기({timer_count})</Button>
            </Modal.Footer>
        </Modal>
    </Container>
}

export default GuestQrResultPage;