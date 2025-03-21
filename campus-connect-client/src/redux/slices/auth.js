import {createSlice} from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import {showSnackbar} from "./app";

const initialState = {
    isLoggedIn: false,
    accessToken: "",
    isLoading: false,
    availableChats: [],
    availableGroups: []
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
        },
        signOut(state, action) {
            state.isLoggedIn = false;
            state.accessToken = "";
            state.user_id = null;
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
    //fromValues=>{email, password}
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
                dispatch(
                    slice.actions.logIn({
                        isLoggedIn: true,
                        accessToken: response.data.accessToken,
                        user_id: response.data.userId,
                    })
                );
                window.localStorage.setItem("user_id", response.data.userId);
                dispatch(
                    showSnackbar({severity: "success", message: "You are connected!"})
                );

                dispatch(
                    slice.actions.updateIsLoading({isLoading: false, error: false})
                );
            })
            .catch(function (error) {
                dispatch(showSnackbar({severity: "error", message: error.message}));
                dispatch(
                    slice.actions.updateIsLoading({isLoading: false, error: false})
                );
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

//Log Out
export function LogoutUser() {
    return async (dispatch, getState) => {
        window.localStorage.removeItem("user_id");
        dispatch(slice.actions.signOut());
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
                dispatch(showSnackbar({severity: "error", message: error.message}));
                dispatch(
                    slice.actions.updateIsLoading({error: true, isLoading: false})
                );
            });
    };
}

