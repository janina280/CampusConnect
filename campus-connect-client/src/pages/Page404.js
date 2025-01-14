import React, { useEffect, useState } from "react";
import { Box, IconButton, Typography, Stack, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { XCircle } from "phosphor-react";
import { useNavigate } from "react-router-dom";

const Page404 = () => {
  const theme = useTheme();
  const [bubbles, setBubbles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 80 + 10,
          size: Math.random() * 30 + 20,
          duration: Math.random() * 3 + 2,
        },
      ]);

      setBubbles((prev) => prev.filter((bubble) => Date.now() - bubble.id < 5000));
    }, 700);

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
      <IconButton
        sx={{
          backgroundColor: theme.palette.error.main,
          color: "#fff",
          width: 100,
          height: 100,
          mb: 4,
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
        }}
      >
        <XCircle size={60} />
      </IconButton>

      <Stack spacing={2} textAlign="center">
        <Typography variant="h4" fontWeight="bold">
          Oops! Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The page you're looking for does not exist. You might have typed the URL incorrectly or the page may have been removed.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} mt={4}>
        <Button
          variant="contained"
          color="primary"
          sx={{ px: 4, py: 1.5 }}
          onClick={() => navigate("/app")} 
        >
          Go Home
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ px: 4, py: 1.5 }}
          onClick={() => navigate("/auth/login")} 
        >
          Login
        </Button>
      </Stack>

      {/* Bule care plutesc în sus */}
      {bubbles.map((bubble) => (
        <Box
          key={bubble.id}
          sx={{
            position: "absolute",
            bottom: 0,
            left: `${bubble.left}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            backgroundColor: theme.palette.primary.main,
            borderRadius: "50%",
            animation: `bubbleUp ${bubble.duration}s ease-in-out`,
            opacity: 0.7,
          }}
        />
      ))}

      <style>
        {`
          @keyframes bubbleUp {
            from {
              transform: translateY(0);
              opacity: 0.7;
            }
            to {
              transform: translateY(-50vh);
              opacity: 0;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Page404;