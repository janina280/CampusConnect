import {createSlice} from "@reduxjs/toolkit";
import {faker} from "@faker-js/faker";
import axios from "../../utils/axios"

const user_id = window.localStorage.getItem("user_id");

const initialState = {
    direct_chat: {
        conversations: [],
        current_conversation: null,
        current_messages: [],
    },
    group_chat: {
        groups: [],
        current_groups: null,
        current_messages: [],
    },
};

const slice = createSlice({
    name: "conversation",
    initialState,
    reducers: {
        fetchDirectConversations(state, action) {
            const list = action.payload.conversations.map((el) => {
                const user = el.users.find(
                    (elm) => elm.id.toString() !== user_id
                );
                console.log("Current logged user ID:", user_id);
                console.log("Users in conversation:", el.users);
                const lastMessage = el.messages?.length
                    ? [...el.messages]
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                        .pop()
                    : null;

                const noMessagesMessage = "You can start messaging with...";
                return {
                    id: el.id,
                    user_id: user?.id,
                    name: user?.name,
                    nickname: user.nickname,
                    msg: lastMessage?.text,
                    time: lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString() : "9:36",
                    unread: 0,
                    pinned: false,
                    about: user?.about,
                    online: user?.status === "Online",
                    urlImg: faker.image.avatar(),
                    lastMessage,
                    noMessagesMessage,
                };
            });
            console.log("Updated conversations: ", list);
            state.direct_chat.conversations = [...list];
        },

        updateDirectConversation(state, action) {
            const this_conversation = action.payload.conversation;
            state.direct_chat.conversations = state.direct_chat.conversations.map(
                (el) => {
                    if (el?.id !== this_conversation.id) {
                        return el;
                    } else {
                        const user = this_conversation.users.find(
                            (elm) => elm.id.toString() !== user_id
                        );
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
                }
            );
        },

        addDirectConversation(state, action) {
            const this_conversation = action.payload.conversation;
            const user = this_conversation.participants.find(
                (elm) => elm._id.toString() !== user_id
            );
            state.direct_chat.conversations = state.direct_chat.conversations.filter(
                (el) => el?.id !== this_conversation._id
            );
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
        },
        fetchCurrentMessages(state, action) {
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
        },
        addDirectMessage(state, action) {
            state.direct_chat.current_messages.push(action.payload.message);
        },

        fetchDirectGroups(state, action) {
            const list = action.payload.groups.map((el) => {

                const lastMessage = el.messages?.length
                    ? [...el.messages]
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                        .pop()
                    : null;

                const noMessagesMessage = "You can start messaging with...";
                return {
                    id: el.id,
                    name: el.name,
                    msg: lastMessage?.text,
                    time: lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString() : "9:36",
                    unread: 0,
                    pinned: false,
                    urlImg: faker.image.avatar(),
                    lastMessage,
                    noMessagesMessage,
                };
            });
            console.log("Updated conversations: ", list);
            state.direct_chat.groups = [...list];
        },

    },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const FetchDirectConversations = (data) => {
    return async (dispatch, getState) => {
        dispatch(
            slice.actions.fetchDirectConversations({conversations: data})
        );
    };
};

export const FetchDirectGroups = (data) => {
    return async (dispatch, getState) => {
        dispatch(
            slice.actions.fetchDirectGroups({conversations: data})
        );
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


export const FetchCurrentMessages = ({messages}) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.fetchCurrentMessages({messages}));
    }
}

export const AddDirectMessage = (message) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.addDirectMessage({message}));
    }
}
