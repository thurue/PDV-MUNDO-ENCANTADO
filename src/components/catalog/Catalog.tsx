import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductDialog, { ProductFormData } from "./ProductDialog";
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

interface Product {
  id_catalogo: number;
  nm_catalogo: string;
  descricao: string;
  vlr_item: number;
  img_catalogo: string;
  categoria: string;
  estoque: number;
}

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("catalogo")
        .select("*")
        .is("deleted_at", null);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: ProductFormData) => {
    try {
      const { error } = await supabase.from("catalogo").insert([
        {
          nm_catalogo: data.nm_catalogo,
          descricao: data.descricao,
          vlr_item: data.vlr_item,
          img_catalogo: data.img_catalogo,
          estoque: data.estoque,
          created_at: new Date().toISOString(),
          deleted_at: null,
          id_categoria: data.id_categoria,
        },
      ]);
      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  };

  const handleUpdate = async (data: ProductFormData) => {
    if (!selectedProduct) return;
    try {
      const { error } = await supabase
        .from("catalogo")
        .update(data)
        .eq("id_catalogo", selectedProduct.id_catalogo);
      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      const { error } = await supabase
        .from("catalogo")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id_catalogo", selectedProduct.id_catalogo);
      if (error) throw error;
      setDeleteDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const openCreateDialog = () => {
    setMode("create");
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setMode("edit");
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
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
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Catálogo de Produtos
        </h1>
        <Button
          onClick={openCreateDialog}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id_catalogo}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="aspect-[4/3] relative">
              <img
                src={product.img_catalogo || "https://via.placeholder.com/400"}
                alt={product.nm_catalogo}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">
                {product.nm_catalogo}
              </h3>
              <p className="text-orange-600 font-bold mb-2">
                R${product.vlr_item.toFixed(2)}
              </p>
              {product.descricao && (
                <p className="text-gray-600 text-sm mb-2">
                  {product.descricao}
                </p>
              )}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Estoque: {product.estoque || 0}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => openDeleteDialog(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={mode === "create" ? handleCreate : handleUpdate}
        initialData={selectedProduct}
        mode={mode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "
              {selectedProduct?.nm_catalogo}"? Esta ação não pode ser desfeita.
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

export default Catalog;
