import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    nm_catalogo: string;
    total_quantity: number;
    total_value: number;
  }>;
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch total sales and orders
      const { data: salesData, error: salesError } = await supabase
        .from("vendas")
        .select(
          `
          id_venda,
          vlr_transaction,
          quantidade,
          catalogo:id_catalogo(nm_catalogo)
        `,
        )
        .is("deleted_at", null);

      if (salesError) throw salesError;

      const totalSales = salesData.reduce(
        (sum, sale) => sum + (sale.vlr_transaction || 0),
        0,
      );
      const totalOrders = salesData.length;

      // Calculate top products
      const productStats = salesData.reduce(
        (acc, sale) => {
          const productName = sale.catalogo?.nm_catalogo;
          if (!productName) return acc;

          if (!acc[productName]) {
            acc[productName] = { total_quantity: 0, total_value: 0 };
          }

          acc[productName].total_quantity += sale.quantidade || 0;
          acc[productName].total_value += sale.vlr_transaction || 0;

          return acc;
        },
        {} as Record<string, { total_quantity: number; total_value: number }>,
      );

      const topProductsList = Object.entries(productStats)
        .map(([nm_catalogo, stats]) => ({
          nm_catalogo,
          ...stats,
        }))
        .sort((a, b) => b.total_value - a.total_value)
        .slice(0, 5);

      setMetrics({
        totalSales,
        totalOrders,
        averageOrderValue: totalOrders ? totalSales / totalOrders : 0,
        topProducts: topProductsList,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard de Vendas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Vendas Totais
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R${metrics.totalSales.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total de Pedidos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R${metrics.averageOrderValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topProducts.map((product) => (
              <div
                key={product.nm_catalogo}
                className="flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{product.nm_catalogo}</p>
                  <p className="text-sm text-gray-500">
                    {product.total_quantity} unidades vendidas
                  </p>
                </div>
                <div className="text-sm font-medium text-orange-600">
                  R${product.total_value.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
