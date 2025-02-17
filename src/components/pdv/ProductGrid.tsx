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
  id_categoria: string;
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
        <div className="relative w-full overflow-x-auto pb-4">
          <div className="flex gap-2 snap-x snap-mandatory overflow-x-auto scrollbar-none">
            <div className="snap-start scroll-ml-2 shrink-0">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => setSelectedCategory("")}
                className={`min-w-[100px] ${selectedCategory === "" ? "bg-orange-600 hover:bg-orange-700" : ""}`}
              >
                Todos
              </Button>
            </div>
            {categories.map((category) => (
              <div key={category.id_categoria} className="snap-start shrink-0">
                <Button
                  variant={
                    selectedCategory === category.id_categoria
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setSelectedCategory(category.id_categoria)}
                  className={`min-w-[100px] ${
                    selectedCategory === category.id_categoria
                      ? "bg-orange-600 hover:bg-orange-700"
                      : ""
                  }`}
                >
                  {category.nm_categoria}
                </Button>
              </div>
            ))}
          </div>
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
