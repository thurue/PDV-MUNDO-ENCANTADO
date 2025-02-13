import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  onQuantityChange?: (id: string, newQuantity: number) => void;
}

const ProductCard = ({
  id = "1",
  name = "Pão de Queijo",
  price = 5.99,
  image = "https://images.unsplash.com/photo-1598142982901-df6cec8aa473?auto=format&fit=crop&q=80&w=400",
  quantity = 0,
  onQuantityChange = () => {},
}: ProductCardProps) => {
  const handleIncrement = () => {
    onQuantityChange(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(id, quantity - 1);
    }
  };

  return (
    <Card className="w-full bg-white overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2">
            {name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-base md:text-xl font-bold text-orange-600">
              R${price.toFixed(2)}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={quantity === 0}
                className="h-8 w-8"
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                className="h-8 w-8"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
