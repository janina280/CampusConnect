import React from "react";
import { Box, Badge, Stack, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { ChatCircle } from "phosphor-react";
import CreateAvatar from "../utils/createAvatar";
import { useDispatch } from "react-redux";
import { SelectConversation } from "../redux/slices/app";
import StyledBadge from "./StyledBadge";

const StyledChatBox = styled(Box)(({ theme }) => ({
  "&:hover": {
    cursor: "pointer",
  },
}));


const ChatElement = ({
  img,
  name,
  lastMessage,
  formattedTime,
  unread,
  online,
  id,
  is_Group,
  handleCreateChat,
  existingChat,
  noMessagesMessage,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  return (
    <StyledChatBox
      onClick={async () => {
        if (!existingChat) {
          handleCreateChat(id);
        }
        dispatch(SelectConversation({ room_id: id }));
      }}
      sx={{
        width: "100%",
        borderRadius: 1,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.background.paper,
      }}
      p={2}
    >
      {existingChat ? (
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2}>
            {online ? (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
              >
                <CreateAvatar name={name} imageUrl={img} size={56} />
              </StyledBadge>
            ) : (
              <CreateAvatar name={name} imageUrl={img} size={56} />
            )}
            <Stack spacing={0.3}>
              <Typography variant="subtitle2">{name}</Typography>
              {lastMessage ? (
                <Typography variant="caption">{lastMessage.content}</Typography>
              ) : (
                <Typography variant="caption" sx={{ color: "gray" }}>
                  {noMessagesMessage}
                </Typography>
              )}
            </Stack>
          </Stack>
          <Stack spacing={2} alignItems={"center"}>
            {lastMessage ? (
              <Typography sx={{ fontWeight: 600 }} variant="caption">
                {formattedTime}
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
            {lastMessage && (
              <Badge
                className="unread-count"
                color="primary"
                badgeContent={unread}
              />
            )}
          </Stack>
        </Stack>
      ) : (
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems={"center"} spacing={2}>
            {online ? (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
              >
                <CreateAvatar name={name} imageUrl={img} size={56} />
              </StyledBadge>
            ) : (
              <CreateAvatar name={name} imageUrl={img} size={56} />
            )}
            <Stack spacing={0.4}>
              <Typography variant="subtitle2">{name}</Typography>
            </Stack>
          </Stack>
          <Stack spacing={2} direction="row" alignItems={"center"}>
            <ChatCircle
              size={20}
              style={{
                cursor: "pointer",
                color: theme.palette.primary.main,
              }}
            />
            <Badge
              className="unread-count"
              color="primary"
              badgeContent={unread}
            />
          </Stack>
        </Stack>
      )}
    </StyledChatBox>
  );
};

export default ChatElement;
