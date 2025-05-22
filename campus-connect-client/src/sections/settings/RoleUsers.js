import React, {useEffect, useState} from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {useSelector} from "react-redux";
import {dispatch} from "../../redux/store";
import {showSnackbar} from "../../redux/slices/app";
import CreateAvatar from "../../utils/createAvatar";
import {BASE_URL} from "../../config";
import axios from "../../utils/axios";

const roles = ["user", "admin", "tutor"];

const getUserRole = (user) => {
    if (user.roles && user.roles.length > 0) {
        const roleObj = user.roles[0];
        const roleStr = typeof roleObj === "string" ? roleObj : roleObj.name;
        return roleStr?.replace("ROLE_", "").toLowerCase() || "";
    }
    return "";
};

const UserRoleManagement = ({open, handleClose}) => {
    const token = useSelector((state) => state.auth.accessToken);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (open) {
            axios.get(`api/user/all`, {
                headers: {Authorization: `Bearer ${token}`}
            })
                .then(res => setUsers(res.data))
                .catch(err => console.error(err));
        }
    }, [open, token]);

    const handleRoleChange = (userId, newRole) => {
        axios.put(`api/user/${userId}/role`, {
            role: `ROLE_${newRole.toUpperCase()}`
        }, {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(() => {
                setUsers(prev =>
                    prev.map(u =>
                        u.id === userId ? {...u, roles: [{name: `ROLE_${newRole.toUpperCase()}`}]} : u
                    )
                );
                dispatch(showSnackbar({severity: "success", message: "Role updated"}));
            })
            .catch(err => console.error(err));
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>User Role Management</DialogTitle>
            <DialogContent>
                {users.length === 0 ? (
                    <Typography>No users found.</Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <CreateAvatar
                                                    name={user.name}
                                                    imageUrl={`${BASE_URL}/${user.imageUrl}`}
                                                    size={40}
                                                />
                                                <Typography>{user.name}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={getUserRole(user)}
                                                onChange={(e) =>
                                                    handleRoleChange(user.id, e.target.value)
                                                }
                                                fullWidth
                                            >
                                                {roles.map(role => (
                                                    <MenuItem key={role} value={role}>
                                                        {role}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserRoleManagement;
