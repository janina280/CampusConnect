import { Box, Stack, Typography } from "@mui/material";
import React from "react";

const Profile = () => {
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
        <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
          <Stack>
            <Typography  variant="h5">Profile</Typography>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

export default Profile;
