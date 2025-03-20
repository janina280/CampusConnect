import React, {useEffect} from "react";
import {Stack} from "@mui/material";
import {Navigate, Outlet} from "react-router-dom";
import SideBar from "./SideBar";
import {useDispatch, useSelector} from "react-redux";
import {
    AddDirectConversation,
    AddDirectGroupConversation,
    UpdateDirectConversation,
} from "../../redux/slices/conversation";
import {SelectChatType, SelectRoomId} from "../../redux/slices/app";
import {useWebSocket} from "../../contexts/WebSocketContext";

const DashboardLayout = () => {
    const {isLoggedIn, user_id} = useSelector((state) => state.auth);

    const {isConnected, socket} = useWebSocket();
    const {conversations} = useSelector((state) => state.conversation.direct_chat);

    const dispatch = useDispatch();
    useEffect(() => {
        if (isLoggedIn) {
            if (!isConnected) return;

            socket.on("/group/group-create-response", (data) => {
                dispatch(AddDirectGroupConversation(data));
            })

            socket.on(`/chat/chat-create-response/${user_id}`, (chatData) => {
                const data = JSON.parse(chatData.body);
                console.log("Start chat data:", data);

                const existingConversation = conversations.find((el) => el?.id === data.id);
                if (existingConversation) {
                    dispatch(UpdateDirectConversation({conversation: data}));
                } else {
                    dispatch(AddDirectConversation({conversation: data}));
                }
                dispatch(SelectChatType({chat_type: "individual"}));
                dispatch(SelectRoomId({room_id: data.id}));
            });

            /*socket.on(`/topic/messages/${user_id}`, (messageOutput) => {
                const message = JSON.parse(messageOutput.body);
                console.log("Received message:", message);

                // Check if the message is for the currently selected conversation
                if (current_conversation?.id === message.conversation_id) {
                    dispatch(
                        AddDirectMessage({
                            id: message._id,
                            type: "msg",
                            subtype: message.type,
                            message: message.text,
                            incoming: message.to === user_id,
                            outgoing: message.from === user_id,
                        })
                    );
                }
            });
            socket.on(`/topic/start_chat/${user_id}`, (chatData) => {
                const data = JSON.parse(chatData.body);
                console.log("Start chat data:", data);

                // Check if the conversation already exists
                const existingConversation = conversations.find((el) => el?.id === data.id);
                if (existingConversation) {
                    // Update the conversation
                    dispatch(UpdateDirectConversation({conversation: data}));
                } else {
                    // Add the new conversation
                    dispatch(AddDirectConversation({conversation: data}));
                }
                dispatch(SelectChatType({chat_type: "individual"}));
                dispatch(SelectRoomId({room_id: data.id}));
            });

            socket.on(`/topic/request_sent/${user_id}`, (requestData) => {
                const data = JSON.parse(requestData.body);
                dispatch(showSnackbar({severity: "success", message: data.message}));
            });*/
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
