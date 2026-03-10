import { STORAGE_KEYS } from '../constants';

export const storage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  removeAccessToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getActiveOrgId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ORG_ID);
  },

  setActiveOrgId: (orgId: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ORG_ID, orgId);
  },

  removeActiveOrgId: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORG_ID);
  },

  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ORG_ID);
  },
};
