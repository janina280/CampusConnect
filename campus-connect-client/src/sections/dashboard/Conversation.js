import React from "react";
import {Box, Divider, IconButton, Menu, MenuItem, Stack, Typography,} from "@mui/material";
import {alpha, useTheme} from "@mui/material/styles";
import {DotsThreeVertical, DownloadSimple, Image} from "phosphor-react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from '@mui/icons-material/StarBorder';
//import { LinkPreview } from "@dhaiwat10/react-link-preview";
import Embed from "react-embed";
import {useDispatch} from "react-redux";
import {starMessage} from "../../redux/slices/conversation";
import {fSmartTime} from "../../utils/formatTime";


const MessageOption = ({ el }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
    const dispatch = useDispatch();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

    const handleStarMessage = () => {
        dispatch(starMessage(el.id));
        handleClose();
    };

    const Message_options = [
        {
            title: "Star message", action: handleStarMessage
        },
        {
            title: "Delete Message",
        },
    ];



  return (
    <>
      <DotsThreeVertical
        size={20}
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <Stack spacing={1} px={1}>
            {Message_options.map((el) => (
                <MenuItem
                    key={el.title}
                    onClick={() => {
                        if (el.action) el.action();
                        handleClose();
                    }}
                >
                    {el.title}
                </MenuItem>
            ))}
        </Stack>
      </Menu>
    </>
  );
};

const TextMsg = ({ el, menu }) => {
    const theme = useTheme();
    const isIncoming = !el.outgoing;
    const [showTimestamp, setShowTimestamp] = React.useState(false);

    const handleToggleTimestamp = () => {
        setShowTimestamp(prev => !prev);
    };

    return (
        <Stack direction="column" alignItems={isIncoming ? "start" : "end"}>
            {isIncoming && el.sender?.name && (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary, pl: 0.5, pb: 0.2 }}
                    >
                        {el.sender.name}
                    </Typography>
                    {el.starred ? (
                        <StarIcon sx={{ fontSize: 16, color: "#FFD700" }} />
                    ) : (
                        <StarBorderIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    )}
                </Stack>
            )}

            <Stack direction="row" justifyContent={isIncoming ? "start" : "end"} alignItems="flex-end" spacing={0.5}>
                <Box
                    px={1.5}
                    py={1.5}
                    sx={{
                        backgroundColor: isIncoming
                            ? alpha(theme.palette.background.default, 1)
                            : theme.palette.primary.main,
                        borderRadius: 1.5,
                        width: "max-content",
                        position: "relative",
                        cursor: "pointer",
                    }}
                    onClick={handleToggleTimestamp}
                >
                    <Typography
                        variant="body1"
                        color={isIncoming ? theme.palette.text : "#fff"}
                    >
                        {el.message}
                    </Typography>
                    {showTimestamp && el.createdAt && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: isIncoming ? theme.palette.text.secondary : "rgba(255,255,255,0.7)",
                                mt: 0.5,
                                fontSize: "0.65rem",
                            }}
                        >
                            {fSmartTime(el.createdAt)}
                        </Typography>
                    )}
                </Box>

                <Stack direction="column" alignItems="center" spacing={1.3}>
                    {menu && <MessageOption el={el}/>}
                </Stack>
            </Stack>
        </Stack>
    );
};



const MediaMsg = ({ el, menu }) => {
  const theme = useTheme();
  const isIncoming = !el.outgoing;
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
        {isIncoming && el.sender?.name && (
            <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, pl: 1, pb: 0.5 }}
            >
                {el.sender.name}
            </Typography>
        )}
      <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor: el.incoming
            ? alpha(theme.palette.background.default, 1)
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={1}>
          <img
            src={el.img}
            alt={el.message}
            style={{ maxHeight: 210, borderRadius: "10px" }}
          />
          <Typography
            variant="body2"
            color={el.incoming ? theme.palette.text : "#fff"}
          >
            {el.message}
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOption />}
    </Stack>
  );
};
const DocMsg = ({ el, menu }) => {
  const theme = useTheme();
    const isIncoming = !el.outgoing;
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
        {(isIncoming || el.sender?.name) && (
            <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, pl: 1, pb: 0.5 }}
            >
                {el.sender.name}
            </Typography>
        )}

        <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor: el.incoming
            ? alpha(theme.palette.background.default, 1)
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            direction="row"
            spacing={3}
            alignItems="center"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <Image size={48} />
            <Typography variant="caption">Abstract.png</Typography>
            <IconButton>
              <DownloadSimple />
            </IconButton>
          </Stack>
          <Typography
            variant="body2"
            color={el.incoming ? theme.palette.text : "#fff"}
          >
            {el.message}
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOption />}
    </Stack>
  );
};
const LinkMsg = ({ el, menu }) => {
  const theme = useTheme();
    const isIncoming = !el.outgoing;
  return (
    <Stack direction="row" justifyContent={isIncoming ? "start" : "end"}>
        {isIncoming && el.sender?.name && (
            <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, pl: 1, pb: 0.5 }}
            >
                {el.sender.name}
            </Typography>
        )}
      <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor: isIncoming
            ? alpha(theme.palette.background.default, 1)
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            direction="column"
            spacing={3}
            alignItems="start"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <Stack direction={"column"} spacing={2}>
              <Embed
                width="300px"
                isDark
                url={`https://youtu.be/xoWxBR34qLE`}
              />
            </Stack>
          </Stack>
          <Typography
            variant="body2"
            color={isIncoming ? theme.palette.text : "#fff"}
          >
            <div dangerouslySetInnerHTML={{ __html: el.message }}></div>
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOption />}
    </Stack>
  );
};
const ReplyMsg = ({ el, menu }) => {
  const theme = useTheme();
    const isIncoming = !el.outgoing;
  return (
    <Stack direction="row" justifyContent={isIncoming ? "start" : "end"}>
        {isIncoming && el.sender?.name && (
            <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary, pl: 1, pb: 0.5 }}
            >
                {el.sender.name}
            </Typography>
        )}
      <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor: isIncoming
            ? alpha(theme.palette.background.paper, 1)
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            direction="column"
            spacing={3}
            alignItems="center"
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 1),

              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color={theme.palette.text}>
              {el.message}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color={isIncoming ? theme.palette.text : "#fff"}
          >
            {el.reply}
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOption />}
    </Stack>
  );
};
const Timeline = ({ el }) => {
  const theme = useTheme();
    const messageTime = fSmartTime(el.createdAt);
  return (

    <Stack direction="row" alignItems={"center"} justifyContent="space-between">
      <Divider width="46%" />
      <Typography variant="caption" sx={{ color: theme.palette.text }}>
          {messageTime}
      </Typography>
      <Divider width="46%" />
    </Stack>

  );
};

export { Timeline, MediaMsg, LinkMsg, DocMsg, TextMsg, ReplyMsg };