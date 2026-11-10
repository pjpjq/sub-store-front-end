export const DEFAULT_API_REQUEST_TIMEOUT = 50000;

export const getApiRequestTimeout = () => {
  const timeout = Number(localStorage.getItem('apiRequestTimeout'));

  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_API_REQUEST_TIMEOUT;
};

export const DEFAULT_API_CHECK_TIMEOUT = 15000;

export const getApiCheckTimeout = () => {
  const timeout = localStorage.getItem('timeout');

  return timeout ? parseInt(timeout, 10) : DEFAULT_API_CHECK_TIMEOUT;
};
