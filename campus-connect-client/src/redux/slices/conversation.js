import {createSlice} from "@reduxjs/toolkit";
import {faker} from "@faker-js/faker";

let user_id = window.localStorage.getItem("user_id");

const initialState = {
    direct_chat: {
        conversations: [], current_conversation: null, current_messages: [],
    }, group_chat: {
        groups: [], current_group_conversation: null, current_messages_group: [],
    },
};

const addMessageToState = (state, message) => {
    const outgoing = message.senderId.toString() === user_id;

    state.direct_chat.current_messages.push({
        id: message.id,
        type: message.type,
        subtype: message.subtype,
        message: message.message,
        outgoing: outgoing,
        senderId: message.senderId,
        sender: message.sender,
        state: message.state,
        createdAt: message.createdAt,
        media: message.media,
        formattedTime: message.formattedTime,
    });
};

const slice = createSlice({
    name: "conversation", initialState, reducers: {


        fetchDirectConversations(state, action) {
            const user_id = window.localStorage.getItem("user_id");

            const list = action.payload.conversations.map((el) => {

                const user = el.users.find((elm) => elm.id.toString() !== user_id);

                const messages = [...el.messages];

                const lastMessage = messages.length > 0
                    ? messages.reduce((latest, msg) => msg.createdAt > latest.createdAt ? msg : latest, messages[0])
                    : { content: "You can start messaging with...", createdAt: null };

                return {
                    id: el.id,
                    user_id: user?.id,
                    name: user?.name,
                    nickname: user?.nickname,
                    msg: lastMessage?.content,
                    time: lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString() : "",
                    unread: 0,
                    pinned: el.pinned,
                    about: user?.about,
                    online: user?.status === "Online",
                    img: faker.image.avatar()
                };
            });

            state.direct_chat.conversations = [...list];
        },

        fetchDirectGroups(state, action) {
            user_id = window.localStorage.getItem("user_id");

            const list = action.payload.groups.map((el) => {

                const messages = [...el.messages];

                const lastMessage = messages.length > 0
                    ? messages.reduce((latest, msg) => msg.createdAt > latest.createdAt ? msg : latest, messages[0])
                    : { content: "You can start messaging with...", createdAt: null };

                return {
                    id: el.id,
                    name: el.name,
                    msg: lastMessage?.content,
                    time: lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString() : "",
                    unread: 0,
                    pinned: el.pinned,
                    img: faker.image.avatar(),
                };
            });
            console.log("Updated conversations: ", list);
            state.group_chat.groups = [...list];
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
            const user = this_conversation.users.find((elm) => elm.id.toString() !== user_id);
            state.direct_chat.conversations = state.direct_chat.conversations.filter((el) => el?.id !== this_conversation.id);
            const lastMessage = this_conversation.messages?.length ? this_conversation.messages.reduce((latest, msg) => msg.createdAt > latest.createdAt ? msg : latest, this_conversation.messages[0]) : {
                content: "You can start messaging with...", createdAt: null
            };
            state.direct_chat.conversations.push({
                id: this_conversation.id,
                user_id: user.id,
                name: user?.name,
                online: user.online ? "Online" : "Offline",
                img: faker.image.avatar(),
                msg: lastMessage?.content,
                time: lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString() : "9:36",
                unread: this_conversation.unread,
                pinned: this_conversation.pinned,
            });
        },


        setCurrentConversation(state, action) {
            state.direct_chat.current_conversation = action.payload;
        },

        fetchCurrentMessages(state, action) {
            const user_id = window.localStorage.getItem("user_id");

            const messages = action.payload.messages;
            const formatted_messages = messages.map((el) => {
                const outgoing = el.senderId.toString() === user_id;

                return {
                    id: el.id,
                    type: el.type,
                    subtype: el.subtype,
                    message: el.message,
                    outgoing: outgoing,
                    senderId: el.senderId,
                    state: el.state,
                    createdAt: el.createdAt,
                    media: el.media,
                    formattedTime: el.formattedTime,
                };
            });

            state.direct_chat.current_messages = formatted_messages;
        }
,


        addDirectMessage(state, action) {
            addMessageToState(state, action.payload.message);
        },



        addDirectMessageGroup(state, action) {
            addMessageToState(state, action.payload.message);
        },


        setCurrentGroup(state, action) {
            state.group_chat.current_group_conversation = action.payload;
        },


        fetchCurrentMessagesGroup(state, action) {
            const messages = action.payload.messages;
            const formatted_messages = messages.map((el) => ({
                id: el.id,
                type: el.type,
                subtype: el.subtype,
                message: el.message,
                incoming: el.incoming,
                outgoing: el.outgoing,
                senderId: el.senderId,
                receiverId: el.receiverId,
                state: el.state,
                createdAt: el.createdAt,
                media: el.media,
                formattedTime: el.formattedTime,
            }));
            state.group_chat.current_messages_group = formatted_messages;
        },


        addDirectGroupConversation(state, action) {
            const this_conversation = action.payload.group.conversation;
            state.group_chat.groups = state.group_chat.groups.filter((el) => el?.id !== this_conversation.id);
            const lastMessage = this_conversation.messages?.length ? this_conversation.messages.reduce((latest, msg) => msg.createdAt > latest.createdAt ? msg : latest, this_conversation.messages[0]) : {
                content: "You can start messaging with...", createdAt: null
            };
            state.group_chat.groups.push({
                id: this_conversation.id,
                users: this_conversation.users,
                name: this_conversation.name,
                online: this_conversation.online ? "Online" : "Offline",
                img: faker.image.avatar(),
                msg: lastMessage.content,
                time: lastMessage.createdAt ? new Date(lastMessage.createdAt).toLocaleTimeString() : "9:36",
                unread: this_conversation.unread,
                pinned: this_conversation.pinned,
            });

        },


        addUserToGroupConversation(state, action) {
            const group = action.payload.group.conversation;
            const groupId = group.id;

            const users = Array.isArray(group.users) ? group.users : [];

            const user = group.users.find((elm) => elm.id.toString() !== user_id);

            state.group_chat.groups = state.group_chat.groups.map(group => {
                if (group.id === groupId) {
                    return {
                        ...group,
                        users: [...users, user],
                    };
                }
                return group;
            });
        }


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
export const AddDirectGroupConversation = (conversation) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.addDirectGroupConversation({group: conversation}));
    }
}
export const AddUserToGroupConversation = (conversation) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.addUserToGroupConversation({group: conversation}));
    }
}
