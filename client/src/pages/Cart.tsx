import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, FileDown, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/lib/types";

const WHATSAPP_FALLBACK = "+96879062219";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();

  const { data: config } = useQuery<{ whatsappNumber: string }>({
    queryKey: ["config"],
    queryFn: () => apiJson<{ whatsappNumber: string }>("/api/config"),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiJson<Category[]>("/api/categories"),
  });

  const whatsappNumber = config?.whatsappNumber || WHATSAPP_FALLBACK;

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "";
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : "";
  };

  const handleWhatsAppInquiry = () => {
    toast({ title: "Opening WhatsApp...", description: "Redirecting you to WhatsApp with your inquiry." });

    const origin = window.location.origin;
    const header = "Hi, I'd like to inquire about the following products:";
    const itemsList = cart.map(item => {
      const productUrl = `${origin}/products/${item.product.slug}`;
      const catName = getCategoryName(item.product.categoryId);
      const catLine = catName ? `  Category: ${catName}\n` : "";
      return `\u2022 *${item.product.name}*\n  P/N: ${item.product.partNumber}\n  Qty: ${item.quantity}\n${catLine}  Link: ${productUrl}`;
    }).join("\n\n");
    const totalItems = cart.reduce((a, b) => a + b.quantity, 0);
    const footer = `\n---\nTotal: ${totalItems} items (${cart.length} products)\nSent from: ${origin}/cart\nDate: ${new Date().toLocaleString()}`;
    const message = `${header}\n\n${itemsList}\n${footer}`;
    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedMessage}`, '_blank');
  };

  const handleDownloadPDF = async () => {
    toast({ title: "Generating PDF...", description: "Creating your inquiry list PDF." });

    let jsPDF: any, autoTable: any;
    try {
      jsPDF = (await import("jspdf")).default;
      autoTable = (await import("jspdf-autotable")).default;
    } catch {
      toast({ title: "Error", description: "Failed to load PDF generator. Please try again.", variant: "destructive" });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const addLogoToDoc = (): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const imgData = canvas.toDataURL("image/png");
          const logoHeight = 14;
          const logoWidth = (img.width / img.height) * logoHeight;
          doc.addImage(imgData, "PNG", 14, 10, logoWidth, logoHeight);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = "/images/pdf-logo.png";
      });
    };

    await addLogoToDoc();

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 15, { align: "right" });
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, pageWidth - 14, 20, { align: "right" });
    doc.setTextColor(0);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Product Inquiry List", 14, 38);

    const tableData = cart.map((item, index) => {
      const catName = getCategoryName(item.product.categoryId);
      return [
        (index + 1).toString(),
        item.product.name,
        item.product.partNumber,
        catName || "-",
        item.quantity.toString(),
      ];
    });

    autoTable(doc, {
      startY: 44,
      head: [["#", "Product Name", "Part Number", "Category", "Qty"]],
      body: tableData,
      headStyles: {
        fillColor: [200, 30, 60],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [250, 245, 245] },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 65 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { cellWidth: 18, halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 100;

    doc.setDrawColor(200);
    doc.line(14, finalY + 6, pageWidth - 14, finalY + 6);

    const totalItems = cart.reduce((a, b) => a + b.quantity, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Items: ${totalItems}`, 14, finalY + 14);
    doc.text(`Unique Products: ${cart.length}`, 14, finalY + 20);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130);
    doc.text("This is an inquiry list, not a purchase order. Contact our sales team for pricing.", 14, finalY + 30);
    doc.text(`WhatsApp: ${whatsappNumber}`, 14, finalY + 35);

    doc.save(`Monipack-Inquiry-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast({ title: "PDF downloaded", description: "Your inquiry list PDF has been saved." });
  };

  const handleSendPDFViaWhatsApp = async () => {
    await handleDownloadPDF();

    toast({
      title: "PDF downloaded",
      description: "Now attach the PDF in the WhatsApp chat that will open.",
    });

    setTimeout(() => {
      const message = encodeURIComponent("Hi, please find my inquiry list attached as PDF.");
      const cleanNum = whatsappNumber.replace(/[^0-9]/g, '');
      window.open(`https://api.whatsapp.com/send?phone=${cleanNum}&text=${message}`, '_blank');
      toast({ title: "Opening WhatsApp...", description: "Attach the downloaded PDF in the chat." });
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2" data-testid="text-empty-cart">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any products to your inquiry list yet.</p>
        <Link href="/products"><Button size="lg" data-testid="button-browse-products">Browse Products</Button></Link>
      </div>
    );
  }

  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8" data-testid="text-inquiry-title">Your Inquiry List</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.product.id} className="overflow-hidden" data-testid={`card-cart-item-${item.product.id}`}>
              <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="w-full sm:w-32 aspect-square bg-muted">
                  <img src={item.product.images?.[0] || "/images/packaging_1.jpg"} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="font-heading font-semibold text-lg hover:text-primary transition-colors">{item.product.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">P/N: {item.product.partNumber}</p>
                      {item.product.categoryId && (
                        <p className="text-xs text-muted-foreground mt-0.5">{getCategoryName(item.product.categoryId)}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.product.id)} data-testid={`button-remove-${item.product.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} data-testid={`button-decrease-${item.product.id}`}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm font-medium" data-testid={`text-quantity-${item.product.id}`}>{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} data-testid={`button-increase-${item.product.id}`}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={clearCart} className="text-muted-foreground" data-testid="button-clear-cart">Clear List</Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="font-heading font-bold text-xl mb-4" data-testid="text-summary-title">Inquiry Summary</h2>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Items</span><span className="font-medium" data-testid="text-total-items">{totalItems}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Unique Products</span><span className="font-medium" data-testid="text-unique-products">{cart.length}</span></div>
              </div>
              <Separator className="my-4" />

              <div className="bg-muted/50 p-4 rounded-lg mb-6 text-sm text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">Next Steps:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Review your item list</li>
                  <li>Send inquiry via WhatsApp or download PDF</li>
                  <li>Our sales team will get back to you</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                  onClick={handleWhatsAppInquiry}
                  data-testid="button-whatsapp-inquiry"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.319 0-4.48-.67-6.32-1.82l-.44-.27-2.633.883.883-2.633-.27-.44A9.965 9.965 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  Send Inquiry on WhatsApp
                </Button>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDownloadPDF}
                    data-testid="button-download-pdf"
                  >
                    <FileDown className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSendPDFViaWhatsApp}
                    data-testid="button-send-pdf-whatsapp"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> PDF via WhatsApp
                  </Button>
                </div>
              </div>

              <p className="text-xs text-center mt-4 text-muted-foreground">No payment is processed on this website. All transactions are handled directly with our sales team.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
