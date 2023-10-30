import axios from "axios";
import {SnackbarPay, SnackbarProduct, SnackbarStock} from "./types";
const URL = '/api/snackbar/'

export function getSnackBarPaysByDate(date: string): Promise<[SnackbarPay]> {
    return axios.get(`${URL}pay`, {params: {date}}).then(response => response.data);
}
export function getSnackBarProducts(): Promise<[SnackbarProduct]> {
    return axios.get(`${URL}product`).then(response => response.data);
}
export function getSnackBarStock(barcode: string): Promise<SnackbarStock> {
    return axios.get(`${URL}stock`, {params: {barcode}}).then(response => response.data);
}
