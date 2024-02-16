import { BaseURI } from "../..";
import { Executor } from "../../Executor";

export const createOrder = (data) => {
    return Executor({
        method: 'post',
        data,
        url: BaseURI + `/sse/orders`,
        isSilent: false,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}
