import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrg } from '@/contexts/OrgContext';
import { ROUTES } from '@/lib/constants';

interface NavItem {
  labelKey: string;
  path: string;
  icon: string;
  orgTypes?: ('SUPPLIER' | 'MERCHANT')[];
}

const navItems: NavItem[] = [
  { labelKey: 'navigation.dashboard', path: ROUTES.DASHBOARD, icon: '📊' },
  {
    labelKey: 'navigation.products',
    path: ROUTES.CATALOG_PRODUCTS,
    icon: '📦',
    orgTypes: ['SUPPLIER'],
  },
  {
    labelKey: 'navigation.suppliers',
    path: ROUTES.CATALOG_SUPPLIERS,
    icon: '🏭',
    orgTypes: ['MERCHANT'],
  },
  {
    labelKey: 'navigation.listings',
    path: ROUTES.LISTINGS,
    icon: '📝',
    orgTypes: ['MERCHANT'],
  },
  {
    labelKey: 'navigation.orders',
    path: '/orders',
    icon: '🛒',
    orgTypes: ['MERCHANT'],
  },
  {
    labelKey: 'navigation.finance',
    path: '/finance',
    icon: '💰',
    orgTypes: ['MERCHANT'],
  },
  {
    labelKey: 'navigation.fulfillments',
    path: ROUTES.FULFILLMENTS,
    icon: '📮',
    orgTypes: ['SUPPLIER'],
  },
  { labelKey: 'navigation.integrations', path: ROUTES.INTEGRATIONS, icon: '🔌' },
];

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { getActiveMembership } = useOrg();
  const activeMembership = getActiveMembership();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.orgTypes) return true;
    if (!activeMembership) return false;
    return item.orgTypes.includes(activeMembership.type);
  });

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold">Dropship Hub</h1>
      </div>
      <nav className="px-3">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          location.pathname.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
