import React from "react";
import { useTheme } from "@mui/material/styles"; // Correct useTheme import
import { Box, Stack } from "@mui/material";

const Group = () => {
  const theme = useTheme();

  return (
    <>
      <Stack direction="row" sx={{ width: "100%" }}>
        {/* Left */}
        <Box
          sx={{
            height: "100vh",
            backgroundColor: theme.palette.mode === "light" 
              ? "#F8FAFF" 
              : theme.palette.background.default, 
          }}
        >
          {/* Add content here */}
        </Box>
        {/* Right */}
        <Box sx={{ flex: 1, backgroundColor: theme.palette.background.paper }}>
          {/* Right content */}
        </Box>
      </Stack>
    </>
  );
};

export default Group;
