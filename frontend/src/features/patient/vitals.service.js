import api from "../../shared/utils/api";

export const vitalsService = {
  log:    (payload) => api.post("/vitals", payload).then(r => r.data),
  latest: () => api.get("/vitals/latest").then(r => r.data),
  trend:  (months = 6) => api.get(`/vitals/trend?months=${months}`).then(r => r.data),
};
