import React from "react";
import {useTheme} from "@mui/material/styles";
import {Box, IconButton, Stack, Typography} from "@mui/material";
import {ArrowLeft} from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import {useDispatch, useSelector} from "react-redux";
import {UpdateSidebarType} from "../../redux/slices/app";

import {TextMsg} from "./Conversation";

const StarredMessagesGroup = () => {
    const dispatch = useDispatch();

    const theme = useTheme();

    const isDesktop = useResponsive("up", "md");

    const {current_messages_group} = useSelector((state) => state.conversation.group_chat);

    const starredMessages = current_messages_group.filter((current_messages_group) => current_messages_group.starred === true);

    return (
        <Box sx={{width: !isDesktop ? "100vw" : 320, maxHeight: "100vh"}}>
            <Stack sx={{height: "100%"}}>
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
                        sx={{height: "100%", p: 2}}
                        direction="row"
                        alignItems={"center"}
                        spacing={3}
                    >
                        <IconButton
                            onClick={() => {
                                dispatch(UpdateSidebarType("CONTACT"));
                            }}
                        >
                            <ArrowLeft/>
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
                    <ConversationStarredGroup messages={starredMessages}/>
                </Stack>
            </Stack>
        </Box>
    );
};

export default StarredMessagesGroup;


const ConversationStarredGroup = ({isMobile, menu}) => {
    const {current_messages_group} = useSelector((state) => state.conversation.group_chat);

    const starredMessagesGroup = current_messages_group.filter((current_messages_group) => current_messages_group.starred === true);
    return (
        <Box p={isMobile ? 1 : 3}>
            <Stack spacing={3}>
                {starredMessagesGroup?.map((el, idx) => {
                    switch (el.type) {
                        case "msg":
                            switch (el.subtype) {
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
export {ConversationStarredGroup};