import { createSlice } from "@reduxjs/toolkit";

export const RestaurantInitialState = {
    restaurant: [],
    restaurantSelected: undefined,
    menu: undefined,
    product: undefined,
    mode: [],
    modeSelected: undefined,
    modeId: undefined,
    disable: false,
    deliveryAdress: "",
    checkedIndices: [],
    checkedOptions: []
};



export const restaurantSlice = createSlice({
    name: "restaurant",
    initialState: RestaurantInitialState,
    reducers: {
        setRestaurant: (state, action) => {
            state.restaurant = action.payload.restaurant
        },
        setRestaurantSelected: (state, action) => {
            state.restaurantSelected = action.payload.restaurantSelected
        },
        setMenu: (state, action) => {
            state.menu = action.payload.menu
        },
        setProduct: (state, action) => {
            state.product = action.payload.product
        },
        setMode: (state, action) => {
            state.mode = action.payload.mode
        },
        setModeSelected: (state, action) => {
            state.modeSelected = action.payload.modeSelected
        },
        setModeId: (state, action) => {
            state.modeId = action.payload.modeId
        },
        setDisable: (state, action) => {
            state.disable = action.payload.disable
        },
        setDeliveryAdress: (state, action) => {
            state.deliveryAdress = action.payload.deliveryAdress
        },
        setCheckedIndices: (state, action) => {
            state.checkedIndices = action.payload.checkedIndices
        },
        setCheckedOptions: (state, action) => {
            state.checkedOptions = action.payload.checkedOptions
        },
    },
});

export const { setRestaurant, setRestaurantSelected, setMenu, setProduct, setMode, setModeSelected, setModeId, setDisable, setDeliveryAdress, setCheckedIndices, setCheckedOptions } = restaurantSlice.actions;
