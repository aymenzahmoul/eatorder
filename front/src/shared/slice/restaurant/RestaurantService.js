import { BaseURI } from "../..";
import { Executor } from "../../Executor";

export const getstorebyidcompany = (id) => {
    return Executor({
        method: 'get',
        url: BaseURI + `/client/storesByCompany/${id}`,
        isSilent: true,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}

export const getStoreById = (_id) => {
    return Executor({   
        method: 'get',
        url: BaseURI + `/client/store/${_id}`,
        isSilent: false,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}

export const getMenuByStore = (store) => {
    return Executor({   
        method: 'get',
        url: BaseURI + `/client/getMenuByStore/${store}`,
        isSilent: false,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}
export const getProductByStoreByMode = (store,mode) => {
    return Executor({   
        method: 'get',
        url: BaseURI + `/client/products-by-store/${store}/${mode}`,
        isSilent: false,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}
export const getModeConsomation = (store) => {
    return Executor({   
        method: 'get',
        url: BaseURI + `/client/modeConsomation/${store}`,
        isSilent: false,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}
 export const getMode = (id)=>{
    return Executor({   
        method: 'get',
        url: BaseURI + `/client/modeById/${id}`,
        isSilent: false,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
 }