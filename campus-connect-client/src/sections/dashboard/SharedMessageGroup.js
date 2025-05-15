import React, {useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {Box, Grid, IconButton, Stack, Tab, Tabs, Typography,} from "@mui/material";
import {ArrowLeft} from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import {useDispatch, useSelector} from "react-redux";
import {UpdateSidebarType} from "../../redux/slices/app";
import {DocMsg, LinkMsg, MediaMsg} from "./Conversation";
import axios from "../../utils/axios";

const MediaGroup = () => {
    const dispatch = useDispatch();

    const theme = useTheme();

    const isDesktop = useResponsive("up", "md");

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [sharedMessages, setSharedMessages] = useState([]);
    const {room_id} = useSelector((state) => state.app);
    const token = useSelector((state) => state.auth.accessToken);
    useEffect(() => {
        const fetchSharedMessages = async () => {
            try {
                const res = await axios.get(`/api/message/${room_id}/shared`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("Shared messages response:", res.data);
                setSharedMessages(res.data);
            } catch (err) {
                console.error("Eroare la fetch shared messages", err);
            }
        };

        fetchSharedMessages();
    }, [room_id]);

    const mediaMessages = sharedMessages.filter(msg => msg.type === "image");
    const linkMessages = sharedMessages.filter(msg => msg.type === "link");
    const docMessages = sharedMessages.filter(msg => msg.type === "document");

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
                        spacing={3}
                    >
                        <IconButton
                            onClick={() => {
                                dispatch(UpdateSidebarType("CONTACT"));
                            }}
                        >
                            <ArrowLeft/>
                        </IconButton>
                        <Typography variant="subtitle2">Shared</Typography>
                    </Stack>
                </Box>

                <Tabs value={value} onChange={handleChange} centered>
                    <Tab label="Media"/>
                    <Tab label="Links"/>
                    <Tab label="Docs"/>
                </Tabs>
                <Stack
                    sx={{
                        height: "100%",
                        position: "relative",
                        flexGrow: 1,
                        overflow: "scroll",
                    }}
                    spacing={3}
                    padding={value === 1 ? 1 : 3}
                >
                    {(() => {
                        switch (value) {
                            case 0:
                                return (
                                    <Grid container spacing={2}>
                                        {mediaMessages.map((msg) => (
                                            <Grid item xs={12} key={msg.id}>
                                                <MediaMsg el={msg}/>
                                            </Grid>
                                        ))}
                                    </Grid>

                                );
                            case 1:
                                return linkMessages.map((msg) => <LinkMsg el={msg}/>);

                            case 2:
                                return docMessages.map((msg) => <DocMsg el={msg}/>);

                            default:
                                break;
                        }
                    })()}
                </Stack>
            </Stack>
        </Box>
    );
};

export default MediaGroup;