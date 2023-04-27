import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import log from './log';
import fs from 'fs';
import { USER_INFO_PATH } from './constant';

// const BASE_URL = 'https://devlink.wiki/api';
const BASE_URL = 'http://127.0.0.1:13000/api';

const userInfo = JSON.parse(fs.readFileSync(USER_INFO_PATH, 'utf8')) || {};

const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

service.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (userInfo?.accessToken?.length !== 0) {
      config.headers['authorization'] = 'Bearer ' + userInfo?.accessToken;
    }
    return config;
  },
  (error: any): Promise<any> => {
    log.verbose('request error', error);
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    log.verbose('response', response.data);
    return response;
  },
  (error: any): Promise<any> => {
    log.verbose('response error', error);
    return Promise.reject(error);
  },
);

export default service;
