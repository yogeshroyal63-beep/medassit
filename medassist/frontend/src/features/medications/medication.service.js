import api from "../../shared/utils/api";

export const medicationService = {
  list:      ()         => api.get("/medications").then(r => r.data),
  add:       (data)     => api.post("/medications", data).then(r => r.data),
  update:    (id, data) => api.put(`/medications/${id}`, data).then(r => r.data),
  remove:    (id)       => api.delete(`/medications/${id}`).then(r => r.data),
  markTaken: (id)       => api.patch(`/medications/${id}/taken`).then(r => r.data),
};
