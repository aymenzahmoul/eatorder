import { BaseURI, store } from "../..";
import { Executor } from "../../Executor";
import { setLoggedInUser, setToken } from "./AuthSlice";

export const checkEmail = (data) => {
    return Executor({
        method: 'post',
        data,
        head:{
            "Content-Type": "application/json",
        Accept: "application/json",
        },
        url: BaseURI + '/client/checkEmail',
        isSilent: false,
        successFun: (data) => {

        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}
export const signup = (data) => {
    return Executor({
        method: 'post',
        data,
        url: BaseURI + '/client/signup',
        isSilent: false,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}

export const login = (data) => {
    return Executor({
        method: 'post',
        data,
        url: BaseURI + '/client/login',
        isSilent: false,
        successFun: (data) => {
            
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}
export const forgetPassword = (data) => {
    return Executor({
        method: 'post',
        data,
        url: BaseURI + '/client/forgetPassword',
        isSilent: false,
        successFun: (data) => {
            
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}
export const sendEmail = (data) => {
    return Executor({
        method: 'post',
        url: BaseURI + `/client/sendVerification/${data}`,
        isSilent: false,
        successFun: (data) => {
            
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}


// export const sendEmail = async (id) => {
//     try {
//         const response = await axios.post(`${ClientURI}/sendVerification/${id}`);
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };
