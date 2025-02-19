import React from "react";
import Chats from "./Chats";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import Contact from "../../sections/dashboard/Contact";
import NoChatSVG from "../../assets/Illustration/NoChat";
import StarredMessages from "../../sections/dashboard/StarredMessages";
import Media from "../../sections/dashboard/SharedMessage";
import ChatComponent from "./Conversation";
import { Link, useSearchParams } from "react-router-dom";

const GeneralApp = () => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
 // const { sideBar, room_id, chat_type } = useSelector((state) => state.app);
  const { open, type } = useSelector((store) => store.app.sideBar);
  const { chat_type, room_id } = useSelector((store) => store.app);

  return (
    <Stack direction={"row"} sx={{ width: "100%" }}>
      <Chats />
      <Box
          sx={{
            height: "100%",
            width: open
              ? `calc(100vw - 740px )`
              : "calc(100vw - 420px )",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#FFF"
                : theme.palette.background.paper,
            borderBottom:
              searchParams.get("type") === "individual-chat" &&
              searchParams.get("id")
                ? "0px"
                : "6px solid #0162C4",
          }}
      >
        {chat_type === "individual" &&
          room_id !== null ? (
            <ChatComponent />
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
              return <Media />;

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
