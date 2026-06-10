import { createContext, useContext, useState, useCallback } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

// Provee el estado de sesión (token y usuario) y las acciones de login/registro/logout
// a toda la aplicación.
export function AuthProvider({ children }) {
  // Inicializamos desde localStorage para mantener la sesión al recargar la página.
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const guardado = localStorage.getItem("user");
    return guardado ? JSON.parse(guardado) : null;
  });

  // Guarda token y usuario en el estado y en localStorage.
  const guardarSesion = useCallback(({ token, email, rol }) => {
    const usuario = { email, rol };
    setToken(token);
    setUser(usuario);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(usuario));
  }, []);

  const login = useCallback(
    async (credenciales) => {
      const { data } = await authApi.login(credenciales);
      guardarSesion(data);
      return data;
    },
    [guardarSesion]
  );

  const register = useCallback(
    async (datos) => {
      const { data } = await authApi.register(datos);
      guardarSesion(data);
      return data;
    },
    [guardarSesion]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    isAdmin: user?.rol === "ADMIN",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para consumir el contexto de sesión desde cualquier componente.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
