import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

interface ShareButtonProps {
  product: Product;
  variant?: "icon" | "default";
  className?: string;
}

export function ShareButton({ product, variant = "icon", className = "" }: ShareButtonProps) {
  const { toast } = useToast();

  const getProductUrl = () => {
    const origin = window.location.origin;
    return `${origin}/products/${product.slug}`;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = getProductUrl();
    const shareData = {
      title: `${product.name} - Monipack`,
      text: `Check out ${product.name} (P/N: ${product.partNumber}) from Monipack`,
      url,
    };

    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Product link copied to clipboard." });
    } catch {
      toast({ title: "Share", description: url, variant: "default" });
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="secondary"
        size="icon"
        className={`rounded-full h-10 w-10 ${className}`}
        onClick={handleShare}
        data-testid={`share-product-${product.id}`}
      >
        <Share2 className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={handleShare}
      data-testid={`share-product-${product.id}`}
    >
      <Share2 className="mr-2 h-4 w-4" /> Share
    </Button>
  );
}
