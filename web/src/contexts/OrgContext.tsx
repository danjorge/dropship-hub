import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/lib/utils/storage';
import { authApi } from '@/lib/api/auth';
import type { OrgMembership } from '@/types';

interface OrgContextType {
  activeOrgId: string | null;
  memberships: OrgMembership[];
  setActiveOrgId: (orgId: string) => void;
  setMemberships: (memberships: OrgMembership[]) => void;
  clearOrg: () => void;
  getActiveMembership: () => OrgMembership | undefined;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);

  useEffect(() => {
    // Initialize org state from localStorage
    const orgId = storage.getActiveOrgId();
    setActiveOrgIdState(orgId);
    
    // Fetch user's organizations if token exists
    const token = storage.getAccessToken();
    if (token) {
      authApi.getUserOrgs()
        .then(response => {
          setMemberships(response.orgs);
        })
        .catch(() => {
          // Failed to fetch orgs, might be invalid token
          console.error('Failed to fetch user organizations');
        });
    }
  }, []);

  const setActiveOrgId = (orgId: string) => {
    storage.setActiveOrgId(orgId);
    setActiveOrgIdState(orgId);
  };

  const clearOrg = () => {
    storage.removeActiveOrgId();
    setActiveOrgIdState(null);
  };

  const getActiveMembership = (): OrgMembership | undefined => {
    if (!activeOrgId) return undefined;
    return memberships.find((m) => m.orgId === activeOrgId);
  };

  const value: OrgContextType = {
    activeOrgId,
    memberships,
    setActiveOrgId,
    setMemberships,
    clearOrg,
    getActiveMembership,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
