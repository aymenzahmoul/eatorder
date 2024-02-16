import { BaseURI } from "../..";
import { Executor } from "../../Executor";

export const getallcompanies = () => {
    return Executor({
        method: 'get',
        url: BaseURI + '/client/companies',
        isSilent: false,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}

export const getcompanybyid = (id) => {
    return Executor({
        method: 'get',
        url: BaseURI + `/client/company/${id}`,
        isSilent: true,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}

