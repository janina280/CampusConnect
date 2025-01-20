import React from "react";
import { Box, Stack, Typography, Badge, Avatar } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ChatElement = ({ id, messages,users, unread, online,  currentUser }) => {
  const theme = useTheme();
  const otherUser =
    users && currentUser
      ? users.find((user) => user.id !== currentUser.sub)
      : null;
  const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
  const time = lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString() : "No messages";
  
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 1,
        backgroundColor:
          theme.palette.mode === "light" ? "#FFF" : theme.palette.background.default,
        padding: 2,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)"
      }}
    >
      <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
        <Stack direction={"row"} spacing={2}>
          {online ? (
            <Avatar sx={{ bgcolor: "green" }} />
          ) : (
            <Avatar sx={{ bgcolor: "gray" }} />
          )}

          <Stack spacing={0.3}>
            <Typography variant="subtitle2">{otherUser?.name || "Unknown User"}</Typography>
            <Typography variant="caption">{lastMessage ? lastMessage.text : "No messages yet"}</Typography>
          </Stack>
        </Stack>
        <Stack spacing={2} alignItems={"center"}>
          <Typography sx={{ fontWeight: 600 }} variant="caption">
            {time}
          </Typography>
          <Badge color="primary" badgeContent={unread}></Badge>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatElement;
