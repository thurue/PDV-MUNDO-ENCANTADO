import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    nm_catalogo: string; // Removido o opcional
    total_quantity: number;
    total_value: number;
  }>;
}

interface Catalogo {
  nm_catalogo: string; // Removido o opcional
}

interface Sale {
  id_venda: number;
  created_at: string;
  vlr_transaction: number;
  quantidade: number;
  catalogo: Catalogo; // Alterado para usar a interface Catalogo
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data: salesData, error: salesError } = await supabase
        .from("vendas")
        .select(
          `
          id_venda,
          vlr_transaction,
          quantidade,
          created_at,
          catalogo:id_catalogo(nm_catalogo)
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (salesError) throw salesError;

      // Tipagem explícita e transformação dos dados
      const typedSalesData: Sale[] = (salesData || []).map((sale: any) => ({
        id_venda: sale.id_venda,
        created_at: sale.created_at,
        vlr_transaction: sale.vlr_transaction || 0,
        quantidade: sale.quantidade || 0,
        catalogo: {
          nm_catalogo: sale.catalogo?.nm_catalogo || "",
        },
      }));

      setSales(typedSalesData);

      const totalSales = typedSalesData.reduce(
        (sum, sale) => sum + sale.vlr_transaction,
        0
      );
      const totalOrders = typedSalesData.length;

      // Calculate top products com tipagem correta
      const productStats: Record<
        string,
        { total_quantity: number; total_value: number }
      > = {};

      typedSalesData.forEach((sale) => {
        const productName = sale.catalogo.nm_catalogo;
        if (!productStats[productName]) {
          productStats[productName] = { total_quantity: 0, total_value: 0 };
        }
        productStats[productName].total_quantity += sale.quantidade;
        productStats[productName].total_value += sale.vlr_transaction;
      });

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

  const handleDelete = async () => {
    if (!selectedSale) return;

    try {
      const { error } = await supabase
        .from("vendas")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id_venda", selectedSale.id_venda);

      if (error) throw error;

      setDeleteDialogOpen(false);
      fetchMetrics();
    } catch (error) {
      console.error("Error deleting sale:", error);
      alert("Erro ao deletar venda. Por favor, tente novamente.");
    }
  };

  const openDeleteDialog = (sale: Sale) => {
    setSelectedSale(sale);
    setDeleteDialogOpen(true);
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sales.map((sale) => (
              <div
                key={sale.id_venda}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {sale.catalogo?.nm_catalogo}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(sale.created_at).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm">{sale.quantidade} unidades</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium text-orange-600">
                    R${sale.vlr_transaction.toFixed(2)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => openDeleteDialog(sale)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta venda? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
