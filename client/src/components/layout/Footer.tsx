import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="/images/mni-logo.png" 
              alt="MNI Logo"
              className="h-32 md:h-40 w-auto object-contain bg-transparent"
            />
            <p className="text-sm font-medium text-foreground/80 max-w-xs mt-3">
              MOROOJ NIZWA INTERNATIONAL LLC
            </p>
            <p className="text-xs text-muted-foreground mt-1">Parent Company</p>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/category/industrial-packaging" className="hover:text-primary transition-colors">Industrial Packaging</Link></li>
              <li><Link href="/category/food-containers" className="hover:text-primary transition-colors">Food Containers</Link></li>
              <li><Link href="/category/eco-friendly" className="hover:text-primary transition-colors">Eco-Friendly</Link></li>
              <li><Link href="/admin/login" className="hover:text-primary transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:support@monipack.com" className="hover:text-primary transition-colors">support@monipack.com</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/monipackoman/?hl=en" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/109757724/admin/dashboard/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/moroojnizwainternational/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://x.com/monipackoman" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://whatsapp.com/channel/0029VbAgW6x1XquRijzWRD2K" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} monipack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
