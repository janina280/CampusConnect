import React from "react";
import {Avatar, Box, Fade, Menu, MenuItem, Stack} from "@mui/material";
import {Profile_Menu} from "../../data";
import {useDispatch, useSelector} from "react-redux";
import {LogoutUser} from "../../redux/slices/auth";
import {useNavigate} from "react-router-dom";


const ProfileMenu = () => {
    const {user} = useSelector((state) => state.app);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const openMenu = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const user_name = user?.firstName;
    const {roles = []} = useSelector((state) => state.auth);

    const isAdmin = roles.includes("ROLE_ADMIN");

    return (
        <>
            <Avatar
                id="profile-positioned-button"
                aria-controls={openMenu ? "profile-positioned-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? "true" : undefined}
                alt={user_name}
                onClick={handleClick}
            />
            <Menu
                MenuListProps={{
                    "aria-labelledby": "fade-button",
                }}
                TransitionComponent={Fade}
                id="profile-positioned-menu"
                aria-labelledby="profile-positioned-button"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
            >
                <Box p={1}>
                    <Stack spacing={1}>
                        {Profile_Menu.map((el, idx) => {
                            if (el.title === "Settings" && !isAdmin) return null;

                            return (
                                <MenuItem key={idx} onClick={handleClose}>
                                    <Stack
                                        onClick={() => {
                                            if (idx === 0) {
                                                navigate("/profile");
                                            } else if (idx === 1) {
                                                navigate("/settings");
                                            } else {
                                                dispatch(LogoutUser());
                                            }
                                        }}
                                        sx={{width: 100}}
                                        direction="row"
                                        alignItems={"center"}
                                        justifyContent="space-between"
                                    >
                                        <span>{el.title}</span>
                                        {el.icon}
                                    </Stack>
                                </MenuItem>
                            );
                        })}
                    </Stack>
                </Box>
            </Menu>
        </>
    );
};

export default ProfileMenu;