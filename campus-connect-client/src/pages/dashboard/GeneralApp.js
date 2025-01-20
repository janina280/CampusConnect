import React, { useState } from "react";
import Chats from "./Chats";
import { Box, Stack } from "@mui/material";
import Conversation from "../../components/Conversation";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import SharedMessages from "../../components/SharedMessages";
import Contact from "../../components/Contact";
import StarredMessages from "../../components/StarredMessages";

const GeneralApp = () => {
  const theme = useTheme();
  const { sidebar } = useSelector((store) => store.app);
  const [querys, setQuerys]=useState(null);
  const [currentChat, setCurrentChat]=useState(null);

  return (
    <Stack direction={"row"} sx={{ width: "100%" }}>
      <Chats />
      <Box
        sx={{
          height: "100%",
          width: sidebar.open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
          backgroundColor:
            theme.palette.mode === "light" ? "#F0F4FA" : "transparent",
        }}
      >
        <Conversation />
      </Box>
      {sidebar.open &&
        (() => {
          switch (sidebar.type) {
            case "CONTACT":
              return <Contact />;

            case "SHARED":
              return <SharedMessages />;

            case "STARRED":
              return <StarredMessages/>;
              
            default:
              break;
          }
        })()}
    </Stack>
  );
};

export default GeneralApp;
