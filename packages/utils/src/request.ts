import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import log from './log';
import fs from 'fs';
import { USER_INFO_PATH } from './constant';

const BASE_URL = 'https://devlink.wiki/api';
// const BASE_URL = 'http://127.0.0.1:13000/api';

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
  error => {
    log.verbose('request error', error);
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    log.verbose('response', response.data);
    return response;
  },
  error => {
    log.verbose('response error', error.response.data.status);
    if (error.response) {
      const errorData = error.response.data;
      const { status } = errorData;
      if (status === 401) {
        log.notice('身份验证失败，请使用 login 命令重新登录');
      }
    }
    return Promise.reject(error);
  },
);

export default service;
