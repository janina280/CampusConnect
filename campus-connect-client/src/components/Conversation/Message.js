import React from "react";
import { Box, Stack } from "@mui/material";
import { DocMsg, LinkMsg, MediaMsg, ReplayMsg, TextMsg, Timeline } from "./MsgTypes";
import { Chat_History } from "../../data";

const Message = ({menu}) => {
  return (
    <Box p={3}>
      <Stack spacing={3}>
        {Chat_History.map((el) => {
          switch (el.type) {
            case "divider":
              return <Timeline el={el} menu={menu} />;

            case "msg":
              switch (el.subtype) {
                case "img":
                  //img msg
                  return <MediaMsg el={el} menu={menu} />;
                case "doc":
                  //doc asg
                  return <DocMsg el={el} menu={menu}/>
                case "link":
                  //link msg
                  return <LinkMsg el={el} menu={menu}/>
                case "reply":
                  //replay msg
                  return <ReplayMsg el={el} menu={menu} />;
                default:
                  return <TextMsg el={el} menu={menu} />;
              }
              
            default:
              return <></>;
          }
        })}
      </Stack>
    </Box>
  );
};

export default Message;
