import Navi from "../components/Navbar";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useEffect, useState } from "react";
import { func, oneOf, string } from "prop-types";
import axios from "axios";

const getConfig = (name) =>
  axios.get(`/api/config/${name}`).then((r) => r.data[name]);
const postConfig = (name, data) => axios.post(`/api/config/${name}`, data);
const postTempImage = (data) => {
  return axios.post("/api/config/dummy/upload", data);
};

const CustomConfigInput = ({
  label,
  announce,
  name,
  value,
  type = "text",
  onChange = undefined,
}) => {
  return (
    <Form.Group className="mb-3" controlId={`ConfigCustomInput${name}`}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        name={name}
        type={type}
        placeholder={label}
        value={value}
        readOnly={!Boolean(onChange)}
        onChange={onChange}
      />
      <Form.Text className="text-muted">
        {announce ? announce : `${label}을(를) 설정합니다.`}
      </Form.Text>
    </Form.Group>
  );
};
CustomConfigInput.propTypes = {
  label: string.isRequired,
  value: string.isRequired,
  name: string.isRequired,
  announce: string,
  type: oneOf(["text"]),
  onChange: func,
};

const Config = (props) => {
  const [config_data, setConfigData] = useState({ tg: {}, cafe_run: {} });
  const [config_tg, setConfigTg] = useState({
    tg_developer_id: -1,
    tg_manager_group_id: [],
    tg_announce_text: "반갑습니다. 카페봇입니다.",
  });
  const [config_cafe_run, setConfigCafeRun] = useState({
    cafe_weekend_close: "",
    cafe_weekend_open: "",
    cafe_weekdays_close: "",
    cafe_close_date: "",
    cafe_is_close: false,
  });
  const [config_cafe_book, setConfigCafeBook] = useState({
    book_room_weekdays_open: "",
    book_room_weekdays_close: "",
    book_room_weekend_open: "",
    book_room_weekend_close: "",
  });
  const [userMembership, setUserMembership] = useState({
    user_membership_normal_file: [],
    user_membership_normal_qr_box: [],
    user_membership_normal_text_box: [],
    user_membership_vip_file: [],
    user_membership_vip_qr_box: [],
    user_membership_vip_text_box: [],
  });
  const [config_cafe_text, setConfigCafeText] = useState({
    cafe_open_time_text: "",
    cafe_close_time_text: "",
  });
  useEffect(() => {
    (async () => {
      const user_membership_normal_file = await getConfig(
        "user_membership_normal_file",
      );
      const user_membership_normal_qr_box = await getConfig(
        "user_membership_normal_qr_box",
      );
      const user_membership_normal_text_box = await getConfig(
        "user_membership_normal_text_box",
      );
      const user_membership_vip_file = await getConfig(
        "user_membership_vip_file",
      );
      const user_membership_vip_qr_box = await getConfig(
        "user_membership_vip_qr_box",
      );
      const user_membership_vip_text_box = await getConfig(
        "user_membership_vip_text_box",
      );

      setUserMembership({
        user_membership_normal_file,
        user_membership_normal_qr_box,
        user_membership_normal_text_box,
        user_membership_vip_file,
        user_membership_vip_qr_box,
        user_membership_vip_text_box,
      });
      setNormalQrBox(user_membership_normal_qr_box.join());
      setNormalTextLocation(user_membership_normal_text_box.join());
      setVipQrBox(user_membership_vip_qr_box.join());
      setVipTextLocation(user_membership_vip_text_box.join());
    })();
    (async () => {
      const cafe_open_time_text = await getConfig("cafe_open_time_text");
      const cafe_close_time_text = await getConfig("cafe_close_time_text");

      setConfigCafeText({
        cafe_open_time_text,
        cafe_close_time_text,
      });
    })();
  }, []);

  const [normalFile, setNormalFile] = useState("");
  const handleFile = (e) => {
    const type = "file/image";
    const file = e.target.files[0];

    const f = new FormData();
    f.append("type", type);
    const reader = new FileReader();
    reader.onload = function () {
      f.append("data", reader.result);
      postTempImage(f).then((response) =>
        setNormalFile(response.data.file_name),
      );
    };
    // 실패할 경우 에러 출력하기
    reader.onerror = function (error) {
      console.error(error);
    };
    reader.readAsDataURL(file);
  };

  const [normalQrBox, setNormalQrBox] = useState(
    userMembership.user_membership_normal_qr_box.join(),
  );
  const [normalTextLocation, setNormalTextLocation] = useState(
    userMembership.user_membership_normal_text_box.join(),
  );

  const [vipFile, setVipFile] = useState("");
  const handleVipFile = (e) => {
    const type = "file/image";
    const file = e.target.files[0];

    const f = new FormData();
    f.append("type", type);
    const reader = new FileReader();
    reader.onload = function () {
      f.append("data", reader.result);
      console.log(userMembership);
      postTempImage(f).then((response) => setVipFile(response.data.file_name));
    };
    // 실패할 경우 에러 출력하기
    reader.onerror = function (error) {
      console.error(error);
    };
    reader.readAsDataURL(file);
  };
  const [vipQrBox, setVipQrBox] = useState(
    userMembership.user_membership_vip_qr_box.join(),
  );
  const [vipTextLocation, setVipTextLocation] = useState(
    userMembership.user_membership_vip_text_box.join(),
  );

  const urlNormalImage =
    "/api/config/dummy/sample.png?" +
    (normalFile ? `file_name=${normalFile}&` : "") +
    (normalQrBox ? `qr_box=${normalQrBox}&` : "") +
    (normalTextLocation ? `text_location=${normalTextLocation}` : "");
  const urlVipImage =
    "/api/config/dummy/sample.vip.png?" +
    (vipFile ? `file_name=${vipFile}&` : "") +
    (vipQrBox ? `qr_box=${vipQrBox}&` : "") +
    (vipTextLocation ? `text_location=${vipTextLocation}` : "");

  const handleSave = (e) => {
    e.preventDefault();

    let form_data = new FormData();
    if (normalFile) {
      form_data.append("data", normalFile);
      postConfig("user_membership_normal_file", form_data);
    }

    if (normalQrBox) {
      form_data = new FormData();
      form_data.append("type", "tuple/int");
      form_data.append("data", normalQrBox);
      postConfig("user_membership_normal_qr_box", form_data);
    }

    if (normalTextLocation) {
      form_data = new FormData();
      form_data.append("type", "tuple/int");
      form_data.append("data", normalTextLocation);
      postConfig("user_membership_normal_text_box", form_data);
    }

    if (vipFile) {
      form_data = new FormData();
      form_data.append("data", vipFile);
      postConfig("user_membership_vip_file", form_data);
    }

    if (vipQrBox) {
      form_data = new FormData();
      form_data.append("type", "tuple/int");
      form_data.append("data", vipQrBox);
      postConfig("user_membership_vip_qr_box", form_data);
    }

    if (vipTextLocation) {
      form_data = new FormData();
      form_data.append("type", "tuple/int");
      form_data.append("data", vipTextLocation);
      postConfig("user_membership_vip_text_box", form_data);
    }

    if (config_cafe_text.cafe_open_time_text) {
      form_data = new FormData();
      form_data.append("type", "str");
      form_data.append("data", config_cafe_text.cafe_open_time_text);
      postConfig("cafe_open_time_text", form_data);
    }

    if (config_cafe_text.cafe_close_time_text) {
      form_data = new FormData();
      form_data.append("type", "str");
      form_data.append("data", config_cafe_text.cafe_close_time_text);
      postConfig("cafe_close_time_text", form_data);
    }
  };

  return (
    <div>
      <Navi />
      <Container>
        <Form>
          {/*<div*/}
          {/*  style={{*/}
          {/*    background: "#0088cc",*/}
          {/*    borderRadius: "10px",*/}
          {/*    padding: "10px",*/}
          {/*    color: "ghostwhite",*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <fieldset>*/}
          {/*    <legend>개발자 설정</legend>*/}
          {/*    <CustomConfigInput*/}
          {/*      label={"개발자 ID 목록"}*/}
          {/*      announce={"개발자 ID를 적어주세요."}*/}
          {/*      name={"tg_developer_id"}*/}
          {/*      value={`${config_tg.tg_developer_id}`}*/}
          {/*    />*/}
          {/*    <CustomConfigInput*/}
          {/*      label={"대관방 ID"}*/}
          {/*      announce={"/getid 의 chat_id를 입력바랍니다."}*/}
          {/*      name={"tg_manager_group_id"}*/}
          {/*      value={`${config_tg.tg_manager_group_id}`}*/}
          {/*    />*/}
          {/*    <CustomConfigInput*/}
          {/*      label={"기본알림"}*/}
          {/*      announce={"아무 메세지 전송시 뜨는 기본 메세지를 설정합니다."}*/}
          {/*      name={"tg_announce_text"}*/}
          {/*      value={`${config_tg.tg_announce_text}`}*/}
          {/*    />*/}
          {/*  </fieldset>*/}
          {/*</div>*/}
          <hr />
          <div
            style={{
              background: "whitesmoke",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <fieldset>
              <legend>카페 운영 설정</legend>
              <div className="mb-3 form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="inputCafeIsClose"
                  name="cafe_is_close"
                  checked={config_cafe_run.cafe_is_close}
                />
                <label
                  className="form-check-label text-danger"
                  htmlFor="inputCafeIsClose"
                >
                  현재 카페가 운영중이 <b>아닐때</b> 체크합니다!!
                </label>
              </div>
              <CustomConfigInput
                label={"카페 휴일"}
                name={"cafe_close_date"}
                value={`${config_cafe_run.cafe_close_date}`}
              />
              <CustomConfigInput
                label={"주중 카페 개점 시간"}
                name={"cafe_weekdays_open"}
                value={`${config_cafe_run.cafe_close_date}`}
              />
              <CustomConfigInput
                label={"주중 카페 폐점 시간"}
                name={"cafe_weekdays_close"}
                value={config_cafe_run.cafe_weekdays_close}
              />
              <CustomConfigInput
                label={"주말 카페 개점 시간"}
                name={"cafe_weekend_open"}
                value={config_cafe_run.cafe_weekend_open}
              />
              <CustomConfigInput
                label={"주말 카페 폐점 시간"}
                name={"cafe_weekend_close"}
                value={config_cafe_run.cafe_weekend_close}
              />
            </fieldset>
          </div>
          <hr />
          <div
            style={{
              background: "whitesmoke",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <fieldset>
              <legend>카페 운영 설정</legend>
              <CustomConfigInput
                label={"주중 예약 시작 시간"}
                name={"book_room_weekdays_open"}
                value={config_cafe_book.book_room_weekdays_open}
              />
              <CustomConfigInput
                label={"주중 예약 마감 시간"}
                name={"book_room_weekdays_close"}
                value={config_cafe_book.book_room_weekdays_close}
              />
              <CustomConfigInput
                label={"주말 예약 시작 시간"}
                name={"book_room_weekend_open"}
                value={config_cafe_book.book_room_weekend_open}
              />
              <CustomConfigInput
                label={"주말 예약 마감 시간"}
                name={"book_room_weekend_close"}
                value={config_cafe_book.book_room_weekend_close}
              />
            </fieldset>
          </div>
          <hr />
          <div
            style={{
              background: "whitesmoke",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <fieldset>
              <legend>회원권 설정</legend>
              <div>
                <img
                  src={urlNormalImage}
                  alt={"일반 회원권 합성 이미지"}
                  width={"50%"}
                />
                <img
                  src={urlVipImage}
                  alt={"특별 회원권 합성 이미지"}
                  width={"50%"}
                />
              </div>
              <CustomConfigInput
                label={`일반 회원권(${userMembership.user_membership_normal_file})`}
                type={"file"}
                name={"user_membership_normal_file"}
                value={undefined}
                onChange={handleFile}
              />
              <CustomConfigInput
                label={"일반 회원권 qr 위치"}
                name={"user_membership_normal_qr_box"}
                value={normalQrBox}
                onChange={(e) => setNormalQrBox(e.target.value)}
              />
              <CustomConfigInput
                label={"일반 회원권 글자 위치"}
                name={"user_membership_normal_text_box"}
                value={normalTextLocation}
                onChange={(e) => setNormalTextLocation(e.target.value)}
              />

              <CustomConfigInput
                label={`특별 회원권(${userMembership.user_membership_vip_file})`}
                type={"file"}
                name={"user_membership_vip_file"}
                value={undefined}
                onChange={handleVipFile}
              />
              <CustomConfigInput
                label={"특별 회원권 qr 위치"}
                name={"user_membership_vip_qr_box"}
                value={vipQrBox}
                onChange={(e) => setVipQrBox(e.target.value)}
              />
              <CustomConfigInput
                label={"특별 회원권 글자 위치"}
                name={"user_membership_normal_text_box"}
                value={vipTextLocation}
                onChange={(e) => setVipTextLocation(e.target.value)}
              />
            </fieldset>
          </div>
          <hr />
          <div
            style={{
              background: "whitesmoke",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <fieldset>
              <legend>QR 인증 표시 내용</legend>
              <CustomConfigInput
                label={"개점 시간"}
                name={"cafe_open_time_text"}
                value={config_cafe_text.cafe_open_time_text}
                onChange={(e) =>
                  setConfigCafeText({
                    ...config_cafe_text,
                    cafe_open_time_text: e.target.value,
                  })
                }
              />
              <CustomConfigInput
                label={"폐점 시간"}
                name={"cafe_close_time_text"}
                value={config_cafe_text.cafe_close_time_text}
                onChange={(e) =>
                  setConfigCafeText({
                    ...config_cafe_text,
                    cafe_close_time_text: e.target.value,
                  })
                }
              />
            </fieldset>
          </div>
          <Button onClick={handleSave}>전체 저장</Button>
        </Form>
      </Container>
    </div>
  );
};

export default Config;
