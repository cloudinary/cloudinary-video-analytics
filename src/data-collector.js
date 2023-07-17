import { setupLegacyDataCollector } from './legacy-data-collector';

export const setupDataCollector = (data, flushEvents, sendData) => {
  // THERE SHOULD BE NEW LOGIC FOR INTERVAL THAT SENDS DATA EVERY X SECONDS
  return setupLegacyDataCollector(data, flushEvents, sendData);
};
