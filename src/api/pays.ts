import axios from "axios";

import {Pay, Transaction} from "./types";

export const PAY_STATUS_WAITING = "waiting"
export const PAY_STATUS_CONFIRM = "confirm"
export const PAY_STATUS_REJECT = "reject"

export function postPay(
    user_id: number,
    book_id: number,
    cashier: string,
    pay_type: string,
    paid: number,
    comment: string | null,
    client_name: string,
): Promise<Pay> {
    const data = {
        user_id: user_id,
        book_id: book_id,
        cashier: cashier,
        pay_type: pay_type,
        paid: paid,
        comment: comment,
        client_name: client_name,
    }
    // @ts-ignore
    return axios.post("/api/pays", data).then(value => value.data).then(value => value.pay)
}

export function postPayDonation(
    user_id: number,
    cashier: string,
    pay_type: string,
    paid: number,
    comment: string | null,
    client_name: string,
): Promise<Pay> {
    const data = {
        user_id: user_id,
        cashier: cashier,
        pay_type: `donation.${pay_type}`,
        paid: paid,
        comment: comment,
        client_name: client_name,
    }
    // @ts-ignore
    return axios.post("/api/pays", data).then(value => value.data).then(value => value.pay)
}

export function getPay(
    pay_id: number,
): Promise<Pay> {
    // @ts-ignore
    return axios.get(`/api/pays/${pay_id}`).then(value => value.data)
}

export function getPays(
    date: string | undefined = undefined,
    pay_type: string | undefined = undefined,
    user_id: number | undefined = undefined,
    book_id: number | undefined = undefined,
    cashier: string | undefined = undefined): Promise<Pay[]> {
    // @ts-ignore
    return axios.get(`/api/pays`, {params: {date, pay_type, user_id, book_id, cashier}}).then(value => value.data.pays)
}
export function getPaysByDate(date: string) {
    // @ts-ignore
    return axios.get(`/api/pays`, {params: {date}}).then(value => value.data.pays)
}

export function getAllTransactions(): Promise<Transaction[]> {
    // @ts-ignore
    return axios.get("/api/transaction/all").then(value => value.data.transactions)
}