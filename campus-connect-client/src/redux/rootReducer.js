import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import appReducer from "./slices/app";
import authReducer from "./slices/auth";
import conversationReducer from "./slices/conversation";

const rootPersitConfig = {
  key: "root",
  storage,
  keyPrefix: "redux-",
  //whitelist: [],
  //blacklist[]
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
 conversation: conversationReducer, 
});

export { rootPersitConfig, rootReducer };
