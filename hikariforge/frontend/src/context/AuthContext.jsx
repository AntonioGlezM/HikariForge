import { createContext, useContext, useState, useCallback } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

// Estado de sesión (token + usuario) con login normal, registro y Google.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const guardado = localStorage.getItem("user");
    return guardado ? JSON.parse(guardado) : null;
  });

  const guardarSesion = useCallback(({ token, email, rol }) => {
    const usuario = { email, rol };
    setToken(token);
    setUser(usuario);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(usuario));
  }, []);

  const login = useCallback(async (credenciales) => {
    const { data } = await authApi.login(credenciales);
    guardarSesion(data);
    return data;
  }, [guardarSesion]);

  const register = useCallback(async (datos) => {
    const { data } = await authApi.register(datos);
    guardarSesion(data);
    return data;
  }, [guardarSesion]);

  // Recibe el credential (idToken) del botón de Google y lo cambia por nuestro JWT.
  const loginWithGoogle = useCallback(async (idToken) => {
    const { data } = await authApi.loginGoogle(idToken);
    guardarSesion(data);
    return data;
  }, [guardarSesion]);

  // Tras editar el perfil, el backend devuelve un token nuevo: se guarda aquí.
  const refrescarSesion = guardarSesion;

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const value = {
    token, user,
    isAuthenticated: !!token,
    isAdmin: user?.rol === "ADMIN",
    login, register, loginWithGoogle, refrescarSesion, logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
