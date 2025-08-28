// INSANYCK STEP 10 — Admin Dashboard
// src/pages/admin/index.tsx
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { createAuthOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/AdminLayout';
import { prisma } from '@/lib/prisma';
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalVariants: number;
}

interface AdminDashboardProps {
  stats: DashboardStats;
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  const statCards = [
    {
      title: 'Produtos',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-400',
    },
    {
      title: 'Categorias',
      value: stats.totalCategories,
      icon: Users,
      color: 'text-green-400',
    },
    {
      title: 'Pedidos',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-purple-400',
    },
    {
      title: 'Variantes',
      value: stats.totalVariants,
      icon: TrendingUp,
      color: 'text-orange-400',
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
          <p className="text-white/60 mt-2">Visão geral do sistema INSANYCK</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/60">{stat.title}</p>
                    <p className="text-2xl font-semibold text-white mt-1">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/products/new"
              className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <Package className="h-5 w-5 mr-2" />
              Novo Produto
            </a>
            <a
              href="/admin/categories"
              className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <Users className="h-5 w-5 mr-2" />
              Gerenciar Categorias
            </a>
            <a
              href="/admin/orders"
              className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Ver Pedidos
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const authOptions = await createAuthOptions();
  const session = await getServerSession(context.req, context.res, authOptions);

  // INSANYCK STEP 10 — Verificar se é admin
  if (!session?.user || (session.user as any)?.role !== 'admin') {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const [totalProducts, totalCategories, totalOrders, totalVariants] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.variant.count(),
    ]);

    return {
      props: {
        stats: {
          totalProducts,
          totalCategories,
          totalOrders,
          totalVariants,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      props: {
        stats: {
          totalProducts: 0,
          totalCategories: 0,
          totalOrders: 0,
          totalVariants: 0,
        },
      },
    };
  }
};