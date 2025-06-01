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
            state.user = {
                name: action.payload.user.name || "N/A",
                email: action.payload.user.email || "N/A",
                imageUrl: action.payload.user.imageUrl || "",
                nickname: action.payload.user.nickname || "",
                about: action.payload.user.about || "",
            };
        },
        updateUser(state, action) {
            state.user.nickname = action.payload.nickname;
            state.user.about = action.payload.about;
        },
        // Toggle Sidebar
        toggleSideBar(state) {
            state.sideBar.open = !state.sideBar.open;
        },
        closeSideBar(state) {
            state.sideBar.open = false;
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
        },
        updateUserImage(state, action) {
            state.user.imageUrl = action.payload.imageUrl;
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

export function CloseSidebar() {
    return async (dispatch) => {
        dispatch(slice.actions.closeSideBar());
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

export const UploadUserImage = (file) => {
    return async (dispatch, getState) => {
        const token = getState().auth.accessToken;
        const user_id = getState().auth.user_id;

        const formData = new FormData();
        formData.append(
            "updatedUserDto",
            new Blob([JSON.stringify({id: user_id})], {type: "application/json"})
        );
        formData.append("image", file);

        try {
            const res = await axios.put("/api/user/update", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.status === 200) {
                dispatch(
                    slice.actions.updateUserImage({
                        imageUrl: res.data.imageUrl,
                    })
                );
                dispatch(showSnackbar({severity: "success", message: "Image updated"}));
            } else {
                console.error("Upload failed", res.status);
            }
        }
        catch (err) {
            console.error("Image upload error:", err);
        }
    };
};


export const FetchUserProfile = () => {
    return async (dispatch, getState) => {
        const token = getState().auth.accessToken;

        if (!token) {
            console.error("Token is missing. Please log in.");
            return;
        }
        try {
            const response = await axios.get("/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                dispatch(slice.actions.fetchUser({ user: response.data }));
            } else {
                console.error("Failed to fetch user profile, status:", response.status);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };
};


export const FetchAllUsers = () => {
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

export const updateUserProfile = (nickname, about) => {
    return async (dispatch) => {
        dispatch(slice.actions.updateUser({ nickname, about }));
    };
};
