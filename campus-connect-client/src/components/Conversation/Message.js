import React from "react";
import { Box, Stack } from "@mui/material";
import { DocMsg, LinkMsg, MediaMsg, ReplayMsg, TextMsg, Timeline } from "./MsgTypes";
import { Chat_History } from "../../data";

const Message = () => {
  return (
    <Box p={3}>
      <Stack spacing={3}>
        {Chat_History.map((el) => {
          switch (el.type) {
            case "divider":
              return <Timeline el={el} />;

            case "msg":
              switch (el.subtype) {
                case "img":
                  //img msg
                  return <MediaMsg el={el} />;
                case "doc":
                  //doc asg
                  return <DocMsg el={el}/>
                case "link":
                  //link msg
                  return <LinkMsg el={el}/>
                case "reply":
                  //replay msg
                  return <ReplayMsg el={el} />;
                default:
                  return <TextMsg el={el} />;
              }

              break;
            default:
              return <></>;
          }
        })}
      </Stack>
    </Box>
  );
};

export default Message;
