import React, {useEffect, useState} from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography} from "@mui/material";
import {useSelector} from "react-redux";
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import axios from "../../utils/axios";

const Statistics = ({open, handleClose}) => {
    const token = useSelector((state) => state.auth.accessToken);
    const [groups, setGroups] = useState([]);
    useEffect(() => {
        if (open) {
            axios.get(`admin/groups`, {
                headers: {Authorization: `Bearer ${token}`},
            })
                .then(res => setGroups(res.data))
                .catch(err => console.error(err));
        }
    }, [open, token]);

    const chartData = groups.map(group => ({
        name: group.name,
        messages: group.messages.length,
    }));

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            keepMounted
            fullWidth
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: "70vw",
                    height: "80vh",
                    p: 4,
                    overflow: "hidden"
                }
            }}
        >
            <DialogTitle>Group Statistics</DialogTitle>
            <DialogContent sx={{
                maxHeight: "calc(80vh)",
            }}>
                {groups.length === 0 ? (
                    <Typography>No groups found.</Typography>
                ) : (
                    <>
                        <Typography variant="h6" mb={2}>📊 Messages per Group</Typography>
                        <Box sx={{width: "100%", height: 600}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{left: 40}}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis type="number" allowDecimals={false}/>
                                    <YAxis dataKey="name" type="category" width={150}/>
                                    <Tooltip/>
                                    <Bar dataKey="messages" fill="#1976d2"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>

                        <Typography variant="h6" mt={4} mb={2}>📋 Group Details</Typography>

                        <Box sx={{maxHeight: 300, overflowY: "auto"}}>
                            <Grid container spacing={2}>
                                {groups.map(group => (
                                    <Grid item xs={12} sm={6} key={group.id}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                border: "1px solid #e0e0e0",
                                                borderRadius: 2,
                                                backgroundColor: "#f9f9f9",
                                            }}
                                        >
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {group.name}
                                            </Typography>
                                            <Typography variant="body2">👤 Creator: {group.createdBy.name}</Typography>
                                            <Typography variant="body2">💬 Messages: {group.messages.length}</Typography>
                                            <Typography variant="body2">👥 Members: {group.users.length}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
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

export default Statistics;
