import {createSlice} from "@reduxjs/toolkit";
import {faker} from "@faker-js/faker";
import axios from "axios";

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
                    : {content: "You can start messaging with...", createdAt: null};

                return {
                    id: el.id,
                    user_id: user?.id,
                    name: user?.name,
                    nickname: user?.nickname,
                    msg: lastMessage?.content,
                    time: lastMessage?.formattedTime ?? "",
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
                    : {content: "You can start messaging with...", createdAt: null};

                return {
                    id: el.id,
                    name: el.name,
                    msg: lastMessage?.content,
                    time: lastMessage?.formattedTime ?? "",
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
                    const messages = [...el.messages];

                    const lastMessage = messages.length > 0
                        ? messages.reduce((latest, msg) => msg.createdAt > latest.createdAt ? msg : latest, messages[0])
                        : {content: "You can start messaging with...", createdAt: null};

                    return {
                        id: el.id,
                        user_id: el.user_id,
                        name: el?.name,
                        nickname: el?.nickname,
                        sender: el.sender,
                        msg: lastMessage?.content,
                        time: lastMessage?.formattedTime ?? "",
                        unread: 0,
                        pinned: el.pinned,
                        about: el?.about,
                        online: el?.status === "Online",
                        img: faker.image.avatar()
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
                time: lastMessage?.formattedTime ?? "",
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
                    type: "msg",
                    subtype: el.type,
                    message: el.content,
                    outgoing: outgoing,
                    senderId: el.senderId,
                    sender: el.sender,
                    state: el.state,
                    createdAt: el.createdAt,
                    media: el.media,
                    formattedTime: el.formattedTime,
                };
            });

            state.direct_chat.current_messages = formatted_messages;
        },

        addDirectMessage(state, action) {
            addMessageToState(state, action.payload.message);
        },

        updateLastMessage(state, action) {
            const message = action.payload.message;
            const list = state.direct_chat.conversations.map((el) => {
                    return {
                        ...el,
                        id: el.id,
                        user_id: el.user_id,
                        name: el?.name,
                        nickname: el?.nickname,
                        sender: message.sender,
                        msg: el.id === message.chatId ? message?.message : el.msg,
                        time: el.id === message.chatId ? message.formattedTime : el.time,
                        unread: 0,
                        pinned: el.pinned,
                        about: el?.about,
                        online: el?.status === "Online",
                        img: faker.image.avatar()
                    }
                }
            );

            state.direct_chat.conversations = [...list];
        },

        addDirectMessageGroup(state, action) {
            addMessageToState(state, action.payload.message);
        }
        ,


        setCurrentGroup(state, action) {
            state.group_chat.current_group_conversation = action.payload;
        }
        ,


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
        }
        ,


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
                time: lastMessage?.formattedTime ?? "",
                unread: this_conversation.unread,
                pinned: this_conversation.pinned,
            });

        }
        ,


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
        },

        removeMessage(state, action)  {
            const { messageId, conversationId } = action.payload;

            state.direct_chat.conversations = state.direct_chat.conversations.map((conversation) => {
                if (conversation.id === conversationId) {
                    conversation.messages = conversation.messages.filter(
                        (message) => message.id !== messageId
                    );
                }
                return conversation;
            });

            state.group_chat.groups = state.group_chat.groups.map((group) => {
                if (group.id === conversationId) {
                    group.messages = group.messages.filter(
                        (message) => message.id !== messageId
                    );
                }
                return group;
            });

            state.direct_chat.current_messages = state.direct_chat.current_messages.filter(
                (message) => message.id !== messageId
            );
        },

        updatePinnedStatus(state, action) {
            const { id, pinned, isGroup } = action.payload;

            if (isGroup) {
                state.group_chat.groups = state.group_chat.groups.map((group) =>
                    group.id === id ? { ...group, pinned } : group
                );
            } else {
                state.direct_chat.conversations = state.direct_chat.conversations.map((conv) =>
                    conv.id === id ? { ...conv, pinned } : conv
                );
            }
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
        dispatch(slice.actions.updateLastMessage({message}));
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
export const deleteMessage = (messageId, conversationId) => {
    return async (dispatch, getState) => {
        const token = getState().auth.accessToken;

        if (!token) {
            console.error("Token is missing. Please log in.");
            return;
        }

        try {
            const response = await axios.delete(`api/messages/${messageId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                console.log('Message deleted successfully');
                dispatch(slice.actions.removeMessage({ messageId, conversationId }));
            } else {
                console.error("Failed to delete message, status:", response.status);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };
};
export const UpdatePinnedStatus = ({ id, pinned, isGroup }) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.updatePinnedStatus({ id, pinned, isGroup }));
    };
};

