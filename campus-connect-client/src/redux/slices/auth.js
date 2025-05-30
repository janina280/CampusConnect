import {createSlice} from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import {showSnackbar} from "./app";
import {jwtDecode} from 'jwt-decode';

const initialState = {
    isLoggedIn: false,
    accessToken: "",
    isLoading: false,
    availableChats: [],
    availableGroups: [],
    user_id: "",
    roles: []
};

const slice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        updateIsLoading(state, action) {
            state.error = action.payload.error;
            state.isLoading = action.payload.isLoading;
        },
        logIn(state, action) {
            state.isLoggedIn = action.payload.isLoggedIn;
            state.accessToken = action.payload.accessToken;
            state.user_id = action.payload.user_id;
            state.roles = action.payload.roles;
        },
        search(state, action) {
            state.availableChats = action.payload.availableChats;
        },
        searchGroup(state, action) {
            state.availableGroups = action.payload.availableGroups;
        }
    },
});

//REDUCER
export default slice.reducer;

//Log in
export function LoginUser(fromValues) {
    return async (dispatch, getState) => {
        dispatch(slice.actions.updateIsLoading({isLoading: true, error: false}));

        await axios
            .post(
                "/auth/login",
                {
                    ...fromValues,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then(function (response) {
                const decodedToken = jwtDecode(response.data.accessToken);
                console.log('Decoded Token:', decodedToken);
                dispatch(
                    slice.actions.logIn({
                        isLoggedIn: true,
                        accessToken: response.data.accessToken,
                        user_id: response.data.userId,
                        roles: decodedToken.roles || []
                    })
                );
                window.localStorage.setItem("user_id", response.data.userId);
                dispatch(
                    showSnackbar({severity: "success", message: "You are connected!"})
                );

                dispatch(
                    slice.actions.updateIsLoading({isLoading: false, error: false})
                );
                return {success: true};
            })
            .catch(function (error) {
                const data = error?.response?.data;
                const errorMessage = "Login failed. Please try again.";

                dispatch(showSnackbar({severity: "error", message: errorMessage}));
                dispatch(slice.actions.updateIsLoading({isLoading: false, error: false}));
                return {success: false, error: errorMessage};
            });

    };
}

//Search User
export function searchUser(data) {
    return async (dispatch, getState) => {
        const token = getState().auth.accessToken;
        if (!token) {
            return;
        }
        try {
            const response = await axios.get(
                `api/user/search?query=${data.keyword}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            dispatch(
                slice.actions.search({
                    availableChats: response.data,
                })
            );
        } catch (error) {
            console.error("Search API error:", error);
        }
    };
}

//Search Group
export function searchGroup(data) {
    return async (dispatch, getState) => {
        const token = getState().auth.accessToken;
        if (!token) {
            return;
        }
        try {
            const response = await axios.get(
                `groups/search?name=${data.keyword}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            dispatch(
                slice.actions.searchGroup({
                    availableGroups: response.data,
                })
            );
        } catch (error) {
            console.error("Search API error:", error);
        }
    }
}

export const LOGOUT = "LOGOUT";


//Log Out
export function LogoutUser() {
    return async (dispatch) => {
        const {persistor} = await import("../store");
        await persistor.purge();
        window.localStorage.removeItem("user_id");
        dispatch({type: LOGOUT});
        dispatch(showSnackbar({severity: "info", message: "Logged out successfully"}));
    };
}


export function RegisterUser(formValues, navigate) {
    return async (dispatch, getState) => {

        dispatch(slice.actions.updateIsLoading({isLoading: true, error: false}));
        await axios
            .post(
                "auth/register",
                {
                    ...formValues,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then(function (response) {
                dispatch(
                    showSnackbar({severity: "success", message: response.data.message})
                );
                dispatch(
                    slice.actions.updateIsLoading({isLoading: false, error: false})
                );

                navigate("/auth/login")
            })
            .catch((error) => {
                console.log(error);
                dispatch(showSnackbar({severity: "error", message: error.response.data.message}));
                dispatch(
                    slice.actions.updateIsLoading({error: true, isLoading: false})
                );
            });
    };
}

