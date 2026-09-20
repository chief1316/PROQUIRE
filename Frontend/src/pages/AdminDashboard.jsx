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
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (storedUser.role !== "admin") {
        navigate("/admin-login");
        return;
      }

      const [usersResponse, pendingResponse] =
        await Promise.all([
          axios.get(
            "http://localhost:5000/api/admin/users",
            getAuthHeaders()
          ),
          axios.get(
            "http://localhost:5000/api/technicians/pending/list",
            getAuthHeaders()
          ),
        ]);

      setUsers(usersResponse.data || []);

      /*
       * The backend can return multiple rows for one
       * technician when that technician has multiple
       * pending documents.
       *
       * Group those rows by technician_id.
       */

      const groupedTechnicians = {};

      (pendingResponse.data || []).forEach(
        (technician) => {
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
            verification_status:
              technician.verification_status,

            confidence_score:
              technician.confidence_score,

            verification_result:
              technician.verification_result,

            remarks:
              technician.remarks,

            verification_date:
              technician.verification_date,

            verified_by:
              technician.verified_by,
          });
        }
      );

      setPendingTechnicians(
        Object.values(groupedTechnicians)
      );
    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin-login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "Access denied. Administrator privileges are required."
        );
        return;
      }

      setError(
        "Unable to load dashboard data. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

    const technicianId =
      selectedTechnician.technician_id;

    try {
      setVerifying(true);
      setError("");
      setSuccess("");

      const response = await axios.patch(
        `http://localhost:5000/api/admin/verify-technician/${technicianId}`,
        {},
        getAuthHeaders()
      );

      setSuccess(
        response.data?.message ||
          "Technician verified successfully."
      );

      setSelectedTechnician(null);

      /*
       * Reload the dashboard so the technician
       * disappears from pending verification.
       */

      await loadDashboardData();
    } catch (err) {
      console.error(
        "Technician verification error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to verify technician."
      );
    } finally {
      setVerifying(false);
    }
  };

  /*
   * ==========================================
   * HELPER FUNCTIONS
   * ==========================================
   */

  const totalUsers = users.length;

  const totalClients = users.filter(
    (user) => user.role === "client"
  ).length;

  const totalTechnicians = users.filter(
    (user) => user.role === "technician"
  ).length;

  const totalAgencies = users.filter(
    (user) => user.role === "agency"
  ).length;

  const totalAdmins = users.filter(
    (user) => user.role === "admin"
  ).length;

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-KE",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getRoleLabel = (role) => {
    if (!role) {
      return "Unknown";
    }

    return (
      role.charAt(0).toUpperCase() +
      role.slice(1)
    );
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
            borderBottom:
              "1px solid #e2e8f0",
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
            style={{
              width: "100%",
              border: "none",
              background: "#eff6ff",
              color: "#2563eb",
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
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          {/* Users */}

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

        <header
          style={{
            height: "80px",
            background: "#ffffff",
            borderBottom:
              "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 35px",
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
        </header>

        {/* Dashboard content */}

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
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
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
              gridTemplateColumns:
                "minmax(0, 1.5fr) minmax(300px, 1fr)",
              gap: "22px",
            }}
          >
            {/* Recent Users */}

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom:
                    "1px solid #e2e8f0",
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
                      </tr>
                    </thead>

                    <tbody>
                      {users
                        .slice(0, 8)
                        .map((user) => (
                          <tr key={user.user_id}>
                            <td
                              style={{
                                padding: "14px 20px",
                                borderTop:
                                  "1px solid #f1f5f9",
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
                                borderTop:
                                  "1px solid #f1f5f9",
                                fontSize: "13px",
                                color: "#475569",
                              }}
                            >
                              {user.email}
                            </td>

                            <td
                              style={{
                                padding: "14px 20px",
                                borderTop:
                                  "1px solid #f1f5f9",
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
                                  ...getRoleStyle(
                                    user.role
                                  ),
                                }}
                              >
                                {getRoleLabel(
                                  user.role
                                )}
                              </span>
                            </td>

                            <td
                              style={{
                                padding: "14px 20px",
                                borderTop:
                                  "1px solid #f1f5f9",
                                fontSize: "13px",
                                color: "#475569",
                              }}
                            >
                              {formatDate(
                                user.created_at
                              )}
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
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom:
                    "1px solid #e2e8f0",
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
                    No technicians are currently
                    waiting for verification.
                  </div>
                </div>
              ) : (
                <div>
                  {pendingTechnicians
                    .slice(0, 6)
                    .map((technician) => (
                      <div
                        key={technician.technician_id}
                        style={{
                          padding: "16px 20px",
                          borderBottom:
                            "1px solid #f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
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
                            {technician.location ||
                              "Location not provided"}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setError("");
                            setSuccess("");
                            setSelectedTechnician(
                              technician
                            );
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
            <ShieldCheck
              size={20}
              color="#2563eb"
            />

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
                {totalAdmins === 1 ? "" : "s"} currently
                registered.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================
          TECHNICIAN REVIEW MODAL
      ====================================== */}

      {selectedTechnician && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
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
              boxShadow:
                "0 20px 60px rgba(15, 23, 42, 0.2)",
            }}
          >
            {/* Modal header */}

            <div
              style={{
                padding: "20px 24px",
                borderBottom:
                  "1px solid #e2e8f0",
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
                  Review the technician's submitted
                  information before verification.
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedTechnician(null)
                }
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
                <MapPin
                  size={18}
                  color="#2563eb"
                />

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
                    {selectedTechnician.location ||
                      "Not provided"}
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
                  {selectedTechnician.bio ||
                    "No biography provided."}
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

                {selectedTechnician.documents?.length >
                0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {selectedTechnician.documents.map(
                      (document, index) => (
                        <div
                          key={
                            document.document_id ||
                            index
                          }
                          style={{
                            padding: "14px",
                            border:
                              "1px solid #e2e8f0",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                          }}
                        >
                          <FileText
                            size={20}
                            color="#2563eb"
                          />

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
                              {document.document_type ||
                                "Verification Document"}
                            </p>

                            <p
                              style={{
                                margin: "4px 0 0",
                                fontSize: "12px",
                                color: "#64748b",
                              }}
                            >
                              Status:{" "}
                              {document.verification_status ||
                                "pending"}
                            </p>

                            {/* AI Verification Analysis */}

                            {document.confidence_score !==
                              null &&
                              document.confidence_score !==
                                undefined && (
                                <div
                                  style={{
                                    marginTop: "10px",
                                    padding: "10px",
                                    background: "#f8fafc",
                                    borderRadius: "8px",
                                    border:
                                      "1px solid #e2e8f0",
                                  }}
                                >
                                  <p
                                    style={{
                                      margin:
                                        "0 0 6px",
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
                                    <strong>
                                      Confidence Score:
                                    </strong>{" "}
                                    {Number(
                                      document.confidence_score
                                    ).toFixed(1)}
                                    %
                                  </p>

                                  <p
                                    style={{
                                      margin: "3px 0",
                                      fontSize: "12px",
                                      color: "#475569",
                                    }}
                                  >
                                    <strong>
                                      Result:
                                    </strong>{" "}
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
                                    <strong>
                                      Remarks:
                                    </strong>{" "}
                                    {document.remarks ||
                                      "No remarks provided"}
                                  </p>

                                  <p
                                    style={{
                                      margin: "3px 0",
                                      fontSize: "12px",
                                      color: "#64748b",
                                    }}
                                  >
                                    <strong>
                                      Verified by:
                                    </strong>{" "}
                                    {document.verified_by ||
                                      "Not available"}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      )
                    )}
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
                borderTop:
                  "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() =>
                  setSelectedTechnician(null)
                }
                disabled={verifying}
                style={{
                  padding: "10px 16px",
                  border:
                    "1px solid #cbd5e1",
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
                  background: verifying
                    ? "#93c5fd"
                    : "#16a34a",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: verifying
                    ? "not-allowed"
                    : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                }}
              >
                <CheckCircle size={16} />

                {verifying
                  ? "Verifying..."
                  : "Approve & Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;