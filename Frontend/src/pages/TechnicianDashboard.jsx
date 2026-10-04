import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TechnicianDashboard.css";
import TechnicianNotifications from "./technician/TechnicianNotifications";
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  CalendarDays,
  ClipboardList,
  Star,
  BriefcaseBusiness,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  CheckCircle,
  Clock3,
  AlertCircle,
  ArrowRight,
  Menu,
  X,
  Wrench,
  MapPin,
  RefreshCw,
} from "lucide-react";

const API = "http://localhost:5000/api";

function TechnicianDashboard() {
  const navigate = useNavigate();

  const [technicianProfile, setTechnicianProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [serviceRequests, setServiceRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loadingRequests, setLoadingRequests] = useState(true);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewError, setReviewError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const technicianName =
    user.full_name || user.name || technicianProfile?.full_name || "Technician";

  const token = sessionStorage.getItem("token");

  // Fetch technician profile
  useEffect(() => {
    const fetchTechnicianProfile = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(`${API}/technicians/my-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTechnicianProfile(response.data);
      } catch (error) {
        console.error("Error fetching technician profile:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

          navigate("/login");
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchTechnicianProfile();
  }, [navigate, token]);

  // Fetch service requests assigned to this technician
  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!technicianProfile?.technician_id) {
        if (!loadingProfile) {
          setLoadingRequests(false);
        }
        return;
      }

      try {
        setLoadingRequests(true);
        setRequestError("");

        const response = await axios.get(
          `${API}/service-requests/technician/${technicianProfile.technician_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setServiceRequests(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching service requests:", error);

        setRequestError(
          error.response?.data?.message || "Unable to load service requests.",
        );
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchServiceRequests();
  }, [technicianProfile, loadingProfile, token]);

  // Fetch technician reviews and average rating
  useEffect(() => {
    const fetchReviews = async () => {
      if (!technicianProfile?.technician_id) {
        if (!loadingProfile) {
          setLoadingReviews(false);
        }
        return;
      }

      try {
        setLoadingReviews(true);
        setReviewError("");

        const technicianId = technicianProfile.technician_id;

        const [reviewsResponse, ratingResponse] = await Promise.all([
          axios.get(`${API}/reviews/technician/${technicianId}`),

          axios.get(`${API}/reviews/technician/${technicianId}/rating`),
        ]);

        setReviews(
          Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [],
        );

        const ratingData = ratingResponse.data || {};

        setAverageRating(Number(ratingData.average_rating || 0));

        setTotalReviews(Number(ratingData.total_reviews || 0));
      } catch (error) {
        console.error("Error fetching technician reviews:", error);

        setReviewError(
          error.response?.data?.message || "Unable to load reviews.",
        );
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [technicianProfile, loadingProfile]);

  // Fetch technician notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(`${API}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("TECHNICIAN NOTIFICATIONS API RESPONSE:", response.data);

        const databaseNotifications = Array.isArray(response.data)
          ? response.data.map((notification) => ({
              notification_id: notification.notification_id,
              technician_id: notification.technician_id,
              document_id: notification.document_id,
              type: notification.notification_type,
              title: notification.title,
              message: notification.message,
              is_read: notification.is_read,
              time: notification.created_at
                ? new Date(notification.created_at).toLocaleString()
                : "",
            }))
          : [];

        setNotifications(databaseNotifications);
      } catch (error) {
        console.error("Error fetching technician notifications:", error);
      }
    };

    fetchNotifications();
  }, [token]);

  // Profile completion
  const profileCompletion = useMemo(() => {
    if (!technicianProfile) {
      return 25;
    }

    const requirements = [
      Boolean(technicianProfile.category_id),
      Boolean(technicianProfile.bio),
      technicianProfile.years_experience !== null &&
        technicianProfile.years_experience !== undefined,
      Boolean(technicianProfile.location),
      Boolean(technicianProfile.employment_type),
    ];

    if (technicianProfile.employment_type === "Agency") {
      requirements.push(Boolean(technicianProfile.agency_id));
    }

    const completed = requirements.filter(Boolean).length;

    return Math.round((completed / requirements.length) * 100);
  }, [technicianProfile]);

  const isProfileComplete = profileCompletion === 100;

  const verificationStatus =
    technicianProfile?.verification_status || "pending";

  const rejectionReason = technicianProfile?.rejection_reason || "";

  const isVerified = verificationStatus === "approved";

  const pendingRequests = serviceRequests.filter(
    (request) => request.request_status === "pending",
  );

  const acceptedRequests = serviceRequests.filter(
    (request) => request.request_status === "accepted",
  );

  // Accept or reject a request
  const handleRequestDecision = async (requestId, status) => {
    const action = status === "accepted" ? "accept" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this service request?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingRequestId(requestId);
      setRequestMessage("");
      setRequestError("");

      const response = await axios.patch(
        `${API}/service-requests/${requestId}/status`,
        {
          request_status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update the request status immediately.
      setServiceRequests((previousRequests) =>
        previousRequests.map((request) =>
          request.request_id === requestId
            ? {
                ...request,
                request_status: response.data.request_status,
              }
            : request,
        ),
      );

      // Reload requests so the accepted request receives the
      // client's phone and email from the backend response.
      if (status === "accepted" && technicianProfile?.technician_id) {
        const refreshedRequests = await axios.get(
          `${API}/service-requests/technician/${technicianProfile.technician_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setServiceRequests(
          Array.isArray(refreshedRequests.data) ? refreshedRequests.data : [],
        );
      }

      setRequestMessage(`Request ${status} successfully.`);
    } catch (error) {
      console.error("Error updating service request:", error);

      setRequestError(
        error.response?.data?.message ||
          "Unable to update the request. Please try again.",
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  // Mark an accepted request as completed
  const handleCompleteRequest = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this service request as completed?",
    );

    if (!confirmed) return;

    try {
      setUpdatingRequestId(requestId);
      setRequestMessage("");
      setRequestError("");

      const response = await axios.patch(
        `${API}/service-requests/${requestId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setServiceRequests((previousRequests) =>
        previousRequests.map((request) =>
          request.request_id === requestId
            ? {
                ...request,
                request_status: response.data.request_status,
              }
            : request,
        ),
      );

      setRequestMessage("Service request completed successfully.");
    } catch (error) {
      console.error("Error completing service request:", error);

      setRequestError(
        error.response?.data?.message ||
          "Unable to complete the request. Please try again.",
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString();
  };

  return (
    <>
      {/* Dashboard styles are imported from TechnicianDashboard.css. */}

      <div style={styles.page} className="technician-dashboard-page">
        <div
          className={`mobile-overlay ${mobileMenuOpen ? "visible" : ""}`}
          onClick={closeMobileMenu}
        />

        {/* Sidebar */}
        <aside
          style={styles.sidebar}
          className={`technician-sidebar ${
            mobileMenuOpen ? "mobile-open" : ""
          }`}
        >
          <div style={styles.sidebarTop}>
            <Link to="/" style={styles.logo} onClick={closeMobileMenu}>
              <div style={styles.logoIcon}>
                <Wrench size={21} />
              </div>

              <span>
                Pro<span style={styles.logoAccent}>Quire</span>
              </span>
            </Link>

            <nav style={styles.navigation}>
              <p style={styles.navTitle}>MAIN MENU</p>

              <Link
                to="/technician"
                style={{
                  ...styles.navItem,
                  ...styles.activeNavItem,
                }}
                onClick={closeMobileMenu}
              >
                <LayoutDashboard size={19} />
                Dashboard
              </Link>

              <Link
                to="/technician/profile"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <User size={19} />
                My Profile
              </Link>

              <button
                type="button"
                style={styles.navButton}
                onClick={() => {
                  document.getElementById("service-requests")?.scrollIntoView({
                    behavior: "smooth",
                  });
                  closeMobileMenu();
                }}
              >
                <ClipboardList size={19} />
                Service Requests
                {pendingRequests.length > 0 && (
                  <span style={styles.navCount}>{pendingRequests.length}</span>
                )}
              </button>

              <Link
                to="/technician/availability"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <CalendarDays size={19} />
                Availability
              </Link>

              <Link
                to="/technician/portfolio"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <BriefcaseBusiness size={19} />
                Portfolio
              </Link>

              <button
                type="button"
                style={styles.navButton}
                onClick={() => {
                  document.getElementById("reviews")?.scrollIntoView({
                    behavior: "smooth",
                  });

                  closeMobileMenu();
                }}
              >
                <Star size={19} />
                Reviews
              </button>

              <p
                style={{
                  ...styles.navTitle,
                  marginTop: "28px",
                }}
              >
                ACCOUNT
              </p>

              <Link
                to="/technician/subscription"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <CreditCard size={19} />
                Subscription
              </Link>

              <Link
                to="/technician"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <Settings size={19} />
                Settings
              </Link>
            </nav>
          </div>

          <div style={styles.sidebarBottom}>
            <div style={styles.sidebarHelp}>
              <ShieldCheck size={20} />

              <div>
                <strong>ProQuire Verified</strong>
                <span>Build trust with clients</span>
              </div>
            </div>

            <button onClick={handleLogout} style={styles.logoutButton}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>
        {mobileMenuOpen && (
          <div
            className="technician-mobile-overlay"
            onClick={closeMobileMenu}
          />
        )}

        {/* Main dashboard */}
        <main style={styles.main} className="technician-main">
          <header style={styles.topbar} className="technician-topbar">
            <div>
              <button
                style={styles.mobileMenu}
                className="technician-mobile-menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open navigation menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

            <div style={styles.topbarRight} className="technician-topbar-right">
              <TechnicianNotifications notifications={notifications} />

              <div style={styles.profileMini}>
                <div
                  style={styles.avatar}
                  className="technician-profile-avatar"
                >
                  {technicianName.charAt(0).toUpperCase()}
                </div>

                <div
                  style={styles.profileMiniText}
                  className="technician-profile-mini-text"
                >
                  <strong>{technicianName}</strong>
                  <span>Technician</span>
                </div>
              </div>

              <button
                className="topbar-logout-button"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={17} />
                <span className="topbar-logout-text">Logout</span>
              </button>
            </div>
          </header>

          <section style={styles.content} className="technician-content">
            {/* Welcome */}
            <div style={styles.welcomeRow} className="technician-welcome-row">
              <div>
                <p style={styles.pageLabel}>TECHNICIAN DASHBOARD</p>

                <h1 style={styles.heading} className="technician-heading">
                  Welcome back, {technicianName.split(" ")[0]}!
                </h1>

                <p style={styles.subheading} className="technician-subheading">
                  Manage your professional profile, requests and services from
                  one place.
                </p>
              </div>

              <button
                style={styles.primaryButton}
                className="technician-primary-button"
                onClick={() => navigate("/technician/profile")}
              >
                <User size={18} />
                View Profile
              </button>
            </div>

            {/* Verification banner */}
            <div
              style={styles.verificationBanner}
              className="technician-verification-banner"
            >
              <div
                style={styles.verificationIcon}
                className="technician-verification-icon"
              >
                <ShieldCheck size={27} />
              </div>

              <div
                style={styles.verificationText}
                className="technician-verification-text"
              >
                <div
                  style={styles.verificationTitleRow}
                  className="technician-verification-title-row"
                >
                  <h3
                    style={styles.verificationTitle}
                    className="technician-verification-title"
                  >
                    Profile verification
                  </h3>

                  <span
                    style={
                      verificationStatus === "approved"
                        ? styles.verifiedBadge
                        : verificationStatus === "rejected"
                          ? styles.rejectedBadge
                          : styles.pendingBadge
                    }
                  >
                    {verificationStatus === "approved"
                      ? "Verified"
                      : verificationStatus === "rejected"
                        ? "Rejected"
                        : "Pending"}
                  </span>
                </div>

                <p>
                  {verificationStatus === "approved"
                    ? "Your professional profile has been verified and is ready to build trust with clients."
                    : verificationStatus === "rejected"
                      ? "Your verification documents were rejected. Please review the reason below and submit clearer or corrected documents."
                      : "Complete your professional profile and submit your documents for verification to build trust with potential clients."}
                </p>

                {verificationStatus === "rejected" && rejectionReason && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "12px 14px",
                      background: "#fff7f7",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      color: "#991b1b",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                  >
                    <strong>Reason for rejection:</strong> {rejectionReason}
                  </div>
                )}
              </div>

              {verificationStatus !== "approved" && (
                <button
                  style={styles.outlineButton}
                  className="technician-outline-button"
                  onClick={() =>
                    navigate(
                      isProfileComplete
                        ? "/technician/verification"
                        : "/technician/profile",
                    )
                  }
                >
                  {isProfileComplete ? "Submit Documents" : "Complete Profile"}

                  <ArrowRight size={17} />
                </button>
              )}
            </div>

            {/* Statistics */}
            <div style={styles.statsGrid} className="technician-stats-grid">
              <div style={styles.statCard} className="technician-stat-card">
                <div
                  style={{
                    ...styles.statIcon,
                    background: "#eaf2ff",
                    color: "#1769e0",
                  }}
                >
                  <ClipboardList size={21} />
                </div>

                <div>
                  <span style={styles.statLabel}>Pending Requests</span>

                  <strong
                    style={styles.statValue}
                    className="technician-stat-value"
                  >
                    {pendingRequests.length}
                  </strong>

                  <span style={styles.statDescription}>
                    Awaiting your response
                  </span>
                </div>
              </div>

              <div style={styles.statCard} className="technician-stat-card">
                <div
                  style={{
                    ...styles.statIcon,
                    background: "#eaf9f0",
                    color: "#159447",
                  }}
                >
                  <CheckCircle size={21} />
                </div>

                <div>
                  <span style={styles.statLabel}>Accepted Requests</span>

                  <strong
                    style={styles.statValue}
                    className="technician-stat-value"
                  >
                    {acceptedRequests.length}
                  </strong>

                  <span style={styles.statDescription}>
                    Requests you've accepted
                  </span>
                </div>
              </div>

              <div style={styles.statCard} className="technician-stat-card">
                <div
                  style={{
                    ...styles.statIcon,
                    background: "#fff6df",
                    color: "#c58a00",
                  }}
                >
                  <Star size={21} />
                </div>

                <div>
                  <span style={styles.statLabel}>Average Rating</span>

                  <strong
                    style={styles.statValue}
                    className="technician-stat-value"
                  >
                    {loadingReviews
                      ? "—"
                      : averageRating > 0
                        ? averageRating.toFixed(1)
                        : "—"}
                  </strong>

                  <span style={styles.statDescription}>
                    {loadingReviews
                      ? "Loading reviews..."
                      : totalReviews > 0
                        ? `${totalReviews} review${
                            totalReviews === 1 ? "" : "s"
                          }`
                        : "No reviews yet"}
                  </span>
                </div>
              </div>

              <div style={styles.statCard} className="technician-stat-card">
                <div
                  style={{
                    ...styles.statIcon,
                    background: "#f2edff",
                    color: "#7048c8",
                  }}
                >
                  <CreditCard size={21} />
                </div>

                <div>
                  <span style={styles.statLabel}>Subscription</span>

                  <strong
                    style={styles.statValue}
                    className="technician-stat-value"
                  >
                    Basic
                  </strong>

                  <span style={styles.statDescription}>Manage your plan</span>
                </div>
              </div>
            </div>

            {/* Service requests and profile completion */}
            <div
              style={styles.dashboardGrid}
              className="technician-dashboard-grid"
            >
              <div
                id="service-requests"
                style={styles.panel}
                className="technician-panel"
              >
                <div
                  style={styles.panelHeader}
                  className="technician-panel-header"
                >
                  <div>
                    <h2
                      style={styles.panelTitle}
                      className="technician-panel-title"
                    >
                      Service Requests
                    </h2>

                    <p style={styles.panelSubtitle}>
                      Review and respond to client requests
                    </p>
                  </div>

                  <button
                    type="button"
                    style={styles.textButton}
                    onClick={() => {
                      setRequestMessage("");
                      setRequestError("");
                      setLoadingRequests(true);

                      axios
                        .get(
                          `${API}/service-requests/technician/${technicianProfile?.technician_id}`,
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          },
                        )
                        .then((response) => {
                          setServiceRequests(
                            Array.isArray(response.data) ? response.data : [],
                          );
                        })
                        .catch((error) => {
                          console.error(error);
                          setRequestError("Unable to refresh requests.");
                        })
                        .finally(() => {
                          setLoadingRequests(false);
                        });
                    }}
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>
                </div>

                {requestMessage && (
                  <div style={styles.successMessage}>
                    <CheckCircle size={17} />
                    {requestMessage}
                  </div>
                )}

                {requestError && (
                  <div style={styles.errorMessage}>
                    <AlertCircle size={17} />
                    {requestError}
                  </div>
                )}

                {loadingRequests ? (
                  <div
                    style={styles.emptyState}
                    className="technician-empty-state"
                  >
                    <Clock3 size={25} color="#8090a5" />
                    <p>Loading service requests...</p>
                  </div>
                ) : serviceRequests.length === 0 ? (
                  <div
                    style={styles.emptyState}
                    className="technician-empty-state"
                  >
                    <div style={styles.emptyIcon}>
                      <ClipboardList size={25} />
                    </div>

                    <h3>No service requests yet</h3>

                    <p>
                      Client service requests will appear here once clients
                      request your services.
                    </p>
                  </div>
                ) : (
                  <div
                    style={styles.requestList}
                    className="technician-request-list"
                  >
                    {serviceRequests.map((request) => {
                      const isPending = request.request_status === "pending";

                      const isUpdating =
                        updatingRequestId === request.request_id;

                      return (
                        <div
                          key={request.request_id}
                          style={styles.requestCard}
                        >
                          <div style={styles.requestCardHeader}>
                            <div>
                              <h3 style={styles.requestTitle}>
                                Service Request #{request.request_id}
                              </h3>

                              <p style={styles.requestDescription}>
                                {request.service_description}
                              </p>
                            </div>

                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(isPending
                                  ? styles.statusPending
                                  : request.request_status === "accepted"
                                    ? styles.statusAccepted
                                    : request.request_status === "rejected"
                                      ? styles.statusRejected
                                      : styles.statusOther),
                              }}
                            >
                              {request.request_status}
                            </span>
                          </div>

                          <div style={styles.requestDetails}>
                            <p>
                              <strong>Client:</strong>{" "}
                              {request.client_name || "Name unavailable"}
                            </p>

                            {request.request_status === "accepted" && (
                              <>
                                <p>
                                  <strong>Phone:</strong>{" "}
                                  {request.client_phone || "Not provided"}
                                </p>

                                <p>
                                  <strong>Email:</strong>{" "}
                                  {request.client_email || "Not provided"}
                                </p>
                              </>
                            )}

                            <p>
                              <MapPin
                                size={14}
                                style={{
                                  verticalAlign: "middle",
                                  marginRight: "4px",
                                }}
                              />
                              <strong>Address:</strong>{" "}
                              {request.service_address || "Not specified"}
                            </p>

                            <p>
                              <CalendarDays
                                size={14}
                                style={{
                                  verticalAlign: "middle",
                                  marginRight: "4px",
                                }}
                              />
                              <strong>Service date:</strong>{" "}
                              {formatDate(request.service_date)}
                            </p>

                            {request.request_date && (
                              <p>
                                <strong>Requested on:</strong>{" "}
                                {formatDate(request.request_date)}
                              </p>
                            )}
                          </div>

                          {isPending && (
                            <div style={styles.requestActions}>
                              <button
                                type="button"
                                className="request-action-button request-accept-button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleRequestDecision(
                                    request.request_id,
                                    "accepted",
                                  )
                                }
                              >
                                {isUpdating
                                  ? "Processing..."
                                  : "Accept Request"}
                              </button>

                              <button
                                type="button"
                                className="request-action-button request-reject-button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleRequestDecision(
                                    request.request_id,
                                    "rejected",
                                  )
                                }
                              >
                                {isUpdating
                                  ? "Processing..."
                                  : "Reject Request"}
                              </button>
                            </div>
                          )}

                          {request.request_status === "accepted" && (
                            <div style={styles.requestActions}>
                              <button
                                type="button"
                                className="request-action-button request-accept-button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleCompleteRequest(request.request_id)
                                }
                              >
                                {isUpdating
                                  ? "Processing..."
                                  : "Mark as Completed"}
                              </button>
                            </div>
                          )}

                          {request.request_status === "completed" && (
                            <p style={styles.processedText}>
                              This service request has been completed.
                            </p>
                          )}

                          {request.request_status === "rejected" && (
                            <p style={styles.processedText}>
                              This request has been rejected.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Profile completion */}
              <div style={styles.panel} className="technician-panel">
                <div
                  style={styles.panelHeader}
                  className="technician-panel-header"
                >
                  <div>
                    <h2
                      style={styles.panelTitle}
                      className="technician-panel-title"
                    >
                      Profile Completion
                    </h2>

                    <p style={styles.panelSubtitle}>
                      Complete your profile to attract clients
                    </p>
                  </div>
                </div>

                <div style={styles.progressContainer}>
                  <div style={styles.progressHeader}>
                    <span>
                      {loadingProfile
                        ? "Loading profile..."
                        : "Profile progress"}
                    </span>

                    <strong>
                      {loadingProfile ? "—" : `${profileCompletion}%`}
                    </strong>
                  </div>

                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${profileCompletion}%`,
                      }}
                    />
                  </div>
                </div>

                <div style={styles.checkList}>
                  <div style={styles.checkItem}>
                    <CheckCircle size={18} color="#1b9a50" />
                    <span>Account created</span>
                  </div>

                  <div style={styles.checkItem}>
                    <CheckCircle size={18} color="#1b9a50" />
                    <span>Email registered</span>
                  </div>

                  <div style={styles.checkItem}>
                    {technicianProfile && profileCompletion === 100 ? (
                      <CheckCircle size={18} color="#1b9a50" />
                    ) : (
                      <Clock3 size={18} color="#d18b00" />
                    )}

                    <span>Complete professional profile</span>
                  </div>

                  <div style={styles.checkItem}>
                    {isVerified ? (
                      <CheckCircle size={18} color="#1b9a50" />
                    ) : (
                      <AlertCircle size={18} color="#e05252" />
                    )}

                    <span>
                      {isVerified
                        ? "Verification approved"
                        : "Submit verification documents"}
                    </span>
                  </div>
                </div>

                <button
                  style={styles.fullButton}
                  onClick={() => navigate("/technician/profile")}
                >
                  {isProfileComplete ? "View Profile" : "Complete Profile"}

                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

            {/* Reviews */}
            <div
              id="reviews"
              style={styles.panel}
              className="technician-panel technician-reviews-panel"
            >
              <div
                style={styles.panelHeader}
                className="technician-panel-header"
              >
                <div>
                  <h2
                    style={styles.panelTitle}
                    className="technician-panel-title"
                  >
                    Reviews
                  </h2>

                  <p style={styles.panelSubtitle}>
                    See what clients have said about your services.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#c58a00",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  <Star size={18} fill="currentColor" />

                  {loadingReviews
                    ? "—"
                    : averageRating > 0
                      ? averageRating.toFixed(1)
                      : "—"}
                </div>
              </div>

              {reviewError && (
                <div style={styles.errorMessage}>
                  <AlertCircle size={17} />
                  {reviewError}
                </div>
              )}

              {loadingReviews ? (
                <div
                  style={styles.emptyState}
                  className="technician-empty-state"
                >
                  <Clock3 size={25} color="#8090a5" />

                  <p>Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div
                  style={styles.emptyState}
                  className="technician-empty-state"
                >
                  <div style={styles.emptyIcon}>
                    <Star size={25} />
                  </div>

                  <h3>No reviews yet</h3>

                  <p>
                    Reviews from clients will appear here after completed
                    services.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {reviews.map((review) => (
                    <div
                      key={review.review_id}
                      style={{
                        border: "1px solid #e7ebf2",
                        borderRadius: "10px",
                        padding: "16px",
                        background: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "15px",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display: "block",
                              color: "#172033",
                              fontSize: "14px",
                            }}
                          >
                            {review.client_name || "Client"}
                          </strong>

                          {review.service_description && (
                            <span
                              style={{
                                display: "block",
                                marginTop: "4px",
                                color: "#7a8496",
                                fontSize: "12px",
                              }}
                            >
                              {review.service_description}
                            </span>
                          )}

                          {review.request_id && (
                            <span
                              style={{
                                display: "block",
                                marginTop: "3px",
                                color: "#98a1b2",
                                fontSize: "11px",
                              }}
                            >
                              Service Request #{review.request_id}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                            color: "#f59e0b",
                            flexShrink: 0,
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={15}
                              fill={
                                star <= Number(review.rating)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      {review.comment && (
                        <p
                          style={{
                            margin: "12px 0 0",
                            color: "#596579",
                            fontSize: "13px",
                            lineHeight: "1.6",
                          }}
                        >
                          "{review.comment}"
                        </p>
                      )}

                      {review.review_date && (
                        <span
                          style={{
                            display: "block",
                            marginTop: "10px",
                            color: "#98a1b2",
                            fontSize: "11px",
                          }}
                        >
                          {formatDate(review.review_date)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div style={styles.quickSection}>
              <div>
                <h2 style={styles.quickTitle}>Quick Actions</h2>

                <p style={styles.quickSubtitle}>
                  Manage the most important parts of your professional account.
                </p>
              </div>

              <div style={styles.quickGrid} className="technician-quick-grid">
                <button
                  style={styles.quickCard}
                  className="technician-quick-card"
                  onClick={() => navigate("/technician/profile")}
                >
                  <User size={22} color="#1769e0" />

                  <div>
                    <strong>Edit Profile</strong>
                    <span>Update your professional information</span>
                  </div>

                  <ArrowRight size={17} />
                </button>

                <button
                  style={styles.quickCard}
                  className="technician-quick-card"
                  onClick={() => navigate("/technician/availability")}
                >
                  <CalendarDays size={22} color="#159447" />

                  <div>
                    <strong>Set Availability</strong>
                    <span>Manage your working hours</span>
                  </div>

                  <ArrowRight size={17} />
                </button>

                <button
                  style={styles.quickCard}
                  className="technician-quick-card"
                  onClick={() => navigate("/technician/portfolio")}
                >
                  <BriefcaseBusiness size={22} color="#7048c8" />

                  <div>
                    <strong>Manage Portfolio</strong>
                    <span>Showcase your previous work</span>
                  </div>

                  <ArrowRight size={17} />
                </button>

                <button
                  style={styles.quickCard}
                  className="technician-quick-card"
                  onClick={() => navigate("/technician/subscription")}
                >
                  <CreditCard size={22} color="#c58a00" />

                  <div>
                    <strong>Manage Subscription</strong>
                    <span>View your subscription plan</span>
                  </div>

                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </section>

          <footer style={styles.footer} className="technician-footer">
            <span>© {new Date().getFullYear()} ProQuire</span>

            <span>Professional Service Marketplace</span>
          </footer>
        </main>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f8fc",
    color: "#172033",
    display: "flex",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "#ffffff",
    borderRight: "1px solid #e7ebf2",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
  },

  sidebarTop: {
    padding: "25px 17px",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    color: "#1769e0",
    fontSize: "25px",
    fontWeight: "800",
    padding: "0 9px",
    marginBottom: "38px",
  },

  logoIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#1769e0",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoAccent: {
    color: "#172033",
  },

  navigation: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  navTitle: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
    color: "#98a1b2",
    margin: "0 10px 9px",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "12px",
    borderRadius: "9px",
    textDecoration: "none",
    color: "#697386",
    fontSize: "14px",
    fontWeight: "500",
    transition: "0.2s",
  },

  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "12px",
    borderRadius: "9px",
    border: "none",
    background: "transparent",
    color: "#697386",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },

  navCount: {
    marginLeft: "auto",
    background: "#1769e0",
    color: "#fff",
    borderRadius: "20px",
    padding: "2px 7px",
    fontSize: "11px",
    fontWeight: "700",
  },

  activeNavItem: {
    background: "#eaf2ff",
    color: "#1769e0",
    fontWeight: "650",
  },

  sidebarBottom: {
    padding: "17px",
    borderTop: "1px solid #edf0f5",
  },

  sidebarHelp: {
    display: "flex",
    gap: "10px",
    padding: "13px",
    background: "#f4f8ff",
    borderRadius: "10px",
    color: "#1769e0",
    marginBottom: "13px",
  },

  logoutButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#697386",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 12px",
    cursor: "pointer",
    fontSize: "14px",
  },

  main: {
    marginLeft: "250px",
    width: "calc(100% - 250px)",
    minHeight: "100vh",
  },

  topbar: {
    height: "74px",
    background: "#ffffff",
    borderBottom: "1px solid #e7ebf2",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 34px",
  },

  mobileMenu: {
    display: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#172033",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
  },

  topbarRight: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  profileMini: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "39px",
    height: "39px",
    borderRadius: "50%",
    background: "#1769e0",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },

  profileMiniText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  content: {
    maxWidth: "1450px",
    margin: "0 auto",
    padding: "34px",
  },

  welcomeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    marginBottom: "27px",
  },

  pageLabel: {
    color: "#1769e0",
    fontSize: "11px",
    fontWeight: "750",
    letterSpacing: "1.2px",
    margin: "0 0 7px",
  },

  heading: {
    margin: 0,
    fontSize: "30px",
    lineHeight: "1.2",
    color: "#172033",
  },

  subheading: {
    margin: "8px 0 0",
    color: "#7a8496",
    fontSize: "14px",
  },

  primaryButton: {
    border: "none",
    background: "#1769e0",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  verificationBanner: {
    background: "#ffffff",
    border: "1px solid #dbe7fb",
    borderLeft: "4px solid #1769e0",
    borderRadius: "11px",
    padding: "19px 21px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "25px",
    boxShadow: "0 2px 8px rgba(25, 65, 120, 0.03)",
  },

  verificationIcon: {
    width: "49px",
    height: "49px",
    borderRadius: "11px",
    background: "#eaf2ff",
    color: "#1769e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  verificationText: {
    flex: 1,
    minWidth: 0,
  },

  verificationTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  verificationTitle: {
    margin: 0,
  },

  verifiedBadge: {
    background: "#e8f8ee",
    color: "#1f8f4d",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },

  pendingBadge: {
    background: "#fff5dc",
    color: "#a87300",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },

  rejectedBadge: {
    background: "#fee2e2",
    color: "#b91c1c",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },

  outlineButton: {
    background: "#ffffff",
    color: "#1769e0",
    border: "1px solid #bcd2f4",
    padding: "10px 14px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "17px",
    marginBottom: "25px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "11px",
    padding: "19px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    boxShadow: "0 2px 7px rgba(20, 40, 70, 0.025)",
    minWidth: 0,
  },

  statIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statLabel: {
    display: "block",
    color: "#7a8496",
    fontSize: "12px",
    marginBottom: "4px",
  },

  statValue: {
    display: "block",
    color: "#172033",
    fontSize: "21px",
    marginBottom: "3px",
  },

  statDescription: {
    display: "block",
    color: "#9aa2b1",
    fontSize: "11px",
  },

  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 1fr",
    gap: "20px",
    marginBottom: "28px",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "11px",
    padding: "22px",
    minHeight: "300px",
    minWidth: 0,
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    paddingBottom: "18px",
    borderBottom: "1px solid #edf0f5",
  },

  panelTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#172033",
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "#8a93a3",
    fontSize: "12px",
  },

  textButton: {
    background: "transparent",
    border: "none",
    color: "#1769e0",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  emptyState: {
    minHeight: "210px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
    padding: "25px",
    color: "#7a8496",
  },

  emptyIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#f1f5fa",
    color: "#8090a5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "11px",
  },

  requestList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "18px",

    // Keep the requests inside their own scrollable section
    maxHeight: "600px",
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: "8px",
    minHeight: 0,
  },

  requestCard: {
    border: "1px solid #e7ebf2",
    borderRadius: "10px",
    padding: "17px",
    background: "#ffffff",
  },

  requestCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },

  requestTitle: {
    margin: "0 0 8px",
    fontSize: "15px",
    color: "#172033",
  },

  requestDescription: {
    margin: "0 0 8px",
    fontSize: "13px",
    color: "#596579",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
  },

  statusBadge: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  statusPending: {
    background: "#fff5dc",
    color: "#a87300",
  },

  statusAccepted: {
    background: "#eaf9f0",
    color: "#159447",
  },

  statusRejected: {
    background: "#fff0f0",
    color: "#d94b4b",
  },

  statusOther: {
    background: "#f1f5fa",
    color: "#596579",
  },

  requestDetails: {
    marginTop: "12px",
    fontSize: "12px",
    color: "#7a8496",
    lineHeight: "1.8",
    overflowWrap: "anywhere",
  },

  requestActions: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
    flexWrap: "wrap",
  },

  processedText: {
    margin: "15px 0 0",
    fontSize: "12px",
    color: "#7a8496",
  },

  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    marginTop: "15px",
    background: "#eaf9f0",
    color: "#159447",
    borderRadius: "8px",
    fontSize: "13px",
  },

  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    marginTop: "15px",
    background: "#fff0f0",
    color: "#d94b4b",
    borderRadius: "8px",
    fontSize: "13px",
  },

  progressContainer: {
    marginTop: "23px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#6f7889",
    marginBottom: "9px",
  },

  progressTrack: {
    width: "100%",
    height: "8px",
    borderRadius: "10px",
    background: "#e9edf3",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "#1769e0",
    borderRadius: "10px",
    transition: "width 0.4s ease",
  },

  checkList: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontSize: "13px",
    color: "#596579",
  },

  fullButton: {
    marginTop: "21px",
    width: "100%",
    background: "#1769e0",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    padding: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  quickSection: {
    marginBottom: "30px",
  },

  quickTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#172033",
  },

  quickSubtitle: {
    margin: "5px 0 16px",
    color: "#8a93a3",
    fontSize: "13px",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
  },

  quickCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "10px",
    padding: "17px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    cursor: "pointer",
    color: "#172033",
    minWidth: 0,
  },

  footer: {
    borderTop: "1px solid #e7ebf2",
    background: "#ffffff",
    padding: "19px 34px",
    display: "flex",
    justifyContent: "space-between",
    color: "#98a1b2",
    fontSize: "11px",
  },
};

export default TechnicianDashboard;
