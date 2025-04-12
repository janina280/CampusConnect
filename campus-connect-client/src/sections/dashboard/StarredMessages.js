import React from "react";
import { useTheme } from "@mui/material/styles";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { ArrowLeft } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import { useDispatch, useSelector } from "react-redux";
import { UpdateSidebarType } from "../../redux/slices/app";

import {DocMsg, LinkMsg, MediaMsg, ReplyMsg, TextMsg, Timeline} from "./Conversation";

const StarredMessages = () => {
    const dispatch = useDispatch();

    const theme = useTheme();

    const isDesktop = useResponsive("up", "md");

    const { current_messages } = useSelector((state) => state.conversation.direct_chat);

    const starredMessages = current_messages.filter((current_messages) => current_messages.starred === true);

    return (
        <Box sx={{ width: !isDesktop ? "100vw" : 320, maxHeight: "100vh" }}>
            <Stack sx={{ height: "100%" }}>
                <Box
                    sx={{
                        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
                        width: "100%",
                        backgroundColor:
                            theme.palette.mode === "light"
                                ? "#F8FAFF"
                                : theme.palette.background,
                    }}
                >
                    <Stack
                        sx={{ height: "100%", p: 2 }}
                        direction="row"
                        alignItems={"center"}
                        spacing={3}
                    >
                        <IconButton
                            onClick={() => {
                                dispatch(UpdateSidebarType("CONTACT"));
                            }}
                        >
                            <ArrowLeft />
                        </IconButton>
                        <Typography variant="subtitle2">Starred Messages</Typography>
                    </Stack>
                </Box>
                <Stack
                    sx={{
                        height: "100%",
                        position: "relative",
                        flexGrow: 1,
                        overflow: "scroll",
                    }}
                    spacing={3}
                >
                    <ConversationStarred messages={starredMessages} />
                </Stack>
            </Stack>
        </Box>
    );
};

export default StarredMessages;


const ConversationStarred = ({ isMobile, menu }) => {
    const { current_messages } = useSelector((state) => state.conversation.direct_chat);

    const starredMessages = current_messages.filter((current_messages) => current_messages.starred === true);
    console.log("Starred Messages:", starredMessages);
    return (
        <Box p={isMobile ? 1 : 3}>
            <Stack spacing={3}>
                {starredMessages?.map((el, idx) => {
                    switch (el.type) {
                        case "divider":
                            return (
                                // Timeline
                                <Timeline el={el} />
                            );

                        case "msg":
                            switch (el.subtype) {
                                case "img":
                                    return (
                                        // Media Message
                                        <MediaMsg el={el} menu={menu} />
                                    );

                                case "doc":
                                    return (
                                        // Doc Message
                                        <DocMsg el={el} menu={menu} />
                                    );
                                case "Link":
                                    return (
                                        //  Link Message
                                        <LinkMsg el={el} menu={menu} />
                                    );

                                case "reply":
                                    return (
                                        //  ReplyMessage
                                        <ReplyMsg el={el} menu={menu} />
                                    );

                                default:
                                    return (
                                        // Text Message
                                        <TextMsg el={el} menu={menu} />
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
export { ConversationStarred };