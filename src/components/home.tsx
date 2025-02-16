import { useState, useEffect } from "react";
import ProductGrid from "./pdv/ProductGrid";
import FloatingCart from "./pdv/FloatingCart";
import CartButton from "./pdv/CartButton";
import CheckoutDialog from "./pdv/CheckoutDialog";
import { supabase } from "@/lib/supabase";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Product {
  id_catalogo: number;
  nm_catalogo: string;
  vlr_item: number;
  img_catalogo: string;
  id_categoria: number;
  categoria: string;
}

function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("catalogo")
      .select("*")
      .is("deleted_at", null);
    if (data) {
      setProducts(data);
    }
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    const product = products.find((p) => p.id_catalogo.toString() === id);
    if (!product) return;

    if (quantity === 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        );
      }
      return [
        ...prev,
        {
          id: id,
          name: product.nm_catalogo,
          price: product.vlr_item,
          image: product.img_catalogo || "",
          id_categoria: product.id_categoria || "",
          quantity,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirmOrder = async () => {
    setProcessing(true);
    try {
      // Create sales records for each item
      const salesData = cartItems.map((item) => ({
        id_catalogo: parseInt(item.id),
        quantidade: item.quantity,
        vlr_transaction: item.price * item.quantity,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("vendas").insert(salesData);

      if (error) throw error;

      setConfirmed(true);
      setTimeout(() => {
        setShowCheckout(false);
        setCartItems([]);
        setConfirmed(false);
      }, 2000);
    } catch (error) {
      console.error("Error processing order:", error);
    } finally {
      setProcessing(false);
    }
  };

  const quantities = Object.fromEntries(
    cartItems.map((item) => [item.id, item.quantity]),
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const mappedProducts = products.map((p) => ({
    id: p.id_catalogo.toString(),
    name: p.nm_catalogo,
    price: p.vlr_item,
    image: p.img_catalogo || "",
    category: p.categoria || "",
    id_categoria: p.id_categoria,
  }));

  return (
    <div className="w-screen min-h-screen bg-orange-50 pb-24">
      <ProductGrid
        products={mappedProducts}
        onQuantityChange={handleQuantityChange}
        quantities={quantities}
      />

      <CartButton
        itemCount={itemCount}
        total={total}
        onClick={() => setShowCart(true)}
      />

      <FloatingCart
        open={showCart}
        onOpenChange={setShowCart}
        items={cartItems}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
      />

      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
        items={cartItems}
        onConfirm={handleConfirmOrder}
        onCancel={() => setShowCheckout(false)}
        processing={processing}
        confirmed={confirmed}
      />
    </div>
  );
}

export default Home;
