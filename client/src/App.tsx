import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { CartProvider } from "./context/CartContext";
import { Layout } from "./components/layout/Layout";
import { AdminLayout } from "./components/layout/AdminLayout";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import NotFound from "./pages/not-found";
import CategoryPage from "./pages/CategoryPage";
import RetailOutlets from "./pages/RetailOutlets";
import Warehouses from "./pages/Warehouses";
import Contact from "./pages/Contact";
import Career from "./pages/Career";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminRetailOutlets from "./pages/admin/AdminRetailOutlets";
import AdminWarehouses from "./pages/admin/AdminWarehouses";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminBrandLogos from "./pages/admin/AdminBrandLogos";

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/products">
        <AdminLayout><AdminProducts /></AdminLayout>
      </Route>
      <Route path="/admin/categories">
        <AdminLayout><AdminCategories /></AdminLayout>
      </Route>
      <Route path="/admin/banners">
        <AdminLayout><AdminBanners /></AdminLayout>
      </Route>
      <Route path="/admin/retail-outlets">
        <AdminLayout><AdminRetailOutlets /></AdminLayout>
      </Route>
      <Route path="/admin/warehouses">
        <AdminLayout><AdminWarehouses /></AdminLayout>
      </Route>
      <Route path="/admin/admin-users">
        <AdminLayout><AdminUsers /></AdminLayout>
      </Route>
      <Route path="/admin/messages">
        <AdminLayout><AdminMessages /></AdminLayout>
      </Route>
      <Route path="/admin/brand-logos">
        <AdminLayout><AdminBrandLogos /></AdminLayout>
      </Route>
      <Route path="/admin">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>

      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={ProductList} />
            <Route path="/products/:slug" component={ProductDetail} />
            <Route path="/category/:slug" component={CategoryPage} />
            <Route path="/retail-outlets" component={RetailOutlets} />
            <Route path="/warehouses" component={Warehouses} />
            <Route path="/contact" component={Contact} />
            <Route path="/career" component={Career} />
            <Route path="/cart" component={Cart} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Router />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
