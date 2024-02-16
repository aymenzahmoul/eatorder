import { createSlice } from "@reduxjs/toolkit";

export const PromosInitialState = {
    promos: [],
    selectedPromos: []
};



export const promosSlice = createSlice({
    name: "promos",
    initialState: PromosInitialState,
    reducers: {
        setPromos: (state, action) => {
            state.promos = action.payload.promos
        },
        setSelectedPromos: (state, action) => {
            state.selectedPromos.push(action.payload.selectedPromo)
        },
        resetPromo: (state) => {
            state.selectedPromos = []
        },
        deletePromos: (state, action) => {
            state.selectedPromos = action.payload.selectedPromos
        }

    },
});

export const { setPromos, setSelectedPromos, resetPromo, deletePromos } = promosSlice.actions;
