import {
  Stack,
  Box,
} from "@mui/material";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Conversation = () => {
  
  return (
    <Stack height={"100%"} maxHeight={"100vh"} width={"auto"}>
      {/*Chat Header*/}
      <Header/>

      {/*Message*/}
      <Box width={"100%"} sx={{ flexGrow: 1 }}></Box>

      {/*Chat footer*/}
      <Footer/>
    </Stack>
  );
};

export default Conversation;
