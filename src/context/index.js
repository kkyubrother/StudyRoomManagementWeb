import {createContext, useReducer} from "react";
import {UPDATE_USER} from "./action";


const initialState = {
    user: {
        user_id: 1,
    },
};

const Context = createContext({});

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_USER:
            return {
                ...state,
                user: action.user,
            };
        default:
            return state;
    }
};

const StoreProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState, undefined);
    const value = {state, dispatch};
    return <Context.Provider value={value}>{children}</Context.Provider>
};

export { Context, StoreProvider };
