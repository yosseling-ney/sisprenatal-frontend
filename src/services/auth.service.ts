import http from "../lib/http";

export interface AuthenticatedUser {
  id: string;
  nombre: string;
  rol: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: AuthenticatedUser;
}

const AUTH_ROUTES = {
  login: "/login",
};

export const login = async (payload: LoginPayload) => {
  const { data } = await http.post<LoginResponse>(AUTH_ROUTES.login, payload);
  return data;
};

export const logout = async () => {
  // La API actual no expone un endpoint de logout, por lo que simplemente resolvemos la promesa.
  return Promise.resolve();
};
