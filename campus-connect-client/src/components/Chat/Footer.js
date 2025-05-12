import {Box, Fab, IconButton, InputAdornment, Stack, TextField, Tooltip,} from "@mui/material";
import {Camera, File, Image, LinkSimple, PaperPlaneTilt, Smiley} from "phosphor-react";
import {styled, useTheme} from "@mui/material/styles";
import React, {useRef, useState} from "react";
import useResponsive from "../../hooks/useResponsive";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import {useSelector} from "react-redux";
import {useWebSocket} from "../../contexts/WebSocketContext";

const StyledInput = styled(TextField)(({ theme }) => ({
    "& .MuiInputBase-input": {
        paddingTop: "12px !important",
        paddingBottom: "12px !important",
    },
}));

const Actions = [
    {
        color: "#0159b2",
        icon: <Camera size={24} />,
        y: 102,
        title: "Image",
        type: "image/*"
    },
    {
        color: "#013f7f",
        icon: <File size={24} />,
        y: 172,
        title: "Document",
        type: "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
];

const ChatInput = ({ openPicker, setOpenPicker, setValue, value, inputRef, onFileUpload }) => {
    const [openActions, setOpenActions] = React.useState(false);
    const fileInputRef = useRef(null);

    const handleFileClick = (type) => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = type;
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onFileUpload) {
            onFileUpload(file);
        }
        e.target.value = "";
    };

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
                        <Stack sx={{ position: "relative", display: openActions ? "inline-block" : "none" }}>
                            {Actions.map((el) => (
                                <Tooltip key={el.title} placement="right" title={el.title}>
                                    <Fab
                                        onClick={() => handleFileClick(el.type)}
                                        sx={{ position: "absolute", top: -el.y, backgroundColor: el.color }}
                                        aria-label="add"
                                    >
                                        {el.icon}
                                    </Fab>
                                </Tooltip>
                            ))}
                        </Stack>
                        <InputAdornment>
                            <IconButton onClick={() => setOpenActions(!openActions)}>
                                <LinkSimple />
                            </IconButton>
                        </InputAdornment>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </Stack>
                ),
                endAdornment: (
                    <Stack sx={{ position: "relative" }}>
                        <InputAdornment>
                            <IconButton onClick={() => setOpenPicker(!openPicker)}>
                                <Smiley />
                            </IconButton>
                        </InputAdornment>
                    </Stack>
                ),
            }}
        />
    );
};

function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`);
}

function containsUrl(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(text);
}

const Footer = () => {
    const theme = useTheme();
    const user_id = window.localStorage.getItem("user_id");
    const { socket } = useWebSocket();
    const isMobile = useResponsive("between", "md", "xs", "sm");

    const { sideBar, room_id } = useSelector((state) => state.app);
    const [openPicker, setOpenPicker] = React.useState(false);
    const [value, setValue] = useState("");
    const inputRef = useRef(null);
    const token = useSelector((state) => state.auth.accessToken);

    const handleSendMessage = () => {
        if (!value.trim()) return;

        const messageData = {
            jwtString: "Bearer " + token,
            content: linkify(value),
            chatId: room_id,
            type: containsUrl(value) ? "link" : "text",
        };

        socket.emit("/app/send-message", messageData);
        setValue("");
    };

    const handleEmojiClick = (emoji) => {
        const input = inputRef.current;
        if (input) {
            const selectionStart = input.selectionStart;
            const selectionEnd = input.selectionEnd;
            const newValue = value.substring(0, selectionStart) + emoji + value.substring(selectionEnd);
            setValue(newValue);
            setTimeout(() => {
                input.focus();
                input.selectionStart = input.selectionEnd = selectionStart + emoji.length;
            }, 0);
            setOpenPicker(false);
        }
    };

    const handleFileUpload = (file) => {
        const messageData = {
            jwtString: "Bearer " + token,
            chatId: room_id,
            type: file.type.startsWith("image/") ? "image" : "file",
            fileName: file.name,
            fileType: file.type,
        };
        const reader = new FileReader();
        reader.onload = () => {
            messageData.content = reader.result;
            socket.emit("/app/send-message", messageData);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Box sx={{ position: "relative", backgroundColor: "transparent !important" }}
             onDrop={(e) => {
                 e.preventDefault();
                 const file = e.dataTransfer.files[0];
                 if (file) {
                     handleFileUpload(file);
                 }
             }}
             onDragOver={(e) => e.preventDefault()}>
            <Box
                p={isMobile ? 1 : 2}
                width={"100%"}
                sx={{
                    backgroundColor: theme.palette.mode === "light" ? "#F8FAFF" : theme.palette.background,
                    boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
                }}
            >
                <Stack direction="row" alignItems={"center"} spacing={isMobile ? 1 : 3}>
                    <Stack sx={{ width: "100%" }}>
                        <Box
                            style={{
                                zIndex: 10,
                                position: "fixed",
                                display: openPicker ? "inline" : "none",
                                bottom: 81,
                                right: isMobile ? 20 : sideBar.open ? 420 : 100,
                            }}
                        >
                            <Picker
                                theme={theme.palette.mode}
                                data={data}
                                onEmojiSelect={(emoji) => handleEmojiClick(emoji.native)}
                            />
                        </Box>
                        <ChatInput
                            inputRef={inputRef}
                            value={value}
                            setValue={setValue}
                            openPicker={openPicker}
                            setOpenPicker={setOpenPicker}
                            onFileUpload={handleFileUpload}
                        />
                    </Stack>
                    <Box
                        sx={{ height: 48, width: 48, backgroundColor: theme.palette.primary.main, borderRadius: 1.5 }}
                    >
                        <Stack sx={{ height: "100%" }} alignItems={"center"} justifyContent="center">
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
