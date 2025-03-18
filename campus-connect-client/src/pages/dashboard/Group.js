import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { MagnifyingGlass, Plus } from "phosphor-react";
import {
    Search,
    SearchIconWrapper,
    StyledInputBase,
} from "../../components/Search";
import { SimpleBarStyle } from "../../components/Scrollbar";
import ChatElement from "../../components/ChatElement";
import CreateGroup from "../../sections/main/CreateGroup";
import { useDispatch, useSelector } from "react-redux";
import NoChatSVG from "../../assets/Illustration/NoChat";
import { FetchDirectGroups, SetCurrentGroup } from "../../redux/slices/conversation";
import { useWebSocket } from "../../contexts/WebSocketContext";
import BottomNav from "../../layouts/dashboard/BottomNav";
import useResponsive from "../../hooks/useResponsive";
import ChatGroupComponent, {ConversationGroup} from "./ConversationGroup";
import Contact from "../../sections/dashboard/Contact";
import Media from "../../sections/dashboard/SharedMessage";
import StarredMessages from "../../sections/dashboard/StarredMessages";
import ChatComponent from "./Conversation";

const Group = () => {
    const theme = useTheme();
    const [openDialog, setOpenDialog] = useState(false);
    const isDesktop = useResponsive("up", "md");
    const [filteredGroups, setFilteredGroups] = useState([]);
    const { type ,open } = useSelector((store) => store.app.sideBar);
    const { isConnected, socket } = useWebSocket();
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.accessToken);

    const [queryGroup, setQueryGroup] = useState("");
    const { groups} = useSelector((state) => state.conversation.group_chat);
    const { chat_type,room_id } = useSelector((state) => state.app);

    useEffect(() => {
        if (!isConnected) return;

        socket.emit("/app/groups", "Bearer " + token);

        socket.on("/group/groups-response", (data) => {
            dispatch(FetchDirectGroups(data));
        });
    }, [isConnected]);

    const handleGroupSelect = (groupId) => {
        dispatch(SetCurrentGroup({ room_id: groupId }));
    };

    const handleSearch = async (searchTerm) => {
        setQueryGroup(searchTerm);
        if (!searchTerm.trim()) {
            setFilteredGroups(groups);
            return;
        }
        try {
            const response = await fetch(
                `http://localhost:8080/api/chat/groups/search?name=${encodeURIComponent(searchTerm)}`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setFilteredGroups(data);
            }
        } catch (error) {
            console.error("Error searching groups:", error);
        }
    };

    const handleGroupCreated = (newGroup) => {
        setFilteredGroups((prevGroups) => [...prevGroups, newGroup]);
    };

    return (
        <>
            <Stack direction="row" sx={{ width: "100%" }}>
                <Box
                    sx={{
                        height: "100vh",
                        backgroundColor:
                            theme.palette.mode === "light"
                                ? "#F8FAFF"
                                : theme.palette.background.default,
                        width: isDesktop ? 320 : "100vw",
                        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
                    }}
                >
                    {!isDesktop && <BottomNav />}
                    <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
                        <Typography variant="h5">Groups</Typography>
                        <Search>
                            <SearchIconWrapper>
                                <MagnifyingGlass color="#709CE6" />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Search"
                                inputProps={{ "aria-label": "search" }}
                                value={queryGroup}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </Search>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="subtitle2">Create New Group</Typography>
                            <IconButton onClick={() => setOpenDialog(true)}>
                                <Plus style={{ color: theme.palette.primary.main }} />
                            </IconButton>
                        </Stack>
                        <Divider />
                        <Stack
                            spacing={3}
                            sx={{ flexGrow: 1, overflow: "auto", height: "100%" }}
                        >
                            <SimpleBarStyle timeout={500} autoHide={true}>
                                <Stack spacing={2.5}>
                                    <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                                        All Groups
                                    </Typography>
                                    <Stack spacing={3}>
                                        {groups.map((group) => (
                                            <ChatElement
                                                key={group.id}
                                                {...group}
                                                onClick={() => handleGroupSelect(group.id)}
                                            />
                                        ))}
                                    </Stack>
                                </Stack>
                            </SimpleBarStyle>
                        </Stack>
                    </Stack>
                </Box>
                <Box
                    sx={{
                        height: "100%",
                        width: open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
                        backgroundColor:
                            theme.palette.mode === "light" ? "#F0F4FA" : "transparent",
                    }}
                >
                    {chat_type === "group" && room_id ? (
                        <ChatGroupComponent key={room_id} />
                    ) : (
                        <Stack
                            spacing={2}
                            sx={{ height: "100%", width: "100%" }}
                            alignItems={"center"}
                            justifyContent={"center"}
                        >
                            <NoChatSVG />
                            <Typography variant="subtitle2">
                                Select a conversation group or create a new one.
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
            {openDialog && (
                <CreateGroup
                    open={openDialog}
                    handleClose={() => setOpenDialog(false)}
                    handleGroupCreated={handleGroupCreated}
                />
            )}
        </>
    );
};

export default Group;
