// import { Toast } from 'react-native-toast-message/lib/src/Toast';

import { store } from ".";
import { setRootLoading } from './slice/rootSlice';

import Intersptor from "./Intersptor"

export function Executor(config) {

    return new Promise((resolve, reject) => {

        !config.isSilent && store.dispatch(setRootLoading(true));

        Intersptor[config.method](config.url, config.data, {
            headers: config.head && {
                ...config.head
            }
        })
            .then((res) => {
                // console.log(res.data);
                const successStatus = res?.status === 200

                successStatus && config.successFun && config.successFun(res?.data)

                !config.isSilent && store.dispatch(setRootLoading(false));

                // successStatus && config.withSuccessToast &&
                //     Toast.show({
                //         type: 'success',
                //         text1: res?.data?.message,
                //     });

                resolve(res?.data);

                //console.log('excutor ', res.status, config.isSilent);

            })
            .catch((err) => {
                const failedStatus =
                    err?.response?.status === 404
                //|| err?.response?.status === 401
                //|| err?.response?.status === 404
                //|| err?.response?.status === 403
                //|| err?.response?.status === 400


                failedStatus && config.errorFun && config.errorFun(err?.response?.data);

                !config.isSilent && store.dispatch(setRootLoading(false));

                // failedStatus && config.withErrorToast &&
                //     Toast.show({
                //         type: 'error',
                //         text1: err?.response?.data?.message,
                //     });


                reject(err);
            });
    });
}

/*const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(() => resolve, delayInms));
};

function fetchWithTimeout(fn, time) {
}*/
