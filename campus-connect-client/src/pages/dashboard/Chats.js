import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  Button,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { ArchiveBox, CircleDashed, MagnifyingGlass } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import { useCurrentUserFromToken } from "../../sections/auth/CurrentUserFromToken";
import { useSelector } from "react-redux";

const Chats = () => {
  const theme = useTheme();
  const [availableChats, setAvailableChats] = useState([]);
  const [existingChats, setExistingChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentUser = useCurrentUserFromToken();
  const [queries, setQueries] = useState(null);
  const token = useSelector((state) => state.auth.accessToken);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSearch = async (query) => {
    if (!token) {
      console.error("Token is missing. Please log in.");
      return;
    }

    setLoading(true);
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `http://localhost:8080/api/user/${encodedQuery}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched chat data:", data);
        setAvailableChats(data);
      } else {
        console.error("Search failed, status:", response.status);
        setAvailableChats([]);
      }
    } catch (error) {
      console.error("Error performing search:", error);
      setAvailableChats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async (userId) => {
    if (!token) {
      console.error("Token is missing. Please log in.");
      return;
    }
  
    setLoading(true);
    try {
      const existingChat = existingChats.find(
        (chat) =>
          chat.users.length === 2 &&
          chat.users.some((user) => user.id === userId)
      );
  
      if (existingChat) {
        setExistingChats((prevChats) => {
          return prevChats.map((existing) =>
            existing.id === existingChat.id
              ? { ...existing, lastMessage: existingChat.lastMessage }
              : existing
          );
        });
        console.log("Chat already exists with this user");
        return;
      }
  
      const createChatResponse = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
  
      if (createChatResponse.ok) {
        const newChat = await createChatResponse.json();
        setExistingChats((prevChats) => [...prevChats, newChat]); 
        console.log("New chat created", newChat);
  
        setSnackbarMessage("Chat created successfully!");
        setSnackbarOpen(true);
      } else {
        console.error(
          "Failed to create chat, status:",
          createChatResponse.status
        );
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const fetchChat = async () => {
      if (!token || loading) {
        console.error("Token is missing. Please log in.");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8080/api/chat/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setExistingChats(data);
        } else {
          console.error("Failed to load chats, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [token]);

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
              onChange={(e) => {
                const searchTerm = e.target.value;
                setQueries(searchTerm);
                if (searchTerm.trim() !== "") {
                  handleSearch(searchTerm);
                } else {
                  setAvailableChats([]);
                }
              }}
              value={queries}
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
            overflowY: "auto",
            height: "100%",
          }}
        >
          {loading ? (
            <Typography variant="body2">Loading chats...</Typography>
          ) : (
            <SimpleBarStyle timeout={500}  autoHide={true}>
              {/* Rezultatele căutării */}
              {queries?.trim() ? (
                <Stack spacing={2.4}>
                  <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                    Search Results
                  </Typography>
                  {availableChats.length > 0 ? (
                    availableChats
                      .filter((chat) => chat.name)
                      .map((chat) => (
                        <ChatElement
                          key={chat.id}
                          {...chat}
                          handleCreateChat={() => handleCreateChat(chat.id)} 
                          showMessageIcon={true}
                          existingChat = {false}
                        />
                      ))
                  ) : (
                    <Typography variant="body2">No users found.</Typography>
                  )}
                </Stack>
              ) : (
                <>
                  <Stack spacing={2.4}>
                    <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                      Pinned
                    </Typography>
                    {existingChats
                      .filter((chat) => chat.pinned)
                      .map((chat) => {
                        return (
                          <ChatElement
                            key={chat.id}
                            {...chat}
                            handleCreateChat={() => handleCreateChat(chat.id)}
                            existingChat={true}
                          />
                        );
                      })}
                  </Stack>
                  <Stack spacing={2.4}>
                    <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                      All Chats
                    </Typography>
                    {existingChats
                      .filter((chat) => !chat.pinned && !chat.group)
                      .map((chat) => {
                        const lastMessage =
                          chat.messages.length > 0
                            ? [...chat.messages]
                                .sort(
                                  (a, b) =>
                                    new Date(a.createdAt) -
                                    new Date(b.createdAt)
                                )
                                .pop()
                            : null;

                        return (
                          <ChatElement
                            key={chat.id}
                            {...chat}
                            name={
                              chat.name ??
                              [...chat.users].filter(
                                (user) => user.id.toString() !== currentUser.sub
                              )[0].name
                            }
                            lastMessage={lastMessage}
                            existingChat={true}
                            noMessagesMessage={
                                "You can start messaging with..."
                            }
                            formattedTime={lastMessage?.formattedTime}
                          />
                        );
                      })}
                  </Stack>
                </>
              )}
            </SimpleBarStyle>
          )}
        </Stack>
      </Stack>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chats;
