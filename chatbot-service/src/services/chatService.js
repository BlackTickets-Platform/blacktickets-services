const formatDate = (rawDate) => {
  try {
    return new Date(rawDate).toLocaleString();
  } catch (error) {
    return rawDate;
  }
};

const buildSummary = (event) => {
  return `${event.name} is happening at ${event.venue} on ${formatDate(event.date)}. ${event.description} Currently ${event.available_seats} of ${event.total_seats} seats are available.`;
};

const buildReply = (message, event) => {
  const text = message.toLowerCase();

  if (/(what|about|tell me)/.test(text)) {
    return `${event.name} is about ${event.description}`;
  }

  if (/(when|time|date|start)/.test(text)) {
    return `${event.name} starts on ${formatDate(event.date)}.`;
  }

  if (/(where|location|venue|happening)/.test(text)) {
    return `${event.name} is happening at ${event.venue}.`;
  }

  if (/(seat|sold out|availability|available)/.test(text)) {
    if (Number(event.available_seats) <= 0) {
      return `${event.name} is currently sold out.`;
    }
    return `${event.name} has ${event.available_seats} seats left out of ${event.total_seats}.`;
  }

  if (/(special|highlight|unique)/.test(text)) {
    return `What makes ${event.name} special is: ${event.description}`;
  }

  return buildSummary(event);
};

module.exports = { buildReply };
