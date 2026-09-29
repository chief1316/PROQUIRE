import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Wrench,
  User,
  LogOut,
  Briefcase,
  X,
  CalendarDays,
  ClipboardList,
  RefreshCw,
  ArrowRight,
  House,
  Pencil,
  Save,
  Mail,
  Phone,
  MapPinned,
} from "lucide-react";

import "./ClientDashboard.css";
import logo from "../assets/proquire-logo.png";

// IMPORTANT: Use a normal URL here.
const API = "http://localhost:5000/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

function generateTimeSlots(availability) {
  const slots = [];

  const toMinutes = (time) => {
    if (!time) return null;

    const [hours, minutes] = time
      .split(":")
      .map(Number);

    return hours * 60 + minutes;
  };

  availability.forEach((item) => {
    const start = toMinutes(item.available_from);
    const end = toMinutes(item.available_to);

    if (
      start === null ||
      end === null ||
      end <= start
    ) {
      return;
    }

    // Only offer appointment start times that allow
    // a full 30-minute appointment within the window.
    for (
      let minutes = start;
      minutes + 30 <= end;
      minutes += 30
    ) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      const value =
        `${String(hours).padStart(2, "0")}:` +
        `${String(mins).padStart(2, "0")}`;

      if (!slots.includes(value)) {
        slots.push(value);
      }
    }
  });

  return slots.sort();
}

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ClientDashboard() {
  const navigate = useNavigate();
  const token = getToken();

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // --------------------------------------------------
  // DASHBOARD STATE
  // --------------------------------------------------

  const [user, setUser] = useState(null);

  const [technicians, setTechnicians] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const [activeTab, setActiveTab] = useState("find");

  const [selectedTechnician, setSelectedTechnician] =
    useState(null);

  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTime, setServiceTime] = useState("");

  const [technicianAvailability, setTechnicianAvailability] =
  useState([]);

  const [availabilityLoading, setAvailabilityLoading] =
  useState(false);

  const [availabilityError, setAvailabilityError] =
  useState("");

  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // PROFILE STATE
  // --------------------------------------------------

  const [profileOpen, setProfileOpen] = useState(false);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] =
    useState("");

  // Determines whether the client already has a profile.
  const [profileExists, setProfileExists] =
    useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
  });

  // --------------------------------------------------
  // INITIAL PAGE LOAD
  // --------------------------------------------------

  useEffect(() => {
    if (!token) {
      navigate("/login?role=client");
      return;
    }

    try {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        setUser(parsedUser);

        // Use existing login details while loading
        // the full client profile from the backend.
        setProfile((previous) => ({
          ...previous,
          full_name:
            parsedUser.full_name ||
            parsedUser.name ||
            "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
          location: parsedUser.location || "",
        }));
      }
    } catch (err) {
      console.error("Saved user loading error:", err);
    }

    fetchDashboardData();
    fetchProfile();
  }, []);

  // --------------------------------------------------
// LOAD TECHNICIAN AVAILABILITY FOR SELECTED DATE
// --------------------------------------------------

useEffect(() => {
  if (!selectedTechnician || !serviceDate) {
    setTechnicianAvailability([]);
    setServiceTime("");
    setAvailabilityError("");
    return;
  }

  let cancelled = false;

  const fetchAvailability = async () => {
    setAvailabilityLoading(true);
    setAvailabilityError("");
    setTechnicianAvailability([]);
    setServiceTime("");

    try {
      // Parse the date as a calendar date, avoiding
      // timezone shifts when determining the weekday.
      const [year, month, day] = serviceDate
        .split("-")
        .map(Number);

      const selectedDay = new Date(
        Date.UTC(year, month - 1, day)
      );

      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const dayName = weekdays[
        selectedDay.getUTCDay()
      ];

      const response = await axios.get(
        `${API}/availability/technician/${
          selectedTechnician.technician_id
        }`
      );

      if (cancelled) return;

      const allAvailability = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      const matchingAvailability =
        allAvailability.filter((item) => {
          return (
            String(item.available_day).toLowerCase() ===
            dayName.toLowerCase()
          );
        });

      setTechnicianAvailability(
        matchingAvailability
      );

      if (matchingAvailability.length === 0) {
        setAvailabilityError(
          `This technician has no availability saved for ${dayName}. Please select another date.`
        );
      }
    } catch (err) {
      if (cancelled) return;

      console.error(
        "Availability loading error:",
        err
      );

      setAvailabilityError(
        err.response?.data?.message ||
          "Unable to load this technician's availability. Please try again."
      );
    } finally {
      if (!cancelled) {
        setAvailabilityLoading(false);
      }
    }
  };

  fetchAvailability();

  return () => {
    cancelled = true;
  };
}, [selectedTechnician, serviceDate]);

  // --------------------------------------------------
  // LOAD TECHNICIANS AND CATEGORIES
  // --------------------------------------------------

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        technicianResponse,
        categoryResponse,
      ] = await Promise.all([
        axios.get(`${API}/technicians`),
        axios.get(`${API}/categories`),
      ]);

      setTechnicians(
        Array.isArray(technicianResponse.data)
          ? technicianResponse.data
          : []
      );

      setCategories(
        Array.isArray(categoryResponse.data)
          ? categoryResponse.data
          : []
      );
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        "Unable to load professionals. Please check that the backend is running and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD CLIENT PROFILE
  // --------------------------------------------------

  const fetchProfile = async (openIfMissing = false) => {
    if (!token) return;

    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await axios.get(
        `${API}/clients/my-profile`,
        authConfig
      );

      const data = response.data;

      const updatedProfile = {
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
      };

      setProfile(updatedProfile);
      setProfileExists(true);

      // Update user information displayed in the header.
      setUser((previousUser) => {
        const updatedUser = {
          ...(previousUser || {}),
          ...data,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        return updatedUser;
      });

      return true;
    } catch (err) {
      console.error("Profile loading error:", err);

      if (err.response?.status === 404) {
        // No client profile exists yet.
        // Keep any information obtained at login.
        setProfileExists(false);

        setProfile((previous) => ({
          full_name:
            previous.full_name ||
            user?.full_name ||
            user?.name ||
            "",
          email:
            previous.email ||
            user?.email ||
            "",
          phone:
            previous.phone ||
            user?.phone ||
            "",
          location: previous.location || "",
        }));

        if (openIfMissing) {
          setProfileOpen(true);

          setProfileError(
            "Your client profile has not been completed. Fill in the details below to create it."
          );
        }

        return false;
      }

      setProfileError(
        err.response?.data?.message ||
          "Unable to load your profile. Please try again."
      );

      return false;
    } finally {
      setProfileLoading(false);
    }
  };

  // --------------------------------------------------
  // OPEN PROFILE EDITOR
  // --------------------------------------------------

  const openProfile = async () => {
    setProfileError("");
    setProfileSuccess("");
    setProfileOpen(true);

    await fetchProfile(true);
  };

  const closeProfile = () => {
    if (profileSaving) return;

    setProfileOpen(false);
    setProfileError("");
    setProfileSuccess("");
  };

  // --------------------------------------------------
  // PROFILE INPUT HANDLING
  // --------------------------------------------------

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // CREATE OR UPDATE CLIENT PROFILE
  // --------------------------------------------------

  const saveProfile = async (event) => {
    event.preventDefault();

    setProfileError("");
    setProfileSuccess("");

    const full_name = profile.full_name.trim();
    const email = profile.email.trim().toLowerCase();
    const phone = profile.phone.trim();
    const clientLocation = profile.location.trim();

    if (
      !full_name ||
      !email ||
      !phone ||
      !clientLocation
    ) {
      setProfileError(
        "Please complete all profile fields."
      );
      return;
    }

    setProfileSaving(true);

    try {
      const profileData = {
        full_name,
        email,
        phone,
        location: clientLocation,
      };

      let response;

      if (profileExists) {
        // Update the existing profile.
        response = await axios.patch(
          `${API}/clients/profile`,
          profileData,
          authConfig
        );
      } else {
        // Create a new client profile.
        response = await axios.post(
          `${API}/clients/profile`,
          profileData,
          authConfig
        );
      }

      const returnedData =
        response.data?.profile ||
        response.data?.client ||
        response.data ||
        {};

      const updatedProfile = {
        full_name:
          returnedData.full_name || full_name,
        email: returnedData.email || email,
        phone: returnedData.phone || phone,
        location:
          returnedData.location || clientLocation,
      };

      setProfile(updatedProfile);
      setProfileExists(true);

      // Update the displayed user and saved login data.
      setUser((previousUser) => {
        const updatedUser = {
          ...(previousUser || {}),
          ...returnedData,
          ...updatedProfile,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        return updatedUser;
      });

      setProfileSuccess(
        "Your profile has been saved successfully."
      );

      setSuccess(
        "Your profile has been saved successfully."
      );

      // Close the modal after a successful save.
      setProfileOpen(false);
      setProfileError("");
    } catch (err) {
      console.error("Profile saving error:", err);

      if (err.response?.status === 401) {
        setProfileError(
          "Your session has expired. Please log in again."
        );
      } else {
        setProfileError(
          err.response?.data?.message ||
            "Unable to save your profile. Please try again."
        );
      }
    } finally {
      setProfileSaving(false);
    }
  };

  // --------------------------------------------------
  // LOAD SERVICE REQUESTS
  // --------------------------------------------------

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setRequestError("");

    try {
      const response = await axios.get(
        `${API}/service-requests/my-requests`,
        authConfig
      );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error("Request loading error:", err);

      setRequestError(
        err.response?.data?.message ||
          "Unable to load your requests. Please try again."
      );
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    }
  }, [activeTab]);

  // --------------------------------------------------
  // FILTER TECHNICIANS
  // --------------------------------------------------

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((technician) => {
      const query = search.toLowerCase().trim();

      const selectedLocation = location
        .toLowerCase()
        .trim();

      const name = (
        technician.full_name || ""
      ).toLowerCase();

      const profession = (
        technician.category_name || ""
      ).toLowerCase();

      const bio = (
        technician.bio || ""
      ).toLowerCase();

      const technicianLocation = (
        technician.location || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        profession.includes(query) ||
        bio.includes(query);

      const matchesLocation =
        !selectedLocation ||
        technicianLocation.includes(selectedLocation);

      const matchesCategory =
        !category ||
        String(technician.category_id) ===
          String(category) ||
        technician.category_name === category;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesCategory
      );
    });
  }, [
    technicians,
    search,
    location,
    category,
  ]);

  // --------------------------------------------------
  // SERVICE REQUEST MODAL
  // --------------------------------------------------

  const openRequestForm = (technician) => {
  setSelectedTechnician(technician);

  setDescription("");
  setAddress("");
  setServiceDate("");
  setServiceTime("");

  setTechnicianAvailability([]);
  setAvailabilityError("");

  setSuccess("");
  setRequestError("");
};

  const closeRequestForm = () => {
    if (submitting) return;

    setSelectedTechnician(null);
    setRequestError("");
  };

  // --------------------------------------------------
  // SUBMIT SERVICE REQUEST
  // --------------------------------------------------

  // --------------------------------------------------
// SUBMIT SERVICE REQUEST
// --------------------------------------------------

const submitServiceRequest = async (event) => {
  event.preventDefault();

  if (!selectedTechnician) return;

  if (
    !description.trim() ||
    !address.trim() ||
    !serviceDate ||
    !serviceTime
  ) {
    setRequestError(
      "Please complete all fields and select an available appointment time."
    );
    return;
  }

  if (
    availabilityLoading ||
    technicianAvailability.length === 0
  ) {
    setRequestError(
      "There is no confirmed availability for the selected date."
    );
    return;
  }

  setSubmitting(true);
  setRequestError("");
  setSuccess("");

  try {
    await axios.post(
      `${API}/service-requests`,
      {
        technician_id:
          selectedTechnician.technician_id,

        service_description:
          description.trim(),

        service_address:
          address.trim(),

        service_date:
          serviceDate,

        service_time:
          serviceTime,
      },
      authConfig
    );

    setSelectedTechnician(null);

    setSuccess(
      "Your service request has been submitted successfully."
    );

    setActiveTab("requests");

    fetchRequests();
  } catch (err) {
    console.error(
      "Service request error:",
      err
    );

    if (err.response?.status === 401) {
      setRequestError(
        "Your session has expired. Please log in again."
      );
    } else {
      setRequestError(
        err.response?.data?.message ||
          "Unable to submit your request. Please try again."
      );
    }
  } finally {
    setSubmitting(false);
  }
};

  // --------------------------------------------------
  // LOG OUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login?role=client");
  };

  // --------------------------------------------------
  // DISPLAY NAME
  // --------------------------------------------------

  const displayName =
    user?.full_name ||
    user?.name ||
    profile.full_name ||
    "Client";

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="client-dashboard">

      {/* HEADER */}

      <header className="client-header">
        <div className="client-header-inner">

          <Link to="/" className="client-brand">
            <img src={logo} alt="ProQuire" />
          </Link>

          <div className="client-header-right">

            <Link
              to="/"
              className="client-header-button"
            >
              <House size={17} />
              <span>Home</span>
            </Link>

            <button
              type="button"
              className="client-header-button"
              onClick={openProfile}
            >
              <Pencil size={17} />
              <span>
                {profileExists
                  ? "Edit Profile"
                  : "Complete Profile"}
              </span>
            </button>

            <div className="client-user">
              <div className="client-avatar">
                <User size={19} />
              </div>

              <div>
                <span className="client-welcome">
                  Welcome back,
                </span>

                <strong>{displayName}</strong>
              </div>
            </div>

            <button
              className="client-logout"
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={17} />
              <span>Log out</span>
            </button>

          </div>
        </div>
      </header>

      {/* MAIN DASHBOARD */}

      <main className="client-main">

        {/* WELCOME BANNER */}

        <section className="client-welcome-banner">
          <div>
            <span className="client-eyebrow">
              YOUR PROQUIRE DASHBOARD
            </span>

            <h1>
              Find the right professional
              <br />
              <span>for your next job.</span>
            </h1>

            <p>
              Browse skilled technicians, compare their
              experience, and request the service you need.
            </p>

            {!profileExists && (
              <button
                type="button"
                className="client-header-button"
                onClick={openProfile}
                style={{ marginTop: "16px" }}
              >
                <Pencil size={17} />
                Complete Your Profile
              </button>
            )}
          </div>

          <div className="client-banner-icon">
            <Wrench size={60} />
          </div>
        </section>

        {/* DASHBOARD TABS */}

        <div className="client-tabs">
          <button
            className={
              activeTab === "find" ? "active" : ""
            }
            onClick={() => setActiveTab("find")}
            type="button"
          >
            <Search size={18} />
            Find Professionals
          </button>

          <button
            className={
              activeTab === "requests" ? "active" : ""
            }
            onClick={() => setActiveTab("requests")}
            type="button"
          >
            <ClipboardList size={18} />
            My Requests
          </button>
        </div>

        {/* SUCCESS MESSAGE */}

        {success && (
          <div className="client-success">
            <ShieldCheck size={19} />

            {success}

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* FIND PROFESSIONALS */}

        {activeTab === "find" && (
          <>
            <section className="client-search-panel">

              <div className="client-search-heading">
                <div>
                  <h2>Find a professional</h2>

                  <p>
                    Search by service, skill, or location.
                  </p>
                </div>

                <button
                  className="client-refresh"
                  onClick={fetchDashboardData}
                  type="button"
                  title="Refresh professionals"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="client-search-fields">

                <label className="client-search-input">
                  <Search size={19} />

                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </label>

                <label className="client-search-input">
                  <MapPin size={19} />

                  <input
                    type="text"
                    placeholder="Town or location"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                  />
                </label>

                <select
                  className="client-category-select"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                >
                  <option value="">
                    All categories
                  </option>

                  {categories.map((item) => (
                    <option
                      key={item.category_id}
                      value={item.category_id}
                    >
                      {item.category_name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="client-search-submit"
                  onClick={() => {
                    setSearch(search.trim());
                    setLocation(location.trim());
                  }}
                >
                  <Search size={18} />
                  Search
                </button>

              </div>
            </section>

            {/* PROFESSIONAL RESULTS */}

            <section className="client-results-section">

              <div className="client-results-heading">
                <div>
                  <h2>Available professionals</h2>

                  <p>
                    {loading
                      ? "Loading professionals..."
                      : `${filteredTechnicians.length} professional${
                          filteredTechnicians.length === 1
                            ? ""
                            : "s"
                        } found`}
                  </p>
                </div>

                {(search || location || category) && (
                  <button
                    type="button"
                    className="client-clear-filters"
                    onClick={() => {
                      setSearch("");
                      setLocation("");
                      setCategory("");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {error && (
                <div className="client-error">
                  {error}

                  <button
                    type="button"
                    onClick={fetchDashboardData}
                  >
                    Try again
                  </button>
                </div>
              )}

              {loading ? (
                <div className="client-loading">
                  <div className="client-spinner" />
                  <p>
                    Finding professionals for you...
                  </p>
                </div>
              ) : filteredTechnicians.length === 0 ? (
                <div className="client-empty">

                  <div className="client-empty-icon">
                    <Search size={30} />
                  </div>

                  <h3>No professionals found</h3>

                  <p>
                    Try another search term, category, or
                    location.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setLocation("");
                      setCategory("");
                    }}
                  >
                    View all professionals
                  </button>

                </div>
              ) : (
                <div className="client-technician-grid">

                  {filteredTechnicians.map(
                    (technician) => (
                      <article
                        className="client-technician-card"
                        key={technician.technician_id}
                      >

                        <div className="client-card-top">
                          <div className="client-technician-avatar">
                            <User size={27} />
                          </div>

                          <div className="client-verified">
                            <ShieldCheck size={15} />
                            Verified
                          </div>
                        </div>

                        <h3>
                          {technician.full_name ||
                            "Professional"}
                        </h3>

                        <span className="client-technician-category">
                          {technician.category_name ||
                            "Skilled Professional"}
                        </span>

                        <div className="client-card-meta">

                          <span>
                            <MapPin size={15} />

                            {technician.location ||
                              "Location not specified"}
                          </span>

                          <span>
                            <Briefcase size={15} />

                            {technician.years_experience ??
                              0}{" "}
                            years experience
                          </span>

                        </div>

                        <p className="client-technician-bio">
                          {technician.bio ||
                            "This professional has not added a description yet."}
                        </p>

                        <div className="client-card-footer">

                          <span className="client-rating">
                            <Star
                              size={16}
                              fill="currentColor"
                            />
                            Ratings coming soon
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              openRequestForm(technician)
                            }
                          >
                            Request Service
                            <ArrowRight size={16} />
                          </button>

                        </div>
                      </article>
                    )
                  )}

                </div>
              )}
            </section>
          </>
        )}

        
        {/* MY SERVICE REQUESTS */}

        {activeTab === "requests" && (
          <section className="client-requests-section">

            <div className="client-results-heading">
              <div>
                <h2>My service requests</h2>

                <p>
                  Track the services you've requested.
                </p>
              </div>

              <button
                type="button"
                className="client-refresh"
                onClick={fetchRequests}
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {requestError && (
              <div className="client-error">
                {requestError}
              </div>
            )}

            {requestsLoading ? (
              <div className="client-loading">
                <div className="client-spinner" />
                <p>Loading your requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="client-empty">

                <div className="client-empty-icon">
                  <ClipboardList size={30} />
                </div>

                <h3>No service requests yet</h3>

                <p>
                  Once you request a professional, your
                  requests will appear here.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab("find")}
                >
                  Find a professional
                </button>

              </div>
            ) : (
              <div className="client-request-list">

                {requests.map((request) => (
                  <article
                    className="client-request-card"
                    key={request.request_id}
                  >

                    <div className="client-request-icon">
                      <Wrench size={22} />
                    </div>

                    <div className="client-request-details">

                      <h3>
                        {request.service_description}
                      </h3>

                      <p>
                        <MapPin size={15} />
                        {request.service_address}
                      </p>

                      <p>
                        <CalendarDays size={15} />

                        {request.service_date
                          ? new Date(
                              request.service_date
                            ).toLocaleDateString()
                          : "Date not specified"}
                      </p>

                      {request.service_time && (
                        <p>
                          <CalendarDays size={15} />

                          Appointment time:{" "}
                          {formatTime(
                            String(request.service_time)
                              .slice(0, 5)
                          )}
                        </p>
                      )}

                      <span className="client-request-technician">
                        Technician:{" "}
                        {request.technician_name ||
                          "Assigned professional"}
                      </span>

                      {/* TECHNICIAN CONTACT DETAILS
                          Visible only after acceptance */}

                      {String(
                        request.request_status || ""
                      ).toLowerCase() === "accepted" && (
                        <div className="client-technician-contact">

                          <h4>
                            <ShieldCheck size={17} />
                            Technician contact details
                          </h4>

                          {request.technician_phone ? (
                            <p>
                              <Phone size={16} />

                              <a
                                href={`tel:${request.technician_phone}`}
                              >
                                {request.technician_phone}
                              </a>
                            </p>
                          ) : (
                            <p>
                              <Phone size={16} />
                              Phone number not available
                            </p>
                          )}

                          {request.technician_email ? (
                            <p>
                              <Mail size={16} />

                              <a
                                href={`mailto:${request.technician_email}`}
                              >
                                {request.technician_email}
                              </a>
                            </p>
                          ) : (
                            <p>
                              <Mail size={16} />
                              Email address not available
                            </p>
                          )}

                        </div>
                      )}

                    </div>

                    <div className="client-request-status">
                      <span
                        className={`request-status ${
                          (
                            request.request_status ||
                            "pending"
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                        }`}
                      >
                        {request.request_status ||
                          "Pending"}
                      </span>
                    </div>

                  </article>
                ))}

              </div>
            )}
          </section>
        )}
      </main>

      {/* FOOTER */}

      <footer className="client-footer">
        <img src={logo} alt="ProQuire" />

        <span>
          Connecting clients with skilled professionals.
        </span>

        <span>© 2026 ProQuire</span>
      </footer>

      {/* ==========================================
          EDIT / COMPLETE CLIENT PROFILE MODAL
      ========================================== */}

      {profileOpen && (
        <div
          className="client-modal-overlay"
          onClick={closeProfile}
        >
          <div
            className="client-request-modal client-profile-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="client-modal-heading">
              <div>
                <span className="client-eyebrow">
                  ACCOUNT SETTINGS
                </span>

                <h2>
                  {profileExists
                    ? "Edit your profile"
                    : "Complete your profile"}
                </h2>

                <p>
                  Update your personal and contact details.
                </p>
              </div>

              <button
                type="button"
                className="client-modal-close"
                onClick={closeProfile}
                disabled={profileSaving}
                aria-label="Close profile editor"
              >
                <X size={21} />
              </button>
            </div>

            {/* PROFILE ERROR */}

            {profileError && (
              <div className="client-error">
                {profileError}
              </div>
            )}

            {/* PROFILE SUCCESS */}

            {profileSuccess && (
              <div className="client-success">
                <ShieldCheck size={18} />
                {profileSuccess}
              </div>
            )}

            {/* PROFILE FORM */}

            {profileLoading ? (
              <div className="client-loading">
                <div className="client-spinner" />
                <p>Loading your profile...</p>
              </div>
            ) : (
              <form
                className="client-request-form"
                onSubmit={saveProfile}
              >

                <label>
                  Full name

                  <div className="client-profile-input">
                    <User size={18} />

                    <input
                      type="text"
                      name="full_name"
                      placeholder="Your full name"
                      value={profile.full_name}
                      onChange={handleProfileChange}
                      required
                      maxLength={100}
                    />
                  </div>
                </label>

                <label>
                  Email address

                  <div className="client-profile-input">
                    <Mail size={18} />

                    <input
                      type="email"
                      name="email"
                      placeholder="Your email address"
                      value={profile.email}
                      onChange={handleProfileChange}
                      required
                      maxLength={255}
                    />
                  </div>
                </label>

                <label>
                  Phone number

                  <div className="client-profile-input">
                    <Phone size={18} />

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Your phone number"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      required
                      maxLength={30}
                    />
                  </div>
                </label>

                <label>
                  Location

                  <div className="client-profile-input">
                    <MapPinned size={18} />

                    <input
                      type="text"
                      name="location"
                      placeholder="Town or area"
                      value={profile.location}
                      onChange={handleProfileChange}
                      required
                      maxLength={255}
                    />
                  </div>
                </label>

                <div className="client-modal-actions">

                  <button
                    type="button"
                    className="client-cancel-button"
                    onClick={closeProfile}
                    disabled={profileSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="client-submit-request"
                    disabled={profileSaving}
                  >
                    <Save size={17} />

                    {profileSaving
                      ? "Saving..."
                      : profileExists
                      ? "Save Changes"
                      : "Complete Profile"}
                  </button>

                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          SERVICE REQUEST MODAL
      ========================================== */}

      {selectedTechnician && (
        <div
          className="client-modal-overlay"
          onClick={closeRequestForm}
        >
          <div
            className="client-request-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="client-modal-heading">
              <div>
                <span className="client-eyebrow">
                  HIRE A PROFESSIONAL
                </span>

                <h2>Request a service</h2>

                <p>
                  Send a request to{" "}
                  <strong>
                    {selectedTechnician.full_name}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                className="client-modal-close"
                onClick={closeRequestForm}
                disabled={submitting}
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            {requestError && (
              <div className="client-error">
                {requestError}
              </div>
            )}

            <form
              className="client-request-form"
              onSubmit={submitServiceRequest}
            >

              <label>
                Service description

                <textarea
                  rows="4"
                  placeholder="Describe the work you need done..."
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Service address

                <input
                  type="text"
                  placeholder="Where should the service be performed?"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  required
                />
              </label>

                            <label>
                Preferred service date

                <input
                  type="date"
                  min={(() => {
                    const today = new Date();

                    const year = today.getFullYear();

                    const month = String(
                      today.getMonth() + 1
                    ).padStart(2, "0");

                    const day = String(
                      today.getDate()
                    ).padStart(2, "0");

                    return `${year}-${month}-${day}`;
                  })()}
                  value={serviceDate}
                  onChange={(event) => {
                    setServiceDate(event.target.value);
                    setServiceTime("");
                    setRequestError("");
                  }}
                  required
                />
              </label>

              {/* AVAILABLE APPOINTMENT TIMES */}

              {serviceDate && (
                <div className="client-availability-section">

                  <label>
                    Available appointment times
                  </label>

                  {availabilityLoading ? (
                    <p>
                      Checking technician availability...
                    </p>
                  ) : availabilityError ? (
                    <div className="client-error">
                      {availabilityError}
                    </div>
                  ) : (
                    <>
                      {technicianAvailability.length > 0 && (
                        <>
                          <p>
                            Select a 30-minute appointment
                            start time:
                          </p>

                          <select
                            value={serviceTime}
                            onChange={(event) => {
                              setServiceTime(
                                event.target.value
                              );

                              setRequestError("");
                            }}
                            required
                          >
                            <option value="">
                              Choose an available time
                            </option>

                            {generateTimeSlots(
                              technicianAvailability
                            ).map((time) => (
                              <option
                                key={time}
                                value={time}
                              >
                                {formatTime(time)}
                              </option>
                            ))}
                          </select>

                          {generateTimeSlots(
                            technicianAvailability
                          ).length === 0 && (
                            <p>
                              No appointment slots are
                              available for this date.
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* REQUEST FORM ACTIONS */}

              <div className="client-modal-actions">

                <button
                  type="button"
                  className="client-cancel-button"
                  onClick={closeRequestForm}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="client-submit-request"
                  disabled={
                    submitting ||
                    availabilityLoading ||
                    !serviceDate ||
                    !serviceTime ||
                    technicianAvailability.length === 0
                  }
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Service Request"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default ClientDashboard;