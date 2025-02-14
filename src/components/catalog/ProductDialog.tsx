import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: ProductFormData;
  mode: "create" | "edit";
}

interface Category {
  id_categoria: number;
  nm_categoria: string;
}

export interface ProductFormData {
  nm_catalogo: string;
  descricao: string;
  vlr_item: number;
  img_catalogo: string;
  id_categoria: number | null;
  categoria: string;
  estoque: number;
}

const ProductDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: ProductDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    nm_catalogo: "",
    descricao: "",
    vlr_item: 0,
    img_catalogo: "",
    id_categoria: null,
    categoria: "",
    estoque: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nm_catalogo: "",
        descricao: "",
        vlr_item: 0,
        img_catalogo: "",
        id_categoria: null,
        categoria: "",
        estoque: 0,
      });
    }
  }, [initialData, open]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .is("deleted_at", null)
      .order("nm_categoria");

    if (!error && data) {
      setCategories(data);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadProgress(0);
      const fileExt = file.name.split(".").pop();
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
      const fileName = `${uniqueId}.${fileExt}`;
      const filePath = `img_catalogos/${fileName}`;

      // Delete old image if exists and is in our storage
      if (
        formData.img_catalogo &&
        formData.img_catalogo.includes("product-images")
      ) {
        const oldPath = formData.img_catalogo.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("product-images")
            .remove([`img_catalogos/${oldPath}`]);
        }
      }

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      setFormData({ ...formData, img_catalogo: publicUrl });
      setUploadProgress(0);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadProgress(0);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF, WEBP)",
      );
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert(
        "O arquivo é muito grande. Por favor, selecione uma imagem com menos de 5MB.",
      );
      return;
    }

    await handleImageUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.img_catalogo) {
      alert("Por favor, adicione uma imagem para o produto.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(
      (c) => c.id_categoria.toString() === categoryId,
    );
    if (category) {
      setFormData({
        ...formData,
        id_categoria: category.id_categoria,
        categoria: category.nm_categoria,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Adicionar Produto" : "Editar Produto"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.nm_catalogo}
              onChange={(e) =>
                setFormData({ ...formData, nm_catalogo: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.descricao || ""}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.vlr_item}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vlr_item: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                value={formData.estoque || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estoque: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.id_categoria?.toString()}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id_categoria}
                    value={category.id_categoria.toString()}
                  >
                    {category.nm_categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <div className="flex flex-col gap-4">
              {formData.img_catalogo && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <img
                    src={formData.img_catalogo}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadProgress > 0 ? (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-orange-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                ) : (
                  <>
                    {formData.img_catalogo ? (
                      <ImageIcon className="mr-2 h-4 w-4" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {formData.img_catalogo
                      ? "Trocar imagem"
                      : "Carregar imagem"}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadProgress > 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Adicionar" : "Salvar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ProductDialog;
