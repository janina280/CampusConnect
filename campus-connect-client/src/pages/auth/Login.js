import {Link, Stack, Typography} from "@mui/material";
import React from "react";
import {Link as RouterLink} from "react-router-dom";
import LoginForm from "../../sections/auth/LoginForm";

const Login = () => {
    return (
        <>
            <Stack spacing={3} sx={{mb: 5, mt: 5, position: "relative"}}>
                <Typography variant="h4">Login to CampusConnect</Typography>
                <Stack direction={"row"} spacing={0.5}>
                    <Typography variant="body2">New User?</Typography>
                    <Link to="/auth/register" component={RouterLink} variant="subtitle2">
                        {" "}
                        Create an account
                    </Link>
                </Stack>
                {/* Login Form*/}
                <LoginForm/>
            </Stack>
        </>
    );
};

export default Login;
