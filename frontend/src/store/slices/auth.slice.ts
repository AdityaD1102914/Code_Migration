import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { login } from "../../services/auth.service";

interface InitialState {
  isLoggedIn: boolean;
  authToken: string | null;
  isLoginInProcess: boolean;
  loggedInUserInfo?: any;
}

const AUTHTOKENKEY =
  import.meta.env.VITE_AUTHTOKEN_KEY || "frontendModernization_auth_token";
const initialState: InitialState = {
  isLoggedIn: false,
  authToken: null,
  isLoginInProcess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserLoginInfo: (state, action) => {
      localStorage.removeItem(AUTHTOKENKEY);
      console.log(state, action);
      localStorage.setItem(AUTHTOKENKEY, action.payload.accessToken);
      state.authToken = action.payload.accessToken;
      state.isLoggedIn = true;
    },
    checkIsLoggedIn: (state) => {
      console.log("checking for logineedn");
      const availableToken = localStorage.getItem(AUTHTOKENKEY);
      if (availableToken && availableToken.length) {
        state.authToken = availableToken;
        state.isLoggedIn = true;
      }
    },
    clearLoggedInInfo: (state) => {
      state.authToken = null;
      state.isLoggedIn = false;
    },
    setLoggedInUserInfo: (state, action) => {
      state.loggedInUserInfo = action.payload;
    },
  },
  extraReducers: (builder) => {},
  // A "builder callback" function used to add more reducers
  // extraReducers?: (builder: ActionReducerMapBuilder<State>) => void,
  // // A preference for the slice reducer's location, used by `combineSlices` and `slice.selectors`. Defaults to `name`.
  // reducerPath?: string,
  // // An object of selectors, which receive the slice's state as their first parameter.
  // selectors?: Record < string, (sliceState: State, ...args: any[]) => any >,
});

export const { checkIsLoggedIn, setUserLoginInfo, clearLoggedInInfo, setLoggedInUserInfo } =
  authSlice.actions;
export default authSlice.reducer;
