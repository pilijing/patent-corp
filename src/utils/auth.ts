const projectName = 'patent';

const KEY_TOKEN = `${projectName}_token`;
const KEY_EXPIRED = `${projectName}_token_expired`;
const KEY_USER_ID = `${projectName}_user_id`;

// token是否失效
const isExpired = () => {
  const expiredStr = window.localStorage.getItem(KEY_EXPIRED);
  if (!expiredStr) return true;
  const expired = parseInt(expiredStr, 10);
  return Date.now() > expired;
};

const getToken = () => window.localStorage.getItem(KEY_TOKEN) || '';

const setToken = (token: string, expired: number) => {
  window.localStorage.setItem(KEY_TOKEN, token);
  window.localStorage.setItem(KEY_EXPIRED, String(expired));
};

// 不判断token失效情况
const isLogin = () => !!window.localStorage.getItem(KEY_TOKEN);
const removeToken = () => {
  window.localStorage.removeItem(KEY_TOKEN);
  window.localStorage.removeItem(KEY_EXPIRED);
};

const setUserId = (info: string | number) => window.localStorage.setItem(KEY_USER_ID, String(info));
const getUserId = () => window.localStorage.getItem(KEY_USER_ID) || '';
const removeUserId = () => window.localStorage.removeItem(KEY_USER_ID);

const logOut = () => {
  removeToken();
  removeUserId();
};

export {
  isExpired,
  isLogin,
  setToken,
  getToken,
  removeToken,
  setUserId,
  getUserId,
  removeUserId,
  logOut,
};
