const { analyzeIntent } = require("./bedrockService");
const { fetchAllEvents } = require("./eventClient");
const { createBooking } = require("./bookingClient");

const normalizeText = (text) => {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const getEventName = (event) => String(event?.name || "").replace(/\s+/g, " ").trim();

const getEventId = (event) => event?.id ?? event?._id ?? event?.event_id;

const hasSelectedEventId = (selectedEventId) => {
  return selectedEventId !== null && selectedEventId !== undefined && String(selectedEventId).trim() !== "";
};

const isTrue = (value) => value === true || normalizeText(value) === "true";

const isEventNameMatch = (requestedName, availableName) => {
  const normalizedRequestedName = normalizeText(requestedName);
  const normalizedAvailableName = normalizeText(availableName);

  return (
    normalizedRequestedName &&
    normalizedAvailableName &&
    (normalizedRequestedName === normalizedAvailableName ||
      normalizedRequestedName.includes(normalizedAvailableName) ||
      normalizedAvailableName.includes(normalizedRequestedName))
  );
};

const handleAgentRequest = async (message, token) => {
  const events = await fetchAllEvents();
  const intentResult = await analyzeIntent(message, events);
  const intent = normalizeText(intentResult?.intent);
  const selectedEventId = intentResult?.selectedEventId;
  const eventName = getEventName({ name: intentResult?.eventName });
  const ticketCount = Number(intentResult?.ticketCount || 0);
  const confidence = intentResult?.confidence || null;

  console.log("[agentService] Intent analysis", {
    intent: intentResult?.intent,
    selectedEventId: hasSelectedEventId(selectedEventId) ? selectedEventId : null,
    eventName: eventName || null,
    confidence,
  });

  if (intent !== "book_ticket") {
    return {
      success: false,
      reasoning: ["No booking action needed"],
    };
  }

  if (isTrue(intentResult?.needsClarification)) {
    const clarificationQuestion = intentResult?.clarificationQuestion || "Could you clarify which event and how many tickets you want?";

    return {
      success: false,
      needsClarification: true,
      clarificationQuestion,
      reasoning: [clarificationQuestion],
    };
  }

  if (ticketCount <= 0) {
    return {
      success: false,
      needsClarification: true,
      clarificationQuestion: "How many tickets would you like to book?",
      reasoning: ["How many tickets would you like to book?"],
    };
  }

  let matchingEvent = null;

  if (hasSelectedEventId(selectedEventId) && Array.isArray(events)) {
    matchingEvent = events.find((event) => String(getEventId(event)) === String(selectedEventId));
  }

  if (!matchingEvent && !hasSelectedEventId(selectedEventId) && eventName && Array.isArray(events)) {
    matchingEvent = events.find((event) => isEventNameMatch(eventName, event.name));
  }

  if (!matchingEvent) {
    return {
      success: false,
      reasoning: ["Could not find requested event"],
    };
  }

  if (Number(matchingEvent.available_seats) < ticketCount) {
    return {
      success: false,
      reasoning: ["Requested event does not have enough seats available"],
    };
  }

  const bookingResult = await createBooking({
    eventId: hasSelectedEventId(selectedEventId) ? selectedEventId : getEventId(matchingEvent),
    seats: ticketCount,
    token,
  });

  return {
    success: true,
    reasoning: [
      "Understood booking request",
      "Found matching event",
      "Checked seat availability",
      "Created booking successfully",
    ],
    bookingResult,
  };
};

module.exports = { handleAgentRequest };
