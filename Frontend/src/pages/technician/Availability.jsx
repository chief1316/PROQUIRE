
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  LogOut,
  Wrench,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const API = "http://localhost:5000/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyForm = {
  available_day: "Monday",
  available_from: "09:00",
  available_to: "17:00",
};

function Availability() {
  const navigate = useNavigate();

  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") ||
          sessionStorage.getItem("user") ||
          "{}"
      );
    } catch {
      return {};
    }
  })();

  const technicianName =
    user.full_name || user.name || "Technician";

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // Redirect to the homepage after clearing the session.
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/");
  };

  // Load the logged-in technician's availability.
  const fetchAvailability = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/availability/my-availability`,
        {
          headers: authHeaders,
        }
      );

      setAvailability(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Availability fetch error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your availability."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setForm({
      available_day: item.available_day,
      available_from: String(
        item.available_from
      ).slice(0, 5),
      available_to: String(
        item.available_to
      ).slice(0, 5),
    });

    setEditingId(item.availability_id);
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !form.available_day ||
      !form.available_from ||
      !form.available_to
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (
      form.available_from >= form.available_to
    ) {
      setError(
        "Ending time must be later than starting time."
      );
      return;
    }

    try {
      setSaving(true);

      let response;

      if (editingId) {
        response = await axios.patch(
          `${API}/availability/${editingId}`,
          form,
          {
            headers: authHeaders,
          }
        );
      } else {
        response = await axios.post(
          `${API}/availability/create`,
          form,
          {
            headers: authHeaders,
          }
        );
      }

      setMessage(
        response.data?.message ||
          "Availability saved successfully."
      );

      resetForm();

      await fetchAvailability();
    } catch (err) {
      console.error("Availability save error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save availability. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete your availability for ${item.available_day}, ${String(
        item.available_from
      ).slice(0, 5)} - ${String(
        item.available_to
      ).slice(0, 5)}?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      setDeletingId(item.availability_id);

      const response = await axios.delete(
        `${API}/availability/${item.availability_id}`,
        {
          headers: authHeaders,
        }
      );

      setAvailability((previous) =>
        previous.filter(
          (entry) =>
            entry.availability_id !==
            item.availability_id
        )
      );

      if (editingId === item.availability_id) {
        resetForm();
      }

      setMessage(
        response.data?.message ||
          "Availability deleted successfully."
      );
    } catch (err) {
      console.error("Availability delete error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete availability."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = String(time)
      .slice(0, 5)
      .split(":")
      .map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const groupedAvailability = DAYS.map((day) => ({
    day,
    slots: availability.filter(
      (item) => item.available_day === day
    ),
  }));

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f5f8fc;
          font-family: Inter, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .availability-page {
          min-height: 100vh;
          color: #172033;
          background: #f5f8fc;
        }

        .availability-topbar {
          background: #fff;
          border-bottom: 1px solid #e7ebf2;
          padding: 16px 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .availability-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #1769e0;
          font-weight: 800;
          font-size: 23px;
        }

        .availability-logo-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1769e0;
          color: #fff;
          border-radius: 10px;
        }

        .availability-top-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .availability-user {
          font-size: 13px;
          color: #596579;
          font-weight: 600;
        }

        .availability-logout {
          border: 1px solid #e7ebf2;
          background: #fff;
          border-radius: 8px;
          padding: 10px 13px;
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          color: #d94b4b;
          font-weight: 600;
        }

        .availability-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 24px 55px;
        }

        .availability-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #1769e0;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 25px;
        }

        .availability-heading {
          margin-bottom: 26px;
        }

        .availability-heading h1 {
          font-size: 29px;
          margin: 0 0 9px;
          color: #172033;
        }

        .availability-heading p {
          color: #7a8496;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        .availability-grid {
          display: grid;
          grid-template-columns: minmax(280px, 0.85fr)
            minmax(0, 1.35fr);
          gap: 22px;
          align-items: start;
        }

        .availability-panel {
          background: #fff;
          border: 1px solid #e7ebf2;
          border-radius: 13px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(20, 40, 70, 0.025);
          min-width: 0;
        }

        .availability-panel h2 {
          margin: 0 0 7px;
          font-size: 18px;
        }

        .availability-panel-subtitle {
          color: #8a93a3;
          font-size: 13px;
          line-height: 1.6;
          margin: 0 0 22px;
        }

        .availability-field {
          margin-bottom: 17px;
        }

        .availability-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #596579;
          font-weight: 650;
        }

        .availability-field select,
        .availability-field input {
          width: 100%;
          padding: 12px;
          border: 1px solid #dfe5ee;
          background: #fff;
          border-radius: 8px;
          font-size: 14px;
          color: #172033;
          outline: none;
        }

        .availability-field select:focus,
        .availability-field input:focus {
          border-color: #1769e0;
          box-shadow: 0 0 0 3px rgba(23, 105, 224, 0.1);
        }

        .availability-time-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .availability-primary {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 8px;
          background: #1769e0;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .availability-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .availability-cancel {
          width: 100%;
          padding: 12px;
          margin-top: 10px;
          border: 1px solid #e0e5ed;
          border-radius: 8px;
          background: #fff;
          color: #596579;
          font-weight: 600;
          cursor: pointer;
        }

        .availability-alert {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          border-radius: 8px;
          padding: 12px;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 17px;
          overflow-wrap: anywhere;
        }

        .availability-alert.error {
          background: #fff0f0;
          color: #b83232;
        }

        .availability-alert.success {
          background: #eaf9f0;
          color: #167a3d;
        }

        .availability-day {
          border: 1px solid #e7ebf2;
          border-radius: 10px;
          margin-top: 12px;
          overflow: hidden;
        }

        .availability-day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: #f9fbfe;
          border-bottom: 1px solid #edf0f5;
        }

        .availability-day-header strong {
          font-size: 14px;
        }

        .availability-day-count {
          background: #eaf2ff;
          color: #1769e0;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
        }

        .availability-slot {
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #edf0f5;
        }

        .availability-slot:last-child {
          border-bottom: none;
        }

        .availability-slot-time {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #596579;
          font-size: 13px;
          min-width: 0;
        }

        .availability-slot-actions {
          display: flex;
          gap: 7px;
          flex-shrink: 0;
        }

        .availability-icon-button {
          width: 34px;
          height: 34px;
          border: 1px solid #e7ebf2;
          border-radius: 7px;
          background: #fff;
          color: #596579;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .availability-icon-button.delete {
          color: #d94b4b;
        }

        .availability-empty {
          text-align: center;
          padding: 35px 15px;
          color: #8993a4;
        }

        .availability-empty h3 {
          color: #596579;
          font-size: 15px;
          margin: 13px 0 7px;
        }

        .availability-empty p {
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }

        .availability-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          color: #7a8496;
          padding: 35px 10px;
          font-size: 14px;
        }

        .availability-footer {
          text-align: center;
          margin-top: 25px;
          color: #98a1b2;
          font-size: 12px;
        }

        @media (max-width: 800px) {
          .availability-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .availability-topbar {
            padding: 13px 16px;
          }

          .availability-user {
            display: none;
          }

          .availability-logo {
            font-size: 20px;
          }

          .availability-container {
            padding: 24px 14px 40px;
          }

          .availability-heading h1 {
            font-size: 25px;
          }

          .availability-panel {
            padding: 18px;
          }

          .availability-time-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .availability-slot {
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="availability-page">
        <header className="availability-topbar">
          <Link
            to="/"
            className="availability-logo"
          >
            <span className="availability-logo-icon">
              <Wrench size={21} />
            </span>

            <span>
              Pro<span style={{ color: "#172033" }}>
                Quire
              </span>
            </span>
          </Link>

          <div className="availability-top-actions">
            <span className="availability-user">
              {technicianName}
            </span>

            <button
              className="availability-logout"
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main className="availability-container">
          <Link
            to="/technician"
            className="availability-back"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="availability-heading">
            <h1>Manage Availability</h1>

            <p>
              Set your working days and hours so clients
              know when you are available for service
              requests.
            </p>
          </div>

          {error && (
            <div className="availability-alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="availability-alert success">
              <CheckCircle size={18} />
              <span>{message}</span>
            </div>
          )}

          <div className="availability-grid">
            {/* Create or edit availability */}
            <section className="availability-panel">
              <h2>
                {editingId
                  ? "Edit Working Hours"
                  : "Add Working Hours"}
              </h2>

              <p className="availability-panel-subtitle">
                Choose a day and the hours you are
                available to accept work.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="availability-field">
                  <label htmlFor="available_day">
                    Day of the week
                  </label>

                  <select
                    id="available_day"
                    name="available_day"
                    value={form.available_day}
                    onChange={handleInputChange}
                    required
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="availability-time-row">
                  <div className="availability-field">
                    <label htmlFor="available_from">
                      Start time
                    </label>

                    <input
                      id="available_from"
                      type="time"
                      name="available_from"
                      value={form.available_from}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="availability-field">
                    <label htmlFor="available_to">
                      End time
                    </label>

                    <input
                      id="available_to"
                      type="time"
                      name="available_to"
                      value={form.available_to}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="availability-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={17} />
                      Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Save size={17} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Availability
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="availability-cancel"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    <X
                      size={16}
                      style={{
                        verticalAlign: "middle",
                        marginRight: 5,
                      }}
                    />
                    Cancel Editing
                  </button>
                )}
              </form>
            </section>

            {/* Existing schedule */}
            <section className="availability-panel">
              <h2>Your Weekly Schedule</h2>

              <p className="availability-panel-subtitle">
                View, edit, or remove your saved working
                hours.
              </p>

              {loading ? (
                <div className="availability-loading">
                  <LoaderCircle size={20} />
                  Loading your schedule...
                </div>
              ) : availability.length === 0 ? (
                <div className="availability-empty">
                  <CalendarDays
                    size={35}
                    color="#a0aaba"
                  />

                  <h3>No availability added yet</h3>

                  <p>
                    Add your working days and hours using
                    the form. Your saved schedule will
                    appear here.
                  </p>
                </div>
              ) : (
                groupedAvailability
                  .filter((group) => group.slots.length > 0)
                  .map((group) => (
                    <div
                      className="availability-day"
                      key={group.day}
                    >
                      <div className="availability-day-header">
                        <strong>{group.day}</strong>

                        <span className="availability-day-count">
                          {group.slots.length}{" "}
                          {group.slots.length === 1
                            ? "slot"
                            : "slots"}
                        </span>
                      </div>

                      {group.slots.map((item) => (
                        <div
                          className="availability-slot"
                          key={item.availability_id}
                        >
                          <div className="availability-slot-time">
                            <Clock
                              size={16}
                              color="#1769e0"
                            />

                            <span>
                              {formatTime(item.available_from)}
                              {" – "}
                              {formatTime(item.available_to)}
                            </span>
                          </div>

                          <div className="availability-slot-actions">
                            <button
                              type="button"
                              className="availability-icon-button"
                              title="Edit availability"
                              aria-label="Edit availability"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              className="availability-icon-button delete"
                              title="Delete availability"
                              aria-label="Delete availability"
                              disabled={
                                deletingId ===
                                item.availability_id
                              }
                              onClick={() => handleDelete(item)}
                            >
                              {deletingId ===
                              item.availability_id ? (
                                <LoaderCircle size={15} />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
              )}

              {!loading && availability.length > 0 && (
                <button
                  type="button"
                  className="availability-cancel"
                  style={{ marginTop: 18 }}
                  onClick={fetchAvailability}
                >
                  Refresh Schedule
                </button>
              )}
            </section>
          </div>

          <footer className="availability-footer">
            © {new Date().getFullYear()} ProQuire
            {" · "}
            Professional Service Marketplace
          </footer>
        </main>
      </div>
    </>
  );
}

export default Availability;