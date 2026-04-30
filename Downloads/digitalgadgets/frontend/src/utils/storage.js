const LOCAL_KEY = "digital-gadgets-auth";
const SESSION_KEY = "digital-gadgets-session";
const THEME_KEY = "digital-gadgets-theme";

const parseItem = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getStoredAuth = () =>
  parseItem(localStorage.getItem(LOCAL_KEY)) ||
  parseItem(sessionStorage.getItem(SESSION_KEY));

export const setStoredAuth = (payload, rememberMe) => {
  localStorage.removeItem(LOCAL_KEY);
  sessionStorage.removeItem(SESSION_KEY);

  const target = rememberMe ? localStorage : sessionStorage;
  target.setItem(rememberMe ? LOCAL_KEY : SESSION_KEY, JSON.stringify(payload));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(LOCAL_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

export const getStoredTheme = () => localStorage.getItem(THEME_KEY) || "dark";

export const setStoredTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
};
