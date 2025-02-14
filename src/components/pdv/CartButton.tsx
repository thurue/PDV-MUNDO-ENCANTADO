import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartButtonProps {
  itemCount: number;
  total: number;
  onClick: () => void;
}

const CartButton = ({ itemCount = 0, total = 0, onClick }: CartButtonProps) => {
  if (itemCount === 0) return null;

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 left-4 right-4 h-14 bg-orange-600 hover:bg-orange-700 text-white shadow-lg md:w-auto md:left-auto md:px-6"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="font-medium">{itemCount} items</span>
        </div>
        <span className="font-bold">R${total.toFixed(2)}</span>
      </div>
    </Button>
  );
};

export default CartButton;
