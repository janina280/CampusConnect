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
  AddDirectConversation, FetchDirectConversations
} from "../../redux/slices/conversation";
import { useTheme } from "@mui/material/styles";
import useResponsive from "../../hooks/useResponsive";
import { searchUser } from "../../redux/slices/auth";
import { useCurrentUserFromToken } from "../../sections/auth/CurrentUserFromToken";
import socket from "../../socket";

const Chats = () => {
  const theme = useTheme();
  const [existingChats, setExistingChats] = useState([]);
  const [snackbarSeverity, setSnackbarSeverity] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(null);
  const token = useSelector((state) => state.auth.accessToken);
   const { open } = useSelector((store) => store.app.sideBar);
  const isDesktop = useResponsive("up", "md");
  const currentUser = useCurrentUserFromToken();
  const dispatch = useDispatch();
  const conversations = useSelector((state) => state.conversation.direct_chat.conversations) || [];
  const user_id = window.localStorage.getItem("user_id");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const availableChats = useSelector((state) => state.auth.availableChats);

  const handleSearch = (value) => {
    setQuery(value);
  
    if (value.trim() === "") {
      return;
    }
    dispatch(searchUser({ keyword: value }));
  };


  const handleCreateChat = (userId) => {
    // Verifică dacă există deja un chat cu acest utilizator
    const chatExists = conversations.some((chat) => chat.user_id === userId);
  
    if (chatExists) {
      setSnackbarMessage("Chat already exists with this user");
      setSnackbarOpen(true);
      return;
    }
  
    dispatch(AddDirectConversation(userId))
      .then((newChat) => {
        if (newChat) {
          setSnackbarMessage("The chat was created successfully!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage("Error creating chat.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      })
      .catch((error) => {
        setSnackbarMessage("Error creating chat.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };
  
  useEffect(() => {
    socket.emit("/app/chats", "Bearer " + token)

    socket.on("/chat/chats-response",(data) =>{
      dispatch(FetchDirectConversations(data));
    })

    /*if (token) {
      dispatch(FetchDirectConversations());
    }*/
  }, [socket.isConnected]);
  

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
              onChange={(e) => handleSearch(e.target.value)}
              value={query}
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
              {query?.trim() ? (
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
                    {conversations
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
                      .filter((chat) => !chat.pinned && !chat.group)
                      .map((chat) => {
                        const lastMessage =
                          chat.messages?.length > 0
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
