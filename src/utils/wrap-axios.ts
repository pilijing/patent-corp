import axios from 'axios';

/**
 * 系统API请求模块
 * PS.
 * 不要在该模块中进行路由跳转，只能进行数据操作
 * 作为基础模块，引入router或其他组件容易导致循环依赖
 *
 */
import {
  getToken, isExpired, setToken,
} from './auth';

const refreshToken = async (token: string) => {
  const { data } = await axios({
    method: 'get',
    url: '/patent-corp_api/authentications/refresh-token',
    headers: {
      Authorization: `Bearer ${token}`, // 老的token
    },
  });
  const mseconds = new Date(data.expire).getTime() - new Date().getTime();
  const expired = new Date().getTime() + (mseconds / 2);
  return { token: data.token, expired };
};

const http = axios.create();

http.interceptors.request.use(async (config) => {
  // Do something before request is sent，return false cancel request。
  const token = getToken();
  if (token) { // 加上鉴权header
    if (isExpired()) { // token已过期
      // refreshToken
      try {
        const data = await refreshToken(token);
        setToken(data.token, data.expired);
        config.headers.Authorization = `Bearer ${data.token}`;
      } catch (error) {
        // 重新登录
        if (error.response?.status === 403) {
          window.location.assign('/patent-corp/login');
        }
      }
    } else {
      // 有效的token
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default http;
