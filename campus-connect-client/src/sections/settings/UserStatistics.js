import React, {useEffect, useState} from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {useSelector} from "react-redux";
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import axios from "../../utils/axios";

const UserStatistics = ({open, handleClose}) => {
    const token = useSelector((state) => state.auth.accessToken);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (open) {
            axios
                .get("api/user/stats/messages", {
                    headers: {Authorization: `Bearer ${token}`}
                })
                .then((res) => setUsers(res.data))
                .catch((err) => console.error(err));
        }
    }, [open, token]);

    const chartData = users.map((user) => ({
        name: user.name,
        messages: user.messageCount
    }));


    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: "50vw",
                    height: "65vh",
                    p: 4,
                    overflow: "hidden"
                }
            }}
        >
            <DialogTitle>User Statistics</DialogTitle>
            <DialogContent sx={{maxHeight: "calc(80vh)", overflow: "auto"}}>
                {users.length === 0 ? (
                    <Typography>No data available.</Typography>
                ) : (
                    <>
                        <Typography variant="h6" mb={2}>📊 Messages per User</Typography>
                        <Box sx={{width: "100%", height: 400}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{left: 40}}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis type="number" allowDecimals={false}/>
                                    <YAxis dataKey="name" type="category" width={150}/>
                                    <Tooltip/>
                                    <Bar dataKey="messages" fill="#4caf50"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleClose}>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserStatistics;
