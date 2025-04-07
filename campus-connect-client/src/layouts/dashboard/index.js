import React, {useEffect} from "react";
import {Stack} from "@mui/material";
import {Navigate, Outlet} from "react-router-dom";
import SideBar from "./SideBar";
import {useDispatch, useSelector} from "react-redux";
import {
    AddDirectConversation,
    AddDirectGroupConversation, AddDirectMessage,
    AddUserToGroupConversation,
    UpdateDirectConversation,
} from "../../redux/slices/conversation";
import {SelectChatType, SelectRoomId} from "../../redux/slices/app";
import {useWebSocket} from "../../contexts/WebSocketContext";

const DashboardLayout = () => {
    const {isLoggedIn, user_id} = useSelector((state) => state.auth);
    const {isConnected, socket} = useWebSocket();
    const {conversations} = useSelector((state) => state.conversation.direct_chat);
    const {current_conversation}=useSelector((state) => state.conversation.direct_chat.current_conversation || []);
    const dispatch = useDispatch();
    useEffect(() => {
        if (isLoggedIn) {
            if (!isConnected) return;

            socket.on(`/user/${user_id}/group/group-create-response`, (data) => {
                dispatch(AddDirectGroupConversation({conversation: data}));
            })

            socket.on(`/user/${user_id}/group/user-add-response`, (data) => {
                dispatch(AddUserToGroupConversation({conversation: data}));
            });

            socket.on("new_message", (data) => {

                const message = data.message;
                console.log(current_conversation, data);

                if (current_conversation?.id === data.conversation_id) {
                    dispatch(
                        AddDirectMessage({
                            id: message.id,
                            type: "msg",
                            subtype: message.type,
                            message: message.content,
                            incoming: message.receiverId === user_id,
                            outgoing: message.senderId === user_id,
                            senderId: message.senderId,
                            receiverId: message.receiverId,
                            state: message.state,
                            createdAt: message.createdAt,
                            media: message.media,
                            formattedTime: message.formattedTime,
                        })
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
