import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrg } from '@/contexts/OrgContext';

export function OrgSwitcher() {
  const { t } = useTranslation();
  const { activeOrgId, memberships, setActiveOrgId } = useOrg();
  const [isOpen, setIsOpen] = useState(false);

  const activeMembership = memberships.find((m) => m.orgId === activeOrgId);

  if (memberships.length === 0) {
    return <span className="text-sm text-gray-500">{t('organizations.noOrgs')}</span>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <span className="text-sm font-medium">
          {activeMembership?.name || t('organizations.selectOrganization')}
        </span>
        {activeMembership && (
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
            {t(`organizations.types.${activeMembership.type}`)}
          </span>
        )}
        <span className="text-gray-500">▼</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              {memberships.map((membership) => (
                <button
                  key={membership.orgId}
                  onClick={() => {
                    setActiveOrgId(membership.orgId);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                    membership.orgId === activeOrgId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{membership.name}</p>
                      <p className="text-xs text-gray-500">
                        {t(`organizations.types.${membership.type}`)} • {t(`organizations.roles.${membership.role}`)}
                      </p>
                    </div>
                    {membership.orgId === activeOrgId && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
