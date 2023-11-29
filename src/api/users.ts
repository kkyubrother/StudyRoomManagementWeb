import axios from "axios";
import { User } from "./types";

export function getUsers(Authorization: string): Promise<User[]> {
  // @ts-ignore
  return axios
    .get("/api/users", { headers: { Authorization } })
    .then((value) => value.data)
    .then((value) => value.users);
}
export function getUser(
  Authorization: string,
  user_id: number,
): Promise<User[]> {
  // @ts-ignore
  return axios
    .get(`/api/users/${user_id}`, { headers: { Authorization } })
    .then((value) => value.data)
    .then((value) => value.user);
}

export function putUser(
  user_id: number,
  username: string | undefined,
  birthday: string | undefined,
  gender: number | undefined,
  age: number | undefined,
  tel: string | undefined,
  grade: number | undefined,
  department: string | undefined,
): Promise<User> {
  const data = {
    username: username,
    birthday: birthday,
    gender: gender,
    age: age,
    tel: tel,
    grade: grade,
    department: department,
  };
  if (typeof username === "undefined") delete data.username;
  if (typeof birthday === "undefined") delete data.birthday;
  if (typeof gender === "undefined") delete data.gender;
  if (typeof age === "undefined") delete data.age;
  if (typeof tel === "undefined") delete data.tel;
  if (typeof grade === "undefined") delete data.grade;
  if (typeof department === "undefined") delete data.department;
  // @ts-ignore
  return axios
    .put(`/api/users/${user_id}`, data)
    .then((value) => value.data)
    .then((value) => value.user);
}
export function getUserByQr(qr: string): Promise<User> {
  // @ts-ignore
  return axios
    .post("/api/auth/qr", { qr_code: qr })
    .then((value) => value.data);
}
export function sendSMSMessage(
  Authorization: string,
  user_id: number,
  text: string,
) {
  // @ts-ignore
  return axios
    .post(
      "/api/auth/sms/message",
      { user_id: user_id, text: text },
      { headers: { Authorization } },
    )
    .then((value) => {
      return { data: value.data, user_id: user_id, status: "fulfilled" };
    })
    .catch((e) => {
      return { user_id: user_id, status: "rejected", error: e };
    });
}
export function getUserQr(user_id: string): Promise<string> {
  // @ts-ignore
  return axios
    .get(`/api/users/${user_id}/qr.txt`)
    .then((value) => value.data.message);
}
