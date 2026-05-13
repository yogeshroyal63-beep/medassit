import api from "../../shared/utils/api";

export const triageService = {
  /** Submit symptoms for AI triage */
  analyze: (symptoms, age) => api.post("/triage", { symptoms, age }).then(r => r.data),
  /** Fetch the user's triage history */
  history: () => api.get("/triage/history").then(r => r.data),
};
