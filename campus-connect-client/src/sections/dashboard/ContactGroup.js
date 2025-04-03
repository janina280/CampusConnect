import React, {useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Slide,
    Stack,
    Typography,
} from "@mui/material";
import CreateAvatar from "../../utils/createAvatar";
import {CaretRight, Plus, Star, Trash, X,} from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import {useDispatch, useSelector} from "react-redux";
import {FetchAllUsers, showSnackbar, ToggleSidebar, UpdateSidebarType} from "../../redux/slices/app";
import axios from "../../utils/axios";
import Snackbar from "@mui/material/Snackbar";
import {useWebSocket} from "../../contexts/WebSocketContext";
import {FetchDirectGroups} from "../../redux/slices/conversation";
import {useNavigate} from "react-router-dom";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const DeleteChatDialog = ({open, handleClose, onDeleteSuccess}) => {
    const [loading, setLoading] = useState(false);
    const chatId = useSelector((state) => state.conversation.group_chat.current_group_conversation.id);
    const token = useSelector((state) => state.auth.accessToken);
    const handleDelete = () => {
        setLoading(true);

        fetch(`http://localhost:8080/${chatId}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    onDeleteSuccess();
                }
            })
            .catch((error) => {
                console.error('Error deleting chat:', error);
            })
            .finally(() => {
                setLoading(false);
                handleClose();
            });
    };
    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>Delete this chat</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Are you sure you want to delete this chat?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleDelete} disabled={loading}>
                    {loading ? "Deleting..." : "Yes"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const AddUserDialog = ({open, handleClose, groupId}) => {
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const token = useSelector((state) => state.auth.accessToken);
    const users = useSelector((state) => state.app.all_users);
    const dispatch = useDispatch();
    const {isConnected, socket} = useWebSocket();

    useEffect(() => {
        dispatch(FetchAllUsers());
    }, [dispatch]);

    const handleAddUser = async () => {
        if (!selectedUser) {
            alert("Please select a user.");
            return;
        }

        const requestData = {
            groupId: groupId,
            userId: selectedUser,
            jwt: "Bearer " + token,
        };

        try {
            if (!isConnected) {
                throw new Error("The Socket is not connected");
            }

            socket.emit("/app/user-add", requestData);

            dispatch(
                showSnackbar({
                    severity: "success",
                    message: "User added successfully!",
                })
            );
            handleClose();
        } catch (error) {
            console.error("Error adding user:", error);
            dispatch(
                showSnackbar({
                    severity: "error",
                    message: "Failed to add user.",
                })
            );
        }
    };


    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Add User to Group</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth>
                        <InputLabel id="user-select-label">Select User</InputLabel>
                        <Select
                            labelId="user-select-label"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            label="Select User"
                            variant="outlined"
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleAddUser} disabled={loading}>
                        {loading ? "Adding..." : "Add User"}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity={snackbarMessage.includes("successfully") ? "success" : "error"}
                    sx={{width: "100%"}}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

const ContactGroup = () => {
    const dispatch = useDispatch();

    const {current_group_conversation} = useSelector((state) => state.conversation.group_chat);
    const {chat_type} = useSelector((store) => store.app);
    const theme = useTheme();
    const groupId = current_group_conversation.id;

    const isDesktop = useResponsive("up", "md");
    const [openDelete, setOpenDelete] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [openAddUser, setOpenAddUser] = useState(false);
    const [groupMembers, setGroupMembers] = useState([]);
    const token = useSelector((state) => state.auth.accessToken);
    const navigate = useNavigate();
    const {isConnected, socket} = useWebSocket();
    const { user_id} = useSelector((state) => state.auth);

    const handleCloseAddUser = () => {
        setOpenAddUser(false);
    };

    const fetchGroupMembers = () => {
        axios
            .get(`http://localhost:8080/${groupId}/users`, {
                headers: {Authorization: `Bearer ${token}`},
            })
            .then((response) => {
                setGroupMembers(response.data);
            })
            .catch((error) => console.error("Error fetching group members:", error));
    };

    useEffect(() => {
        if (chat_type === "group" && current_group_conversation) {
            setConversation(current_group_conversation);
            fetchGroupMembers();
        }
    }, [chat_type, current_group_conversation, groupId]);

    const fetchGroups = () => {
        if (!isConnected) return;

        socket.emit("/app/groups", `Bearer ${token}`);

        socket.on(`/user/${user_id}/group/groups-response`, (data) => {
            dispatch(FetchDirectGroups(data));
        });
    };


    useEffect(() => {
        fetchGroups();
    }, [isConnected]);


    const handleDeleteSuccess = () => {
        navigate("/app");
        fetchGroups();
    };

    return (
        <Box sx={{width: !isDesktop ? "100vw" : 320, maxHeight: "100vh"}}>
            <Stack sx={{height: "100%"}}>
                <Box
                    sx={{
                        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
                        width: "100%",
                        backgroundColor:
                            theme.palette.mode === "light"
                                ? "#F8FAFF"
                                : theme.palette.background,
                    }}
                >
                    <Stack
                        sx={{height: "100%", p: 2}}
                        direction="row"
                        alignItems={"center"}
                        justifyContent="space-between"
                        spacing={3}
                    >
                        <Typography variant="subtitle2">Contact Info</Typography>
                        <IconButton
                            onClick={() => {
                                dispatch(ToggleSidebar());
                            }}
                        >
                            <X/>
                        </IconButton>
                    </Stack>
                </Box>
                <Stack
                    sx={{
                        height: "100%",
                        position: "relative",
                        flexGrow: 1,
                        overflow: "scroll",
                    }}
                    p={3}
                    spacing={3}
                >
                    <Stack alignItems="center" direction="row" spacing={2}>
                        <CreateAvatar
                            name={conversation?.name}
                            imageUrl={conversation?.img}
                            size={56}
                        />
                        <Stack spacing={0.5}>
                            <Typography variant="article" fontWeight={600}>
                                {conversation?.name}
                            </Typography>
                        </Stack>
                    </Stack>
                    <Divider/>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent={"space-between"}
                    >
                        <Typography variant="subtitle2">Media, Links & Docs</Typography>
                        <Button
                            onClick={() => {
                                dispatch(UpdateSidebarType("SHARED"));
                            }}
                            endIcon={<CaretRight/>}
                        >
                            401
                        </Button>
                    </Stack>
                    <Stack direction={"row"} alignItems="center" spacing={2}>
                        {[1, 2, 3].map((el) => (
                            <Box>
                                {/* <img src={faker.image.city()} alt={faker.internet.userName()} /> */}
                            </Box>
                        ))}
                    </Stack>
                    <Divider/>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent={"space-between"}
                    >
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Star size={21}/>
                            <Typography variant="subtitle2">Starred Messages</Typography>
                        </Stack>

                        <IconButton
                            onClick={() => {
                                dispatch(UpdateSidebarType("STARRED"));
                            }}
                        >
                            <CaretRight/>
                        </IconButton>
                    </Stack>
                    <Divider/>
                    <Stack spacing={1}>
                        <Typography variant="subtitle2">Members</Typography>
                        <Stack spacing={1}>
                            {groupMembers.length > 0 ? (
                                groupMembers.map((user) => (
                                    <Stack direction="row" alignItems="center" spacing={2} key={user.id}>
                                        <CreateAvatar
                                            name={user.name}
                                            imageUrl={user.img}
                                            size={40}
                                        />
                                        <Typography variant="body2">{user.name}</Typography>
                                    </Stack>
                                ))
                            ) : (
                                <Typography variant="body2">No members in the group yet.</Typography>
                            )}
                        </Stack>
                    </Stack>

                    <Divider/>
                    <Stack direction="row" alignItems={"center"} spacing={2}>
                        <Button
                            onClick={() => setOpenAddUser(true)}
                            startIcon={<Plus/>}
                            variant="outlined"
                            sx={{width: "100%"}}
                        >
                            Add User
                        </Button>
                        <Button
                            onClick={() => setOpenDelete(true)}
                            startIcon={<Trash/>}
                            variant="outlined"
                            sx={{width: "100%"}}
                        >
                            Delete
                        </Button>
                    </Stack>

                </Stack>
            </Stack>
            {openDelete && <DeleteChatDialog open={openDelete} handleClose={() => setOpenDelete(false)} onDeleteSuccess={handleDeleteSuccess} />}
            {<AddUserDialog open={openAddUser} handleClose={handleCloseAddUser} groupId={groupId}/>}
        </Box>
    );
};

export default ContactGroup;