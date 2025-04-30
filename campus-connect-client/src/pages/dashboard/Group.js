import React, {useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {Box, Divider, IconButton, Stack, Typography} from "@mui/material";
import {MagnifyingGlass, Plus} from "phosphor-react";
import {Search, SearchIconWrapper, StyledInputBase,} from "../../components/Search";
import {SimpleBarStyle} from "../../components/Scrollbar";
import ChatElement from "../../components/ChatElement";
import CreateGroup from "../../sections/main/CreateGroup";
import {useDispatch, useSelector} from "react-redux";
import {FetchDirectGroups, SetCurrentGroup} from "../../redux/slices/conversation";
import {useWebSocket} from "../../contexts/WebSocketContext";
import BottomNav from "../../layouts/dashboard/BottomNav";
import useResponsive from "../../hooks/useResponsive";
import {searchGroup} from "../../redux/slices/auth";


const Group = () => {
    const theme = useTheme();
    const [openDialog, setOpenDialog] = useState(false);
    const isDesktop = useResponsive("up", "md");
    const [filteredGroups, setFilteredGroups] = useState([]);
    const {isConnected, socket} = useWebSocket();
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.accessToken);
    const {user_id} = useSelector((state) => state.auth);
    const {roles = []} = useSelector((state) => state.auth);

    const isAdmin = roles.includes("ROLE_ADMIN");
    const isTutor = roles.includes("ROLE_TUTOR");
    const canCreateGroup = isAdmin || isTutor;
    const [queryGroup, setQueryGroup] = useState("");
    const {groups} = useSelector((state) => state.conversation.group_chat);
    const {availableGroups} = useSelector((state) => state.auth);


    useEffect(() => {
        if (!isConnected) return;

        socket.emit("/app/groups", "Bearer " + token);

        socket.on(`/user/${user_id}/group/groups-response`, (data) => {
            dispatch(FetchDirectGroups(data));
        });

    }, [isConnected, dispatch]);


    const handleGroupSelect = (groupId) => {
        dispatch(SetCurrentGroup({room_id: groupId}));
    };

    const handleSearch = async (searchTerm) => {
        setQueryGroup(searchTerm);
        if (!searchTerm.trim()) {
            setFilteredGroups(groups);
            return;
        }
        dispatch(searchGroup({keyword: searchTerm}));
    };

    return (
        <>
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
                <Stack p={3} spacing={2} sx={{maxHeight: "100vh"}}>
                    <Stack
                        direction="row"
                        alignItems={"center"}
                        justifyContent={"space-between"}
                    >
                        <Typography variant="h5">Groups</Typography>
                    </Stack>
                    <Stack sx={{width: "100%"}}>
                        <Search>
                            <SearchIconWrapper>
                                <MagnifyingGlass color="#709CE6"/>
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Search"
                                inputProps={{"aria-label": "search"}}
                                value={queryGroup}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </Search>
                    </Stack>
                    {canCreateGroup && (
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="subtitle2">Create New Group</Typography>
                        <IconButton onClick={() => setOpenDialog(true)}>
                            <Plus style={{color: theme.palette.primary.main}}/>
                        </IconButton>
                    </Stack>)}
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
                        <SimpleBarStyle timeout={500} autoHide={true}>

                            {queryGroup.trim() === "" && (
                                <Stack spacing={2.4}>
                                    <Typography variant="subtitle2" sx={{color: "#676767"}}>
                                        Pinned
                                    </Typography>
                                    {groups.filter((group) => group.pinned).length > 0 ? (
                                        groups
                                            .filter((group) => group.pinned)
                                            .map((group) => (
                                                <ChatElement
                                                    key={group.id}
                                                    {...group}
                                                    onClick={() => handleGroupSelect(group.id)}
                                                />
                                            ))
                                    ) : (""
                                    )}
                                </Stack>
                            )}

                            <Stack spacing={2.4}>
                                <Typography variant="subtitle2" sx={{color: "#676667"}}>
                                    All Groups
                                </Typography>
                                {(queryGroup.trim() === ""
                                        ? groups.filter((group) => !group.pinned)
                                        : availableGroups
                                ).length > 0 ? (
                                    (queryGroup.trim() === ""
                                            ? groups.filter((group) => !group.pinned)
                                            : availableGroups
                                    ).map((group) => (
                                        <ChatElement
                                            key={group.id}
                                            {...group}
                                            onClick={() => handleGroupSelect(group.id)}
                                        />
                                    ))
                                ) : ("")}
                            </Stack>
                        </SimpleBarStyle>
                    </Stack>
                </Stack>
            </Box>
            {openDialog && (
                <CreateGroup
                    open={openDialog}
                    handleClose={() => setOpenDialog(false)}
                />
            )}
        </>
    );
};

export default Group;
