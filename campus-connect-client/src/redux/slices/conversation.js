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

const addMessageToStateGroup = (state, message) => {
    const outgoing = message.senderId.toString() === user_id;

    state.group_chat.current_messages_group.push({
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

const getUserId = () => window.localStorage.getItem("user_id");


const slice = createSlice({
    name: "conversation", initialState, reducers: {

        fetchDirectConversations(state, action) {
            const user_id = getUserId();

            const list = action.payload.conversations.map((el) => {
                const user = el.users.find((elm) => elm.id.toString() !== user_id);
                const messages = [...el.messages];

                const lastMessage = messages.length > 0
                    ? messages.reduce((latest, msg) =>
                            new Date(msg.createdAt) > new Date(latest.createdAt) ? msg : latest,
                        messages[0]
                    )
                    : {content: "You can start messaging with...", createdAt: null};

                return {
                    id: el.id,
                    user_id: user?.id,
                    name: user?.name,
                    nickname: user?.nickname,
                    msg: lastMessage?.content,
                    time: lastMessage?.createdAt,
                    unread: 0,
                    pinned: el.pinned,
                    about: user?.about,
                    online: user?.status === "Online",
                    img: user?.imageUrl,
                };
            });

            const sortedList = list.sort((a, b) => {
                // 1. sortăm după pinned
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;

                // 2. sortăm după timp (descrescător)
                if (!a.time) return 1;
                if (!b.time) return -1;
                return new Date(b.time) - new Date(a.time);
            });

            state.direct_chat.conversations = sortedList;
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
                    time: lastMessage?.createdAt ?? "",
                    unread: 0,
                    pinned: el.pinned,
                    img: faker.image.avatar(),
                };
            });
            const sortedListGroup = list.sort((a, b) => {
                // 1. sortăm după pinned
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;

                // 2. sortăm după timp (descrescător)
                if (!a.time) return 1;
                if (!b.time) return -1;
                return new Date(b.time) - new Date(a.time);
            });
            state.group_chat.groups = sortedListGroup;
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
                        time: lastMessage?.createdAt ?? "",
                        unread: 0,
                        pinned: el.pinned,
                        about: el?.about,
                        online: el?.status === "Online",
                        img: el?.img
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
                img: user.img,
                msg: lastMessage?.content,
                time: lastMessage?.createdAt ?? "",
                unread: this_conversation.unread,
                pinned: this_conversation.pinned,
            });
        },


        setCurrentConversation(state, action) {
            state.direct_chat.current_conversation = action.payload;
        },

        fetchCurrentMessages(state, action) {
            const user_id = getUserId();
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
                    starred: el.starred || false,
                    formattedTime: el.formattedTime,
                };
            });


            state.direct_chat.current_messages = formatted_messages.sort((a, b) => {
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
        },

        fetchCurrentMessagesGroup(state, action) {
            const user_id = getUserId();
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
                    starred: el.starred || false,
                    formattedTime: el.formattedTime,
                };
            });


            state.group_chat.current_messages_group = formatted_messages.sort((a, b) => {
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
        }
        ,

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
                        time: el.id === message.chatId ? message.createdAt : el.time,
                        unread: 0,
                        pinned: el.pinned,
                        about: el?.about,
                        starred: el.starred || false,
                        online: el?.status === "Online",
                        img: el.img
                    }
                }
            );

            state.direct_chat.conversations = [...list];
        },

        updateLastMessageGroup(state, action) {
            const message = action.payload.message;
            const list = state.group_chat.groups.map((el) => {
                    return {
                        ...el,
                        id: el.id,
                        user_id: el.user_id,
                        name: el?.name,
                        nickname: el?.nickname,
                        sender: message.sender,
                        msg: el.id === message.chatId ? message?.message : el.msg,
                        time: el.id === message.chatId ? message.createdAt : el.time,
                        unread: 0,
                        pinned: el.pinned,
                        about: el?.about,
                        starred: el.starred || false,
                        online: el?.status === "Online",
                        img: faker.image.avatar()
                    }
                }
            );

            state.group_chat.groups = [...list];
        },

        addDirectMessageGroup(state, action) {
            addMessageToStateGroup(state, action.payload.message);
        },


        setCurrentGroup(state, action) {
            state.group_chat.current_group_conversation = action.payload;
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
                time: lastMessage?.formattedTime ?? "",
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
        },

        removeMessage(state, action) {
            const {messageId, conversationId} = action.payload;

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
            const {id, pinned, isGroup} = action.payload;

            if (isGroup) {
                state.group_chat.groups = state.group_chat.groups.map((group) =>
                    group.id === id ? {...group, pinned} : group
                );
            } else {
                state.direct_chat.conversations = state.direct_chat.conversations.map((conv) =>
                    conv.id === id ? {...conv, pinned} : conv
                );
            }
        },

        starMessage(state, action) {
            const starredMsg = action.payload;

            const update = (messages) =>
                messages.map(msg =>
                    msg.id === starredMsg.id ? {...msg, starred: true} : msg
                );

            state.direct_chat.current_messages = update(state.direct_chat.current_messages);
            state.group_chat.current_messages_group = update(state.group_chat.current_messages_group);

            const sortMessagesByTime = (messages) =>
                messages.sort((a, b) => new Date(a.formattedTime) - new Date(b.formattedTime));

            state.direct_chat.current_messages = sortMessagesByTime(state.direct_chat.current_messages);
            state.group_chat.current_messages_group = sortMessagesByTime(state.group_chat.current_messages_group);
        },
    }
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
        dispatch(slice.actions.updateLastMessageGroup({message}));
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

export const UpdatePinnedStatus = ({ id, pinned, isGroup }) => {
    return async (dispatch, getState) => {
        dispatch(slice.actions.updatePinnedStatus({ id, pinned, isGroup }));
    };
};



export const starMessage = (messageId) => async (dispatch, getState) => {
    try {
        const token = getState().auth.accessToken;

        if (!token) {
            console.error("Token is missing. Please log in.");
            return;
        }

        const response = await axios.put(
            `http://localhost:8080/api/message/${messageId}/starred`,
            {},
           {
                headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            dispatch(slice.actions.starMessage(response.data));
        } else {
            console.error("Failed to mark message as starred, status:", response.status);
        }
    } catch (error) {
        console.error('Error starring message:', error);
    }
};
