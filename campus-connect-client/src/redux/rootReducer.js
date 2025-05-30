import {combineReducers} from "redux";
import storage from "redux-persist/lib/storage";
import appReducer from "./slices/app";
import authReducer, {LOGOUT} from "./slices/auth";
import conversationReducer from "./slices/conversation";

const appReducerCombined = combineReducers({
    app: appReducer,
    auth: authReducer,
    conversation: conversationReducer,
});

const rootReducer = (state, action) => {
    if (action.type === LOGOUT) {
        storage.removeItem("persist:root");
        state = undefined;
    }
    return appReducerCombined(state, action);
};

const rootPersitConfig = {
  key: "root",
  storage,
  keyPrefix: "redux-",
    whitelist: ["auth", "app", "conversation"]
};

export { rootPersitConfig, rootReducer };
