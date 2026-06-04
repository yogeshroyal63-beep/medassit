import api from "../../shared/utils/api";

export const doctorService = {
  list:               (specialization) => api.get("/doctors", { params: { specialization } }).then(r => r.data),
  getById:            (id)             => api.get(`/doctors/${id}`).then(r => r.data),
  getMe:              ()               => api.get("/doctors/me").then(r => r.data),
  register:           (formData)       => api.post("/doctors/register", formData, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data),
  updateAvailability: (data)           => api.patch("/doctors/availability", data).then(r => r.data),
};
