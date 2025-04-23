import {Divider, IconButton, Stack} from "@mui/material";
import {GoogleLogo} from "phosphor-react";
import React from "react";

const AuthSocial = () => {
    const googleLogin = () => {
        const redirectUri = encodeURIComponent("http://localhost:3000/oauth2/redirect");
        document.cookie = `redirect_uri=${redirectUri}; path=/`;

        window.location.href = "http://localhost:8080/oauth2/authorize/google";
    };

  return (
    <div>
      <Divider
        sx={{
          my: 2.5,
          typography: "overline",
          color: "text.disabled",
          "&::before, ::after": {
            borderTopStyle: "dashed",
          },
        }}
      >
        OR
      </Divider>
      <Stack direction={"row"} justifyContent="center" spacing={2}>

          <IconButton onClick={googleLogin}>
              <GoogleLogo color="#DF3E30"/>
          </IconButton>

      </Stack>
    </div>
  );
};

export default AuthSocial;
