import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface Category {
  id_categoria: string;
  nm_categoria: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  id_categoria: string; // Adicionado para corresponder ao filtro usado
}

interface ProductGridProps {
  products?: any[];
  onQuantityChange?: (id: string, quantity: number) => void;
  quantities?: Record<string, number>;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products = [],
  onQuantityChange = () => {},
  quantities = {},
}: ProductGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categorias").select("*");

      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, []);

  const filteredProducts =
    selectedCategory === ""
      ? products
      : products.filter((p) => p.id_categoria === selectedCategory);

  return (
    <div className="bg-orange-50 min-h-screen p-2 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => setSelectedCategory("")}
            className={
              selectedCategory === "" ? "bg-orange-600 hover:bg-orange-700" : ""
            }
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id_categoria}
              variant={
                selectedCategory === category.id_categoria
                  ? "default"
                  : "outline"
              }
              onClick={() => setSelectedCategory(category.id_categoria)}
              className={
                selectedCategory === category.id_categoria
                  ? "bg-orange-600 hover:bg-orange-700"
                  : ""
              }
            >
              {category.nm_categoria}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              quantity={quantities[product.id] || 0}
              onQuantityChange={onQuantityChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
