import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader2 } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  items?: OrderItem[];
  onConfirm?: () => void;
  onCancel?: () => void;
  processing?: boolean;
  confirmed?: boolean;
}

const CheckoutDialog = ({
  open = true,
  onOpenChange = () => {},
  items = [
    {
      id: "1",
      name: "Pão de Queijo",
      price: 5.99,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1598142982901-df6cec8aa473?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: "2",
      name: "Canjica",
      price: 4.5,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1528975604071-b4dc52d2104d?auto=format&fit=crop&q=80&w=400",
    },
  ],
  onConfirm = () => {},
  onCancel = () => {},
  processing = false,
  confirmed = false,
}: CheckoutDialogProps) => {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-600">
            {confirmed ? "Pedido Confirmado!" : "Confirmar Pedido"}
          </DialogTitle>
        </DialogHeader>

        {confirmed ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-lg text-center">
              Seu pedido foi confirmado com sucesso!
            </p>
            <Button className="w-full mt-4" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[400px] pr-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center py-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x R${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    R${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </ScrollArea>

            <Separator className="my-4" />

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span className="text-orange-600">R${total.toFixed(2)}</span>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={processing}
              >
                Cancelar
              </Button>
              <Button
                onClick={onConfirm}
                disabled={processing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando
                  </>
                ) : (
                  "Confirmar Pedido"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
