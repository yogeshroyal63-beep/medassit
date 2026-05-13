import api from "../../shared/utils/api";

export const recordService = {
  list:   ()       => api.get("/records").then(r => r.data),
  get:    (id)     => api.get(`/records/${id}`).then(r => r.data),
  create: (data)   => api.post("/records", data).then(r => r.data),
  delete: (id)     => api.delete(`/records/${id}`).then(r => r.data),
};
