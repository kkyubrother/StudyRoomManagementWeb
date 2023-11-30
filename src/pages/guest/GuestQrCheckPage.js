import { useContext, useEffect, useState } from "react";
import { getUserByQr } from "../../api/users";
import { useLocation, useNavigate } from "react-router-dom";
import { ACTION_UPDATE_USER } from "../../context/action";
import Container from "react-bootstrap/Container";
import { Context } from "../../context";

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
};

const GuestQrCheckPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { dispatch } = useContext(Context);
  const [timer_count, setTimerCount] = useState(15);
  const [qr_code, setQrCode] = useState(null);

  useEffect(() => {
    if (!qr_code || typeof qr_code !== "string") return;
    (async () => {
      try {
        const user = await getUserByQr(qr_code);

        if (!user) {
          navigate("/", {
            replace: true,
            state: { message: "올바른 QR이 아닙니다." },
          });
        } else {
          dispatch(ACTION_UPDATE_USER(user));
          navigate(location.state.backref, {
            replace: true,
            state: { user: user, qr_code: qr_code },
          });
        }
      } catch (e) {
        console.error(e);
        navigate("/", {
          replace: true,
          state: { message: "올바른 QR이 아닙니다." },
        });
      }
    })();
  }, [qr_code]);

  const handleError = (error) => {};

  useEffect(() => {
    const original_pathname = window.location.pathname;
    setTimeout(
      function tick(t) {
        if (original_pathname !== window.location.pathname) return;
        else if (t > 0) {
          setTimerCount(t);
          setTimeout(tick, 1000, t - 1);
        } else navigate("/");
      },
      1000,
      timer_count - 1,
    );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const qr_code = await (await fetch("/api/users/2/qr.txt")).json();
      setQrCode(qr_code.message);
    }, 3000);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <Container style={styles.container} fluid>
      {!qr_code && (
        <img src={"/api/users/2/qr.png"} width={"35%"} alt={"qr.png"} />
      )}
      <div></div>
      <div>
        <h1>{timer_count}초 후 메인화면으로 복귀합니다.</h1>
      </div>
    </Container>
  );
};

export default GuestQrCheckPage;
