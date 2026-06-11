import { useState } from "react";
import { Routes, Route } from "react-router-dom";
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

// Layout general: barra de anuncios, nav, rutas, footer y los paneles flotantes.
export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <AnnounceBar />
      <Navbar onOpenSearch={() => setSearchOpen(true)} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/producto/:id" element={<ProductoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>

      <Footer />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
      <Chatbot />
    </>
  );
}
