import api from "../../shared/utils/api";

export const messagingService = {
  // GET /messages/  → returns conversation list (each item has _id = other user's id)
  conversations: () => api.get("/messages/").then(r => r.data),

  // GET /messages/:userId  → messages between current user and userId
  messages: (otherUserId) => api.get(`/messages/${otherUserId}`).then(r => r.data),

  // POST /messages/  → body: { receiverId, content }
  send: (otherUserId, text) =>
    api.post("/messages/", { receiverId: otherUserId, content: text }).then(r => r.data),

  // POST /messages/  → start a new conversation (same endpoint, same shape)
  startConversation: (recipientId) =>
    api.post("/messages/", { receiverId: recipientId, content: "👋 Hello!" }).then(r => r.data),
};
