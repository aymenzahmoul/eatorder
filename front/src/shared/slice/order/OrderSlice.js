import { createSlice } from "@reduxjs/toolkit";

export const OrderInitialState = {
    order: [],
};

export const orderSlice = createSlice({
    name: "order",
    initialState: OrderInitialState,
    reducers: {
        setOrder: (state, action) => {
            state.order = action.payload.order
        }
    },
});

export const { setOrder } = orderSlice.actions;
