import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { bookingApi, chatbotApi, eventApi, identityApi, userApi, setAuthToken } from "./api";

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
  };

  return { token, setToken, user, setUser, logout };
};

const FormMessage = ({ text }) => {
  if (!text) return null;
  return <p className="form-message">{text}</p>;
};

const formatEventDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const formatEventTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};



const isBookingRequest = (message) => /book|ticket|reserve|seats?|passes?/i.test(message);

const formatAgentResponse = (data) => {
  if (!data) return "Processing request...";



  if (data.agentResult) {
    const result = data.agentResult;

    if (!result.success) {
      return result.reasoning?.join(" ") || "Could not process your request.";
    }

    let response = "Booking confirmed\n\n";
    if (result.reasoning && Array.isArray(result.reasoning)) {
      result.reasoning.forEach((step) => {
        if (step.includes("Understood")) response += "Confirmed: " + step + "\n";
        else if (step.includes("Event found")) response += "Event: " + step + "\n";
        else if (step.includes("Seats")) response += "Seats: " + step + "\n";
        else if (step.includes("successfully")) response += "Success: " + step + "\n";
        else response += "- " + step + "\n";
      });
    }

    if (result.bookingResult) {
      response += "\nBooking Details:\n";
      response += "- ID: " + result.bookingResult.id + "\n";
      response += "- Status: " + result.bookingResult.status + "\n";
    }

    return response;
  }

  return data.reply || "Processing request...";
};

function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="loading-state">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await identityApi.post("/register", form);
      setMessage("Account created successfully. Please login.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-visual">
        <span className="eyebrow">AI Powered Booking</span>
        <h1>Reserve standout experiences with less friction.</h1>
        <p>Join BlackTickets to discover curated events, manage bookings, and use AI to reserve seats faster.</p>
      </div>
      <div className="surface-card auth-card">
        <span className="form-kicker">Create account</span>
        <h2>Start your booking journey</h2>
        <p className="muted">Premium events, clean checkout, and AI assistance in one place.</p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="register-name">Full name</label>
          <input id="register-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Anant Kumar" />
          <label className="field-label" htmlFor="register-email">Email</label>
          <input id="register-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" />
          <label className="field-label" htmlFor="register-password">Password</label>
          <input id="register-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter a secure password" />
          <button type="submit" className="btn-primary btn-full">Create Account</button>
          <FormMessage text={message} />
        </form>
      </div>
    </section>
  );
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await identityApi.post("/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.token, data.user);
      navigate("/events");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-visual">
        <span className="eyebrow">Welcome back</span>
        <h1>Your event command center is ready.</h1>
        <p>Access bookings, publish events, and let the AI assistant help customers find the right ticket.</p>
      </div>
      <div className="surface-card auth-card">
        <span className="form-kicker">Secure login</span>
        <h2>Sign in to BlackTickets</h2>
        <p className="muted">Login to manage events and bookings.</p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="login-email">Email</label>
          <input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          <label className="field-label" htmlFor="login-password">Password</label>
          <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
          <button type="submit" className="btn-primary btn-full">Sign In</button>
          <FormMessage text={error} />
        </form>
      </div>
    </section>
  );
}

function EventsPage({ user }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    eventApi.get("/").then((res) => setEvents(res.data));
  }, []);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Live inventory</span>
          <h1>Featured Events</h1>
          <p className="muted">Discover curated experiences and book the best seats before they disappear.</p>
        </div>
        {user?.role === "admin" && <Link to="/events/create" className="btn-primary">Create Event</Link>}
      </div>

      <div className="event-grid">
        {events.map((eventItem) => (
          <article key={eventItem.id} className="surface-card event-card">
            <div className="event-poster-wrap">
              {eventItem.poster_url ? (
                <img className="event-poster" src={eventItem.poster_url} alt={eventItem.name} />
              ) : (
                <div className="event-poster event-poster-placeholder">BlackTickets</div>
              )}
              <span className="date-badge">{formatEventDate(eventItem.date)}</span>
            </div>
            <div className="event-meta">
              <span className="pill pill-secondary">{eventItem.available_seats} seats left</span>
              <span className="pill">Premium access</span>
            </div>
            <h3>{eventItem.name}</h3>
            <p className="muted">{eventItem.description}</p>
            <div className="venue-row">
              <span>Venue</span>
              <strong>{eventItem.venue}</strong>
            </div>
            <Link to={`/events/${eventItem.id}`} className="link-cta">View Details</Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventDetailPage() {
  const { id } = useParams();
  const authContext = useAuth();
  const [eventItem, setEventItem] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatError, setChatError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    eventApi.get(`/${id}`).then((res) => setEventItem(res.data));
  }, [id]);

  const askChatbot = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    const isBookingReq = isBookingRequest(userMessage);

    if (isBookingReq && !authContext.token) {
      setChatError("Please log in first to book tickets through the AI assistant.");
      setChatInput("");
      return;
    }

    setChatError("");
    setChatReply("");
    setIsLoading(true);

    try {
      const { data } = await chatbotApi.post("/chat", {
        message: userMessage,
        eventId: Number(id)
      });

      const formatted = formatAgentResponse(data);
      setChatReply(formatted);
      setChatInput("");
    } catch (error) {
      const errorMsg = error?.response?.data?.message;

      if (error?.response?.status === 401) {
        setChatError("Please log in first to book tickets through the AI assistant.");
      } else if (errorMsg?.includes("Authentication required")) {
        setChatError("Please log in first to book tickets through the AI assistant.");
      } else {
        setChatError(errorMsg || "Chatbot is unavailable right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!eventItem) return <LoadingSpinner label="Loading event details..." />;

  return (
    <section className="detail-page">
      <div className="detail-hero surface-card">
        {eventItem.poster_url ? (
          <img className="detail-poster" src={eventItem.poster_url} alt={eventItem.name} />
        ) : (
          <div className="detail-poster detail-poster-placeholder">BlackTickets</div>
        )}
        <div className="detail-hero-copy">
          <span className="eyebrow">Event details</span>
          <h1>{eventItem.name}</h1>
          <p>{eventItem.description}</p>
        </div>
      </div>

      <div className="detail-layout">
        <div className="surface-card detail-card">
          <h2>Event information</h2>
          <div className="stats-row">
            <div className="stat-box"><span>Venue</span><strong>{eventItem.venue}</strong></div>
            <div className="stat-box"><span>Date</span><strong>{formatEventTime(eventItem.date)}</strong></div>
            <div className="stat-box"><span>Available Seats</span><strong>{eventItem.available_seats}</strong></div>
          </div>
          <p className="muted">Your ticket gives you access to this curated BlackTickets experience.</p>
        </div>

        <aside className="surface-card booking-panel">
          <span className="eyebrow">Fast checkout</span>
          <h3>Reserve your seat</h3>
          <p className="muted">Book manually or ask the AI assistant to reserve tickets for you.</p>
          <Link to={`/book/${eventItem.id}`} className="btn-primary btn-full">Book Tickets</Link>
          <div className="mini-divider" />
          <div className="chatbot-box">
            <h3>Event Assistant</h3>
            <p className="muted">Powered by Amazon Bedrock. Ask about details, availability, or say "Book X tickets".</p>
            <form onSubmit={askChatbot} className="chatbot-form">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Book 2 tickets"
                disabled={isLoading}
              />
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? <span className="button-spinner" /> : "Ask"}
              </button>
            </form>
            {chatReply && <div className="chatbot-reply" style={{ whiteSpace: "pre-line" }}>{chatReply}</div>}
            {chatError && <p className="form-message">{chatError}</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}

function BookingPage() {
  const { id } = useParams();
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await bookingApi.post("/", { event_id: Number(id), seats: Number(seats) });
      setMessage("Booking successful.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Booking failed.");
    }
  };

  return (
    <section className="auth-shell">
      <div className="surface-card auth-card">
        <span className="form-kicker">Checkout</span>
        <h2>Confirm your booking</h2>
        <p className="muted">Event ID: #{id}</p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="seats">Number of seats</label>
          <input id="seats" type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} />
          <button type="submit" className="btn-primary btn-full">Confirm Booking</button>
          <FormMessage text={message} />
        </form>
      </div>
    </section>
  );
}

function CreateEventPage({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    venue: "",
    date: "",
    total_seats: 100,
    poster_url: "",
    poster: null
  });
  const [message, setMessage] = useState("");

  if (user?.role !== "admin") {
    return <p className="muted">Only admin users can create events.</p>;
  }

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("venue", form.venue);
      payload.append("date", form.date);
      payload.append("total_seats", form.total_seats);
      if (form.poster_url) {
        payload.append("poster_url", form.poster_url);
      }
      if (form.poster) {
        payload.append("poster", form.poster);
      }

      await eventApi.post("/", payload);
      navigate("/events");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Could not create event.");
    }
  };

  return (
    <section className="admin-layout">
      <div className="page-header">
        <div>
          <span className="eyebrow">Admin studio</span>
          <h1>Create a new event</h1>
          <p className="muted">Publish premium experiences for your audience.</p>
        </div>
      </div>
      <div className="surface-card create-card">
        <form onSubmit={submit} className="event-form">
          <div className="form-grid">
            <div>
              <label className="field-label" htmlFor="event-name">Event name</label>
              <input id="event-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="event-venue">Venue</label>
              <input id="event-venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="event-date">Date & time</label>
              <input id="event-date" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="event-total-seats">Total seats</label>
              <input id="event-total-seats" type="number" min="1" value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: Number(e.target.value) })} />
            </div>
          </div>
          <label className="field-label" htmlFor="event-description">Description</label>
          <input id="event-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="field-label" htmlFor="event-poster-url">Poster URL</label>
          <input id="event-poster-url" value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} placeholder="https://..." />
          <label className="field-label" htmlFor="event-poster">Poster image</label>
          <label className="file-upload" htmlFor="event-poster">
            <span>{form.poster ? form.poster.name : "Upload poster image"}</span>
            <strong>Choose file</strong>
          </label>
          <input className="sr-only-file" id="event-poster" type="file" accept="image/*" onChange={(e) => setForm({ ...form, poster: e.target.files?.[0] || null })} />
          <button className="btn-primary btn-full" type="submit">Publish Event</button>
          <FormMessage text={message} />
        </form>
      </div>
    </section>
  );
}

function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    userApi.get("/me").then((res) => setProfile(res.data));
    bookingApi.get("/").then((res) => setBookings(res.data));
  }, []);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Account analytics</span>
          <h1>Dashboard</h1>
          <p className="muted">Track your account and booking portfolio.</p>
        </div>
      </div>
      <div className="analytics-grid">
        <div className="surface-card analytics-card"><span>Total Bookings</span><strong>{bookings.length}</strong></div>
        <div className="surface-card analytics-card"><span>Total Seats</span><strong>{bookings.reduce((total, booking) => total + Number(booking.seats || 0), 0)}</strong></div>
        <div className="surface-card analytics-card"><span>Active Profile</span><strong>{profile?.role || "User"}</strong></div>
      </div>
      {profile && (
        <div className="surface-card profile-card">
          <h3>{profile.name}</h3>
          <p>{profile.email}</p>
          <span className="pill">{profile.role}</span>
        </div>
      )}

      <h3 className="section-title">Recent Bookings</h3>
      <div className="booking-grid">
        {bookings.map((booking) => (
          <article key={booking.id} className="surface-card booking-card">
            <p><strong>Booking #{booking.id}</strong></p>
            <p>Event ID: {booking.event_id}</p>
            <p>Seats: {booking.seats}</p>
            <p>Status: <span className="pill pill-secondary">{booking.status}</span></p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FloatingAssistant({ token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (isBookingRequest(message) && !token) {
      setError("Please log in first to book tickets through the AI assistant.");
      setReply("");
      return;
    }

    setError("");
    setReply("");
    setIsLoading(true);

    try {
      const { data } = await chatbotApi.post("/chat", { message });
      setReply(formatAgentResponse(data));
      setMessage("");
    } catch (err) {
      const errorMsg = err?.response?.data?.message;
      if (err?.response?.status === 401 || errorMsg?.includes("Authentication required")) {
        setError("Please log in first to book tickets through the AI assistant.");
      } else {
        setError(errorMsg || "AI assistant is unavailable right now. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="floating-ai">
      {isOpen && (
        <div className="surface-card ai-panel">
          <div className="ai-panel-header">
            <div>
              <span className="eyebrow">Powered by Amazon Bedrock</span>
              <h3>AI Booking Assistant</h3>
            </div>
            <button type="button" className="icon-button" onClick={() => setIsOpen(false)} aria-label="Close AI assistant">x</button>
          </div>
          <p className="muted">Ask a question or say "Book 2 tickets for Tech Conference 2026".</p>
          <form onSubmit={submit} className="ai-form">
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask AI to book tickets" disabled={isLoading} />
            <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? <span className="button-spinner" /> : "Send"}</button>
          </form>
          {reply && <div className="chatbot-reply" style={{ whiteSpace: "pre-line" }}>{reply}</div>}
          {error && <p className="form-message">{error}</p>}
        </div>
      )}
      <button type="button" className="ai-fab" onClick={() => setIsOpen((value) => !value)}>
        <span>AI Booking Assistant</span>
        <small>Powered by Amazon Bedrock</small>
      </button>
    </div>
  );
}

export default function App() {
  const { token, setToken, user, setUser, logout } = useAuth();

  const onLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <div className="app-shell">
      <main className="container">
        <nav className="navbar surface-card">
          <Link to="/events" className="navbar-brand">
            <span className="brand-mark">BT</span>
            <span>
              BlackTickets
              <small>AI Powered Booking</small>
            </span>
          </Link>
          <div className="navbar-nav">
            <NavLink to="/" end>Register</NavLink>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/events">Events</NavLink>
            {token && <NavLink to="/dashboard">Dashboard</NavLink>}
            {token && user?.role === "admin" && <NavLink to="/events/create">Create Event</NavLink>}
            <button type="button" className="btn-ghost" onClick={logout} disabled={!token}>Logout</button>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
          <Route path="/events" element={<EventsPage user={user} />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/create" element={<CreateEventPage user={user} />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
      <FloatingAssistant token={token} />
    </div>
  );
}
