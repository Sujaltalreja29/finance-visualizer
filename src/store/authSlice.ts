import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the type for the user object
export interface User {
  _id: string;
  username: string;
  email: string;
  budget: number;
  spent : number;
}

// Define the type for the state
export interface AuthState {
  status: boolean;
  userData: { user: User; expires: string } | null; // Structure matching the session object
}

const initialState: AuthState = {
  status: false,
  userData: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; expires: string }>) => {
      state.status = true;
      state.userData = action.payload;
      console.log(state.userData, state.status);
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
