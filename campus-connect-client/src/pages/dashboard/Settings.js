import React, {useEffect, useState} from "react";
import {Box, Divider, IconButton, Stack, Typography} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {CaretLeft, Info, Keyboard, Lock,} from "phosphor-react";
import Shortcuts from "../../sections/settings/Shortcuts";
import NoChatSVG from "../../assets/Illustration/NoChat";
import CreateAvatar from "../../utils/createAvatar";
import Privacy from "../../sections/settings/Privacy";
import {useDispatch, useSelector} from "react-redux";
import {FetchUserProfile} from "../../redux/slices/app";
import Statistics from "../../sections/settings/Statistics";

function Settings() {
  const theme = useTheme();

  const [openShortcuts, setOpenShortcuts] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const { open } = useSelector((store) => store.app.sideBar);
  const dispatch = useDispatch();
  const [openStatistics, setOpenStatistics] = useState(false);

  const handleCloseStatistics = () => {
    setOpenStatistics(false);
  };

  const handleOpenPrivacy = () => {
    setOpenPrivacy(true);
  };

  const handleClosePrivacy = () => {
    setOpenPrivacy(false);
  };

  const handleOpenShortcuts = () => {
    setOpenShortcuts(true);
  };
  const handleCloseShortcuts = () => {
    setOpenShortcuts(false);
  };

  const { user} = useSelector((state) => state.app);

  const token = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    dispatch(FetchUserProfile())
  }, [token]);

  const list = [
    {
      key: 1,
      icon: <Lock size={20} />,
      title: "Privacy",
      onclick: handleOpenPrivacy,
    },
    {
      key: 2,
      icon: <Keyboard size={20} />,
      title: "Keyboard Shortcuts",
      onclick: handleOpenShortcuts,
    },
    {
      key: 3,
      icon: <Info size={20} />,
      title: "Statistics",
      onclick: () => setOpenStatistics(true),
    }

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
                    {key !== 3 && <Divider/>}
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
      {openPrivacy && (
        <Privacy open={openPrivacy} handleClose={handleClosePrivacy} />
      )}
      {openStatistics && (
          <Statistics open={openStatistics} handleClose={handleCloseStatistics}/>
      )}

    </>
  );
}

export default Settings;
