import React from "react";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MagnifyingGlass } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import { ToggleSidebar } from "../../redux/slices/app";
import { SetCurrentConversation } from "../../redux/slices/conversation";
import { useDispatch, useSelector } from "react-redux";
import CreateAvatar from "../../utils/createAvatar";
import StyledBadge from "../StyledBadge";

const ChatHeader = () => {
  const dispatch = useDispatch();
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const theme = useTheme();

  const { current_conversation } = useSelector(
      (state) => state.conversation.direct_chat
  );
  const { current_groups } = useSelector(
      (state) => state.conversation.group_chat
  );

  const isGroupChat = current_groups != null;
  const conversation = isGroupChat ? current_groups : current_conversation;

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
            sx={{ width: "100%", height: "100%" }}
            justifyContent="space-between"
        >
          <Stack
              onClick={() => {
                dispatch(ToggleSidebar());
              }}
              spacing={2}
              direction="row"
          >
            <Box>
              <StyledBadge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
              >
                <CreateAvatar
                    name={conversation?.name}
                    imageUrl={conversation?.img}
                    size={56}
                />
              </StyledBadge>
            </Box>
            <Stack spacing={0.2}>
              <Typography variant="subtitle2">
                {conversation?.name}
              </Typography>
              <Typography variant="caption">
                {isGroupChat ? "Active Group" : "Online"}
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
                  <MagnifyingGlass />
                </IconButton>
            )}
          </Stack>
        </Stack>
      </Box>
  );
};

export default ChatHeader;
