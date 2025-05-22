import React, {useEffect, useState} from "react";
import {Box, Divider, IconButton, Stack, Typography} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {CaretLeft} from "phosphor-react";
import NoChatSVG from "../../assets/Illustration/NoChat";
import CreateAvatar from "../../utils/createAvatar";
import {useDispatch, useSelector} from "react-redux";
import {CloseSidebar, FetchUserProfile} from "../../redux/slices/app";
import Statistics from "../../sections/settings/Statistics";
import UserStatistics from "../../sections/settings/UserStatistics";
import {BASE_URL} from "../../config";
import UserRoleManagement from "../../sections/settings/RoleUsers";
import BarChartIcon from '@mui/icons-material/BarChart';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import {motion} from "framer-motion";
import {varHover} from "../../components/animate";

function Settings() {
  const theme = useTheme();

  const { open } = useSelector((store) => store.app.sideBar);
  const dispatch = useDispatch();
  const [openStatistics, setOpenStatistics] = useState(false);
  const [openStatisticsUser, setOpenStatisticsUser] = useState(false);
  const [openRole, setOpenRole] = useState(false);
  const {roles = []} = useSelector((state) => state.auth);
  const isAdmin = roles.includes("ROLE_ADMIN");
  const {user} = useSelector((state) => state.app);
  const token = useSelector((state) => state.auth.accessToken);

  const handleCloseStatistics = () => {
    setOpenStatistics(false);
  };
  const handleCloseStatisticsUser = () => {
    setOpenStatisticsUser(false);
  };
  const handleCloseRole = () => {
    setOpenRole(false);
  }

  useEffect(() => {
    dispatch(CloseSidebar());
    dispatch(FetchUserProfile())
  }, [token]);

  const list = [
    {
      key: 1,
      icon: <BarChartIcon size={20}/>,
      title: "Group Statistics",
      onclick: () => setOpenStatistics(true),
      show: isAdmin,
    },
    {
      key: 2,
      icon: <InsertChartIcon size={20}/>,
      title: "User Statistics",
      onclick: () => setOpenStatisticsUser(true),
      show: isAdmin,
    },
    {
      key: 3,
      icon: <ManageAccountsIcon size={20}/>,
      title: "Manage Roles",
      onclick: () => setOpenRole(true),
      show: isAdmin,
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
                imageUrl={`${BASE_URL}/${user.imageUrl}`}
                size={56}
              />
              <Stack spacing={0.5}>
                <Typography variant="article">{user.name}</Typography>
                <Typography variant="body2">{user.email}</Typography>
              </Stack>
            </Stack>
            {/* List of options */}
            <Stack spacing={4}>
              {list.map(({key, icon, title, onclick, show}) => (
                  show !== false && (
                      <motion.div variants={varHover(1.05)} whileHover="hover">
                      <React.Fragment key={key}>
                        <Stack
                            sx={{cursor: "pointer"}}
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
                      </motion.div>
                  )
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
            <Typography variant="body2"> You can view and manage your statistics and roles here.</Typography>
          </Stack>
        </Box>
      </Stack>
      {openStatistics && (
          <Statistics open={openStatistics} handleClose={handleCloseStatistics}/>
      )}
      {openStatisticsUser && (
          <UserStatistics open={openStatisticsUser} handleClose={handleCloseStatisticsUser}/>
      )}
      {openRole && (<UserRoleManagement open={openRole} handleClose={handleCloseRole}/>)}
    </>
  );
}

export default Settings;
