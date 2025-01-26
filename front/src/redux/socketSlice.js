import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
    name:"socketio",
    initialState:{
        socket:null,
        connected: false
    },
    reducers:{
        // actions
        setSocket:(state,action) => {
            state.socket = action.payload;
            state.connected = action.payload ? action.payload.connected : false;
        }
    }
});
export const {setSocket} = socketSlice.actions;
export default socketSlice.reducer;