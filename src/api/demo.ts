import axios from "axios";

export function getOTPCodeDemo(): Promise<string> {
  return axios.get("/api/auth/otp/debug").then((value) => value.data.otp);
}
