import axios from "axios";
import {Commute, CommuteResult} from "./types";


export function getCommute (action: string, date: string, user_id: number | null = null):  Promise<Array<Commute>> {
    // @ts-ignore
    return axios.get('/api/commute', {params: {action, date, user_id}, headers: {Authorization: sessionStorage.getItem("Authorization")}}).then(response => response.data)
}
export function postCommute (action: string, qr_code: string, record: string):  Promise<CommuteResult> {
    // @ts-ignore
    return axios.post('/api/commute', {action, qr_code, record}, {}).then(response => response.data)
}