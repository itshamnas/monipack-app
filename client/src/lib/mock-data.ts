
export interface Product {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  price?: number;
  category: string;
  images: string[];
  inStock: boolean;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export const CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Industrial Packaging",
    slug: "industrial-packaging",
    image: "/images/packaging_1.jpg", // Placeholder
    description: "Heavy-duty solutions for industrial shipping."
  },
  {
    id: "2",
    name: "Food Containers",
    slug: "food-containers",
    image: "/images/packaging_2.jpg",
    description: "Safe and secure storage for food products."
  },
  {
    id: "3",
    name: "Eco-Friendly",
    slug: "eco-friendly",
    image: "/images/packaging_3.jpg",
    description: "Sustainable packaging for a greener future."
  },
  {
    id: "4",
    name: "Custom Boxes",
    slug: "custom-boxes",
    image: "/images/packaging_4.jpg",
    description: "Branded boxes tailored to your needs."
  }
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Corrugated Shipping Box",
    partNumber: "MP-BX-001",
    description: "Double-wall corrugated cardboard box designed for heavy items. Dimensions: 24x24x24 inches. High crush resistance.",
    category: "industrial-packaging",
    images: ["/images/packaging_1.jpg", "/images/packaging_2.jpg", "/images/packaging_3.jpg"],
    inStock: true,
    featured: true,
    price: 12.50
  },
  {
    id: "p2",
    name: "Bio-degradable Food Container",
    partNumber: "MP-FD-055",
    description: "Plant-based PLA food container. Microwave safe and fully compostable. Pack of 50.",
    category: "food-containers",
    images: ["/images/packaging_2.jpg", "/images/packaging_3.jpg", "/images/packaging_4.jpg"],
    inStock: true,
    featured: true
  },
  {
    id: "p3",
    name: "Kraft Paper Tape",
    partNumber: "MP-TP-202",
    description: "Water-activated reinforced kraft paper tape. Strong adhesive for secure sealing. Recyclable.",
    category: "eco-friendly",
    images: ["/images/packaging_3.jpg", "/images/packaging_1.jpg", "/images/packaging_2.jpg"],
    inStock: true,
    price: 5.00
  },
  {
    id: "p4",
    name: "Custom Printed Mailer",
    partNumber: "MP-CUST-99",
    description: "Full-color printed mailer box. Perfect for subscription boxes and e-commerce brands.",
    category: "custom-boxes",
    images: ["/images/packaging_4.jpg", "/images/packaging_1.jpg", "/images/packaging_3.jpg"],
    inStock: true
  },
  {
    id: "p5",
    name: "Stretch Wrap Film",
    partNumber: "MP-SW-500",
    description: "Heavy-duty stretch wrap for palletizing. 18 inches width, 1500 feet length.",
    category: "industrial-packaging",
    images: ["/images/packaging_1.jpg", "/images/packaging_4.jpg", "/images/packaging_2.jpg"],
    inStock: true
  },
  {
    id: "p6",
    name: "Honeycombe Padding",
    partNumber: "MP-HC-100",
    description: "Eco-friendly alternative to bubble wrap. Made from recycled paper.",
    category: "eco-friendly",
    images: ["/images/packaging_3.jpg", "/images/packaging_2.jpg", "/images/packaging_1.jpg"],
    inStock: false
  }
];
