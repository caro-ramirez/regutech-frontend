import { createContext, useContext, useState } from "react";
import { API_URL } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("regutech_usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al iniciar sesión.");
    }

    setUsuario(data.usuario);
    localStorage.setItem("regutech_usuario", JSON.stringify(data.usuario));
    localStorage.setItem("regutech_token", data.token);
    return data.usuario;
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("regutech_usuario");
    localStorage.removeItem("regutech_token");
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
