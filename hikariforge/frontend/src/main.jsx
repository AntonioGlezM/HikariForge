import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext";
import { AuthProvider } from "./context/AuthContext";
import { ProductosProvider } from "./context/ProductosContext";
import { CartProvider } from "./context/CartContext";
import { FavsProvider } from "./context/FavsContext";
import { ToastProvider } from "./context/ToastContext";
import { ComparadorProvider } from "./context/ComparadorContext";
import App from "./App";
import "./styles/theme.css";

// Punto de entrada: router + proveedores (ajustes, sesión, catálogo, carrito).
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <ProductosProvider>
            <CartProvider>
              <ToastProvider>
                <FavsProvider>
                  <ComparadorProvider>
                    <App />
                  </ComparadorProvider>
                </FavsProvider>
              </ToastProvider>
            </CartProvider>
          </ProductosProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
