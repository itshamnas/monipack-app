import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* ---- LOGO + ABOUT ---- */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/mni-logo.png"
                alt="MNI Logo"
                width={160}
                height={70}
                className="object-contain"
              />
            </Link>

            <p className="text-sm text-gray-500 mt-2">
              MOROOJ NIZWA INTERNATIONAL LLC — <br />
              Parent Company
            </p>
          </div>

          {/* ---- QUICK LINKS ---- */}
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

          {/* ---- SUPPORT ---- */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:support@monipack.com" className="hover:text-primary transition-colors">support@monipack.com</
