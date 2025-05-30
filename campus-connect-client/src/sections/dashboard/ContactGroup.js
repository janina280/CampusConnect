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
import {CaretRight, Plus, PushPin, SignOut, Star, X} from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import {useDispatch, useSelector} from "react-redux";
import {FetchAllUsers, SelectRoomId, showSnackbar, ToggleSidebar, UpdateSidebarType} from "../../redux/slices/app";
import axios from "../../utils/axios";
import Snackbar from "@mui/material/Snackbar";
import {useWebSocket} from "../../contexts/WebSocketContext";
import {
    SetCurrentConversation,
    SetCurrentGroup,
    UpdateGroupImage,
    UpdatePinnedStatus
} from "../../redux/slices/conversation";
import {BASE_URL} from "../../config";
import Last3Images from "../../components/Last3Images";
import {varHover} from "../../components/animate";
import {motion} from "framer-motion";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const PinDialog = ({
                       open,
                       handleClose,
                       chatId,
                       onAction,
                       actionType = "pin",
                       title,
                       message,
                   }) => {
    const authToken = useSelector((state) => state.auth.accessToken);
    const dispatch = useDispatch();

    const handleAction = async () => {
        try {
            await axios.patch(
                `${chatId}/${actionType}`,
                {},
                {headers: {Authorization: `Bearer ${authToken}`}}
            );

            if (onAction) onAction();
            handleClose();
            dispatch(SelectRoomId({room_id: null}));
            dispatch(SetCurrentConversation({room_id: null}));
            dispatch(ToggleSidebar());
            dispatch(showSnackbar({severity: "success", message: `Group ${actionType}ed successfully!`}));
        }
        catch (error) {
            dispatch(showSnackbar({severity: "error", message: `Error during ${actionType} group:`}));
            console.error(`Error during ${actionType} group:`, error);
        }
    }

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleAction}>Yes</Button>
            </DialogActions>
        </Dialog>
    );
};

const RemoveMemberDialog = ({open, onClose, onConfirm, member}) => (
    <Dialog open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={onClose}
            aria-describedby="alert-dialog-slide-description">
        <DialogTitle>Remove member</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
                Are you sure you want to remove <b>{member?.name}</b> this group?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="destructive" onClick={() => onConfirm(member.id)}>Yes</Button>
        </DialogActions>

    </Dialog>
);

const LeaveChatDialog = ({open, handleClose, onLeaveSuccess}) => {
    const [loading, setLoading] = useState(false);
    const chatId = useSelector((state) => state.conversation.group_chat.current_group_conversation.id);
    const token = useSelector((state) => state.auth.accessToken);
    const {socket} = useWebSocket();
    const dispatch = useDispatch();
    const handleLeaveGroup = () => {
        setLoading(true);

        fetch(`${BASE_URL}/${chatId}`, {
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
                    onLeaveSuccess();
                }
            })
            .catch((error) => {
                console.error('Error leaving group:', error);
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
                <Button onClick={handleLeaveGroup} disabled={loading}>
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
        }
        catch (error) {
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
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 48 * 5.5,
                                    },
                                },
                            }}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    <Stack alignItems="center" direction="row" spacing={2}>
                                        <CreateAvatar
                                            name={user?.name}
                                            imageUrl={`${BASE_URL}/${user.imageUrl}`}
                                            size={36}
                                        />
                                        <Stack spacing={0.5}>
                                            <Typography variant="article" fontWeight={400}>
                                                {user?.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {user?.email}
                                            </Typography>
                                        </Stack>
                                    </Stack>
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
    const [openLeave, setOpenLeave] = useState(false);

    const [conversation, setConversation] = useState(null);

    const [openAddUser, setOpenAddUser] = useState(false);
    const [openPinned, setOpenPinned] = useState(false);
    const [openUnpinned, setOpenUnpinned] = useState(false);
    const [sharedMediaCount, setSharedMediaCount] = useState(0);

    const [groupMembers, setGroupMembers] = useState([]);

    const token = useSelector((state) => state.auth.accessToken);
    const {roles = []} = useSelector((state) => state.auth);

    const isAdmin = roles.includes("ROLE_ADMIN");
    const isTutor = roles.includes("ROLE_TUTOR");

    const adminOrTutor = isAdmin || isTutor;

    const handleCloseAddUser = () => {
        setOpenAddUser(false);
    };

    const fetchGroupMembers = () => {
        axios.get(`${groupId}/users`, {
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

    useEffect(() => {
        const fetchSharedMediaCount = async () => {
            try {
                const response = await axios.get(
                    `api/message/count-media/${current_group_conversation?.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setSharedMediaCount(response.data);
            }
            catch (error) {
                console.error("Error fetching media count:", error);
            }
        };
        if (current_group_conversation?.id) {
            fetchSharedMediaCount();
        }
    }, [current_group_conversation]);

    const handleLeaveSuccess = () => {
        setOpenLeave(false);
        dispatch(SetCurrentGroup({room_id: null}));
        dispatch(SelectRoomId({room_id: null}));
        dispatch(ToggleSidebar());
        dispatch(showSnackbar({severity: "success", message: "Group left successfully!"}));
    };

    const [selectedMember, setSelectedMember] = useState(null);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

    const handleOpenRemoveDialog = (user) => {
        setSelectedMember(user);
        setRemoveDialogOpen(true);
    };

    const handleRemoveMember = async (userId) => {
        try {
            await axios.put(`${groupId}/remove/${userId}`, {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            setGroupMembers(prev => prev.filter(m => m.id !== userId));
            dispatch(
                showSnackbar({
                    severity: "success",
                    message: "User removed successfully!",
                })
            );
        }
        catch (err) {
            console.error("Error to remove member", err);
        }
        finally {
            setRemoveDialogOpen(false);
            setSelectedMember(null);
        }
    };

    const handleGroupImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !current_group_conversation?.id) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await axios.put(
                `${current_group_conversation.id}/image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                });
            if (response.status === 200) {
                dispatch(UpdateGroupImage({
                    groupId: current_group_conversation.id,
                    imageUrl: response.data.img
                }));
                dispatch(
                    showSnackbar({
                        severity: "success",
                        message: "Image updated successfully!",
                    })
                );
            }
        }
        catch (error) {
            dispatch(
                showSnackbar({
                    severity: "error",
                    message: "Failed to update image.",
                })
            );
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
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{position: "relative", width: 56, height: 56}}>
                            <CreateAvatar
                                name={current_group_conversation?.name}
                                imageUrl={`${BASE_URL}/${current_group_conversation?.img}?${Date.now()}`}
                                size={56}
                            />
                            {adminOrTutor && (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="group-img-upload"
                                        style={{display: "none"}}
                                        onChange={handleGroupImageChange}
                                    />
                                    <label htmlFor="group-img-upload">
                                        <IconButton
                                            size="small"
                                            sx={{
                                                position: "absolute",
                                                bottom: 0,
                                                right: 0,
                                                backgroundColor: "white",
                                                boxShadow: 1,
                                            }}
                                            component="span"
                                        >
                                            <Plus size={16}/>
                                        </IconButton>
                                    </label>
                                </>
                            )}
                        </Box>
                        <Stack spacing={0.5}>
                            <Typography variant="article" fontWeight={600}>
                                {current_group_conversation?.name}
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
                            {sharedMediaCount}
                        </Button>
                    </Stack>
                    <Stack direction={"row"} alignItems="center" spacing={2}>
                        <Last3Images chatId={current_group_conversation?.id}/>
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
                                            <CreateAvatar name={user.name}
                                                          imageUrl={`${BASE_URL}/${user.imageUrl}`}
                                                          size={40}/>
                                            <Typography variant="body2">{user.name}</Typography>
                                        </Stack>
                                        {isAdmin && (
                                            <motion.div variants={varHover(1.05)} whileHover="hover">
                                                <Button onClick={() => handleOpenRemoveDialog(user)}>
                                                    <X className="w-4 h-4 text-red-500 hover:text-red-700"/>
                                                </Button>
                                            </motion.div>)}

                                    </Stack>
                                ))
                            ) : (
                                <Typography variant="body2">No members in the group yet.</Typography>
                            )}
                        </Stack>
                    </Stack>

                    <Divider/>

                    <Stack spacing={1} alignItems="center">
                        <Stack direction="row" spacing={1}>
                            {adminOrTutor && (
                                <motion.div variants={varHover(1.05)} whileHover="hover">
                                    <Button
                                        onClick={() => setOpenAddUser(true)}
                                        startIcon={<Plus/>}
                                        variant="outlined"
                                        sx={{minWidth: "120px"}}
                                    >
                                        Add
                                    </Button>
                                </motion.div>
                            )}
                            <motion.div variants={varHover(1.05)} whileHover="hover">
                                <Button
                                    onClick={() => setOpenLeave(true)}
                                    startIcon={<SignOut/>}
                                    variant="outlined"
                                    sx={{minWidth: "120px"}}
                                >
                                    Leave
                                </Button>
                            </motion.div>
                        </Stack>

                        {adminOrTutor && (
                            <motion.div variants={varHover(1.05)} whileHover="hover">
                                <Button
                                    onClick={() => {
                                        if (current_group_conversation?.pinned) {
                                            setOpenUnpinned(true);
                                        } else {
                                            setOpenPinned(true);
                                        }
                                    }}
                                    startIcon={current_group_conversation?.pinned ? <PushPin/> : <PushPin/>}
                                    variant="outlined"
                                    sx={{minWidth: "150px"}}
                                >
                                    {current_group_conversation?.pinned ? 'Unpin' : 'Pin'}
                                </Button>
                            </motion.div>
                        )}
                    </Stack>

                </Stack>
            </Stack>
            {openLeave && <LeaveChatDialog open={openLeave} handleClose={() => setOpenLeave(false)}
                                           onLeaveSuccess={handleLeaveSuccess}/>}
            {<AddUserDialog open={openAddUser} handleClose={handleCloseAddUser} groupId={groupId}/>}
            {(openPinned || openUnpinned) && (
                <PinDialog
                    open={openPinned || openUnpinned}
                    handleClose={() => {
                        if (openPinned) setOpenPinned(false);
                        if (openUnpinned) setOpenUnpinned(false);
                    }}
                    chatId={current_group_conversation?.id}
                    actionType={openPinned ? "pin" : "unpin"}
                    onAction={() => {
                        dispatch(UpdatePinnedStatus({
                            id: current_group_conversation.id,
                            pinned: openPinned,
                            isGroup: true
                        }));
                    }}
                    title={openPinned ? "Pin this group" : "Unpin this group"}
                    message={
                        openPinned
                            ? "Would you like to pin this group?"
                            : "Would you like to unpin this group?"
                    }
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