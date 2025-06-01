import {Box, IconButton, Stack, Typography} from "@mui/material";
import {CaretLeft} from "phosphor-react";
import React from "react";
import ProfileForm from "../../sections/settings/ProfileForm";
import NoChatSVG from "../../assets/Illustration/NoChat";
import {useTheme} from "@mui/material/styles";
import {useSelector} from "react-redux";

const Profile = () => {
    const theme = useTheme();
    const {open, type} = useSelector((store) => store.app.sideBar);
    return (
        <Stack direction="row" sx={{width: "100%"}}>
            {/* Left */}
            <Box
                sx={{
                    height: "100vh",
                    backgroundColor: (theme) =>
                        theme.palette.mode === "light"
                            ? "#F8FAFF"
                            : theme.palette.background.default,
                    width: 320,
                    boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
                }}
            >
                {/* Add content here */}
                <Stack p={4} spacing={5}>
                    <Stack direction={"row"} alignItems={"center"} spacing={3}>
                        <IconButton onClick={() => window.history.back()}>
                            <CaretLeft size={24} color="#4B4B4B"/>
                        </IconButton>
                        <Typography variant="h5">Profile</Typography>
                    </Stack>
                    {/* Profile Form */}
                    <ProfileForm/>
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
                <Stack
                    spacing={2}
                    sx={{height: "100%", width: "100%"}}
                    alignItems={"center"}
                    justifyContent={"center"}
                >
                    <NoChatSVG/>
                    <Typography variant="subtitle2">
                        Your profile is your digital identity. Customize it to stand out!
                    </Typography>
                </Stack>
            </Box>
        </Stack>
    );
};

export default Profile;
