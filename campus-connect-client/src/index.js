import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from 'react-router-dom';
import {HelmetProvider} from "react-helmet-async";
import App from "./App";

// contexts
import SettingsProvider from "./contexts/SettingsContext";
import {store} from "./redux/store";
import {Provider as ReduxProvider} from "react-redux";
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <HelmetProvider>
            <ReduxProvider store={store}>
                <SettingsProvider>
                    <BrowserRouter>
                        <DevSupport ComponentPreviews={ComponentPreviews}
                                    useInitialHook={useInitial}
                        >
                            <App/>
                        </DevSupport>
                    </BrowserRouter>
                </SettingsProvider>
            </ReduxProvider>
        </HelmetProvider>
    </React.StrictMode>
);

