import {getPay, PAY_STATUS_CONFIRM, PAY_STATUS_REJECT, PAY_STATUS_WAITING} from "../api/pays";
import {deleteBook} from "../api/books";

export const isPayConfirm = pay => pay && pay.status === PAY_STATUS_CONFIRM

const WaitTransaction = (pay_id, timer, callback, user_id = undefined, book_id = undefined) => {
    callback({status: PAY_STATUS_WAITING, title: "결제 대기중", message: `결제해주세요(${Math.round(timer/2)} 초)`})
    if (timer > 0) {
        getPay(pay_id)
            .then(pay_result => {
                if (pay_result.status.startsWith(PAY_STATUS_CONFIRM)) { callback({status: PAY_STATUS_CONFIRM, title: "결제 완료", message: `결제되었습니다.`}) }
                else if (pay_result.status.startsWith(PAY_STATUS_REJECT)) {
                    if (user_id && book_id)
                        deleteBook(user_id, book_id, `Pay.${PAY_STATUS_REJECT}`).then(res => console.log(res));
                    callback({status: PAY_STATUS_REJECT, title: "결제 실패", message: pay_result.comment ? pay_result.comment : "다시 결제바랍니다."})
                }

                else if (pay_result.status.startsWith(PAY_STATUS_WAITING)) {
                    setTimeout(WaitTransaction, 500, ...[pay_id, (timer - 1), callback, user_id, book_id])
                }
            })
            .catch(error => {
                if (user_id && book_id)
                    deleteBook(user_id, book_id, `Pay.Error`).then(res => console.log(res));
                callback({status: PAY_STATUS_REJECT, title: "오류 발생", message: "다시 결제바랍니다.", error: error});
            })
    } else {
        if (user_id && book_id)
            deleteBook(user_id, book_id, `Pay.${PAY_STATUS_REJECT}`).then(res => console.log(res));
        callback({status: PAY_STATUS_REJECT, title: "결제 대기 시간 초과", message: "다시 결제바랍니다."});
    }
}

export default WaitTransaction;