import { BaseURI } from "../..";
import { Executor } from "../../Executor";

export const getpromosbystoreid = (storeId,modeId) => {
    return Executor({
        method: 'get',
        url: BaseURI + `/client/promos-by-store/${storeId}/${modeId}`,
        isSilent: true,
        successFun: (data) => {
        },
        withErrorToast: false,
        withSuccessToast: false,
    });
}
