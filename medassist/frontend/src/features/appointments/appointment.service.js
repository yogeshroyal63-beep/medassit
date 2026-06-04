import api from "../../shared/utils/api";

export const appointmentService = {
  myAppointments: ()                    => api.get("/appointments/my").then(r => r.data),
  book:           (data)                => api.post("/appointments", data).then(r => r.data),
  updateStatus:   (id, status)          => api.patch(`/appointments/${id}/status`, { status }).then(r => r.data),
  cancel:         (id)                  => api.patch(`/appointments/${id}/cancel`).then(r => r.data),
};
