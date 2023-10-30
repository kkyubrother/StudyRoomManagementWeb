import axios from "axios";

import {Book, Reason, Room} from "./types";


export function getBooks(): Promise<Book[]> {
    // @ts-ignore
    return axios.get("/api/books").then(value => value.data).then(value => value.books)
}

export function getBooksBy(user_id: number): Promise<Book[]> {
    // @ts-ignore
    return axios.get("/api/books", {params: {user_id: user_id}}).then(value => value.data).then(value => value.books)
}
export function getBooksByUserId(user_id: number): Promise<Book[]> {
    // @ts-ignore
    return axios.get("/api/books", {params: {user_id: user_id}}).then(value => value.data).then(value => value.books)
}
export function getBooksByBookDate(book_date: string): Promise<Book[]> {
    // @ts-ignore
    return axios.get("/api/books", {params: {book_date: book_date}}).then(value => value.data).then(value => value.books)
}
export function putBookChangeRoom(book_id: number, room_type: number, room_no: number): Promise<Room> {
    const data = {
        action: "change.room",
        room_type: room_type,
        room_no: room_no,
    }
    // @ts-ignore
    return axios.put(`/api/books/${book_id}`, data).then(value => value.data).then(value => value.room)
}
export function getBooksByDepartment(department: string): Promise<Book[]> {
    // @ts-ignore
    return axios.get("/api/books", {params: {department: department}}).then(value => value.data).then(value => value.books)
}
export function postBook(
    chat_id: number,
    user_id: number,
    date: string,
    start_time: string,
    end_time: string,
    room_type: number,
    room_no: number,
    people_no: number,
    department: string,
    pay_type: string,
    etc_reason: string,
    purpose: string = "현장 예약",
    obj: string = "현장 사용",
): Promise<Book> {
    const action = "immediately"
    const data = {
        action,
        chat_id,
        user_id,
        date,
        start_time,
        end_time,
        room_type,
        room_no,
        people_no,
        department,
        pay_type,
        etc_reason,
        purpose,
        obj,
    }
    // @ts-ignore
    return axios.post("/api/books", data).then(result => result.data).then(result => result.book)
}

export function deleteBook(user_id: number, book_id: number, reason: string): Promise<Reason> {
    const data = {user_id, reason}
    // @ts-ignore
    return axios.delete(`/api/books/${book_id}`, {data: data}).then(value => value.data)
}
