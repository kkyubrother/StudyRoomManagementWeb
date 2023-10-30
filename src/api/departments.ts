import axios from "axios";

import {Department} from "./types";


export function getDepartments(): Promise<Department[]> {
    // @ts-ignore
    return axios.get("/api/departments").then(value => value.data).then(value => value.departments)
}
export function getDepartmentName(target: string): Promise<{
    saved_money: number;
    key: string, name: string}> {
    // @ts-ignore
    return axios.get("/api/departments", {params: {name: target, action: "find.department"}}).then(value => value.data) //.then(value => value.departments)
}