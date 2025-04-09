import React, {useEffect} from "react";
import {Stack} from "@mui/material";
import {Navigate, Outlet} from "react-router-dom";
import SideBar from "./SideBar";
import {useDispatch, useSelector} from "react-redux";
import {
    AddDirectConversation,
    AddDirectGroupConversation,
    AddDirectMessage,
    AddUserToGroupConversation,
    UpdateDirectConversation,
} from "../../redux/slices/conversation";
import {SelectChatType, SelectRoomId} from "../../redux/slices/app";
import {useWebSocket} from "../../contexts/WebSocketContext";

const DashboardLayout = () => {
    const {isLoggedIn, user_id} = useSelector((state) => state.auth);
    const {isConnected, socket} = useWebSocket();
    const {conversations, current_conversation} = useSelector((state) => state.conversation.direct_chat);
    const dispatch = useDispatch();
    const {room_id} = useSelector((state) => state.app);
    useEffect(() => {
        if (isLoggedIn) {
            if (!isConnected) return;

            socket.on(`/user/${user_id}/group/group-create-response`, (data) => {
                dispatch(AddDirectGroupConversation({conversation: data}));
            })

            socket.on(`/user/${user_id}/group/user-add-response`, (data) => {
                dispatch(AddUserToGroupConversation({conversation: data}));
            });

            //socket.on(`/user/${user_id}/message/chat-${current_conversation?.id}`, (newMessage) => {
              //  dispatch(FetchCurrentMessages({ messages: [newMessage] }));
          //  });

            socket.on(`/user/${user_id}/message/message-send-response`, (message) => {
                console.log(message);
                if (current_conversation?.id === message.chatId) {
                    dispatch(
                        AddDirectMessage({
                            id: message.id,
                            type: "msg",
                            subtype: message.type,
                            message: message.content,
                            outgoing: message.senderId === user_id,
                            senderId: message.senderId,
                            state: message.state,
                            createdAt: message.createdAt,
                            media: message.media,
                            formattedTime: message.formattedTime,
                        }),
                    );

                }
            });

            socket.on(`/user/${user_id}/chat/chat-create-response`, (data) => {
                const existingConversation = conversations.find((el) => el?.id === data.id);
                if (existingConversation) {
                    dispatch(UpdateDirectConversation({conversation: data}));
                } else {
                    dispatch(AddDirectConversation({conversation: data}));
                }
                dispatch(SelectChatType({chat_type: "individual"}));
                dispatch(SelectRoomId({room_id: data.id}));
            });

        }
    }, [isLoggedIn, isConnected]);

    if (!isLoggedIn) {
        return <Navigate to={"/auth/login"}/>;
    }

    return (
        <Stack direction="row">
            <SideBar/>
            <Outlet/>
        </Stack>
    );
};

export default DashboardLayout;
