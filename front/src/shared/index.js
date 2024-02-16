import { combineReducers, createStore } from "@reduxjs/toolkit";

import { persistStore, persistReducer } from "redux-persist";
import { rootSlice } from "./slice/rootSlice";

import storage from "redux-persist/lib/storage"; // Import storage from redux-persist/lib
// import { authentificationSlice } from "./slice/auth/AuthSlice";
import { companySlice } from "./slice/company/CompanySlice";
import { restaurantSlice } from "./slice/restaurant/RestaurantSlice";
import { modalLoginSlice } from "./slice/ModalLogin/ModalLoginSlice";
import { authentificationSlice } from "./slice/auth/AuthSlice";
import { orderSlice } from "./slice/order/OrderSlice";
import { promosSlice } from "./slice/promos/PromosSlice";
import { scrollSlice } from "./slice/scroll/ScrollSlice";
export const ClientURI="http://localhost:8000/client"
export const SseURI = "http://localhost:8000/sse"
export const BaseURI="http://localhost:8000"
// export const ClientURI="https://api.eatorder.fr/client"
// export const SseURI = "https://api.eatorder.fr/sse"
// export const BaseURI="https://api.eatorder.fr"
// https://api.eatorder.fr


const persistConfig = {
  key: "root",
  storage: storage,
  whitelist: ["root",'company',"authentification","restaurant","order","promos"],
};

const rootReducer = combineReducers({
  root: rootSlice.reducer,
  authentification: authentificationSlice.reducer,
  company : companySlice.reducer,
  restaurant : restaurantSlice.reducer,
  modalLogin :modalLoginSlice.reducer,
  order : orderSlice.reducer,
  promos : promosSlice.reducer,
  scroll : scrollSlice.reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer);

export const persistor = persistStore(store);
