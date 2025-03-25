import React, { useState, useEffect } from "react";
import { Stack, Box, IconButton, Typography, Divider } from "@mui/material";
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
import Shortcuts from "../../sections/settings/Shortcuts";
import NoChatSVG from "../../assets/Illustration/NoChat";
import CreateAvatar from "../../utils/createAvatar";
import RequestAccountInfo from "../../sections/settings/RequestAccountInfo";
import ChatWallpaper from "../../sections/settings/ChatWallpaper";
import Privacy from "../../sections/settings/Privacy";
import {useDispatch, useSelector} from "react-redux";
import {FetchUserProfile} from "../../redux/slices/app";

function Settings() {
  const theme = useTheme();

  const [openShortcuts, setOpenShortcuts] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openRequestInfo, setOpenRequestInfo] = useState(false);
  const [openChatWallpaper, setOpenChatWallpaper] = useState(false);
  const { open } = useSelector((store) => store.app.sideBar);
  const dispatch = useDispatch();

  const handleOpenPrivacy = () => {
    setOpenPrivacy(true);
  };

  const handleClosePrivacy = () => {
    setOpenPrivacy(false);
  };
  const handleOpenChatWallpaper = () => {
    setOpenChatWallpaper(true);
  };

  const handleCloseChatWallpaper = () => {
    setOpenChatWallpaper(false);
  };

  const handleOpenShortcuts = () => {
    setOpenShortcuts(true);
  };
  const handleCloseShortcuts = () => {
    setOpenShortcuts(false);
  };

  const handleOpenRequestInfo = () => {
    setOpenRequestInfo(true);
  };

  const handleCloseRequestInfo = () => {
    setOpenRequestInfo(false);
  };

  const { user} = useSelector((state) => state.app);

  const token = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    dispatch(FetchUserProfile())
  }, [token]);

  const list = [
    {
      key: 0,
      icon: <Bell size={20} />,
      title: "Notification",
      onclick: () => {},
    },
    {
      key: 1,
      icon: <Lock size={20} />,
      title: "Privacy",
      onclick: handleOpenPrivacy,
    },
    { key: 2, icon: <Key size={20} />, title: "Security", onclick: () => {} },
    {
      key: 3,
      icon: <Image size={20} />,
      title: "Chat Wallpaper",
      onclick: handleOpenChatWallpaper,
    },
    {
      key: 4,
      icon: <Note size={20} />,
      title: "Request Account Info",
      onclick: handleOpenRequestInfo,
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
      onclick: () => {},
    },
  ];

  return (
    <>
      <Stack direction={"row"} sx={{ width: "100%" }}>
        {/* LeftPanel */}
        <Box
          sx={{
            overflowY: "auto",
            height: "100vh",
            width: 320,
            backgroundColor:
              theme.palette.mode === "light"
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
                name={user.name}
                imageUrl={user.imageUrl}
                size={56}
              />
              <Stack spacing={0.5}>
                <Typography variant="article">{user.name}</Typography>
                <Typography variant="body2">{user.about}</Typography>
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
            height: "100%",
            width: open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
            backgroundColor:
              theme.palette.mode === "light" ? "#F0F4FA" : "transparent",
          }}
        >
          <Stack
            spacing={2}
            sx={{ height: "100%", width: "100%" }}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <NoChatSVG />
            <Typography variant="subtitle2">Customize your experience. Adjust your settings below.</Typography>
          </Stack>
        </Box>
      </Stack>
      {openShortcuts && (
        <Shortcuts open={openShortcuts} handleClose={handleCloseShortcuts} />
      )}
      {openRequestInfo && (
        <RequestAccountInfo
          open={openRequestInfo}
          handleClose={handleCloseRequestInfo}
        />
      )}
      {openChatWallpaper && (
        <ChatWallpaper
          open={openChatWallpaper}
          handleClose={handleCloseChatWallpaper}
        />
      )}
      {openPrivacy && (
        <Privacy open={openPrivacy} handleClose={handleClosePrivacy} />
      )}
    </>
  );
}

export default Settings;
