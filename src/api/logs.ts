import axios from "axios";
import {LogResponse} from "./types";


export function getLogsTypeAuth(user_id: number | undefined = undefined): Promise<[]> {
    // @ts-ignore
    return axios.get("/api/logs", {params: {type: "auth", user_id: user_id}}).then(value => value.data).then(value => value.logs)
}
export function getLogs(): Promise<[]> {
    // @ts-ignore
    return axios.get("/api/logs").then(value => value.data).then(value => value.logs)
}
export function getLogsV2(page: number, per_page: number): Promise<LogResponse> {
    // @ts-ignore
    return axios.get("/api/logs", {params: {page, per_page}}).then(value => value.data)
}