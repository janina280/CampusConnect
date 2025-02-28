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
import { SimpleBarStyle } from "../../components/Scrollbar";
import BottomNav from "../../layouts/dashboard/BottomNav";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchDirectConversations
} from "../../redux/slices/conversation";
import { useTheme } from "@mui/material/styles";
import useResponsive from "../../hooks/useResponsive";

const Chats = () => {
  const theme = useTheme();
  const [availableChats, setAvailableChats] = useState([]);
  const [existingChats, setExistingChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState(null);
  const token = useSelector((state) => state.auth.accessToken);
  const isDesktop = useResponsive("up", "md");
  const dispatch = useDispatch();
  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const user_id = window.localStorage.getItem("user_id");
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
    //socket.emit("get_direct_conversations", { user_id }, (data) => {
    //  console.log(data); // this data is the list of conversations
      // dispatch action

      dispatch(FetchDirectConversations({ conversations: conversations }));
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width: isDesktop ? 320 : "100vw",
        backgroundColor:
          theme.palette.mode === "light" ? "#F8FAFF" : "transparent",
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      {!isDesktop && <BottomNav />}
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
            <SimpleBarStyle timeout={500} autoHide={true}>
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
                          existingChat={false}
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
                            existingChat={true}
                          />
                        );
                      })}
                  </Stack>
                  <Stack spacing={2.4}>
                    <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                      All Chats
                    </Typography>
                    {conversations
                      .filter((el) => !el.pinned)
                      .map((el, idx) => {
                        return <ChatElement {...el} />;
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
