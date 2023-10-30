import axios from "axios";
import {getPay} from "../api/pays";

const cancelBook = (book_id, qr_code, cashier) => (axios.put(`/api/books/${book_id}`, {action: "cancel", cashier: cashier}, { headers: { Authorization: `QR ${qr_code}` }}))
const waitingCancel = (waiting_id) => (axios.get(`/api/waiting/${waiting_id}`))
const waitingCancelTimeout = (waiting_id) => (axios.delete(`/api/waiting/${waiting_id}`))


function waitingPay(pay_id, timer, updateMessage) {
        getPay(pay_id)
            .then(result => {
                if (result.status === "confirm") {
                    updateMessage(result.comment, false)
                }
                else if (result.status === "reject") {
                    updateMessage(`결제를 취소할 수 없습니다(${result.comment})`, false)
                }
                else if (result.status === "waiting") {
                    updateMessage(`${result.comment}(${Math.round(timer/2)} 초 남음})`, true)
                    if (timer > 0) {setTimeout(waitingPay, 500, ...[pay_id, timer - 1, updateMessage])}
                    else {
                        updateMessage(`시간 초과로 취소되었습니다.`, false)
                        // waitingCancelTimeout(pay_id)
                        //     .then(result => result.data)
                        //     .then(result => {return {status: "confirm", message: "message"}})
                        //     .then(result => {
                        //         updateMessage(`시간 초과로 취소되었습니다.`)
                        //     })
                        //     .catch(error => updateMessage(`오류가 발생했습니다(${error})`))
                    }
                }
                else {
                    updateMessage(result.comment, false)
                }
            })
            .catch(error => updateMessage(`오류가 발생했습니다(${error})`, false))
    }


export default function cancelBookControl(book_id, qr_code, cashier, updateMessage, callback) {
    cancelBook(book_id, qr_code, cashier)
        .then(result => result.data)
        .then(result => {
            if (result.status === "confirm") {
                updateMessage(result.message, false)
            }
            else if (result.status === "reject") {
                updateMessage(`예약을 취소할 수 없습니다(${result.message})`, false)
            }
            else if (result.status === "waiting") {
                updateMessage(result.message, true)
                waitingPay(result.refund_pay.pay_id, 60, updateMessage)
            }
            else {
                updateMessage(result.message, false)
            }
        })
        .catch(error => {
            if (error.response.status === 403) {
                updateMessage(`[${error.response.status}]${error.response.data.message}`, false)
            }
            else {
                updateMessage(`[${error.response.status}]오류가 발생했습니다(${error.response.data.message})`, false)
            }
        })
}