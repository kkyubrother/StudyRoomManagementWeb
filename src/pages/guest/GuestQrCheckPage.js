import { useContext, useEffect, useState } from "react";
import { getUserByQr } from "../../api/users";
import { useLocation, useNavigate } from "react-router-dom";
import { ACTION_UPDATE_USER } from "../../context/action";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { Context } from "../../context";

const QR_CODE =
  "100001xdcgxMInGDMOv4TcEV17IjYG94JITd8Ifr5w3b7cPtcUJN2WKDwM98ghc2iZ5lFWFBJE-1mDql9MuBv5D-zn1Q";

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
    // if (qr_code && typeof qr_code === "string") {
    //   getUserByQr(qr_code)
    //     .then((user) => {
    //       // console.debug(`GuestQrCheckPage::handleScan::getUserByQr::user::${JSON.stringify(user, null, 2)}`)
    //       if (user) {
    //         dispatch(ACTION_UPDATE_USER(user));
    //         navigate(location.state.backref, {
    //           replace: true,
    //           state: { user: user, qr_code: qr_code },
    //         });
    //       } else {
    //         navigate("/", {
    //           replace: true,
    //           state: { message: "올바른 QR이 아닙니다." },
    //         });
    //       }
    //     })
    //     .catch((error) => {
    //       // console.error(error.response.data.message)
    //       navigate("/", {
    //         replace: true,
    //         state: { message: "올바른 QR이 아닙니다." },
    //       });
    //     });
    // }
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

  return (
    <Container style={styles.container} fluid>
      {!qr_code && (
        <img
          src={"http://localhost:5000/api/users/1/qr.png"}
          width={"50%"}
          alt={"qr.png"}
        />
      )}
      <div>
        <Button onClick={() => setQrCode(QR_CODE)}>큐알 입력</Button>
      </div>
      <div>
        <h1>{timer_count}초 후 메인화면으로 복귀합니다.</h1>
        <Button onClick={() => navigate("/")}>홈으로</Button>
      </div>
    </Container>
  );
};

export default GuestQrCheckPage;
