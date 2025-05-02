import React, {useEffect, useState} from "react";
import {useTheme} from "@mui/material/styles";
import Logo from "../../assets/Images/logo.ico";
import {Nav_Buttons, Profile_Menu} from "../../data";
import {Gear} from "phosphor-react";
import {useDispatch, useSelector} from "react-redux";
import CreateAvatar from "../../utils/createAvatar";
import {LogoutUser} from "../../redux/slices/auth";
import {Box, Divider, IconButton, Menu, MenuItem, Stack,} from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom";
import {FetchUserProfile, SelectChatType} from "../../redux/slices/app";

const getMenuPath = (index) => {
    switch (index) {
        case 0:
            return "/profile";
        case 1:
            return "/settings";
        case 2:
            return null;
        default:
            return "/";
    }
};

const getPath = (index) => {
    switch (index) {
        case 0:
        case 1:
            return "/app";
        case 2:
            return "/settings";
        default:
            return "/";
    }
};

const SideBar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const location = useLocation();
    const dispatch = useDispatch();
    const open = Boolean(anchorEl);

    const token = useSelector(
        (state) => state.auth.accessToken);

    // Handle Avatar menu click
    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Handle Menu Close
    const handleClose = () => {
        setAnchorEl(null);
    };

    const { user } = useSelector((state) => state.app);

    useEffect(() => {
        dispatch(FetchUserProfile())
    }, [token]);


    useEffect(() => {
        switch (location.pathname) {
            case "/app":
                setSelected(0);
                dispatch(SelectChatType({chat_type: "individual"}));
                break;
            case "/group":
                setSelected(1);
                break;
            case "/settings":
                setSelected(2);
                break;
            default:
                setSelected(0);
                break;
        }
    }, [location]);

    return (
        <Box
            p={2}
            sx={{
                backgroundColor: theme.palette.background.paper,
                boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
                height: "100vh",
                width: 100,
            }}
        >
            <Stack
                direction="column"
                alignItems={"center"}
                justifyContent="space-between"
                sx={{height: "100%"}}
                spacing={3}
            >
                {/* Top Section */}
                <Stack alignItems={"center"} spacing={4}>
                    {/* Logo */}
                    <Box
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            height: 64,
                            width: 64,
                            borderRadius: 1.5,
                        }}
                        onClick={() => {
                            setSelected(0);
                            navigate("/app");
                        }}
                    >
                        <img src={Logo} alt="Chat App Logo"/>
                    </Box>

                    {/* Navigation Buttons */}
                    <Stack
                        sx={{width: "max-content"}}
                        direction="column"
                        alignItems="center"
                        spacing={3}
                    >
                        {Nav_Buttons.map((el) =>
                            el.index === selected ? (
                                <Box
                                    key={el.index}
                                    p={1}
                                    sx={{
                                        backgroundColor: theme.palette.primary.main,
                                        borderRadius: 1.5,
                                    }}
                                >
                                    <IconButton sx={{width: "max-content", color: "#fff"}}>
                                        {el.icon}
                                    </IconButton>
                                </Box>
                            ) : (
                                <IconButton
                                    key={el.index}
                                    onClick={() => {
                                        setSelected(el.index);
                                        let chatType = "individual";
                                        if (el.index === 1) {
                                            chatType = "group";
                                        }
                                        dispatch(SelectChatType({chat_type: chatType}));

                                        if (location.pathname !== '/app') {
                                            navigate(getPath(el.index));
                                        }
                                    }
                                    }
                                    sx={{
                                        width: "max-content",
                                        color:
                                            theme.palette.mode === "light"
                                                ? "#000"
                                                : theme.palette.text.primary,
                                    }}
                                >
                                    {el.icon}
                                </IconButton>
                            )
                        )}

                        <Divider sx={{width: "48px"}}/>

                        {/* Gear Icon */}
                        {selected === 2 ? (
                            <Box
                                p={1}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    borderRadius: 1.5,
                                }}
                            >
                                <IconButton sx={{width: "max-content", color: "#fff"}}>
                                    <Gear/>
                                </IconButton>
                            </Box>
                        ) : (
                            <IconButton
                                onClick={() => {
                                    navigate(getPath(2));
                                    setSelected(2);
                                }}
                                sx={{
                                    width: "max-content",
                                    color:
                                        theme.palette.mode === "light"
                                            ? "#000"
                                            : theme.palette.text.primary,
                                }}
                            >
                                <Gear/>
                            </IconButton>
                        )}
                    </Stack>
                </Stack>

                {/* Bottom Section */}
                <Stack spacing={4}>
                    {/* Avatar */}

                    <Box
                        id="basic-button"
                        aria-controls={open ? "basic-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                        onClick={handleAvatarClick}
                    >
                        <CreateAvatar
                            name={user.name}
                            imageUrl={`http://localhost:8080/${user.imageUrl}`}
                            size={56}
                        />
                    </Box>

                    {/* Menu */}
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            "aria-labelledby": "basic-button",
                        }}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                        }}
                    >
                        <Stack spacing={1} px={1}>
                            {Profile_Menu.map((el, idx) => (
                                <MenuItem
                                    key={idx}
                                    onClick={() => {
                                        if (idx === 2) {
                                            dispatch(LogoutUser());

                                        } else {
                                            navigate(getMenuPath(idx));
                                        }
                                        handleClose();
                                    }}
                                >
                                    <Stack
                                        sx={{width: 100}}
                                        direction={"row"}
                                        alignItems={"center"}
                                        justifyContent={"space-between"}
                                    >
                                        <span>{el.title}</span>
                                        {el.icon}
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Stack>
                    </Menu>
                </Stack>
            </Stack>
        </Box>
    );
};

export default SideBar;
