import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Divider,
  IconButton,
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
import ChatElement from "../../components/ChatElement";
import CreateGroup from "../../sections/main/CreateGroup";
import { useSelector } from "react-redux";

const Group = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [query, setQuery] = useState("");
  const token = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8080/api/chat/groups", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
          setFilteredGroups(data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, [token]);

  const handleSearch = async (searchTerm) => {
    setQuery(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredGroups(groups);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/api/groups/search?name=${encodeURIComponent(
          searchTerm
        )}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setFilteredGroups(data);
      }
    } catch (error) {
      console.error("Error searching groups:", error);
    }
  };

  return (
    <>
      <Stack direction="row" sx={{ width: "100%" }}>
        <Box
          sx={{
            height: "100vh",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.default,
            width: 320,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
            <Typography variant="h5">Groups</Typography>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709CE6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search"
                inputProps={{ "aria-label": "search" }}
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </Search>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Create New Group</Typography>
              <IconButton onClick={() => setOpenDialog(true)}>
                <Plus style={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Stack>
            <Divider />
            <Stack spacing={3} sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}>
              <SimpleBarStyle timeout={500} clickOnTrack={false}>
                <Stack spacing={2.5}>
                  <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                    All Groups
                  </Typography>
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => <ChatElement key={group.id} {...group} />)
                  ) : (
                    <Typography variant="body2">No groups found.</Typography>
                  )}
                </Stack>
              </SimpleBarStyle>
            </Stack>
          </Stack>
        </Box>
      </Stack>
      {openDialog && <CreateGroup open={openDialog} handleClose={() => setOpenDialog(false)} />}
    </>
  );
};

export default Group;
