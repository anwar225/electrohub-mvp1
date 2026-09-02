import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  LogOut,
  Zap,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/fournisseurs', label: 'Fournisseurs', icon: FileText },
  { to: '/ventes', label: 'Ventes', icon: ShoppingCart },
  { to: '/stock', label: 'Stock', icon: Package },
];

export function Sidebar() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const uiStore = useUIStore();

  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };

  const content = (
    <div className="flex h-full flex-col bg-primary text-primary-foreground">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-primary-foreground/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15">
          <Zap className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-base font-bold leading-tight">ElectroHub</p>
          <p className="text-[11px] text-primary-foreground/60 leading-tight">
            Gestion simplifiée
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => uiStore.setSidebar(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => uiStore.setSidebar(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-foreground text-primary shadow-sm'
                  : 'text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-primary-foreground/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20 text-sm font-semibold uppercase">
            {authStore.user?.nom?.[0] ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{authStore.user?.nom}</p>
            <p className="truncate text-[11px] text-primary-foreground/60">
              {authStore.user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-[18px] w-[18px]" />
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0">{content}</aside>

      {/* Mobile overlay */}
      {uiStore.sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => uiStore.setSidebar(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
