import {createSlice} from "@reduxjs/toolkit";
import axios from "../../utils/axios";
// ----------------------------------------------------------------------

const initialState = {
    user: {},
    sideBar: {
        open: false,
        type: "CONTACT", // can be CONTACT, STARRED, SHARED
    },
    isLoggedIn: true,
    tab: 0, // [0, 1, 2, 3]
    snackbar: {
        open: null,
        severity: null,
        message: null,
    },
    all_users: [],
    chat_type: null,
    room_id: null,
};

const slice = createSlice({
    name: "app",
    initialState,
    reducers: {
        fetchUser(state, action) {
            state.user = action.payload.user;
        },
        updateUser(state, action) {
            state.user = action.payload.user;
        },
        // Toggle Sidebar
        toggleSideBar(state) {
            state.sideBar.open = !state.sideBar.open;
        },
        updateSideBarType(state, action) {
            state.sideBar.type = action.payload.type;
        },
        updateTab(state, action) {
            state.tab = action.payload.tab;
        },

        openSnackBar(state, action) {
            state.snackbar.open = true;
            state.snackbar.severity = action.payload.severity;
            state.snackbar.message = action.payload.message;
        },
        closeSnackBar(state) {
            state.snackbar.open = false;
            state.snackbar.message = null;
        },
        updateUsers(state, action) {
            state.all_users = action.payload.users;
        },
        selectChatType(state, action) {
            state.chat_type = action.payload.chat_type;
            state.room_id = null;
        },
        selectRoomId(state, action) {
            state.room_id = action.payload.room_id;
        }
    },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const closeSnackBar = () => async (dispatch, getState) => {
    dispatch(slice.actions.closeSnackBar());
};

export const showSnackbar =
    ({severity, message}) =>
        async (dispatch, getState) => {
            dispatch(
                slice.actions.openSnackBar({
                    message,
                    severity,
                })
            );

            setTimeout(() => {
                dispatch(slice.actions.closeSnackBar());
            }, 4000);
        };

export function ToggleSidebar() {
    return async (dispatch, getState) => {
        dispatch(slice.actions.toggleSideBar());
    };
}

export function UpdateSidebarType(type) {
    return async (dispatch, getState) => {
        dispatch(slice.actions.updateSideBarType({type}));
    };
}

export function UpdateTab(tab) {
    return async (dispatch, getState) => {
        dispatch(slice.actions.updateTab(tab));
    };
}

export function SelectChatType({chat_type}) {
    return async (dispatch, getState) => {
        dispatch(slice.actions.selectChatType({chat_type}));
        if (getState().app.sideBar.open) {
            dispatch(slice.actions.toggleSideBar());
        }
    };
}

export function SelectRoomId({room_id}) {
    return async (dispatch, getState) => {
        dispatch(slice.actions.selectRoomId({room_id}));
    };
}

export const FetchUserProfile = () => {
    return async (dispatch, getState) => {
        axios
            .get("/profile", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getState().auth.token}`,
                },
            })
            .then((response) => {
                console.log(response);
                dispatch(slice.actions.fetchUser({user: response.data.data}));
            })
            .catch((err) => {
                console.log(err);
            });
    };
};

export const FetchAllUsers = (data) => {
    return async (dispatch, getState) => {
        const token = getState().auth.accessToken;

        if (!token) {
            console.error("Token is missing. Please log in.");
            return;
        }

        try {
            const response = await axios.get("api/user/all", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                dispatch(slice.actions.updateUsers({ users: response.data }));
            } else {
                console.error("Failed to fetch users, status:", response.status);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
};

