import {
  Box,
  Fab,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  Camera,
  File,
  Image,
  LinkSimple,
  PaperPlaneTilt,
  Smiley,
  Sticker,
  User,
} from "phosphor-react";
import { useTheme, styled } from "@mui/material/styles";
import React, { useRef, useState, useEffect } from "react";
import useResponsive from "../../hooks/useResponsive";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useSelector, useDispatch } from "react-redux"; 
import { AddDirectMessage } from "../../redux/slices/conversation";
import { Client } from '@stomp/stompjs';

import SockJS from "sockjs-client";

const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    paddingTop: "12px !important",
    paddingBottom: "12px !important",
  },
}));

const Actions = [
  {
    color: "#4da5fe",
    icon: <Image size={24} />,
    y: 102,
    title: "Photo/Video",
  },
  {
    color: "#1b8cfe",
    icon: <Sticker size={24} />,
    y: 172,
    title: "Stickers",
  },
  {
    color: "#0172e4",
    icon: <Camera size={24} />,
    y: 242,
    title: "Image",
  },
  {
    color: "#0159b2",
    icon: <File size={24} />,
    y: 312,
    title: "Document",
  },
  {
    color: "#013f7f",
    icon: <User size={24} />,
    y: 382,
    title: "Contact",
  },
];

const ChatInput = ({
  openPicker,
  setOpenPicker,
  setValue,
  value,
  inputRef,
}) => {
  const [openActions, setOpenActions] = React.useState(false);

  return (
    <StyledInput
      inputRef={inputRef}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
      }}
      fullWidth
      placeholder="Write a message..."
      variant="filled"
      InputProps={{
        disableUnderline: true,
        startAdornment: (
          <Stack sx={{ width: "max-content" }}>
            <Stack
              sx={{
                position: "relative",
                display: openActions ? "inline-block" : "none",
              }}
            >
              {Actions.map((el) => (
                <Tooltip placement="right" title={el.title}>
                  <Fab
                    onClick={() => {
                      setOpenActions(!openActions);
                    }}
                    sx={{
                      position: "absolute",
                      top: -el.y,
                      backgroundColor: el.color,
                    }}
                    aria-label="add"
                  >
                    {el.icon}
                  </Fab>
                </Tooltip>
              ))}
            </Stack>

            <InputAdornment>
              <IconButton
                onClick={() => {
                  setOpenActions(!openActions);
                }}
              >
                <LinkSimple />
              </IconButton>
            </InputAdornment>
          </Stack>
        ),
        endAdornment: (
          <Stack sx={{ position: "relative" }}>
            <InputAdornment>
              <IconButton
                onClick={() => {
                  setOpenPicker(!openPicker);
                }}
              >
                <Smiley />
              </IconButton>
            </InputAdornment>
          </Stack>
        ),
      }}
    />
  );
};

const Footer = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { current_conversation } = useSelector((state) => state.conversation.direct_chat);
  const user_id = window.localStorage.getItem("user_id"); // ID-ul utilizatorului curent
  const receiver_id = current_conversation?.id; // ID-ul destinatarului mesajului

  const [openPicker, setOpenPicker] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  /*useEffect(() => {
    // Inițializează conexiunea WebSocket
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("Connected to WebSocket");

        // Abonează-te pentru a primi mesaje personale
        client.subscribe(`/user/queue/messages`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log("New message:", receivedMessage);

          // Adaugă mesajul în Redux Store
          dispatch(AddDirectMessage(receivedMessage));
        });
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, []);*/

  const handleSendMessage = () => {
    if (stompClient && stompClient.connected && receiver_id && value.trim() !== "") {
      const messagePayload = {
        userId: user_id,
        receiverId: receiver_id,
        content: value,
      };

      stompClient.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify(messagePayload),
      });

      setValue(""); // Golește inputul după trimitere
    }
  };

  function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(
      urlRegex,
      (url) => `<a href="${url}" target="_blank">${url}</a>`
    );
  }

  function containsUrl(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(text);
  }

  const handleEmojiClick = (emoji) => {
    const input = inputRef.current;
    if (input) {
      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;

      setValue(
        value.substring(0, selectionStart) +
          emoji +
          value.substring(selectionEnd)
      );
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box p={2} width="100%" sx={{ backgroundColor: theme.palette.mode === "light" ? "#F8FAFF" : "transparent" }}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Stack sx={{ width: "100%" }}>
            <Box sx={{ position: "fixed", display: openPicker ? "inline" : "none", bottom: 81 }}>
              <Picker
                theme={theme.palette.mode}
                data={data}
                onEmojiSelect={(emoji) => handleEmojiClick(emoji.native)}
              />
            </Box>
            <TextField
              inputRef={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              fullWidth
              placeholder="Write a message..."
              variant="filled"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton onClick={() => setOpenPicker(!openPicker)}>
                      <Smiley />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Box sx={{ height: 48, width: 48, backgroundColor: theme.palette.primary.main, borderRadius: 1.5 }}>
            <Stack sx={{ height: "100%", width: "100%" }} alignItems="center" justifyContent="center">
              <IconButton onClick={handleSendMessage}>
                <PaperPlaneTilt color="#ffffff" />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;