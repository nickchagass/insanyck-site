// INSANYCK STEP 10 — Admin Products List
// src/pages/admin/products/index.tsx
import { useState, useEffect, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { createAuthOptions } from '@/pages/api/auth/[...nextauth]';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  category?: {
    name: string;
  };
  _count: {
    variants: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data: ProductsResponse = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${colors[status as keyof typeof colors] || colors.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white">Produtos</h1>
            <p className="text-white/60 mt-2">Gerencie o catálogo de produtos</p>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Products table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full mx-auto"></div>
              <p className="text-white/60 mt-2">Carregando produtos...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Produto</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Categoria</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Variantes</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Atualizado</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-white/80">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{product.title}</p>
                            <p className="text-white/60 text-sm">/{product.slug}</p>
                            {product.isFeatured && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                                Destaque
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(product.status)}
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {product.category?.name || '—'}
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {product._count.variants}
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {formatDate(product.updatedAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/produto/${product.slug}`}
                              target="_blank"
                              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Ver produto"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Editar produto"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Deletar produto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-sm text-white/60">
                    Mostrando {products.length} de {pagination.total} produtos
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 hover:bg-white/20 transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="px-3 py-1 text-white/80">
                      {currentPage} de {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white disabled:opacity-50 hover:bg-white/20 transition-colors"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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

  return { props: {} };
};