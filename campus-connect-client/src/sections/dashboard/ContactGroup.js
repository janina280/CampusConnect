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
import {CaretRight, Plus, PushPin, Star, Trash, X,SignOut} from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import {useDispatch, useSelector} from "react-redux";
import {FetchAllUsers, SelectRoomId, showSnackbar, ToggleSidebar, UpdateSidebarType} from "../../redux/slices/app";
import axios from "../../utils/axios";
import Snackbar from "@mui/material/Snackbar";
import {useWebSocket} from "../../contexts/WebSocketContext";
import DeleteIcon from '@mui/icons-material/Delete';
import {SetCurrentConversation, SetCurrentGroup, UpdatePinnedStatus} from "../../redux/slices/conversation";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const PinnedDialog = ({open, handleClose, chatId, onPin}) => {

    const authToken = useSelector((state) => state.auth.accessToken);
    const dispatch = useDispatch();
    const handlePinChat = async () => {
        try {
            await axios.patch(
                `http://localhost:8080/${chatId}/pin`,
                {},
                {headers: {Authorization: `Bearer ${authToken}`}}
            );

            if (onPin) onPin();
            handleClose();
            dispatch(SelectRoomId({room_id: null}));
            dispatch(SetCurrentConversation({room_id: null}));
            dispatch(ToggleSidebar());

        } catch (error) {
            console.error("Error pinning chat:", error);
        }
    };

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>Pin this chat</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Would you like to pin this chat?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handlePinChat}>Yes</Button>
            </DialogActions>
        </Dialog>
    );
};

const UnpinnedDialog = ({open, handleClose, chatId, onUnpin}) => {
    const authToken = useSelector((state) => state.auth.accessToken);
    const dispatch = useDispatch();
    const handleUnpinChat = async () => {
        try {
            await axios.patch(
                `http://localhost:8080/${chatId}/unpin`,
                {},
                {headers: {Authorization: `Bearer ${authToken}`}}
            );

            if (onUnpin) onUnpin();
            handleClose();
            dispatch(SelectRoomId({room_id: null}));
            dispatch(SetCurrentConversation({room_id: null}));
            dispatch(ToggleSidebar());
        } catch (error) {
            console.error("Error unpinning chat:", error);
        }
    };

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>Unpin this chat</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Would you like to unpin this chat?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleUnpinChat}>Yes</Button>
            </DialogActions>
        </Dialog>
    );
};

const RemoveMemberDialog = ({ open, onClose, onConfirm, user, chatId }) =>(
    <Dialog open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={onClose}
            aria-describedby="alert-dialog-slide-description">
        <DialogTitle>Confirmă eliminarea</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
                Sigur vrei să-l elimini pe <b>{user?.name}</b> din grup?
            </DialogContentText>
        </DialogContent>
            <DialogActions>
                <Button variant="outline" onClick={onClose}>Anulează</Button>
                <Button variant="destructive" onClick={() => onConfirm(user.id)}>Confirmă</Button>
                </DialogActions>

    </Dialog>
);

const DeleteChatDialog = ({open, handleClose, onDeleteSuccess}) => {
    const [loading, setLoading] = useState(false);
    const chatId = useSelector((state) => state.conversation.group_chat.current_group_conversation.id);
    const token = useSelector((state) => state.auth.accessToken);
    const {socket} = useWebSocket();
    const dispatch = useDispatch();
    const handleDeleteGroup = () => {
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
                    socket.emit("/app/groups", "Bearer " + token);
                    onDeleteSuccess();
                    dispatch(
                        showSnackbar({
                            severity: "success",
                            message: "Group deleted successfully!",
                        })
                    );
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
            <DialogTitle>Leaving this group</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Are you sure you want to leave this group?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleDeleteGroup} disabled={loading}>
                    {loading ? "Leaving..." : "Yes"}
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
           
            dispatch(ToggleSidebar());
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
    const isGroup = !!current_group_conversation;

    const isDesktop = useResponsive("up", "md");
    const [openDelete, setOpenDelete] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [openAddUser, setOpenAddUser] = useState(false);
    const [openPinned, setOpenPinned] = useState(false);
    const [openUnpinned, setOpenUnpinned] = useState(false);
    const [groupMembers, setGroupMembers] = useState([]);
    const token = useSelector((state) => state.auth.accessToken);

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

    const handleDeleteSuccess = () => {
        setOpenDelete(false);
        dispatch(SetCurrentGroup({room_id: null}));
        dispatch(SelectRoomId({room_id: null}));
        dispatch(ToggleSidebar());
    };

    const [selectedMember, setSelectedMember] = useState(null);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

    const handleOpenRemoveDialog = (user) => {
        setSelectedMember(user);
        setRemoveDialogOpen(true);
    };

    const handleRemoveMember = async (userId) => {
        try {
            await axios.delete(`/api/groups/${groupId}/members/${userId}`);
            setGroupMembers(prev => prev.filter(m => m.id !== userId));
        } catch (err) {
            console.error("Eroare la eliminarea membrului", err);
        } finally {
            setRemoveDialogOpen(false);
            setSelectedMember(null);
        }
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
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        spacing={2}
                                        key={user.id}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <CreateAvatar name={user.name} imageUrl={user.img} size={40} />
                                            <Typography variant="body2">{user.name}</Typography>
                                        </Stack>

                                        <Button onClick={() => handleOpenRemoveDialog(user)}>
                                            <X className="w-4 h-4 text-red-500 hover:text-red-700" />
                                        </Button>
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
                            Add
                        </Button>
                        <Button
                            onClick={() => setOpenDelete(true)}
                            startIcon={<SignOut/>}
                            variant="outlined"
                            sx={{width: "100%"}}
                        >
                            Leave
                        </Button>
                        <Button
                            onClick={() => {
                                if (conversation?.pinned) {
                                    setOpenUnpinned(true);
                                } else {
                                    setOpenPinned(true);
                                }
                            }}
                            startIcon={conversation?.pinned ? <PushPin/> : <PushPin/>}
                            variant="outlined"
                            sx={{width: "100%"}}
                        >
                            {conversation?.pinned ? 'Unpin' : 'Pin'}
                        </Button>
                    </Stack>

                </Stack>
            </Stack>
            {openDelete && <DeleteChatDialog open={openDelete} handleClose={() => setOpenDelete(false)}
                                             onDeleteSuccess={handleDeleteSuccess}/>}
            {<AddUserDialog open={openAddUser} handleClose={handleCloseAddUser} groupId={groupId}/>}
            {openPinned && (
                <PinnedDialog
                    open={openPinned}
                    handleClose={() => setOpenPinned(false)}
                    chatId={conversation?.id}
                    onPin={() => {
                        dispatch(UpdatePinnedStatus({id: conversation.id, pinned: true, isGroup}));
                    }}
                />
            )}
            {openUnpinned && (
                <UnpinnedDialog
                    open={openUnpinned}
                    handleClose={() => setOpenUnpinned(false)}
                    chatId={conversation?.id}
                    onUnpin={() => {
                        dispatch(UpdatePinnedStatus({id: conversation.id, pinned: false, isGroup}));
                    }}
                />
            )}
            <RemoveMemberDialog
                open={removeDialogOpen}
                onClose={() => setRemoveDialogOpen(false)}
                onConfirm={handleRemoveMember}
                member={selectedMember}
            />


        </Box>
    );
};

export default ContactGroup;