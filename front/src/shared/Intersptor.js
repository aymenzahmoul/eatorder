// for refresh token
import axios from 'axios';
import { store } from '.';
const Intersptor = axios.create({
  timeout: 20000,
});
Intersptor.interceptors.request.use( (config) => {
  config.headers = {
    ...config.headers,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (store.getState().authentification.token) {
    config.headers.Authorization = `Bearer ${store.getState().authentification.token}`
  }
  return config
});
export default Intersptor









