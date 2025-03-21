// routes
// theme
// components
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import ThemeSettings from "./components/settings";
import ThemeProvider from "./theme";
import Router from "./routes";
import {closeSnackBar} from "./redux/slices/app";
import {WebSocketProvider} from "./contexts/WebSocketContext";

const vertical = "bottom";
const horizontal = "center";

const Alert = React.forwardRef((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

function App() {
    const dispatch = useDispatch();

    const {severity, message, open} = useSelector(
        (state) => state.app.snackbar
    );

    return (
        <>
            <ThemeProvider>
                <WebSocketProvider>
                    <ThemeSettings>
                        {" "}
                        <Router/>{" "}
                    </ThemeSettings>
                </WebSocketProvider>
            </ThemeProvider>

            {open ? (
                <Snackbar
                    anchorOrigin={{vertical, horizontal}}
                    open={open}
                    autoHideDuration={4000}
                    key={vertical + horizontal}
                    onClose={() => {
                        console.log("This is clicked");
                        dispatch(closeSnackBar());
                    }}
                >
                    <Alert
                        onClose={() => {
                            console.log("This is clicked");
                            dispatch(closeSnackBar());
                        }}
                        severity={severity}
                        sx={{width: "100%"}}
                    >
                        {message}
                    </Alert>
                </Snackbar>
            ) : (
                <></>
            )}
        </>
    );
}

export default App;