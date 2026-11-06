import api from "../../shared/utils/api";

export const modelService = {
  /** Model card + live runtime state (also wakes the AI service). Public. */
  info: () => api.get("/model/info").then((r) => r.data),
  /** Word-level explanation of a prediction. Public, nothing is stored. */
  explain: (symptoms) => api.post("/model/explain", { symptoms }).then((r) => r.data),
};
