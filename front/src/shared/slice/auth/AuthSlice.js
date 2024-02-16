import { createSlice } from "@reduxjs/toolkit";

export const AuthentificationInitialState = {
  loggedInUser: undefined,
  isLoggedIn: false,
  userId: undefined,
  token: undefined,
};

export const authentificationSlice = createSlice({
  name: "authentification",
  initialState: AuthentificationInitialState,
  reducers: {
    setLoggedInUser: (state, action) => {
      state.isLoggedIn = true;
      // here i will delete password from user object
      const user = action.payload.user;
      delete user.password;

      state.loggedInUser = user;

      state.userId = action.payload.user._id;
    },

    setToken: (state, action) => {
      state.token = action.payload.token;
    },

    disconnect: (state) => {
      state.loggedInUser = undefined;
      state.isLoggedIn = false;
      state.userId = undefined;
      state.token = undefined;
    },
  },
});

export const {
  setLoggedInUser,
  setToken,
  disconnect,
} = authentificationSlice.actions;
