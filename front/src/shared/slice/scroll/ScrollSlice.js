import { createSlice } from "@reduxjs/toolkit";

export const ScrollInitialState = {
    scroll: 0,

};


export const scrollSlice = createSlice({
    name: "scroll",
    initialState: ScrollInitialState,
    reducers: {
        setScroll: (state, action) => {
            state.scroll = action.payload.scroll
        },

    },
});

export const { setScroll } = scrollSlice.actions;
