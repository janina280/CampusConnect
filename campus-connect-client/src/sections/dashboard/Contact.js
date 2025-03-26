import React, {useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Slide,
  Stack,
  Typography,
} from "@mui/material";
import CreateAvatar from "../../utils/createAvatar";
import {CaretRight, Prohibit, Star, Trash, X,} from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import {useDispatch, useSelector} from "react-redux";
import {ToggleSidebar, UpdateSidebarType} from "../../redux/slices/app";
import axios from "axios";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BlockDialog = ({ open, handleClose }) => {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Block this contact</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Are you sure you want to block this Contact?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleClose}>Yes</Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteChatDialog = ({ open, handleClose}) => {
  const [loading, setLoading] = useState(false);
  const chatId=useSelector((state)=>state.conversation.direct_chat.current_conversation.id);
  const token = useSelector((state) => state.auth.accessToken);
  //const groupId=useSelector((state)=>state.conversation.group_chat.current_group_conversation.id);
  const handleDelete = () => {
    setLoading(true);

    fetch(`http://localhost:8080/${chatId}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log("Successfully deleted");
          }
        })
        .catch((error) => {
          console.error('Error deleting chat:', error);
        })
        .finally(() => {
          setLoading(false);
          handleClose();
        });
  };
  return (
      <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Delete this chat</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to delete this chat?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Yes"}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

const Contact = () => {
  const dispatch = useDispatch();

  const {current_conversation} = useSelector((state) => state.conversation.direct_chat);
  const {current_group_conversation} = useSelector((state) => state.conversation.group_chat);
  const {chat_type, room_id} = useSelector((store) => store.app);
  const authToken = useSelector((state) => state.auth.accessToken);
  const theme = useTheme();

  const isDesktop = useResponsive("up", "md");

  const [openBlock, setOpenBlock] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [commonGroups, setCommonGroups] = useState([]);
  const [conversation, setConversation] = useState(null);

  const handleCloseBlock = () => {
    setOpenBlock(false);
  }
  const handleCloseDelete = () => {
    setOpenDelete(false);
  }

  useEffect(() => {
    const fetchCommonGroups = async () => {
      try {
        const response = await axios.get(
            `http://localhost:8080/common-groups/${current_conversation.user_id}`,
            {headers: {Authorization: `Bearer ${authToken}`}}
        );
        setCommonGroups(response.data);
      } catch (error) {
        console.error("Error fetching common groups:", error);
      }
    };

    if (current_conversation?.user_id) {

      fetchCommonGroups();
    }
  }, [current_conversation]);


  useEffect(() => {
      if(chat_type === "individual") {
        setConversation(current_conversation);
      }
      else{
        setConversation(current_group_conversation);
      }
  }, [chat_type, current_conversation, current_group_conversation])

  return (
    <Box sx={{ width: !isDesktop ? "100vw" : 320, maxHeight: "100vh" }}>
      <Stack sx={{ height: "100%" }}>
        <Box
          sx={{
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            width: "100%",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background,
          }}
        >
          <Stack
            sx={{ height: "100%", p: 2 }}
            direction="row"
            alignItems={"center"}
            justifyContent="space-between"
            spacing={3}
          >
            <Typography variant="subtitle2">Contact Info</Typography>
            <IconButton
              onClick={() => {
                dispatch(ToggleSidebar());
              }}
            >
              <X />
            </IconButton>
          </Stack>
        </Box>
        <Stack
          sx={{
            height: "100%",
            position: "relative",
            flexGrow: 1,
            overflow: "scroll",
          }}
          p={3}
          spacing={3}
        >
          <Stack alignItems="center" direction="row" spacing={2}>
          <CreateAvatar
                  name={conversation?.name}
                  imageUrl={conversation?.img}
                  size={56}
                />
            <Stack spacing={0.5}>
              <Typography variant="article" fontWeight={600}>
                {conversation?.name}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {conversation?.nickname}
              </Typography>
            </Stack>
          </Stack>
          <Divider />
          <Stack spacing={0.5}>
            <Typography variant="article" fontWeight={600}>
              About
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {conversation?.about}
            </Typography>
          </Stack>
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
          >
            <Typography variant="subtitle2">Media, Links & Docs</Typography>
            <Button
              onClick={() => {
                dispatch(UpdateSidebarType("SHARED"));
              }}
              endIcon={<CaretRight />}
            >
              401
            </Button>
          </Stack>
          <Stack direction={"row"} alignItems="center" spacing={2}>
            {[1, 2, 3].map((el) => (
              <Box>
                {/* <img src={faker.image.city()} alt={faker.internet.userName()} /> */}
              </Box>
            ))}
          </Stack>
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={"space-between"}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Star size={21} />
              <Typography variant="subtitle2">Starred Messages</Typography>
            </Stack>

            <IconButton
              onClick={() => {
                dispatch(UpdateSidebarType("STARRED"));
              }}
            >
              <CaretRight />
            </IconButton>
          </Stack>
          <Divider />
          <Typography variant="body2">Groups in common</Typography>
          <Stack spacing={2}>
            {commonGroups.length > 0 ? (
                commonGroups.map((group) => (
                    <Stack key={group.id} direction="row" alignItems={"center"} spacing={2}>
                      <CreateAvatar name={group.name} imageUrl={group.img} size={40}/>
                      <Stack>
                        <Typography variant="subtitle2">{group.name}</Typography>
                        <Typography variant="caption">
                          {group.users.length} members
                        </Typography>
                      </Stack>
                    </Stack>
                ))
            ) : (
                <Typography variant="caption">No groups in common</Typography>
            )}
          </Stack>
          <Divider />

          <Stack direction="row" alignItems={"center"} spacing={2}>
            <Button
              onClick={() => {
                setOpenBlock(true);
              }}
              fullWidth
              startIcon={<Prohibit />}
              variant="outlined"
            >
              Block
            </Button>
            <Button
              onClick={() => {
                setOpenDelete(true);
              }}
              fullWidth
              startIcon={<Trash />}
              variant="outlined"

            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Stack>
      {openBlock && <BlockDialog open={openBlock} handleClose={handleCloseBlock} />}
      {openDelete && <DeleteChatDialog open={openDelete} handleClose={handleCloseDelete} />}
    </Box>
  );
};

export default Contact;