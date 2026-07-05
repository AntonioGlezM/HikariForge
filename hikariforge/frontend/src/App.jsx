import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useSettings } from "./context/SettingsContext";
import ScrollAndTitle from "./components/ScrollAndTitle";
import AnnounceBar from "./components/AnnounceBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchDrawer from "./components/SearchDrawer";
import CartDrawer from "./components/CartDrawer";
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import CatalogoPage from "./pages/CatalogoPage";
import ProductoPage from "./pages/ProductoPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import SoportePage from "./pages/SoportePage";
import PerfilPage from "./pages/PerfilPage";
import PedidosPage from "./pages/PedidosPage";
import CheckoutPage from "./pages/CheckoutPage";
import FavoritosPage from "./pages/FavoritosPage";
import NotFoundPage from "./pages/NotFoundPage";

// Layout general: barra de anuncios, nav, rutas, footer y los paneles flotantes.
export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { tr } = useSettings();

  return (
    <div className="hf-app">
      <ScrollAndTitle tr={tr} />
      <AnnounceBar />
      <Navbar onOpenSearch={() => setSearchOpen(true)} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/producto/:id" element={<ProductoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/soporte" element={<SoportePage />} />
        <Route path="/favoritos" element={<FavoritosPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        {/* Cualquier otra ruta: página 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
      <Chatbot hidden={searchOpen} />
    </div>
  );
}
