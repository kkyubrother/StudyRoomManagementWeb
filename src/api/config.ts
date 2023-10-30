import axios from "axios";

export const getConfigBookWeekdaysOpen = (): Promise<string> => {
  return (
    axios
      .get("/api/config/book_room_weekdays_open")
      // @ts-ignore
      .then((response) => response.data.book_room_weekdays_open)
  );
};
export const getConfigBookWeekdaysClose = (): Promise<string> => {
  return (
    axios
      .get("/api/config/book_room_weekdays_close")
      // @ts-ignore
      .then((response) => response.data.book_room_weekdays_close)
  );
};
export const getConfigBookWeekendOpen = (): Promise<string> => {
  return (
    axios
      .get("/api/config/book_room_weekend_open")
      // @ts-ignore
      .then((response) => response.data.book_room_weekend_open)
  );
};
export const getConfigBookWeekendClose = (): Promise<string> => {
  return (
    axios
      .get("/api/config/book_room_weekend_close")
      // @ts-ignore
      .then((response) => response.data.book_room_weekend_close)
  );
};
