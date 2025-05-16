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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import axios from "axios";
import {useSelector} from "react-redux";

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
            axios.get("http://localhost:8080/api/user/all", {
                headers: {Authorization: `Bearer ${token}`}
            })
                .then(res => setUsers(res.data))
                .catch(err => console.error(err));
        }
    }, [open, token]);

    const handleRoleChange = (userId, newRole) => {
        axios.put(`http://localhost:8080/api/user/${userId}/role`, {
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
                                        <TableCell>{user.name}</TableCell>
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
