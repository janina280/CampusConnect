import {createSlice} from "@reduxjs/toolkit";
import {faker} from "@faker-js/faker";
import axios from "../../utils/axios"

let user_id = window.localStorage.getItem("user_id");

const initialState = {
    direct_chat: {
        conversations: [], current_conversation: null, current_messages: [],
    }, group_chat: {
        groups: [], current_groups: null, current_messages_group: [],
    },
};

const slice = createSlice({
    name: "conversation", initialState, reducers: {
        fetchDirectConversations(state, action) {
            user_id = window.localStorage.getItem("user_id");
            const list = action.payload.conversations.map((el) => {
                const user = el.users.find((elm) => elm.id.toString() !== user_id);
                const messages = [...el.messages];
                const lastMessage = messages?.length ? messages.reduce((latest, msg) => msg.createdAt > latest.createdAt ? msg : latest, messages[0]) : {
                    text: "You can start messaging with...", createdAt: null
                };

                return {
                    id: el.id,
                    user_id: user?.id,
                    name: user?.name,
                    nickname: user.nickname,
                    msg: lastMessage?.text,
                    time: lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString() : "9:36",
                    unread: 0,
                    pinned: el.pinned,
                    about: user?.about,
                    online: user?.status === "Online",
                    img: faker.image.avatar()
                };
            });
            console.log("Updated conversations: ", list);
            state.direct_chat.conversations = [...list];
        },

        updateDirectConversation(state, action) {
            const this_conversation = action.payload.conversation;
            state.direct_chat.conversations = state.direct_chat.conversations.map((el) => {
                if (el?.id !== this_conversation.id) {
                    return el;
                } else {
                    const user = this_conversation.users.find((elm) => elm.id.toString() !== user_id);
                    return {
                        id: this_conversation.id,
                        user_id: user?.id,
                        name: user?.name,
                        online: user?.status === "Online",
                        img: faker.image.avatar(),
                        msg: faker.music.songName(),
                        time: "9:36",
                        unread: 0,
                        pinned: false,
                    };
                }
            });
        },

        addDirectConversation(state, action) {
            const this_conversation = action.payload.conversation;
            const user = this_conversation.participants.find((elm) => elm._id.toString() !== user_id);
            state.direct_chat.conversations = state.direct_chat.conversations.filter((el) => el?.id !== this_conversation._id);
            state.direct_chat.conversations.push({
                id: this_conversation._id._id,
                user_id: user?._id,
                name: `${user?.firstName} ${user?.lastName}`,
                online: user?.status === "Online",
                img: faker.image.avatar(),
                msg: faker.music.songName(),
                time: "9:36",
                unread: 0,
                pinned: false,
            });
        },

        setCurrentConversation(state, action) {
            state.direct_chat.current_conversation = action.payload;
        }, fetchCurrentMessages(state, action) {
            const messages = action.payload.messages;
            const formatted_messages = messages.map((el) => ({
                id: el._id,
                type: "msg",
                subtype: el.type,
                message: el.text,
                incoming: el.to === user_id,
                outgoing: el.from === user_id,
            }));
            state.direct_chat.current_messages = formatted_messages;
        }, addDirectMessage(state, action) {
            state.direct_chat.current_messages.push(action.payload.message);
        },

        setCurrentGroup(state, action) {
            state.group_chat.current_groups = action.payload;
        }, fetchCurrentMessagesGroup(state, action) {
            const messages = action.payload.messages;
            const formatted_messages = messages.map((el) => ({
                id: el.id,
                type: "msg",
                subtype: el.type,
                message: el.text,
                incoming: el.to === user_id,
                outgoing: el.from === user_id,
            }));
            state.group_chat.current_messages_group = formatted_messages;
        }, addDirectMessageGroup(state, action) {
            state.group_chat.current_messages_group.push(action.payload.message);
        },

        fetchDirectGroups(state, action) {
            user_id = window.localStorage.getItem("user_id");
            const list = action.payload.groups.map((el) => {
                const messages = [...el.messages];
                const lastMessage = messages?.length ? messages.reduce((latest, msg) => msg.createdAt > latest.createdAt ? msg : latest, messages[0]) : {
                    text: "You can start messaging with...", createdAt: null
                };

                return {
                    id: el.id,
                    name: el.name,
                    msg: lastMessage?.text,
                    time: lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString() : "9:36",
                    unread: 0,
                    pinned: el.pinned,
                    img: faker.image.avatar(),
                };
            });
            console.log("Updated conversations: ", list);
            state.group_chat.groups = [...list];
        },

    },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const FetchDirectConversations = (data) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.fetchDirectConversations({conversations: data}));
    };
};

export const FetchDirectGroups = (data) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.fetchDirectGroups({groups: data}));
    };
};

export const AddDirectConversation = ({conversation}) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.addDirectConversation({conversation}));
    };
};

export const UpdateDirectConversation = ({conversation}) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.updateDirectConversation({conversation}));
    };
};

export const SetCurrentConversation = (current_conversation) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.setCurrentConversation(current_conversation));
    };
};


export const SetCurrentGroup = (current_group) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.setCurrentGroup(current_group));
    };
};


export const FetchCurrentMessages = ({messages}) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.fetchCurrentMessages({messages}));
    }
}
export const FetchCurrentMessagesGroup = ({messages}) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.fetchCurrentMessagesGroup({messages}));
    }
}

export const AddDirectMessage = (message) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.addDirectMessage({message}));
    }
}
export const AddDirectMessageGroup = (message) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.addDirectMessageGroup({message}));
    }
}
