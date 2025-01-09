import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, CircularProgress } from "@mui/material";

const LoadingScreen = () => {
  const theme = useTheme();
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#f8faff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          fontSize: "36px",  
          color: theme.palette.primary.main,  
          fontWeight: "bold",  
          marginBottom: "20px",
        }}
      >
        Loading{dots}
      </Box>
      <CircularProgress
        sx={{
          color: theme.palette.primary.main,  
        }}
      />

      <Box
        sx={{
          fontSize: "18px",
          marginTop: "20px",
          color: theme.palette.text.secondary,
        }}
      >
        Please wait while the app is loading.
      </Box>
    </Box>
  );
};

export default LoadingScreen;
