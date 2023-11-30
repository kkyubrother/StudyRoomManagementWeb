import moment from "moment";

interface ServerBookData {
  book_id: number;

  book_date: string;
  start_time: string;
  end_time: string;

  department: string;
  people_no: number;

  user: {
    username: string;
  };
  room: {
    type: number;
    no: number;
  };
}
interface BookItemOnClick
  extends Omit<ServerBookData, "start_time" | "end_time"> {
  start_time: moment.Moment;
  end_time: moment.Moment;
}

export const convertBookItem = (
  value: ServerBookData,
  book_date: number,
  onClick: (data: BookItemOnClick) => void,
) => {
  if (!moment(value.book_date).isSame(moment(book_date), "day")) return;

  const startTime = new Date(`${value.book_date}T${value.start_time}`);
  const endTime = new Date(`${value.book_date}T${value.end_time}`);
  const start_time = moment(startTime, "hh:mm:ss");
  const end_time = moment(endTime, "hh:mm:ss");
  const s = start_time.format("HH:mm");
  const e = end_time.format("HH:mm");

  return {
    id: value.book_id,
    name: `[${value.department}] ${value.user.username}\n${s} - ${e}`,
    type: "book",
    startTime: startTime,
    endTime: endTime,
    data: value,
    onClick: () => onClick({ ...value, start_time, end_time }),
  };
};

export const getDefaultRoom = () => {
  return {
    r_01: [],
    r_02: [],
    r_03: [],
    r_04: [],
    r_05: [],
    r_06: [],
    r_07: [],
    r_08: [],
    r_09: [],
    r_10: [],
    seminar: [],
    studio: [],
    hall: [],
  };
};

// @ts-ignore
export const classifyRoomBook = (temp_books, value: ServerBookData, v) => {
  if (value.room.type === 3) temp_books.studio.push(v);
  else if (value.room.type === 2) temp_books.seminar.push(v);
  else if (value.room.type === 4) temp_books.hall.push(v);
  else if (value.room.type === 1) {
    const room_no = value.room.no;
    if (room_no === 1) temp_books.r_01.push(v);
    else if (room_no === 2) temp_books.r_02.push(v);
    else if (room_no === 3) temp_books.r_03.push(v);
    else if (room_no === 4) temp_books.r_04.push(v);
    else if (room_no === 5) temp_books.r_05.push(v);
    else if (room_no === 6) temp_books.r_06.push(v);
    else if (room_no === 7) temp_books.r_07.push(v);
    else if (room_no === 8) temp_books.r_08.push(v);
    else if (room_no === 9) temp_books.r_09.push(v);
    else if (room_no === 10) temp_books.r_10.push(v);
  }
};
