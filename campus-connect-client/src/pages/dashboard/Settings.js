import React, { useState, useEffect } from "react";
import {
  Stack,
  Box,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Bell,
  CaretLeft,
  Image,
  Info,
  Key,
  Keyboard,
  Lock,
  Note,
} from "phosphor-react";
import { useNavigate } from "react-router-dom";
import Shortcuts from "../../sections/settings/Shortcuts";
import CreateAvatar from "../../utils/createAvatar";

function Settings() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [openShortcuts, setOpenShortcuts] = useState(false);
  const handleOpenShortcuts = () => {
    setOpenShortcuts(true);
  };
  const handleCloseShortcuts = () => {
    setOpenShortcuts(false);
  };

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    imageUrl: "",
    about: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://localhost:8080/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            name: data.name || "N/A",
            email: data.email || "N/A",
            imageUrl: data.imageUrl || "", 
            about: data.about || "", 
          });
        } else {
          console.error("Failed to load profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };

    fetchProfileData();
  }, []);

  const list = [
    {
      key: 0,
      icon: <Bell size={20} />,
      title: "Notification",
      onclick: () => { },
    },
    {
      key: 1,
      icon: <Lock size={20} />,
      title: "Privacy",
      onclick: () => { },
    },
    { key: 2, icon: <Key size={20} />, title: "Security", onclick: () => { } },
    {
      key: 3,
      icon: <Image size={20} />,
      title: "Chat Wallpaper",
      onclick: () => { },
    },
    {
      key: 4,
      icon: <Note size={20} />,
      title: "Request Account Info",
      onclick: () => { },
    },
    {
      key: 5,
      icon: <Keyboard size={20} />,
      title: "Keyboard Shortcuts",
      onclick: handleOpenShortcuts,
    },
    {
      key: 6,
      icon: <Info size={20} />,
      title: "Help",
      onclick: () => { },
    },
  ];

  const [bubbles, setBubbles] = useState([]);


  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 100 + 10, 
          size: Math.random() * 30 + 20, 
          duration: Math.random() * 3 + 2, 
        },
      ]);

      setBubbles((prev) => prev.filter((bubble) => Date.now() - bubble.id < 5000));
    }, 700); 

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Stack direction={"row"} sx={{ width: "100%" }}>
        {/* LeftPanel */}
        <Box
          sx={{
            overflowY: "scroll",
            height: "100vh",
            width: 320,
            backgroundColor: theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,
            boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
          }}
        >
          <Stack p={4} spacing={5}>
            {/* Header */}
            <Stack direction={"row"} alignItems={"center"} spacing={3}>
              <IconButton onClick={() => window.history.back()}>
                <CaretLeft size={24} color="#4B4B4B" />
              </IconButton>
              <Typography variant="h6">Settings</Typography>
            </Stack>
            {/* Profile */}
            <Stack direction={"row"} spacing={3}>
              <CreateAvatar
                name={userData.name}
                imageUrl={userData.imageUrl} 
                size={56} 
              />
              <Stack spacing={0.5}>
                <Typography variant="article">{userData.name}</Typography>
                <Typography variant="body2">{userData.about}</Typography>
              </Stack>
            </Stack>
            {/* List of options */}
            <Stack spacing={4}>
              {list.map(({ key, icon, title, onclick }) => (
                <React.Fragment key={key}>
                  <Stack
                    sx={{ cursor: "pointer" }}
                    spacing={2}
                    onClick={onclick}
                  >
                    <Stack direction={"row"} spacing={2} alignItems={"center"}>
                      {icon}

                      <Typography variant="body2">{title}</Typography>
                    </Stack>
                    {key !== 6 && <Divider />}
                  </Stack>
                </React.Fragment>
              ))}
            </Stack>
          </Stack>
        </Box>
        {/* RightPanel */}
        <Box
          sx={{
            flexGrow: 1,
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: 4,
            backgroundColor: theme.palette.mode === "light" ? "#FFF" : "#121212",
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Settings
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            You can customize your preferences, adjust notifications, and configure account options for a better experience. 
            </Typography>
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
           
          </Stack>
        </Box>
      </Stack>
      {openShortcuts && (
        <Shortcuts open={openShortcuts} handleClose={handleCloseShortcuts} />
      )}
    </>
  );
}

export default Settings;
