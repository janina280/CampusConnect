import React from "react";
import {Box, Stack, Typography,} from "@mui/material";
import {styled, useTheme} from "@mui/material/styles";
import CreateAvatar from "../utils/createAvatar";
import {ChatCircle} from "phosphor-react";
import {BASE_URL} from "../config";

const StyledChatBox = styled(Box)(({theme}) => ({
    "&:hover": {
        cursor: "pointer",
    },
}));

const UserElement = ({imageUrl, name, onClick}) => {
    const theme = useTheme();
    const image = imageUrl ? `${BASE_URL}/${imageUrl.replace("\\", "/")}` : '';
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
                    <CreateAvatar name={name} imageUrl={image} size={56}/>
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
