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
    updateIsLoading(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
    },
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
        window.localStorage.setItem("user_id", response.data.userId);
        dispatch(
          showSnackbar({ severity: "success", message: "You are connected!" })
        );
      })
      .catch(function (error) {
        dispatch(showSnackbar({ severity: "error", message: error.message }));
      });
  };
}

//Log Out
export function LogoutUser() {
  return async (dispatch, getState) => {
    window.localStorage.removeItem("user_id");
    dispatch(slice.actions.signOut());
  };
}

export function RegisterUser(formValues, navigate) {
  return async (dispatch, getState) => {

    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));
    await axios
      .post(
        "auth/register",
        {
          ...formValues,
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
          showSnackbar({ severity: "success", message: response.data.message })
        );
        dispatch(
          slice.actions.updateIsLoading({ isLoading: false, error: false })
        );

        navigate("/auth/login")
      })
      .catch((error) => {
        console.log(error);
        dispatch(showSnackbar({ severity: "error", message: error.message }));
        dispatch(
          slice.actions.updateIsLoading({ error: true, isLoading: false })
        );
      });
  };
}

