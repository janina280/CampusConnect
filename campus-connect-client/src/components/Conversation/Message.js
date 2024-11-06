import React from "react";
import { Box, Stack } from "@mui/material";
import { TextMsg, Timeline } from "./MsgTypes";
import { Chat_History } from "../../data";

const Message=()=> {
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
                  break;
                case "doc":
                  //doc asg
                  break;
                case "link":
                  //link msg
                  break;
                case "replay":
                  //replay msg
                  break;
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
}

export default Message;
