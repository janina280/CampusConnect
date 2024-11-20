import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Stack,
  Typography,
} from "@mui/material";
import {  MagnifyingGlass } from "phosphor-react";
import { Search, SearchIconWrapper, StyledInputBase } from "../../components/Search";

const Group = () => {
  const theme = useTheme();
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
          {/* Add content here */}
          <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
            <Stack>
              <Typography variant='h5'>Groups</Typography>
            </Stack>
            <Stack sx={{width:"100%"}}>
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
          </Stack>
        </Box>
        {/* Right */}
        <Box sx={{ flex: 1, backgroundColor: theme.palette.background.paper }}>
          {/* Right content */}
        </Box>
      </Stack>
    </>
  );
};

export default Group;
