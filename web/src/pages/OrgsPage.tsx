import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserOrgs } from '@/hooks/useUserOrgs';
import { useOrg } from '@/contexts/OrgContext';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageContainer } from '@/components/common/PageContainer';

export function OrgsPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useUserOrgs();
  const { setActiveOrgId, setMemberships, activeOrgId } = useOrg();

  useEffect(() => {
    if (data?.orgs) {
      setMemberships(data.orgs);
      
      // If user has only one org, auto-select it
      if (data.orgs.length === 1 && !activeOrgId) {
        setActiveOrgId(data.orgs[0]!.orgId);
        navigate('/dashboard');
      }
    }
  }, [data, setMemberships, setActiveOrgId, activeOrgId, navigate]);

  const handleSelectOrg = (orgId: string) => {
    setActiveOrgId(orgId);
    navigate('/dashboard');
  };

  if (isLoading) {
    return <LoadingState message="Loading your organizations..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Failed to load organizations"
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PageContainer
        title="Select Organization"
        description="Choose which organization you want to work with"
      >
        <div className="max-w-2xl mx-auto">
          <div className="grid gap-4">
            {data?.orgs.map((org) => (
              <button
                key={org.orgId}
                onClick={() => handleSelectOrg(org.orgId)}
                className={`p-6 bg-white rounded-lg border-2 transition-all hover:border-blue-500 hover:shadow-md text-left ${
                  activeOrgId === org.orgId
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {org.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {org.type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {org.role}
                      </span>
                    </div>
                  </div>
                  {activeOrgId === org.orgId && (
                    <div className="text-blue-600 text-2xl">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {data?.orgs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                You don't belong to any organizations yet.
              </p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
