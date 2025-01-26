import { createSlice } from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import { showSnackbar } from "./app";

const initialState = {
  isLoggedIn: false,
  accessToken: "",
  isLoading: false,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logIn(state, action) {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.accessToken = action.payload.accessToken;
    },
    signOut(state, action) {
      state.isLoggedIn = false;
      state.accessToken = "";
    },
  },
});

//REDUCER
export default slice.reducer;

//Log in
export function LoginUser(fromValues) {
  //fromValues=>{email, password}
  return async (dispatch, getState) => {
    await axios
      .post(
        "/auth/login",
        {
          ...fromValues,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response) {
        console.log(response);
        dispatch(
          slice.actions.logIn({
            isLoggedIn: true,
            accessToken: response.data.accessToken,
          })
        );
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
      })
      .catch(function (error) {
        console.log(error);
        dispatch(showSnackbar({ severity: "error", message: error.message }));
      });
  };
}

//Log Out
export function LogoutUser() {
  return async (dispatch, getState) => {
    dispatch(slice.actions.signOut());
  };
}