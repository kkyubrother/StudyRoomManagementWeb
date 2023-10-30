const CHANGE_USERNAME = "guest.username.change";
const CHANGE_BOOK_DATE = "guest.book_date.change";
const CHANGE_START_TIME = "guest.start_time.change";
const CHANGE_END_TIME = "guest.end_time.change";
const CHANGE_ROOM = "guest.room.change";
const CHANGE_DEPARTMENT = "guest.department.change";
const CHANGE_PURPOSE = "guest.purpose.change";
const CHANGE_PEOPLE_NO = "guest.people_no.change";
const CHANGE_PAY_TYPE = "guest.pay_type.change";
const CHANGE_PAY_TYPE_ETC_REASON = "guest.pay_type_etc_reason.change";


export const initial_guest = {
    user: null,
    username: null,
    book_date: null,
    start_time: null,
    end_time: null,
    room: null,
    department: null,
    purpose: null,
    people_no: null,
}

const GuestReducer = (state = initial_guest, action) => {
    switch (action.type) {
        case CHANGE_USERNAME:
            return {...state, username: action.username}
        case CHANGE_BOOK_DATE:
            return {...state, book_date: action.book_date}
        case CHANGE_START_TIME:
            return {...state, start_time: action.start_time}
        case CHANGE_END_TIME:
            return {...state, end_time: action.end_time}
        case CHANGE_ROOM:
            return {...state, room: action.room}
        case CHANGE_DEPARTMENT:
            return {...state, department: action.department}
        case CHANGE_PURPOSE:
            return {...state, purpose: action.purpose}
        case CHANGE_PEOPLE_NO:
            return {...state, people_no: action.people_no}
        case CHANGE_PAY_TYPE:
            return {...state, pay_type: action.pay_type}
        case CHANGE_PAY_TYPE_ETC_REASON:
            return {...state, pay_type_etc_reason: action.pay_type_etc_reason}
        default:
            return state
    }
}

export const changeUsername = (dispatch, username) => (
    dispatch({type: CHANGE_USERNAME, username: username})
)
export const changeBookDate = (dispatch, book_date) => (
    dispatch({type: CHANGE_BOOK_DATE, book_date: book_date})
)
export const changeStartTime = (dispatch, start_time) => (
    dispatch({type: CHANGE_START_TIME, start_time: start_time})
)
export const changeEndTime = (dispatch, end_time) => (
    dispatch({type: CHANGE_END_TIME, end_time: end_time})
)
export const changeRoom = (dispatch, room) => (
    dispatch({type: CHANGE_ROOM, room: room})
)
export const changeDepartment = (dispatch, department) => (
    dispatch({type: CHANGE_DEPARTMENT, department: department})
)
export const changePeopleNo = (dispatch, people_no) => (
    dispatch({type: CHANGE_PEOPLE_NO, people_no: people_no})
)
export const changePurpose = (dispatch, purpose) => (
    dispatch({type: CHANGE_PURPOSE, purpose: purpose})
)
export const changePayType = (dispatch, pay_type) => (
    dispatch({type: CHANGE_PAY_TYPE, pay_type: pay_type})
)
export const changePayTypeEtcReason = (dispatch, pay_type_etc_reason) => (
    dispatch({type: CHANGE_PAY_TYPE_ETC_REASON, pay_type_etc_reason: pay_type_etc_reason})
)


export default GuestReducer;