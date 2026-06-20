const { fetchEventById } = require("../services/eventClient");
const { buildReply } = require("../services/chatService");
const { handleAgentRequest } = require("../services/agentService");

const extractToken = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  return parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;
};

const isBookingIntent = (message) => {
  const text = String(message || "").toLowerCase();
  const bookingAction = /\b(book|reserve|buy|purchase)\b/.test(text);
  const getPasses = /\b(get|want|need)\b.*\b(ticket|tickets|pass|passes|seat|seats)\b/.test(text);

  return bookingAction || getPasses;
};

const buildGeneralReply = (message) => {
  const text = String(message || "").toLowerCase().trim();

  if (/^(hi|hello|hey)\b/.test(text)) {
    return "Hello! I can help with event details and ticket bookings.";
  }

  return "I can help with event details, availability, and ticket bookings.";
};

const chat = async (req, res, next) => {
  try {
    const { message, eventId } = req.body;
    const authHeader = req.headers.authorization || "";
    const token = extractToken(authHeader);

    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const isLikelyBooking = isBookingIntent(message);

    if (isLikelyBooking) {
      if (!token) {
        return res.status(401).json({ message: "Authentication required for booking requests. Please include Authorization: Bearer <JWT_TOKEN> header." });
      }
      try {
        const agentResult = await handleAgentRequest(message, token);
        return res.json({ reply: agentResult.reasoning?.join(" ") || "Processing request", agentResult });
      } catch (agentError) {
        console.error("Agent error:", {
          message: agentError.message,
          type: agentError.type,
          status: agentError.response?.status,
        });
        if (!eventId) {
          return res.status(400).json({ message: "Could not process booking request" });
        }
      }
    }

    if (!eventId) {
      return res.json({ reply: buildGeneralReply(message) });
    }

    // Traditional behavior: require eventId for event-specific queries
    const parsedEventId = Number(eventId);
    if (!parsedEventId) {
      return res.status(400).json({ message: "message and valid eventId are required for event queries" });
    }

    const event = await fetchEventById(parsedEventId);
    const reply = buildReply(String(message), event);

    return res.json({ reply });
  } catch (error) {
    if (error.type === "EVENT_NOT_FOUND") {
      return res.status(404).json({ message: "Event not found" });
    }
    if (error.type === "EVENT_SERVICE_UNAVAILABLE") {
      return res.status(503).json({ message: "Event service is unavailable" });
    }
    return next(error);
  }
};

module.exports = { chat };
