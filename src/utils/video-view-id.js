import { v4 as uuidv4 } from 'uuid';
export const getVideoViewId = () => {
  return uuidv4().replace(/-/g, '');
};
