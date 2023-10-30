export const convertRoomToRoomName = (room_var_name: string) => {
    switch (room_var_name) {
        case "r_01": return "스터디룸 1번"
        case "r_02": return "2번"
        case "r_03": return "3번"
        case "r_04": return "4번"
        case "r_05": return "5번"
        case "r_06": return "6번"
        case "r_07": return "7번"
        case "r_08": return "8번"
        case "r_09": return "9번"
        case "r_10": return "10번"
        case "seminar": return "세미나룸"
        case "studio": return "스튜디오"
        case "hall": return "홀"
        default: return room_var_name
    }
};

export const convertConfigHourToHour = (config_hour: string) => {
    return Number(config_hour.split(":")[0]) + Number(Number(config_hour.split(":")[1]) / 60)
};
