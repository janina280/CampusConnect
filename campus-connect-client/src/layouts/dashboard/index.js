import React, {useEffect, useRef} from "react";
import {Stack} from "@mui/material";
import {Navigate, Outlet} from "react-router-dom";
import SideBar from "./SideBar";
import {useDispatch, useSelector} from "react-redux";
import {
    AddDirectConversation,
    AddDirectGroupConversation,
    AddDirectMessage,
    AddDirectMessageGroup,
    AddUserToGroupConversation,
    FetchCurrentMessages,
    FetchCurrentMessagesGroup,
    UpdateDirectConversation,
} from "../../redux/slices/conversation";
import {SelectChatType, SelectRoomId} from "../../redux/slices/app";
import {useWebSocket} from "../../contexts/WebSocketContext";

const DashboardLayout = () => {
    const {isLoggedIn, user_id} = useSelector((state) => state.auth);
    const {isConnected, socket} = useWebSocket();
    const conversations = useSelector((state) => state.conversation.direct_chat.conversations);
    const current_conversation = useSelector((state) => state.conversation.direct_chat.current_conversation);
    const current_conversationRef = useRef(current_conversation);
    const dispatch = useDispatch();

    useEffect(() => {
        current_conversationRef.current = current_conversation;
    }, [current_conversation]);

    useEffect(() => {
        if (!isLoggedIn || !isConnected) return;

        // === HANDLERS ===
        const handleGroupCreate = (data) => {
            dispatch(AddDirectGroupConversation({conversation: data}));
        };

        const handleUserAdd = (data) => {
            dispatch(AddUserToGroupConversation({conversation: data}));
        };

        const handleChatCreate = (data) => {
            const existingConversation = conversations.find((el) => el?.id === data.id);
            if (existingConversation) {
                dispatch(UpdateDirectConversation({conversation: data}));
            } else {
                dispatch(AddDirectConversation({conversation: data}));
            }
            dispatch(SelectChatType({chat_type: "individual"}));
            dispatch(SelectRoomId({room_id: data.id}));
        };

        const handleMessageSendResponse = (message) => {
            const isGroup = message.group === true;
            const payload = {
                id: message.id,
                type: "msg",
                subtype: message.type,
                message: message.content,
                outgoing: message.senderId === user_id,
                senderId: message.senderId,
                sender: message.sender,
                state: message.state,
                createdAt: message.createdAt,
                media: message.media,
                formattedTime: message.formattedTime,
                chatId: message.chatId,
            };

            if (isGroup) {
                dispatch(AddDirectMessageGroup(payload));
            } else if (current_conversationRef.current?.id === message.chatId) {
                dispatch(AddDirectMessage(payload));
            }
        };

        const handlePrivateMessage = (data) => {
            dispatch(FetchCurrentMessages({messages: data}));
        };

        const handleGroupMessage = (data) => {
            dispatch(FetchCurrentMessagesGroup({messages: data}));
        };

        // === EVENT NAMES ===
        const groupCreateEvent = `/user/${user_id}/group/group-create-response`;
        const userAddEvent = `/user/${user_id}/group/user-add-response`;
        const chatCreateEvent = `/user/${user_id}/chat/chat-create-response`;
        const messageSendEvent = `/user/${user_id}/message/message-send-response`;
        const chatEvent = `/user/${user_id}/message/chat`;
        const groupMessageEvent = `/user/${user_id}/message/group`;

        // === ATTACH EVENTS ===
        socket.on(groupCreateEvent, handleGroupCreate);
        socket.on(userAddEvent, handleUserAdd);
        socket.on(chatCreateEvent, handleChatCreate);
        socket.on(messageSendEvent, handleMessageSendResponse);
        socket.on(chatEvent, handlePrivateMessage);
        socket.on(groupMessageEvent, handleGroupMessage);

        // === CLEANUP ===
        return () => {
            socket.off(groupCreateEvent, handleGroupCreate);
            socket.off(userAddEvent, handleUserAdd);
            socket.off(chatCreateEvent, handleChatCreate);
            socket.off(messageSendEvent, handleMessageSendResponse);
            socket.off(chatEvent, handlePrivateMessage);
            socket.off(groupMessageEvent, handleGroupMessage);
        };
    }, [isLoggedIn, isConnected, user_id, conversations]);

    if (!isLoggedIn) {
        return <Navigate to="/auth/login"/>;
    }

    return (
        <Stack direction="row">
            <SideBar/>
            <Outlet/>
        </Stack>
    );
};

export default DashboardLayout;
