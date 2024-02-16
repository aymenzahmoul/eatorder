import { createSlice } from "@reduxjs/toolkit";

export const CompanyInitialState = {
    company: [],
};

export const companySlice = createSlice({
    name: "company",
    initialState: CompanyInitialState,
    reducers: {
        setCompany: (state, action) => {
            state.company = action.payload.company
        }
    },
});

export const {setCompany} = companySlice.actions;
