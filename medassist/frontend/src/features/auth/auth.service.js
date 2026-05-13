import api from "../../shared/utils/api";

export const authService = {
  login:    (email, password)                      => api.post("/auth/login",    { email, password }).then(r => r.data),
  register: ({ name, email, phone, role, password }) => api.post("/auth/register", { name, email, phone, role, password }).then(r => r.data),
  me:       ()                                     => api.get("/auth/me").then(r => r.data),
  refresh:  (refreshToken)                         => api.post("/auth/refresh",   { refreshToken }).then(r => r.data),
  logout:   (refreshToken)                         => api.post("/auth/logout",    { refreshToken }).then(r => r.data),
};
