import React from "react";
import { Box, Badge, Stack, Typography } from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import { ChatCircle } from "phosphor-react";
import CreateAvatar from "../utils/createAvatar";
import {useDispatch, useSelector} from "react-redux";
import { SelectConversation } from "../redux/slices/app";

const truncateText = (string, n) => {
  return string?.length > n ? `${string?.slice(0, n)}...` : string;
};

const StyledChatBox = styled(Box)(({ theme }) => ({
  "&:hover": {
    cursor: "pointer",
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));


const ChatElement = ({
  img,
  name,
  lastMessage, msg,
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
  const {room_id} = useSelector((state) => state.app);
  const selectedChatId = room_id?.toString();
  let isSelected = +selectedChatId === id;

  if (!selectedChatId) {
    isSelected = false;
  }
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
        backgroundColor: isSelected
            ? theme.palette.mode === "light"
                ? alpha(theme.palette.primary.main, 0.5)
                : theme.palette.primary.main
            : theme.palette.mode === "light"
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
            {" "}
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
                <Typography variant="caption">{truncateText(lastMessage.content, 20)}</Typography>
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
