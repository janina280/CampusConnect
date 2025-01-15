import { Box, IconButton, Stack, Typography } from "@mui/material";
import { CaretLeft } from "phosphor-react";
import React from "react";
import ProfileForm from "../../sections/settings/ProfileForm";
import message from "../../assets/Images/message.png";
import { useTheme } from "@mui/material/styles";

const Profile = () => {
  const theme = useTheme();
  return (
    <Stack direction="row" sx={{ width: "100%" }}>
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
              <CaretLeft size={24} color="#4B4B4B" />
            </IconButton>
            <Typography variant="h5">Profile</Typography>
          </Stack>
          {/* Profile Form */}
          <ProfileForm />
        </Stack>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 1,
          backgroundImage: `url(${message})`,
          backgroundSize: "82%",
          backgroundPosition: "center 20%",
          backgroundColor: theme.palette.mode === "light" ? "#FFF" : "#121212",
        }}
      ></Box>
    </Stack>
  );
};

export default Profile;
