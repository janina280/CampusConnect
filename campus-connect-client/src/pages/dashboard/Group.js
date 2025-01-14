import React, { useState,useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { MagnifyingGlass, Plus } from "phosphor-react";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { SimpleBarStyle } from "../../components/Scrollbar";
import { ChatList } from "../../data";
import ChatElement from "../../components/ChatElement";
import CreateGroup from "../../sections/main/CreateGroup";

const Group = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
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
          <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
            <Stack>
              <Typography variant="h5">Groups</Typography>
            </Stack>
            <Stack sx={{ width: "100%" }}>
              <Search>
                <SearchIconWrapper>
                  <MagnifyingGlass color="#709CE6" />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search"
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
            </Stack>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant="subtitle2" component={Link}>
                Create New Group
              </Typography>
              <IconButton onClick={() => setOpenDialog(true)}>
                <Plus
                  style={{ color: (theme) => theme.palette.primary.main }}
                />
              </IconButton>
            </Stack>
            <Divider />
            <Stack
              spacing={3}
              sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}
            >
              <SimpleBarStyle timeout={500} clickOnTrack={false}>
                <Stack spacing={2.5}>
                  {/* Pinned Groups */}
                  <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                    Pinned
                  </Typography>
                  {ChatList.filter((el) => el.pinned).map((el) => {
                    return <ChatElement {...el} />;
                  })}
                  {/* All Groups */}
                  <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                    All Groups
                  </Typography>
                  {ChatList.filter((el) => !el.pinned).map((el) => {
                    return <ChatElement {...el} />;
                  })}
                </Stack>
              </SimpleBarStyle>
            </Stack>
          </Stack>
        </Box>
        {/* Right - Middle Text */}
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
              Create a Group to Start Collaborating!
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              You can create a new group to connect with your friends, collaborate on projects, or organize study sessions.
            </Typography>
            <IconButton>
              <Plus size={32} />
            </IconButton>
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
      {openDialog && <CreateGroup open={openDialog} handleClose={handleCloseDialog} />}
    </>
  );
};

export default Group;
