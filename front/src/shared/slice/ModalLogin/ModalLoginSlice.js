import { createSlice } from "@reduxjs/toolkit";

export const ModalLoginInitialState = {
    modalPrincipal: false,
    modalLogin: false,
    modalSignup: false,
    modalSendEmail: false,
    modalResetPassword: false,
    emailExist: null,
    modeDelivery: false,
    email: ""
};



export const modalLoginSlice = createSlice({
    name: "modalLogin",
    initialState: ModalLoginInitialState,
    reducers: {
        setModalPrincipal: (state, action) => {
            state.modalPrincipal = action.payload.modalPrincipal
        },
        setModalLogin: (state, action) => {
            state.modalLogin = action.payload.modalLogin
        },
        setModalSignup: (state, action) => {
            state.modalSignup = action.payload.modalSignup
        },
        setModalSendEmail: (state, action) => {
            state.modalSendEmail = action.payload.modalSendEmail
        },
        setModalResetPassword: (state, action) => {
            state.modalResetPassword = action.payload.modalResetPassword
        },
        setEmailExist: (state, action) => {
            state.emailExist = action.payload.emailExist
        },
        setModeDelivery: (state, action) => {
            state.modeDelivery = action.payload.modeDelivery
        },
        setEmail: (state, action) => {
            state.email = action.payload.email
        },
    },
});

export const { setModalPrincipal, setModalLogin, setModalSignup, setEmailExist, setModeDelivery, setEmail, setModalSendEmail, setModalResetPassword } = modalLoginSlice.actions;
