import { v4 as uuidv4 } from 'uuid';

const CLD_ANALYTICS_USER_ID_KEY = 'cld-analytics-user-id';

export const getUserId = () => {
  const storageUserId = window.localStorage.getItem(CLD_ANALYTICS_USER_ID_KEY);

  if (storageUserId) {
    return storageUserId;
  }

  const userId = uuidv4().replace(/-/g, '');
  window.localStorage.setItem(CLD_ANALYTICS_USER_ID_KEY, userId);
  return userId;
};
