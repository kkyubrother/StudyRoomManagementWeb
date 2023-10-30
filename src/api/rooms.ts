import axios from "axios";

import {Room} from "./types";
import moment from "moment";


interface Rooms {
    date: string | Date | undefined;
    // @ts-ignore
    start_time: string | moment | undefined;
    // @ts-ignore
    end_time: string | moment | undefined;
}

export function getRooms({date, start_time=undefined, end_time=undefined}: Rooms): Promise<Room[]> {
    const d = (typeof date === "object") ? (date ? date : new Date()) : new Date();
    if (typeof date !== "string") date = `${d.getFullYear()}-${d.getMonth() > 8 ? "" : "0"}${d.getMonth() + 1}-${d.getDate() > 9 ? "" : "0"}${d.getDate()}`

    const config = {params: {date: date}}
    if (start_time && end_time) {
        // @ts-ignore
        config.params["start_time"] = (typeof start_time === "object") ? start_time.format("HH:mm:ssZ") : start_time;
        // @ts-ignore
        config.params["end_time"] = (typeof end_time === "object") ? end_time.format("HH:mm:ssZ") : end_time;
    }
    // @ts-ignore
    return axios.get("/api/rooms", config).then(value => value.data).then(value => value.rooms)
}