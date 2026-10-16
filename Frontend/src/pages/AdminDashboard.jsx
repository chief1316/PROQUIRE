import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Wrench,
  Building2,
  ShieldCheck,
  Bell,
  Clock,
  LogOut,
  RefreshCw,
  MapPin,
  FileText,
  CheckCircle,
  X,
  Eye,
} from "lucide-react";
import logo from "../assets/proquire-logo.png";

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [pendingTechnicians, setPendingTechnicians] = useState([]);

  const [pendingAgencies, setPendingAgencies] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);

  const [readNotificationIds, setReadNotificationIds] = useState([]);

  const [selectedTechnician, setSelectedTechnician] = useState(null);

  const [selectedAgency, setSelectedAgency] = useState(null);

  const [verifyingAgency, setVerifyingAgency] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState(null);

  const [loading, setLoading] = useState(true);

  const [verifying, setVerifying] = useState(false);

  const [reviewingDocument, setReviewingDocument] = useState(false);

  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const [rejectionReason, setRejectionReason] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [activeSection, setActiveSection] = useState("dashboard");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const token = sessionStorage.getItem("token");

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // ==========================================
  // ACTIVATE / DEACTIVATE USER
  // ==========================================
  const handleToggleUserStatus = async () => {
    if (!selectedUser) return;

    const currentlyActive = Number(selectedUser.is_active) === 1;
    const newStatus = currentlyActive ? 0 : 1;
    const action = currentlyActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`,
    );

    if (!confirmed) return;

    try {
      const userId = selectedUser.user_id;

      const response = await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        { is_active: newStatus },
        getAuthHeaders(),
      );

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user.user_id === userId ? { ...user, is_active: newStatus } : user,
        ),
      );

      setSelectedUser((previousUser) =>
        previousUser ? { ...previousUser, is_active: newStatus } : null,
      );

      setSuccess(
        response.data?.message || "Account status updated successfully.",
      );
    } catch (err) {
      console.error("User status update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update user status. Please try again.",
      );
    }
  };

  /*
   * ==========================================
   * LOAD DASHBOARD DATA
   * ==========================================
   */

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/admin-login");
        return;
      }

      const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");

      if (storedUser.role !== "admin") {
        navigate("/admin-login");
        return;
      }

      const [usersResponse, pendingResponse, pendingAgenciesResponse] =
        await Promise.all([
          axios.get("http://localhost:5000/api/admin/users", getAuthHeaders()),

          axios.get(
            "http://localhost:5000/api/technicians/pending/list",
            getAuthHeaders(),
          ),

          axios.get(
            "http://localhost:5000/api/agencies/pending/list",
            getAuthHeaders(),
          ),
        ]);

      setUsers(usersResponse.data || []);

      setPendingAgencies(pendingAgenciesResponse.data || []);

      /*
       * The backend can return multiple rows for one
       * technician when that technician has multiple
       * pending documents.
       *
       * Group those rows by technician_id.
       */

      const groupedTechnicians = {};

      (pendingResponse.data || []).forEach((technician) => {
        const id = technician.technician_id;

        if (!groupedTechnicians[id]) {
          groupedTechnicians[id] = {
            technician_id: id,
            full_name: technician.full_name,
            bio: technician.bio,
            location: technician.location,
            documents: [],
          };
        }

        groupedTechnicians[id].documents.push({
          document_id: technician.document_id,
          document_type: technician.document_type,
          document_path: technician.document_path,
          verification_status: technician.verification_status,

          confidence_score: technician.confidence_score,

          verification_result: technician.verification_result,

          remarks: technician.remarks,

          verification_date: technician.verification_date,

          verified_by: technician.verified_by,
        });
      });

      setPendingTechnicians(Object.values(groupedTechnicians));
    } catch (err) {
      console.error("Admin dashboard error:", err);

      if (err.response?.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        navigate("/admin-login");
        return;
      }

      if (err.response?.status === 403) {
        setError("Access denied. Administrator privileges are required.");
        return;
      }

      setError(
        "Unable to load dashboard data. Make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = userSearch.trim().toLowerCase();

    const matchesSearch =
      !search ||
      [user.full_name, user.name, user.email, user.role].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search),
      );

    const matchesRole =
      roleFilter === "all" ||
      String(user.role || "").toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  /*
   * ==========================================
   * INITIAL LOAD
   * ==========================================
   */

  useEffect(() => {
    loadDashboardData();
  }, []);

  /*
   * ==========================================
   * LOGOUT
   * ==========================================
   */

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/admin-login");
  };

  /*
   * ==========================================
   * VERIFY TECHNICIAN
   * ==========================================
   */

  const handleVerifyTechnician = async () => {
    if (!selectedTechnician) {
      return;
    }

    const technicianId = selectedTechnician.technician_id;

    try {
      setVerifying(true);
      setError("");
      setSuccess("");

      const response = await axios.patch(
        `http://localhost:5000/api/admin/verify-technician/${technicianId}`,
        {},
        getAuthHeaders(),
      );

      setSuccess(response.data?.message || "Technician verified successfully.");

      setSelectedTechnician(null);

      /*
       * Reload the dashboard so the technician
       * disappears from pending verification.
       */

      await loadDashboardData();
    } catch (err) {
      console.error("Technician verification error:", err);

      setError(err.response?.data?.message || "Unable to verify technician.");
    } finally {
      setVerifying(false);
    }
  };

  /*
   * ==========================================
   * VERIFY AGENCY
   * ==========================================
   */

  const handleVerifyAgency = async () => {
    if (!selectedAgency) {
      return;
    }

    const agencyId = selectedAgency.agency_id;

    try {
      setVerifyingAgency(true);

      setError("");

      setSuccess("");

      const response = await axios.patch(
        `http://localhost:5000/api/agencies/verify/${agencyId}`,
        {},
        getAuthHeaders(),
      );

      setSuccess(response.data?.message || "Agency verified successfully.");

      setSelectedAgency(null);

      /*
       * Reload dashboard so the verified
       * agency disappears from pending.
       */

      await loadDashboardData();
    } catch (err) {
      console.error("Agency verification error:", err);

      setError(err.response?.data?.message || "Unable to verify agency.");
    } finally {
      setVerifyingAgency(false);
    }
  };

  /*
   * ==========================================
   * REVIEW VERIFICATION DOCUMENT
   * ==========================================
   */

  const handleReviewDocument = async (decision) => {
    if (!selectedDocument?.document_id) {
      return;
    }

    try {
      setReviewingDocument(true);
      setError("");
      setSuccess("");

      const response = await axios.patch(
        `http://localhost:5000/api/technicians/verification/review/${selectedDocument.document_id}`,
        {
          decision,
          rejection_reason:
            decision === "rejected" ? rejectionReason.trim() : null,
        },
        getAuthHeaders(),
      );

      setSuccess(
        response.data?.message ||
          `Verification document ${decision} successfully.`,
      );

      setRejectionReason("");
      setShowRejectionForm(false);
      setSelectedDocument(null);
      setSelectedTechnician(null);

      await loadDashboardData();
    } catch (err) {
      console.error("Verification document review error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to review verification document.",
      );
    } finally {
      setReviewingDocument(false);
    }
  };

  /*
   * ==========================================
   * HELPER FUNCTIONS
   * ==========================================
   */

  const totalUsers = users.length;

  const totalClients = users.filter((user) => user.role === "client").length;

  const totalTechnicians = users.filter(
    (user) => user.role === "technician",
  ).length;

  const totalAgencies = users.filter((user) => user.role === "agency").length;

  const totalAdmins = users.filter((user) => user.role === "admin").length;

  const notifications = [
    ...pendingTechnicians.map((technician) => ({
      id: `technician-${technician.technician_id}`,
      title: "Technician verification pending",
      message: `${technician.full_name || "A technician"} is waiting for verification.`,
      time: "Awaiting review",
      read: readNotificationIds.includes(
        `technician-${technician.technician_id}`,
      ),
    })),

    ...pendingAgencies.map((agency) => ({
      id: `agency-${agency.agency_id}`,
      title: "Agency verification pending",
      message: `${agency.company_name || "An agency"} is waiting for verification.`,
      time: "Awaiting review",
      read: readNotificationIds.includes(`agency-${agency.agency_id}`),
    })),
  ];

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleLabel = (role) => {
    if (!role) {
      return "Unknown";
    }

    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "client":
        return {
          background: "#eff6ff",
          color: "#2563eb",
        };

      case "technician":
        return {
          background: "#f0fdf4",
          color: "#16a34a",
        };

      case "agency":
        return {
          background: "#fff7ed",
          color: "#ea580c",
        };

      case "admin":
        return {
          background: "#f3e8ff",
          color: "#9333ea",
        };

      default:
        return {
          background: "#f1f5f9",
          color: "#475569",
        };
    }
  };

  /*
   * ==========================================
   * LOADING SCREEN
   * ==========================================
   */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fb",
          color: "#64748b",
          fontSize: "15px",
        }}
      >
        Loading Admin Dashboard...
      </div>
    );
  }

  /*
   * ==========================================
   * MAIN DASHBOARD
   * ==========================================
   */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        display: "flex",
        color: "#0f172a",
      }}
    >
      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        style={{
          width: "250px",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: "80px",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <img
            src={logo}
            alt="ProQuire"
            style={{
              width: "125px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            padding: "25px 15px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "0 12px",
              marginBottom: "10px",
            }}
          >
            Administration
          </div>

          {/* Dashboard */}

          <button
            type="button"
            onClick={() => setActiveSection("dashboard")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              border: "none",
              borderRadius: "8px",
              background:
                activeSection === "dashboard" ? "#eff6ff" : "transparent",
              color: activeSection === "dashboard" ? "#2563eb" : "#475569",
              fontWeight: activeSection === "dashboard" ? "600" : "500",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          {/* Users */}

          <button
            type="button"
            onClick={() => setActiveSection("users")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              border: "none",
              borderRadius: "8px",
              background: activeSection === "users" ? "#eff6ff" : "transparent",
              color: activeSection === "users" ? "#2563eb" : "#475569",
              fontWeight: activeSection === "users" ? "600" : "500",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Users size={18} />
            Users
          </button>

          {/* Technicians */}

          <button
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "9px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "5px",
              textAlign: "left",
            }}
          >
            <Wrench size={18} />
            Technicians
          </button>

          {/* Agencies */}

          <button
            onClick={() =>
              document
                .getElementById("pending-agencies-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
            }
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "9px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "5px",
              textAlign: "left",
            }}
          >
            <Building2 size={18} />
            Agencies
          </button>

          {/* Verification */}

          <button
            onClick={() =>
              document
                .getElementById("pending-verification-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
            }
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "9px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "5px",
              textAlign: "left",
            }}
          >
            <ShieldCheck size={18} />
            Verification
          </button>
        </div>

        {/* Logout */}

        <button
          onClick={handleLogout}
          style={{
            margin: "15px",
            padding: "12px",
            border: "1px solid #e2e8f0",
            borderRadius: "9px",
            background: "#ffffff",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </aside>

      {/* ======================================
          MAIN AREA
      ====================================== */}

      <main
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          minHeight: "100vh",
        }}
      >
        {/* Top bar */}

        {/* Top bar */}
        <header
          style={{
            height: "80px",
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 35px",
            position: "relative",
            zIndex: 1001,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              Admin Dashboard
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Manage and monitor the ProQuire platform.
            </p>
          </div>

          {/* Header actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Bell and dropdown wrapper */}
            <div style={{ position: "relative" }}>
              {/* Notification Bell */}
              <button
                type="button"
                title="Notifications"
                aria-label="Notifications"
                onClick={() => setShowNotifications((prev) => !prev)}
                style={{
                  position: "relative",
                  width: "42px",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                <Bell size={21} />

                {notifications.some((notification) => !notification.read) && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 4px",
                      borderRadius: "999px",
                      background: "#dc2626",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #ffffff",
                    }}
                  >
                    {
                      notifications.filter((notification) => !notification.read)
                        .length
                    }
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: "0",
                    width: "340px",
                    maxWidth: "calc(100vw - 32px)",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 12px 35px rgba(15, 23, 42, 0.15)",
                    zIndex: 1002,
                    overflow: "hidden",
                  }}
                >
                  {/* Panel Header */}
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        fontWeight: "700",
                      }}
                    >
                      Notifications
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setReadNotificationIds((prev) => [
                          ...new Set([
                            ...prev,
                            ...notifications.map(
                              (notification) => notification.id,
                            ),
                          ]),
                        ])
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#2563eb",
                        fontSize: "12px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Mark all read
                    </button>
                  </div>

                  {/* Notification List */}
                  <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: "30px 16px",
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        You're all caught up!
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          style={{
                            padding: "15px 16px",
                            borderBottom: "1px solid #f1f5f9",
                            background: notification.read
                              ? "#ffffff"
                              : "#eff6ff",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "10px",
                            }}
                          >
                            <Bell
                              size={17}
                              color={notification.read ? "#94a3b8" : "#2563eb"}
                              style={{ marginTop: "2px", flexShrink: 0 }}
                            />

                            <div style={{ flex: 1 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "13px",
                                  fontWeight: "700",
                                  color: "#0f172a",
                                }}
                              >
                                {notification.title}
                              </p>

                              <p
                                style={{
                                  margin: "5px 0",
                                  fontSize: "12px",
                                  color: "#475569",
                                  lineHeight: "1.5",
                                }}
                              >
                                {notification.message}
                              </p>

                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#94a3b8",
                                }}
                              >
                                {notification.time}
                              </span>
                            </div>

                            {!notification.read && (
                              <span
                                title="Unread"
                                style={{
                                  width: "7px",
                                  height: "7px",
                                  borderRadius: "50%",
                                  background: "#2563eb",
                                  marginTop: "5px",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Administrator Label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#eff6ff",
                color: "#2563eb",
                padding: "8px 13px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              <ShieldCheck size={17} />
              Administrator
            </div>
          </div>
        </header>

        {/* Dashboard content */}

        {activeSection === "dashboard" && (
          <section
            style={{
              padding: "30px 35px",
            }}
          >
            {/* Success message */}

            {success && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#15803d",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CheckCircle size={18} />
                {success}
              </div>
            )}

            {/* Error message */}

            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  marginBottom: "20px",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* ==================================
              STATISTICS
          ================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "18px",
                marginBottom: "30px",
              }}
            >
              {/* Total Users */}

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={23} />
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "25px",
                      fontWeight: "700",
                    }}
                  >
                    {totalUsers}
                  </p>

                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Total Users
                  </p>
                </div>
              </div>

              {/* Clients */}

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserRound size={23} />
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "25px",
                      fontWeight: "700",
                    }}
                  >
                    {totalClients}
                  </p>

                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Clients
                  </p>
                </div>
              </div>

              {/* Technicians */}

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#f0fdf4",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Wrench size={23} />
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "25px",
                      fontWeight: "700",
                    }}
                  >
                    {totalTechnicians}
                  </p>

                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Technicians
                  </p>
                </div>
              </div>

              {/* Agencies */}

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#fff7ed",
                    color: "#ea580c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building2 size={23} />
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "25px",
                      fontWeight: "700",
                    }}
                  >
                    {totalAgencies}
                  </p>

                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Agencies
                  </p>
                </div>
              </div>

              {/* Pending Verification */}

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#fff7ed",
                    color: "#ea580c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={23} />
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "25px",
                      fontWeight: "700",
                    }}
                  >
                    {pendingTechnicians.length}
                  </p>

                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Pending Verification
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================
              CONTENT PANELS
          ================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.5fr) minmax(300px, 1fr)",
                gap: "22px",
              }}
            >
              {/* Recent Users */}

              {/* Recent Users */}

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  overflow: "hidden",
                  height: "420px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "18px 20px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    Recent Users
                  </h2>

                  <button
                    onClick={loadDashboardData}
                    title="Refresh"
                    style={{
                      border: "none",
                      background: "#f8fafc",
                      color: "#475569",
                      width: "34px",
                      height: "34px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                {users.length === 0 ? (
                  <div
                    style={{
                      padding: "35px 20px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    No users found.
                  </div>
                ) : (
                  <div
                    style={{
                      overflowX: "auto",
                      overflowY: "auto",
                      flex: 1,
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "12px 20px",
                              fontSize: "11px",
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              background: "#f8fafc",
                            }}
                          >
                            Name
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "12px 20px",
                              fontSize: "11px",
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              background: "#f8fafc",
                            }}
                          >
                            Email
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "12px 20px",
                              fontSize: "11px",
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              background: "#f8fafc",
                            }}
                          >
                            Role
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "12px 20px",
                              fontSize: "11px",
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              background: "#f8fafc",
                            }}
                          >
                            Joined
                          </th>

                          <th
                            style={{
                              textAlign: "left",
                              padding: "12px 20px",
                              fontSize: "11px",
                              color: "#94a3b8",
                              textTransform: "uppercase",
                              background: "#f8fafc",
                            }}
                          >
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {users.slice(0, 8).map((user) => (
                          <tr key={user.user_id}>
                            <td
                              style={{
                                padding: "14px 20px",
                                borderTop: "1px solid #f1f5f9",
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#0f172a",
                              }}
                            >
                              {user.full_name}
                            </td>

                            <td
                              style={{
                                padding: "14px 20px",
                                borderTop: "1px solid #f1f5f9",
                                fontSize: "13px",
                                color: "#475569",
                              }}
                            >
                              {user.email}
                            </td>

                            <td
                              style={{
                                padding: "14px 20px",
                                borderTop: "1px solid #f1f5f9",
                                fontSize: "13px",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-flex",
                                  padding: "5px 9px",
                                  borderRadius: "999px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  ...getRoleStyle(user.role),
                                }}
                              >
                                {getRoleLabel(user.role)}
                              </span>
                            </td>

                            <td
                              style={{
                                padding: "14px 20px",
                                borderTop: "1px solid #f1f5f9",
                                fontSize: "13px",
                                color: "#475569",
                              }}
                            >
                              {formatDate(user.created_at)}
                            </td>

                            <td
                              style={{
                                padding: "14px 20px",
                                borderTop: "1px solid #f1f5f9",
                                fontSize: "13px",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-flex",
                                  padding: "5px 9px",
                                  borderRadius: "999px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  background:
                                    Number(user.is_active) === 1
                                      ? "#dcfce7"
                                      : "#fee2e2",
                                  color:
                                    Number(user.is_active) === 1
                                      ? "#166534"
                                      : "#991b1b",
                                }}
                              >
                                {Number(user.is_active) === 1
                                  ? "Active"
                                  : "Deactivated"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pending Verification */}

              <div
                id="pending-verification-section"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  overflow: "hidden",
                  height: "420px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "18px 20px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    Pending Verification
                  </h2>

                  <span
                    style={{
                      background: "#fff7ed",
                      color: "#ea580c",
                      padding: "5px 9px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    {pendingTechnicians.length}
                  </span>
                </div>

                {pendingTechnicians.length === 0 ? (
                  <div
                    style={{
                      padding: "35px 20px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    <CheckCircle
                      size={30}
                      style={{
                        marginBottom: "8px",
                        color: "#16a34a",
                      }}
                    />

                    <div>
                      No technicians are currently waiting for verification.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                    }}
                  >
                    {pendingTechnicians.map((technician) => (
                      <div
                        key={technician.technician_id}
                        style={{
                          padding: "16px 20px",
                          borderBottom: "1px solid #f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "15px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#0f172a",
                            }}
                          >
                            {technician.full_name}
                          </p>

                          <p
                            style={{
                              margin: "4px 0 0",
                              fontSize: "12px",
                              color: "#64748b",
                            }}
                          >
                            {technician.location || "Location not provided"}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setError("");
                            setSuccess("");
                            setSelectedTechnician(technician);
                          }}
                          style={{
                            border: "none",
                            background: "#2563eb",
                            color: "#ffffff",
                            padding: "8px 11px",
                            borderRadius: "7px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Eye size={14} />
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ==================================
    PENDING AGENCY VERIFICATION
================================== */}

            <div
              id="pending-agencies-section"
              style={{
                marginTop: "22px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                overflow: "hidden",
                maxHeight: "420px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}

              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    Pending Agency Verification
                  </h2>

                  <p
                    style={{
                      margin: "5px 0 0",
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    Agencies waiting for administrator verification.
                  </p>
                </div>

                <span
                  style={{
                    background: "#fff7ed",
                    color: "#ea580c",
                    padding: "5px 9px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  {pendingAgencies.length}
                </span>
              </div>

              {/* Empty State */}

              {pendingAgencies.length === 0 ? (
                <div
                  style={{
                    padding: "35px 20px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  <CheckCircle
                    size={30}
                    style={{
                      marginBottom: "8px",
                      color: "#16a34a",
                    }}
                  />

                  <div>No agencies are currently waiting for verification.</div>
                </div>
              ) : (
                <div
                  style={{
                    overflowY: "auto",
                    flex: 1,
                  }}
                >
                  {pendingAgencies.map((agency) => (
                    <div
                      key={agency.agency_id}
                      style={{
                        padding: "18px 20px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "20px",
                      }}
                    >
                      {/* Agency information */}

                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#0f172a",
                          }}
                        >
                          {agency.company_name || "Unnamed Agency"}
                        </p>

                        <p
                          style={{
                            margin: "5px 0 0",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          Registration:{" "}
                          {agency.registration_number || "Not provided"}
                        </p>

                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          County: {agency.county || "Not provided"}
                        </p>

                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          Email: {agency.email || "Not provided"}
                        </p>
                      </div>

                      {/* Review button */}

                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setSuccess("");
                          setSelectedAgency(agency);
                        }}
                        style={{
                          border: "none",
                          background: "#2563eb",
                          color: "#ffffff",
                          padding: "8px 12px",
                          borderRadius: "7px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Eye size={14} />
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ==================================
              ADMIN INFORMATION
          ================================== */}

            <div
              style={{
                marginTop: "22px",
                padding: "18px 20px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <ShieldCheck size={20} color="#2563eb" />

              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  ProQuire Administration
                </p>

                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  {totalAdmins} administrator account
                  {totalAdmins === 1 ? "" : "s"} currently registered.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* USERS MANAGEMENT SECTION */}
        {activeSection === "users" && (
          <section style={{ padding: "30px 35px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2 style={{ margin: "0 0 8px", fontSize: "22px" }}>
                  User Management
                </h2>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                  Search and view registered ProQuire users.
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboardData}
                style={{
                  padding: "10px 14px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={15} /> Refresh Users
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <input
                type="text"
                placeholder="Search name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "220px",
                  padding: "12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                }}
              />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  padding: "12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#fff",
                }}
              >
                <option value="all">All Roles</option>
                <option value="client">Clients</option>
                <option value="technician">Technicians</option>
                <option value="agency">Agencies</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Name", "Email", "Role", "Joined", "Action"].map(
                      (heading) => (
                        <th
                          key={heading}
                          style={{
                            padding: "14px 16px",
                            color: "#64748b",
                            fontSize: "12px",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: "28px",
                          textAlign: "center",
                          color: "#64748b",
                        }}
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr key={user.user_id || user.id || user.email || index}>
                        <td
                          style={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {user.full_name || user.name || "—"}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {user.email || "—"}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {getRoleLabel(user.role)}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {user.created_at ? formatDate(user.created_at) : "—"}
                        </td>

                        <td
                          style={{
                            padding: "14px 16px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedUser({
                                ...user,
                                is_active: Number(user.is_active),
                              })
                            }
                            style={{
                              padding: "7px 12px",
                              border: "1px solid #bfdbfe",
                              borderRadius: "7px",
                              background: "#eff6ff",
                              color: "#2563eb",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p
              style={{ marginTop: "14px", color: "#64748b", fontSize: "13px" }}
            >
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </section>
        )}
      </main>

      {/* ======================================
    USER DETAILS MODAL
====================================== */}

      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "26px",
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "21px", color: "#0f172a" }}>
                  User Details
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Registered ProQuire account information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close user details"
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "18px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: "700",
                  marginBottom: "12px",
                }}
              >
                {(selectedUser.full_name || selectedUser.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>
                {selectedUser.full_name ||
                  selectedUser.name ||
                  "Name not provided"}
              </h3>

              <span
                style={{
                  display: "inline-block",
                  padding: "5px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600",
                  ...getRoleStyle(selectedUser.role),
                }}
              >
                {getRoleLabel(selectedUser.role)}
              </span>
            </div>

            {[
              ["User ID", selectedUser.user_id ?? selectedUser.id],
              ["Full Name", selectedUser.full_name || selectedUser.name],
              ["Email", selectedUser.email],
              ["Role", getRoleLabel(selectedUser.role)],
              [
                "Date Registered",
                selectedUser.created_at
                  ? formatDate(selectedUser.created_at)
                  : null,
              ],
              [
                "Account Status",
                selectedUser.is_active == null
                  ? "Unknown"
                  : Number(selectedUser.is_active) === 1
                    ? "Active"
                    : "Deactivated",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "13px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span style={{ color: "#64748b", fontSize: "13px" }}>
                  {label}
                </span>
                <span
                  style={{
                    color: "#0f172a",
                    fontSize: "13px",
                    fontWeight: "600",
                    textAlign: "right",
                    overflowWrap: "anywhere",
                  }}
                >
                  {value ?? "Not available"}
                </span>
              </div>
            ))}

            <button
              type="button"
              onClick={handleToggleUserStatus}
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                background:
                  Number(selectedUser.is_active) === 1 ? "#dc2626" : "#16a34a",
                color: "#ffffff",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {Number(selectedUser.is_active) === 1
                ? "Deactivate User"
                : "Activate User"}
            </button>

            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ======================================
          TECHNICIAN REVIEW MODAL
      ====================================== */}

      {selectedTechnician && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.2)",
            }}
          >
            {/* Modal header */}

            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "700",
                  }}
                >
                  Technician Verification
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  Review the technician's submitted information before
                  verification.
                </p>
              </div>

              <button
                onClick={() => setSelectedTechnician(null)}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  color: "#475569",
                  width: "35px",
                  height: "35px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}

            <div
              style={{
                padding: "24px",
              }}
            >
              {/* Name */}

              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#94a3b8",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Technician
                </p>

                <h3
                  style={{
                    margin: "5px 0 0",
                    fontSize: "18px",
                  }}
                >
                  {selectedTechnician.full_name}
                </h3>
              </div>

              {/* Location */}

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginBottom: "18px",
                  padding: "14px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                }}
              >
                <MapPin size={18} color="#2563eb" />

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    Location
                  </p>

                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    {selectedTechnician.location || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Bio */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 7px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  Professional Bio
                </p>

                <div
                  style={{
                    padding: "14px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    color: "#475569",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  {selectedTechnician.bio || "No biography provided."}
                </div>
              </div>

              {/* Documents */}

              <div>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  Submitted Documents
                </p>

                {selectedTechnician.documents?.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {selectedTechnician.documents.map((document, index) => (
                      <div
                        key={document.document_id || index}
                        style={{
                          padding: "14px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <FileText size={20} color="#2563eb" />

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            {document.document_type || "Verification Document"}
                          </p>

                          <p
                            style={{
                              margin: "4px 0 0",
                              fontSize: "12px",
                              color: "#64748b",
                            }}
                          >
                            Status: {document.verification_status || "pending"}
                          </p>

                          {/* AI Verification Analysis */}

                          {document.confidence_score !== null &&
                            document.confidence_score !== undefined && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  padding: "10px",
                                  background: "#f8fafc",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <p
                                  style={{
                                    margin: "0 0 6px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    color: "#334155",
                                  }}
                                >
                                  AI Verification Analysis
                                </p>

                                <p
                                  style={{
                                    margin: "3px 0",
                                    fontSize: "12px",
                                    color: "#475569",
                                  }}
                                >
                                  <strong>Confidence Score:</strong>{" "}
                                  {Number(document.confidence_score).toFixed(1)}
                                  %
                                </p>

                                <p
                                  style={{
                                    margin: "3px 0",
                                    fontSize: "12px",
                                    color: "#475569",
                                  }}
                                >
                                  <strong>Result:</strong>{" "}
                                  {document.verification_result ||
                                    "Not available"}
                                </p>

                                <p
                                  style={{
                                    margin: "3px 0",
                                    fontSize: "12px",
                                    color: "#475569",
                                  }}
                                >
                                  <strong>Remarks:</strong>{" "}
                                  {document.remarks || "No remarks provided"}
                                </p>

                                <p
                                  style={{
                                    margin: "3px 0",
                                    fontSize: "12px",
                                    color: "#64748b",
                                  }}
                                >
                                  <strong>Verified by:</strong>{" "}
                                  {document.verified_by || "Not available"}
                                </p>
                              </div>
                            )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDocument(document);
                          }}
                          style={{
                            border: "1px solid #2563eb",
                            background: "#eff6ff",
                            color: "#2563eb",
                            padding: "7px 10px",
                            borderRadius: "7px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Eye size={14} />
                          Review Document
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "15px",
                      background: "#f8fafc",
                      borderRadius: "10px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    No documents found.
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}

            <div
              style={{
                padding: "18px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setSelectedTechnician(null)}
                disabled={verifying}
                style={{
                  padding: "10px 16px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleVerifyTechnician}
                disabled={verifying}
                style={{
                  padding: "10px 17px",
                  border: "none",
                  background: verifying ? "#93c5fd" : "#16a34a",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: verifying ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <CheckCircle size={16} />

                {verifying ? "Verifying..." : "Approve & Verify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          AGENCY REVIEW MODAL
      ====================================== */}

      {selectedAgency && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1100,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "620px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.2)",
            }}
          >
            {/* Header */}

            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  Agency Verification
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  Review the agency's submitted business information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAgency(null)}
                disabled={verifyingAgency}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  color: "#475569",
                  width: "35px",
                  height: "35px",
                  borderRadius: "8px",
                  cursor: verifyingAgency ? "not-allowed" : "pointer",
                  fontSize: "20px",
                }}
              >
                ×
              </button>
            </div>

            {/* Agency Details */}

            <div
              style={{
                padding: "24px",
              }}
            >
              {[
                ["Company Name", selectedAgency.company_name],
                ["Registration Number", selectedAgency.registration_number],
                ["KRA PIN", selectedAgency.kra_pin],
                ["Business Email", selectedAgency.email],
                ["Business Phone", selectedAgency.phone],
                ["County", selectedAgency.county],
                ["Address", selectedAgency.address],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    padding: "13px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    {label}
                  </span>

                  <strong
                    style={{
                      fontSize: "13px",
                      color: "#0f172a",
                      textAlign: "right",
                      maxWidth: "65%",
                      wordBreak: "break-word",
                    }}
                  >
                    {value || "Not provided"}
                  </strong>
                </div>
              ))}

              {/* Description */}

              <div
                style={{
                  marginTop: "20px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Business Description
                </p>

                <div
                  style={{
                    padding: "14px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    color: "#475569",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {selectedAgency.description || "No description provided."}
                </div>
              </div>
            </div>

            {/* Footer */}

            <div
              style={{
                padding: "18px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedAgency(null)}
                disabled={verifyingAgency}
                style={{
                  padding: "10px 17px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: verifyingAgency ? "not-allowed" : "pointer",
                }}
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleVerifyAgency}
                disabled={verifyingAgency}
                style={{
                  padding: "10px 17px",
                  border: "none",
                  background: verifyingAgency ? "#93c5fd" : "#16a34a",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: verifyingAgency ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <CheckCircle size={16} />

                {verifyingAgency ? "Verifying..." : "Approve & Verify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          DOCUMENT REVIEW MODAL
      ====================================== */}

      {selectedDocument && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
            zIndex: 1000,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "min(900px, 100%)",
              maxWidth: "900px",
              maxHeight: "94vh",
              background: "#ffffff",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(15, 23, 42, 0.25)",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            {/* Document Review Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  Document Review
                </p>

                <h3
                  style={{
                    margin: "4px 0 0",
                    fontSize: "18px",
                    color: "#0f172a",
                    wordBreak: "break-word",
                  }}
                >
                  {selectedDocument.document_type || "Verification Document"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRejectionForm(false);
                  setRejectionReason("");
                  setSelectedDocument(null);
                }}
                disabled={reviewingDocument}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  color: "#475569",
                  width: "35px",
                  height: "35px",
                  minWidth: "35px",
                  borderRadius: "8px",
                  cursor: reviewingDocument ? "not-allowed" : "pointer",
                  fontSize: "20px",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* Document Content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "16px",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
            >
              {/* Uploaded Document */}
              <div
                style={{
                  width: "100%",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  minHeight: "min(420px, 55vh)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                {selectedDocument.document_path ? (
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(
                    selectedDocument.document_path,
                  ) ? (
                    <img
                      src={`http://localhost:5000/uploads/documents/${selectedDocument.document_path
                        .replace(/^\/+/, "")
                        .replace(/^(?:uploads\/)+/i, "")
                        .replace(/^documents\//i, "")}`}
                      alt={
                        selectedDocument.document_type ||
                        "Verification document"
                      }
                      style={{
                        maxWidth: "100%",
                        maxHeight: "55vh",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  ) : (
                    <iframe
                      src={`http://localhost:5000/uploads/documents/${selectedDocument.document_path
                        .replace(/^\/+/, "")
                        .replace(/^(?:uploads\/)+/i, "")
                        .replace(/^documents\//i, "")}`}
                      title="Verification Document"
                      style={{
                        width: "100%",
                        height: "55vh",
                        minHeight: "350px",
                        border: "none",
                        display: "block",
                      }}
                    />
                  )
                ) : (
                  <div
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Document file is not available.
                  </div>
                )}
              </div>

              {/* AI Verification Analysis */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "15px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  boxSizing: "border-box",
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  AI Verification Analysis
                </p>

                <p
                  style={{
                    margin: "5px 0",
                    fontSize: "13px",
                    color: "#475569",
                    overflowWrap: "anywhere",
                  }}
                >
                  <strong>Confidence Score:</strong>{" "}
                  {selectedDocument.confidence_score !== null &&
                  selectedDocument.confidence_score !== undefined
                    ? `${Number(selectedDocument.confidence_score).toFixed(1)}%`
                    : "Not available"}
                </p>

                <p
                  style={{
                    margin: "5px 0",
                    fontSize: "13px",
                    color: "#475569",
                    overflowWrap: "anywhere",
                  }}
                >
                  <strong>AI Result:</strong>{" "}
                  {selectedDocument.verification_result || "Not available"}
                </p>

                <p
                  style={{
                    margin: "5px 0",
                    fontSize: "13px",
                    color: "#475569",
                    lineHeight: "1.5",
                    overflowWrap: "anywhere",
                  }}
                >
                  <strong>Remarks:</strong>{" "}
                  {selectedDocument.remarks || "No remarks provided"}
                </p>
              </div>
            </div>

            {/* Document Review Footer */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid #e2e8f0",
                background: "#ffffff",
                boxSizing: "border-box",
                flexShrink: 0,
              }}
            >
              {/* Rejection Form */}
              {showRejectionForm && (
                <div
                  style={{
                    marginBottom: "14px",
                    padding: "14px",
                    background: "#fff7f7",
                    border: "1px solid #fecaca",
                    borderRadius: "10px",
                    boxSizing: "border-box",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#991b1b",
                      marginBottom: "8px",
                    }}
                  >
                    Reason for rejection
                  </div>

                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this document is being rejected..."
                    rows={4}
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      padding: "12px",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      fontSize: "14px",
                      resize: "vertical",
                      boxSizing: "border-box",
                      outline: "none",
                      display: "block",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "12px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectionForm(false);
                        setRejectionReason("");
                        setError("");
                      }}
                      disabled={reviewingDocument}
                      style={{
                        padding: "9px 16px",
                        borderRadius: "7px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#475569",
                        cursor: reviewingDocument ? "not-allowed" : "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!rejectionReason.trim()) {
                          setError(
                            "Please provide a reason for rejecting this document.",
                          );
                          return;
                        }

                        setError("");

                        handleReviewDocument("rejected");
                      }}
                      disabled={reviewingDocument}
                      style={{
                        padding: "9px 16px",
                        borderRadius: "7px",
                        border: "none",
                        background: "#dc2626",
                        color: "#ffffff",
                        cursor: reviewingDocument ? "not-allowed" : "pointer",
                        fontWeight: "600",
                      }}
                    >
                      {reviewingDocument
                        ? "Processing..."
                        : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              )}

              {/* Main Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectionForm(false);
                    setRejectionReason("");
                    setError("");
                    setSelectedDocument(null);
                  }}
                  disabled={reviewingDocument}
                  style={{
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#334155",
                    padding: "9px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: reviewingDocument ? "not-allowed" : "pointer",
                  }}
                >
                  Close
                </button>

                {!showRejectionForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setRejectionReason("");
                      setShowRejectionForm(true);
                      setError("");
                    }}
                    disabled={reviewingDocument}
                    style={{
                      border: "1px solid #dc2626",
                      background: "#fef2f2",
                      color: "#dc2626",
                      padding: "9px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: reviewingDocument ? "not-allowed" : "pointer",
                    }}
                  >
                    Reject Document
                  </button>
                )}

                {!showRejectionForm && (
                  <button
                    type="button"
                    onClick={() => handleReviewDocument("approved")}
                    disabled={reviewingDocument}
                    style={{
                      border: "1px solid #16a34a",
                      background: "#16a34a",
                      color: "#ffffff",
                      padding: "9px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: reviewingDocument ? "not-allowed" : "pointer",
                    }}
                  >
                    {reviewingDocument ? "Processing..." : "Approve Document"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
