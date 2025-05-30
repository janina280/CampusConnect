import React from "react";
import {Avatar, Badge, Box, Stack, Typography} from "@mui/material";
import {alpha, styled, useTheme} from "@mui/material/styles";
import {ChatCircle} from "phosphor-react";
import CreateAvatar from "../utils/createAvatar";
import {useDispatch, useSelector} from "react-redux";
import {SelectRoomId} from "../redux/slices/app";
import {fSmartTime} from "../utils/formatTime";
import {BASE_URL} from "../config";
import truncateString from "../utils/truncate";


const StyledChatBox = styled(Box)(({theme}) => ({
    "&:hover": {
        cursor: "pointer",
    },
}));

const ChatElement = ({img, name, msg, time, unread, id, lastMessageType}) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const {room_id} = useSelector((state) => state.app);
    const selectedChatId = room_id?.toString();
    let isSelected = +selectedChatId === id;
    if (!selectedChatId) {
        isSelected = false;
    }
    const imageUrl = img ? `${BASE_URL}/${img.replace("\\", "/")}` : '';

    const message = "You can start messaging with...";

    const formatLastMessage = () => {
        if (lastMessageType === "text") return truncateString(msg, 20);
        if (lastMessageType === "image") return "📷 Image";
        if (lastMessageType === "document") return "📄 Document";
        if (lastMessageType === "link") return "🔗 Link";
        return truncateString(message, 20);
    };

    return (
        <StyledChatBox
            onClick={() => {
                dispatch(SelectRoomId({room_id: id}));
            }}
            sx={{
                width: "100%",
                borderRadius: 1,
                backgroundColor: isSelected ? theme.palette.mode === "light" ? alpha(theme.palette.primary.main, 0.5) : theme.palette.primary.main : theme.palette.mode === "light" ? "#fff" : theme.palette.background.paper,
            }}
            p={2}
        >
            <Stack direction="row" alignItems={"center"} justifyContent="space-between">
                <Stack direction="row" spacing={2}>
                    {
                        id === "ai_chat" ? (
                            <Avatar src={img} sx={{width: 56, height: 56}}/>
                        ) : (
                            <CreateAvatar name={name} imageUrl={imageUrl} size={56}/>
                        )
                    }
                    <Stack spacing={0.3}>
                        <Typography variant="subtitle2">{name}</Typography>
                        <Typography variant="caption">
                            {formatLastMessage()}
                        </Typography>
                    </Stack>
                </Stack>
                <Stack spacing={2} alignItems={"center"}>
                    {time ? (
                        <Typography sx={{fontWeight: 600}} variant="caption">
                            {fSmartTime(time)}
                        </Typography>
                    ) : (
                        <ChatCircle
                            size={20}
                            style={{
                                cursor: "pointer",
                                color: theme.palette.primary.main,
                            }}
                        />
                    )}
                    <Badge className="unread-count" color="primary" badgeContent={unread}/>
                </Stack>
            </Stack>
        </StyledChatBox>
    );
};

export default ChatElement;
