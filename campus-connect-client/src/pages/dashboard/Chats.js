import React, {useEffect, useState} from "react";
import {Alert, Box, Button, Divider, IconButton, Snackbar, Stack, Typography,} from "@mui/material";
import {ArchiveBox, CircleDashed, MagnifyingGlass} from "phosphor-react";
import {SimpleBarStyle} from "../../components/Scrollbar";
import BottomNav from "../../layouts/dashboard/BottomNav";
import {Search, SearchIconWrapper, StyledInputBase,} from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import {useDispatch, useSelector} from "react-redux";
import {AddDirectConversation, FetchDirectConversations} from "../../redux/slices/conversation";
import {useTheme} from "@mui/material/styles";
import useResponsive from "../../hooks/useResponsive";
import {searchUser} from "../../redux/slices/auth";
import {useWebSocket} from "../../contexts/WebSocketContext";

const Chats = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
   const { open } = useSelector((store) => store.app.sideBar);
  const isDesktop = useResponsive("up", "md");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const {isConnected, socket} = useWebSocket();

  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);

  const [queryChat, setQueryChat] = useState(null);
  const {conversations} = useSelector((state) => state.conversation.direct_chat);

  const users = useSelector((state) => state.auth.availableChats);

  useEffect(() => {

    if (!isConnected) return;

    socket.emit("/app/chats", "Bearer " + token)

    socket.on("/chat/chats-response", (data) => {
      dispatch(FetchDirectConversations(data));
    });
  }, [isConnected]);

  //todo: check if it still needed
  const handleSearch = (value) => {
    setQueryChat(value);
    if (value.trim() === "") {
      return;
    }
    dispatch(searchUser({ keyword: value }));
  };

  //todo: later
  const handleCreateChat = (userId) => {
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
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage("Error creating chat.");
          setSnackbarOpen(true);
        }
      })
      .catch((error) => {
        setSnackbarMessage("Error creating chat.");
        setSnackbarOpen(true);
      });
  };

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
              value={queryChat}
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
              {queryChat?.trim() ? (
                <Stack spacing={2.4}>
                  <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                    Search Results
                  </Typography>
                  {users.length > 0 ? (
                    users
                      .filter((user) => user.name)
                      .map((chat) => (
                          //todo: display users
                          //<UserElement onClick() -> below todo></UserElement>
                          //todo: when user is clicked check if the chat exists
                          // if true -> show ChatElement
                        <ChatElement
                          key={chat.id}
                          {...chat}
                          handleCreateChat={() => handleCreateChat(chat.id)}
                          showMessageIcon={true}
                          existingChat={false}
                        />
                          //if false -> create new chat and show ChatElement
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
                      .filter((chat) => chat.pinned && !chat.group)
                      .map((chat) => {
                        return (
                          <ChatElement
                            {...chat}
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
                        return (
                          <ChatElement
                              {...chat}
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
