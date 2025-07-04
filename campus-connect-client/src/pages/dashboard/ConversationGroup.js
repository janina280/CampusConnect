import {Box, Stack} from "@mui/material";
import React, {useEffect, useRef} from "react";
import {useTheme} from "@mui/material/styles";
import {SimpleBarStyle} from "../../components/Scrollbar";
import {ChatFooter, ChatHeader} from "../../components/Chat";
import useResponsive from "../../hooks/useResponsive";
import {DocMsg, LinkMsg, MediaMsg, TextMsg} from "../../sections/dashboard/Conversation";
import {useDispatch, useSelector} from "react-redux";
import {SetCurrentGroup,} from "../../redux/slices/conversation";
import {useWebSocket} from "../../contexts/WebSocketContext";

const ConversationGroup = ({isMobile, menu}) => {
    const dispatch = useDispatch();
    const {groups, current_messages_group} = useSelector((state) => state.conversation.group_chat);
    const {room_id} = useSelector((state) => state.app);
    const {socket} = useWebSocket();
    const token = useSelector((state) => state.auth.accessToken);

    useEffect(() => {
        const current = groups.find((el) => el?.id === room_id);

        if (current) {
            dispatch(SetCurrentGroup(current));
            socket.emit("/app/get-messages/" + current.id, "Bearer " + token);
        }
    }, [room_id]);
    return (
        <Box p={isMobile ? 1 : 3}>
            <Stack spacing={3}>
                {current_messages_group.map((el, idx) => {
                    switch (el.type) {
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
};

const ChatGroupComponent = () => {
    const isMobile = useResponsive("between", "md", "xs", "sm");
    const theme = useTheme();

    const messageListRef = useRef(null);

    const {current_messages_group} = useSelector(
        (state) => state.conversation.group_chat
    );

    useEffect(() => {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, [current_messages_group]);

    return (
        <Stack
            height={"100%"}
            maxHeight={"100vh"}
            width={isMobile ? "100vw" : "auto"}
        >
            {/*  */}
            <ChatHeader/>
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
                    <ConversationGroup menu={true} isMobile={isMobile} isGroup={true}/>
                </SimpleBarStyle>
            </Box>

            {/*  */}
            <ChatFooter/>
        </Stack>
    );
};

export default ChatGroupComponent;

export {ConversationGroup};