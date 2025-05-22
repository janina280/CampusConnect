import {Box, Stack} from "@mui/material";
import React, {useEffect, useRef} from "react";
import {useTheme} from "@mui/material/styles";
import {SimpleBarStyle} from "../../components/Scrollbar";

import {ChatFooter, ChatHeader} from "../../components/Chat";
import useResponsive from "../../hooks/useResponsive";
import {DocMsg, LinkMsg, MediaMsg, ReplyMsg, TextMsg, Timeline,} from "../../sections/dashboard/Conversation";
import {useDispatch, useSelector} from "react-redux";
import {SetCurrentConversation,} from "../../redux/slices/conversation";
import {useWebSocket} from "../../contexts/WebSocketContext";

const Conversation = ({isMobile, menu}) => {
    const dispatch = useDispatch();
    const {conversations, current_messages} = useSelector((state) => state.conversation.direct_chat);
    const {room_id} = useSelector((state) => state.app);
    const {socket} = useWebSocket();
    const token = useSelector((state) => state.auth.accessToken);

    useEffect(() => {
        const current = conversations.find((el) => el?.id === room_id);
        if (current) {
            dispatch(SetCurrentConversation(current));
            socket.emit("/app/get-messages/" + current.id, "Bearer " + token);
        }
    }, [room_id]);

    if (room_id === "ai_chat") {
        return <>
            <iframe
                src="https://www.chatbase.co/chatbot-iframe/6lOMMp9fr0yRMJiB4MGRt"
                width="100%"
                style={{
                    maxHeight: '99vh',
                    border: 'none',
                    minHeight: '99dvh',
                }}
                frameBorder="0"
            ></iframe>
        </>;
    } else {
        return (
            <Box p={isMobile ? 1 : 3}>
                <Stack spacing={3}>
                    {current_messages?.map((el, idx) => {
                        switch (el.type) {
                            case "divider":
                                return (
                                    // Timeline
                                    <Timeline el={el}/>
                                );

                            case "msg":
                                switch (el.subtype) {
                                    case "image":
                                        return (
                                            // Media Message
                                            <MediaMsg el={el} menu={menu}/>
                                        );

                                    case "document":
                                        return (
                                            // Doc Message
                                            <DocMsg el={el} menu={menu}/>
                                        );
                                    case "link":
                                        return (
                                            //  Link Message
                                            <LinkMsg el={el} menu={menu}/>
                                        );

                                    case "reply":
                                        return (
                                            //  ReplyMessage
                                            <ReplyMsg el={el} menu={menu}/>
                                        );

                                    default:
                                        return (
                                            // Text Message
                                            <TextMsg el={el} menu={menu}/>
                                        );
                                }

                            default:
                                return <></>;
                        }
                    })}
                </Stack>
            </Box>
        );
    }
};

const ChatComponent = () => {
    const isMobile = useResponsive("between", "md", "xs", "sm");
    const theme = useTheme();
    const {room_id} = useSelector((state) => state.app);

    const messageListRef = useRef(null);

    const {current_messages} = useSelector(
        (state) => state.conversation.direct_chat
    );

    useEffect(() => {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, [current_messages]);

    return (
        <Stack
            height={"100%"}
            maxHeight={"100vh"}
            width={isMobile ? "100vw" : "auto"}
        >
            {room_id !== "ai_chat" ? <ChatHeader/> : null}
            <Box
                ref={messageListRef}
                width={"100%"}
                sx={{
                    position: "relative",
                    flexGrow: 1,
                    overflow: "auto",

                    backgroundColor:
                        theme.palette.mode === "light"
                            ? "#F0F4FA"
                            : theme.palette.background,

                    boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
                }}
            >
                <SimpleBarStyle timeout={500} clickOnTrack={false}>
                    <Conversation menu={true} isMobile={isMobile}/>
                </SimpleBarStyle>
            </Box>

            {/*  */}
            {room_id !== "ai_chat" ? <ChatFooter/> : null}
        </Stack>
    );
};

export default ChatComponent;

export {Conversation};