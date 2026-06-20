const axios = require("axios");

const fetchEventById = async (eventId) => {
  try {
    const response = await axios.get(`${process.env.EVENT_SERVICE_URL}/events/${eventId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      const notFoundError = new Error("Event not found");
      notFoundError.type = "EVENT_NOT_FOUND";
      throw notFoundError;
    }

    const serviceError = new Error("Event service unavailable");
    serviceError.type = "EVENT_SERVICE_UNAVAILABLE";
    throw serviceError;
  }
};

const fetchAllEvents = async () => {
  try {
    const url = `${process.env.EVENT_SERVICE_URL}/events`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    const serviceError = new Error("Event service unavailable");
    serviceError.type = "EVENT_SERVICE_UNAVAILABLE";
    throw serviceError;
  }
};

module.exports = { fetchEventById, fetchAllEvents };
