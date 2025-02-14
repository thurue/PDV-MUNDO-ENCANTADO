import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface FloatingCartProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  items?: CartItem[];
  onCheckout?: () => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
}

const FloatingCart = ({
  open = false,
  onOpenChange = () => {},
  items = [],
  onCheckout = () => {},
  onUpdateQuantity = () => {},
  onRemoveItem = () => {},
}: FloatingCartProps) => {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] p-0">
        <SheetHeader className="px-4 py-3 border-b sticky top-0 bg-white z-10">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-600" />
            <span>Carrinho ({items.length} items)</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(90vh-180px)] sm:h-[calc(85vh-180px)]">
          <div className="px-4 py-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-4 border-b last:border-b-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-orange-600 font-bold mt-1">
                    R${item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4 sticky bottom-0 bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-xl font-bold text-orange-600">
              R${total.toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-lg"
            onClick={onCheckout}
            disabled={items.length === 0}
          >
            Finalizar Pedido
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FloatingCart;
