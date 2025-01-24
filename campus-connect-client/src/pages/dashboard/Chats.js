import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { ArchiveBox, CircleDashed, MagnifyingGlass } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";
import { Search, SearchIconWrapper, StyledInputBase } from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import { getCurrentUserFromToken } from "../../sections/auth/CurrentUserFromToken";

const Chats = () => {
  const theme = useTheme();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUserFromToken(); 

  console.log('test')
  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token is missing. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/api/chat", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setChats(data);
        } else {
          console.error("Failed to load chats, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        width: 320,
        backgroundColor:
          theme.palette.mode === "light" ? "#F8FAFF" : "transparent",
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack p={3} spacing={2} sx={{ height: "100vh" }}>
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Typography variant="h5">CampusConnect</Typography>
          <IconButton>
            <CircleDashed />
          </IconButton>
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
        <Stack spacing={1}>
          <Stack direction={"row"} alignItems={"center"} spacing={1.5}>
            <ArchiveBox size={24} />
            <Button> Archive</Button>
          </Stack>
          <Divider />
        </Stack>
        <Stack
          spacing={2}
          direction="column"
          sx={{
            flexGrow: 1,
            overflowY: "scroll",
            height: "100%",
          }}
        >
          {loading ? (
            <Typography variant="body2">Loading chats...</Typography>
          ) : (
            <SimpleBarStyle timeout={500} clickOnTrack={false}>
              <Stack spacing={2.4}>
                <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                  Pinned
                </Typography>
                {chats.filter((chat) => chat.pinned).map((chat) => (
                  <ChatElement key={chat.id} {...chat} currentUser={currentUser} />
                ))}
              </Stack>
              <Stack spacing={2.4}>
                <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                  All Chats
                </Typography>
                {chats.filter((chat) => !chat.pinned).map((chat) => (
                  <ChatElement key={chat.id} {...chat} currentUser={currentUser} />
                ))}
              </Stack>
            </SimpleBarStyle>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default Chats;
