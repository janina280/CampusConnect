import React, {useEffect, useState} from "react";
import {Alert, Box, Divider, Snackbar, Stack, Typography,} from "@mui/material";
import {MagnifyingGlass} from "phosphor-react";
import {SimpleBarStyle} from "../../components/Scrollbar";
import BottomNav from "../../layouts/dashboard/BottomNav";
import {Search, SearchIconWrapper, StyledInputBase,} from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import {useDispatch, useSelector} from "react-redux";
import {FetchDirectConversations} from "../../redux/slices/conversation";
import {useTheme} from "@mui/material/styles";
import useResponsive from "../../hooks/useResponsive";
import {searchUser} from "../../redux/slices/auth";
import {useWebSocket} from "../../contexts/WebSocketContext";
import {UserElement} from "../../components/UserElement";
import {showSnackbar} from "../../redux/slices/app";
import {motion} from "framer-motion";
import {varHover} from "../../components/animate";
import Robot from "../../assets/Images/robot.png";

const Chats = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const {open} = useSelector((store) => store.app.sideBar);
    const isDesktop = useResponsive("up", "md");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const {isConnected, socket} = useWebSocket();
    const {user_id} = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.accessToken);

    const [queryChat, setQueryChat] = useState(null);
    const {conversations} = useSelector((state) => state.conversation.direct_chat);

    const users = useSelector((state) => state.auth.availableChats);
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {

        if (!isConnected) return;
        socket.emit("/app/chats", "Bearer " + token)

        socket.on(`/user/${user_id}/chat/chats-response`, (data) => {
            dispatch(FetchDirectConversations(data));
        });

    }, [isConnected, dispatch]);

    const handleSearch = (value) => {
        const trimmedValue = value.trim();
        setQueryChat(trimmedValue);

        if (trimmedValue !== "") {
            dispatch(searchUser({keyword: trimmedValue}));
        }
    };

    const handleCreateChat = (userId) => {
        if (userId === user_id) {
            dispatch(
                showSnackbar({
                    severity: "warning",
                    message: "You cannot create a chat with yourself.",
                })
            );
            return;
        }
        const existingChat = conversations.find((chat) => chat.user_id === userId);

        if (existingChat) {
            setSelectedChat(existingChat);
            return;
        }

        if (!isConnected) {
            console.error("The Socket is not connected");
            return;
        }

        const requestData = {userId: userId, jwtString: `Bearer ` + token};

        try {
            socket.emit("/app/chat-create", requestData);

            dispatch(
                showSnackbar({
                    severity: "success",
                    message: "Chat created successfully!",
                })
            );
        }
        catch (error) {
            dispatch(
                showSnackbar({
                    severity: "error",
                    message: "Failed to create chat.",
                })
            );
        }
    };

    return (
        <Box
            sx={{
                position: "relative",
                height: "100%",
                width: isDesktop ? 320 : "100vw",
                backgroundColor:
                    theme.palette.mode === "light" ? "#F8FAFF" : "transparent",
                boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            }}
        >
            {!isDesktop && <BottomNav/>}
            <Stack p={3} spacing={2} sx={{height: "100vh"}}>
                <Stack
                    direction="row"
                    alignItems={"center"}
                >
                    <Typography variant="h5">CampusConnect</Typography>
                </Stack>
                <Stack sx={{width: "100%"}}>
                    <Search>
                        <SearchIconWrapper>
                            <MagnifyingGlass color="#709CE6"/>
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search"
                            inputProps={{"aria-label": "search"}}
                            onChange={(e) => handleSearch(e.target.value)}
                            value={queryChat}
                        />
                    </Search>
                </Stack>
                <Divider/>
                <Stack
                    spacing={2}
                    direction="column"
                    sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        height: "100%",
                    }}
                >
                    {selectedChat ? (
                        <ChatElement {...selectedChat} />
                    ) : loading ? (
                        <Typography variant="body2">Loading chats...</Typography>
                    ) : (
                        <SimpleBarStyle timeout={500} autoHide={true}>
                            {queryChat?.trim() && users.length > 0 ? (
                                <Stack spacing={2.4}>
                                    <Typography variant="subtitle2" sx={{color: "#676767"}}>
                                        Search Results
                                    </Typography>
                                    {users.length > 0 ? (
                                        users
                                            .filter((user) => user.name)
                                            .map((chat) => (
                                                <motion.div variants={varHover(1.05)} whileHover="hover">
                                                    <UserElement
                                                        key={chat.id}
                                                        {...chat}
                                                        onClick={() => handleCreateChat(chat.id)}
                                                        showMessageIcon={true}
                                                        existingChat={!!conversations.find(c => c.user_id === chat.id)}
                                                    />
                                                </motion.div>
                                            ))
                                    ) : (
                                        <Typography variant="body2">No users found.</Typography>
                                    )}
                                </Stack>
                            ) : (
                                <>
                                    <Stack spacing={2.4}>
                                        <Typography variant="subtitle2" sx={{color: "#676767"}}>
                                            Pinned
                                        </Typography>
                                        <motion.div variants={varHover(1.05)} whileHover="hover">
                                            <ChatElement name={"Campus AI"} id={"ai_chat"} img={Robot}></ChatElement>
                                        </motion.div>
                                        {conversations
                                            .filter((chat) => chat.pinned && !chat.group)
                                            .map((chat) => {
                                                return (
                                                    <motion.div variants={varHover(1.05)} whileHover="hover">
                                                        <ChatElement
                                                            {...chat}
                                                        />
                                                    </motion.div>
                                                );
                                            })}
                                    </Stack>
                                    <Stack spacing={2.4}>
                                        <Typography variant="subtitle2" sx={{color: "#676767"}}>
                                            All Chats
                                        </Typography>
                                        {conversations
                                            .filter((chat) => !chat.pinned && !chat.group)
                                            .map((chat) => {
                                                return (
                                                    <motion.div variants={varHover(1.05)} whileHover="hover">
                                                        <ChatElement
                                                            {...chat}
                                                        />
                                                    </motion.div>
                                                );
                                            })}
                                    </Stack>
                                </>
                            )}
                        </SimpleBarStyle>
                    )}
                </Stack>
            </Stack>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert severity="success" sx={{width: "100%"}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Chats;
