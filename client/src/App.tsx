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
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminUsers from "./pages/admin/AdminUsers";

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" nest>
        <AdminLayout>
          <Switch>
            <Route path="/" component={AdminDashboard} />
            <Route path="/products" component={AdminProducts} />
            <Route path="/categories" component={AdminCategories} />
            <Route path="/banners" component={AdminBanners} />
            <Route path="/admin-users" component={AdminUsers} />
            <Route component={AdminDashboard} />
          </Switch>
        </AdminLayout>
      </Route>

      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={ProductList} />
            <Route path="/products/:slug" component={ProductDetail} />
            <Route path="/category/:slug" component={CategoryPage} />
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
