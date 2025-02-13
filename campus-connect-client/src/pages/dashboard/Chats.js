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
  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentUser = useCurrentUserFromToken();
  const [queries, setQueries] = useState(null);

  const token = useSelector((state) => state.auth.accessToken);

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
        setChats(data);
      } else {
        console.error("Search failed, status:", response.status);
        setChats([]);
      }
    } catch (error) {
      console.error("Error performing search:", error);
      setChats([]);
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
          setChat(data);
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
                  setChats([]);
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
            overflowY: "scroll",
            height: "100%",
          }}
        >
          {loading ? (
            <Typography variant="body2">Loading chats...</Typography>
          ) : (
            <SimpleBarStyle timeout={500} clickOnTrack={false}>
              {/* Rezultatele căutării */}
              {queries?.trim() ? (
                <Stack spacing={2.4}>
                  <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                    Search Results
                  </Typography>
                  {chats.length > 0 ? (
                    chats
                      .filter(
                        (chat) => chat.name
                      )
                      .map((chat) => <ChatElement {...chat} />)
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
                    {chat
                      .filter((chat) => chat.pinned)
                      .map((chat) => {
                        return <ChatElement {...chat} />;
                      })}
                  </Stack>
                  <Stack spacing={2.4}>
                    <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                      All Chats
                    </Typography>
                    {chat
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
                            {...chat}
                            name={
                              chat.name ??
                              [...chat.users].filter(
                                (user) => user.id.toString() !== currentUser.sub
                              )[0].name
                            }
                            lastMessage={lastMessage}
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
    </Box>
  );
};

export default Chats;
