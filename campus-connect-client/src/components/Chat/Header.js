import React, {useEffect, useState} from "react";
import {Box, IconButton, Stack, Typography,} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {MagnifyingGlass} from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import {ToggleSidebar} from "../../redux/slices/app";
import {useDispatch, useSelector} from "react-redux";
import CreateAvatar from "../../utils/createAvatar";
import StyledBadge from "../StyledBadge";

const ChatHeader = () => {
    const dispatch = useDispatch();
    const isMobile = useResponsive("between", "md", "xs", "sm");
    const theme = useTheme();

    const {current_conversation} = useSelector((state) => state.conversation.direct_chat);
    const {current_group_conversation} = useSelector((state) => state.conversation.group_chat);

    const {chat_type} = useSelector((store) => store.app);

    const [conversation, setConversation] = useState(null);

    useEffect(() => {
        if (chat_type === "individual") {
            setConversation(current_conversation);
        } else {
            setConversation(current_group_conversation);
        }
    }, [chat_type, current_group_conversation, current_conversation]);

    return (
        <Box
            p={2}
            width={"100%"}
            sx={{
                backgroundColor:
                    theme.palette.mode === "light" ? "#F8FAFF" : "transparent",
                boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            }}
        >
            <Stack
                alignItems={"center"}
                direction={"row"}
                sx={{width: "100%", height: "100%"}}
                justifyContent="space-between"
            >
                <Stack
                    onClick={() => {
                        dispatch(ToggleSidebar());
                    }}
                    spacing={2}
                    direction="row"
                    alignItems="center"
                >
                    <CreateAvatar
                        name={conversation?.name}
                        imageUrl={`http://localhost:8080/${conversation?.img}`}
                        size={56}
                    />
                    <Stack>
                        <Typography variant="subtitle2" align="center">
                            {conversation?.name}
                        </Typography>
                    </Stack>
                </Stack>
                <Stack
                    direction={"row"}
                    alignItems="center"
                    spacing={isMobile ? 1 : 3}
                >
                    {!isMobile && (
                        <IconButton>
                            <MagnifyingGlass/>
                        </IconButton>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};

export default ChatHeader;
