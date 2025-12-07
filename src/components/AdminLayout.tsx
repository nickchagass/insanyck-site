// INSANYCK FASE G-04.2 — Admin Layout com tokens DS (white-label ready)
// src/components/AdminLayout.tsx
import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { 
  Package, 
  FolderTree, 
  Settings, 
  LogOut, 
  User,
  BarChart3,
  ShoppingCart
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const navigation = [
    { name: 'Produtos', href: '/admin/products', icon: Package },
    { name: 'Categorias', href: '/admin/categories', icon: FolderTree },
    { name: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Relatórios', href: '/admin/reports', icon: BarChart3 },
    { name: 'Configurações', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    return router.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[color:var(--ins-bg-base)]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-ds-surface backdrop-blur-xl border-r border-ds-borderSubtle">
        <div className="flex h-16 items-center justify-center border-b border-ds-borderSubtle">
          <h1 className="text-xl font-semibold text-ds-accent tracking-tight">
            INSANYCK Admin
          </h1>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                      transition-all duration-200
                      ${isActive(item.href)
                        ? 'bg-ds-elevated text-ds-accent border border-ds-borderStrong'
                        : 'text-ds-accentSoft hover:text-ds-accent hover:bg-ds-elevated'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User menu */}
        <div className="absolute bottom-0 w-full p-4 border-t border-ds-borderSubtle">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-ds-elevated flex items-center justify-center">
                <User className="h-4 w-4 text-ds-accentSoft" />
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-ds-accent truncate">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-xs text-ds-accentSoft">Admin</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="ml-2 p-1 rounded-md text-ds-accentSoft hover:text-ds-accent hover:bg-ds-elevated transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}