import axios from "axios";
import { User } from "./types";

const Authorization = "CafeManagementTestUsername CafeManagementTestTOKEN";

export function getOtp(): Promise<string> {
  // @ts-ignore
  return axios
    .post(
      "/api/auth/otp/request",
      {},
      { headers: { Authorization, "User-Id": "2" } },
    )
    .then((response) => response.data.otp);
}
export function postOtp(otp_code: string): Promise<string> {
  // @ts-ignore
  return axios
    .post(
      "/api/auth/otp/response",
      { otp_code },
      { headers: { Authorization } },
    )
    .then((response) => response.data.token);
}
export function getUserByQr(qr: string): Promise<User> {
  // @ts-ignore
  return axios
    .post("/api/auth/qr/enter", {}, { headers: { Authorization: `QR ${qr}` } })
    .then((value) => value.data);
}

export const post_otp = (otp: string) => {
  return axios.post("/api/auth/otp", { otp_code: otp });
};
