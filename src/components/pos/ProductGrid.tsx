import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

interface ProductGridProps {
  products?: Product[];
  onQuantityChange?: (id: string, quantity: number) => void;
  quantities?: Record<string, number>;
}

const ProductGrid = ({
  products = [],
  onQuantityChange = () => {},
  quantities = {},
}: ProductGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Get unique categories from products
    const uniqueCategories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean)),
    );
    setCategories(uniqueCategories);
  }, [products]);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="bg-orange-50 min-h-screen p-2 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className={
              selectedCategory === "all"
                ? "bg-orange-600 hover:bg-orange-700"
                : ""
            }
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-orange-600 hover:bg-orange-700"
                  : ""
              }
            >
              {category}
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
