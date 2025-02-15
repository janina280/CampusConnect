import React, { useState } from "react";
import Chats from "./Chats";
import { Box, Stack, Typography } from "@mui/material";
import Conversation from "../../components/Conversation";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import SharedMessages from "../../components/SharedMessages";
import Contact from "../../components/Contact";
import StarredMessages from "../../components/StarredMessages";
import NoChatSVG from "../../assets/Illustration/NoChat";

const GeneralApp = () => {
  const theme = useTheme();
  const { open, type } = useSelector((store) => store.app.sideBar);
  const { chat_type, room_id } = useSelector((store) => store.app);

  return (
    <Stack direction={"row"} sx={{ width: "100%" }}>
      <Chats />
      <Box
        sx={{
          height: "100%",
          width: open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
          backgroundColor:
            theme.palette.mode === "light" ? "#F0F4FA" : "transparent",
        }}
      >
        {room_id !== null && chat_type === "individual" ? (
          <Conversation />
        ) : (
          <Stack
            spacing={2}
            sx={{ height: "100%", width: "100%" }}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <NoChatSVG />
            <Typography variant="subtitle2">
              Select a conversation or start new one.
            </Typography>
          </Stack>
        )}
      </Box>
      {open &&
        (() => {
          switch (type) {
            case "CONTACT":
              return <Contact />;

            case "SHARED":
              return <SharedMessages />;

            case "STARRED":
              return <StarredMessages />;

            default:
              break;
          }
        })()}
    </Stack>
  );
};

export default GeneralApp;
