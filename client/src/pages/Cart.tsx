import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, Send, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const { data: config } = useQuery<{ whatsappNumber: string }>({
    queryKey: ["config"],
    queryFn: () => fetch("/api/config").then(r => r.json()),
  });

  const handleWhatsAppInquiry = () => {
    const header = "Please share your name, phone number, and delivery location.";
    const itemsList = cart.map(item =>
      `• ${item.product.name} (P/N: ${item.product.partNumber}) - Qty: ${item.quantity}`
    ).join("\n");
    const footer = `Source: ${window.location.origin}/cart\nTime: ${new Date().toLocaleString()}`;
    const message = `${header}\n\n*Product Inquiry:*\n${itemsList}\n\n${footer}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${config?.whatsappNumber || "1234567890"}?text=${encodedMessage}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any products to your inquiry list yet.</p>
        <Link href="/products"><Button size="lg">Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">Your Inquiry List</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.product.id} className="overflow-hidden">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="w-full sm:w-32 aspect-square bg-muted">
                  <img src={item.product.images?.[0] || "/images/packaging_1.jpg"} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-heading font-semibold text-lg">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">P/N: {item.product.partNumber}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={clearCart} className="text-muted-foreground">Clear List</Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="font-heading font-bold text-xl mb-4">Inquiry Summary</h2>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Items</span><span className="font-medium">{cart.reduce((a, b) => a + b.quantity, 0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Unique Products</span><span className="font-medium">{cart.length}</span></div>
              </div>
              <Separator className="my-4" />
              <div className="bg-muted/50 p-4 rounded-lg mb-6 text-sm text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">Next Steps:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Review your item list</li>
                  <li>Click "Send Inquiry" below</li>
                  <li>WhatsApp will open with your pre-filled list</li>
                </ol>
              </div>
              <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" onClick={handleWhatsAppInquiry}>
                <Send className="mr-2 h-4 w-4" /> Send Inquiry on WhatsApp
              </Button>
              <p className="text-xs text-center mt-4 text-muted-foreground">No payment is processed on this website. All transactions are handled directly with our sales team.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
