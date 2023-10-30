const USER = "user";

const ACTION_UPDATE = "update";

export const UPDATE_USER = `${USER}/${ACTION_UPDATE}/all`;


export const ACTION_UPDATE_USER = (user) => ({
    type: UPDATE_USER,
    user: user,
})
