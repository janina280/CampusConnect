import React from "react";
import {Badge, Box, Stack, Typography,} from "@mui/material";
import {styled, useTheme} from "@mui/material/styles";
import CreateAvatar from "../utils/createAvatar";
import {ChatCircle} from "phosphor-react";

const user_id = window.localStorage.getItem("user_id");

const StyledChatBox = styled(Box)(({theme}) => ({
    "&:hover": {
        cursor: "pointer",
    },
}));

const StyledBadge = styled(Badge)(({theme}) => ({
    "& .MuiBadge-badge": {
        backgroundColor: "#44b700",
        color: "#44b700",
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        "&::after": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            animation: "ripple 1.2s infinite ease-in-out",
            border: "1px solid currentColor",
            content: '""',
        },
    },
    "@keyframes ripple": {
        "0%": {
            transform: "scale(.8)",
            opacity: 1,
        },
        "100%": {
            transform: "scale(2.4)",
            opacity: 0,
        },
    },
}));

const UserElement = ({img, name, online, id, onClick}) => {
    const theme = useTheme();

    return (
        <StyledChatBox sx={{
            width: "100%",
            borderRadius: 1,
            backgroundColor: theme.palette.background.paper,
        }} p={2}
                       onClick={onClick}>

            <Stack
                direction="row"
                alignItems={"center"}
                justifyContent="space-between"
            >
                <Stack direction="row" alignItems={"center"} spacing={2}>
                    {online ? (
                        <StyledBadge
                            overlap="circular"
                            anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                            variant="dot"
                        >
                            <CreateAvatar name={name} imageUrl={img} size={56}/>
                        </StyledBadge>
                    ) : (
                        <CreateAvatar name={name} imageUrl={img} size={56}/>
                    )}
                    <Stack spacing={0.4}>
                        <Typography variant="subtitle2">{name}</Typography>
                    </Stack>
                </Stack>
                <Stack spacing={2} direction="row" alignItems={"center"}>
                    <ChatCircle
                        size={20}
                        style={{
                            cursor: "pointer",
                            color: theme.palette.primary.main,
                        }}
                    />
                </Stack>
            </Stack>
        </StyledChatBox>
    );
};

export {UserElement};
