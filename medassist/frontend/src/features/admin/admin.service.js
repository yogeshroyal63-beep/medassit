import api from "../../shared/utils/api";

export const adminService = {
  stats:         ()          => api.get("/admin/stats").then(r => r.data),
  pendingDoctors:()          => api.get("/admin/doctors/pending").then(r => r.data),
  approveDoctor: (id)        => api.patch(`/admin/doctors/${id}/approve`).then(r => r.data),
  rejectDoctor:  (id, reason)=> api.patch(`/admin/doctors/${id}/reject`, { reason }).then(r => r.data),
  users:         ()          => api.get("/admin/users").then(r => r.data),
  auditLogs:     ()          => api.get("/admin/audit-logs").then(r => r.data),
};
