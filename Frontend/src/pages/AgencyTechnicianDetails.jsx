import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  BriefcaseBusiness,
  MapPin,
  FileText,
  CheckCircle2,
  Clock3,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function AgencyTechnicianDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  const fetchTechnician = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login?role=agency");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/agencies/technicians/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTechnician(response.data);
    } catch (err) {
      console.error("Error loading technician:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login?role=agency");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load technician information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnician();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return "T";

    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7b879d",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <RefreshCw
            size={32}
            style={{
              animation: "agencyTechnicianDetailsSpin 1s linear infinite",
              marginBottom: "12px",
              color: "#2166d1",
            }}
          />

          <p style={{ margin: 0 }}>
            Loading technician information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "30px",
          color: "#14213d",
        }}
      >
        <button
          onClick={() => navigate("/agency/technicians")}
          style={{
            border: "1px solid #e5e9f2",
            background: "#ffffff",
            color: "#52627a",
            padding: "10px 16px",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} />
          Back to Technicians
        </button>

        <div
          style={{
            maxWidth: "700px",
            margin: "80px auto",
            background: "#ffffff",
            border: "1px solid #e5e9f2",
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              color: "#182640",
            }}
          >
            Unable to Load Technician
          </h2>

          <p
            style={{
              margin: "0 0 22px",
              color: "#c9384a",
            }}
          >
            {error}
          </p>

          <button
            onClick={fetchTechnician}
            style={{
              border: "none",
              background: "#2166d1",
              color: "#ffffff",
              padding: "11px 20px",
              borderRadius: "9px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!technician) {
    return null;
  }

  const verified = Number(technician.is_verified) === 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#14213d",
      }}
    >
      {/* Header */}

      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e9f2",
          padding: "20px 34px",
        }}
      >
        <button
          onClick={() => navigate("/agency/technicians")}
          style={{
            border: "1px solid #e5e9f2",
            background: "#ffffff",
            color: "#52627a",
            padding: "10px 15px",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={18} />
          Back to Technicians
        </button>
      </header>

      {/* Main Content */}

      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "35px 25px 50px",
        }}
      >
        {/* Profile Header */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e9f2",
            borderRadius: "17px",
            padding: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "25px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "18px",
                background: "#eaf2ff",
                color: "#2166d1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "21px",
                fontWeight: 700,
              }}
            >
              {getInitials(technician.full_name)}
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "25px",
                  color: "#182640",
                }}
              >
                {technician.full_name || "Unnamed Technician"}
              </h1>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#7b879d",
                  fontSize: "13px",
                }}
              >
                {technician.category_name || "Technician"}
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "10px",
                  padding: "6px 10px",
                  borderRadius: "7px",
                  background: verified
                    ? "#e9f8ef"
                    : "#fff3df",
                  color: verified
                    ? "#21784b"
                    : "#a56a14",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {verified ? (
                  <>
                    <CheckCircle2 size={14} />
                    Verified
                  </>
                ) : (
                  <>
                    <Clock3 size={14} />
                    Pending Verification
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Contact Information */}

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e9f2",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "22px",
              }}
            >
              <User size={19} color="#2166d1" />

              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  color: "#182640",
                }}
              >
                Contact Information
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#8893a7",
                    marginBottom: "5px",
                  }}
                >
                  Full Name
                </span>

                <strong
                  style={{
                    fontSize: "13px",
                    color: "#34415a",
                  }}
                >
                  {technician.full_name || "Not provided"}
                </strong>
              </div>

              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#8893a7",
                    marginBottom: "5px",
                  }}
                >
                  Email Address
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#34415a",
                    fontSize: "13px",
                  }}
                >
                  <Mail size={15} color="#7b879d" />
                  {technician.email || "Not provided"}
                </div>
              </div>

              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#8893a7",
                    marginBottom: "5px",
                  }}
                >
                  Phone Number
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#34415a",
                    fontSize: "13px",
                  }}
                >
                  <Phone size={15} color="#7b879d" />
                  {technician.phone || "Not provided"}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e9f2",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "22px",
              }}
            >
              <BriefcaseBusiness size={19} color="#2166d1" />

              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  color: "#182640",
                }}
              >
                Professional Information
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#8893a7",
                    marginBottom: "5px",
                  }}
                >
                  Category
                </span>

                <strong
                  style={{
                    fontSize: "13px",
                    color: "#34415a",
                  }}
                >
                  {technician.category_name || "Not provided"}
                </strong>
              </div>

              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#8893a7",
                    marginBottom: "5px",
                  }}
                >
                  Years of Experience
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#34415a",
                    fontSize: "13px",
                  }}
                >
                  <BriefcaseBusiness
                    size={15}
                    color="#7b879d"
                  />
                  {technician.years_experience ?? 0} years
                </div>
              </div>

              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#8893a7",
                    marginBottom: "5px",
                  }}
                >
                  Location
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#34415a",
                    fontSize: "13px",
                  }}
                >
                  <MapPin size={15} color="#7b879d" />
                  {technician.location || "Not provided"}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Bio */}

          <div
            style={{
              gridColumn: "1 / -1",
              background: "#ffffff",
              border: "1px solid #e5e9f2",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "18px",
              }}
            >
              <FileText size={19} color="#2166d1" />

              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  color: "#182640",
                }}
              >
                Professional Bio
              </h2>
            </div>

            <p
              style={{
                margin: 0,
                color: "#5e6b80",
                fontSize: "13px",
                lineHeight: 1.8,
              }}
            >
              {technician.bio || "No professional bio provided."}
            </p>
          </div>

          {/* Agency Information */}

          <div
            style={{
              gridColumn: "1 / -1",
              background: "#ffffff",
              border: "1px solid #e5e9f2",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                margin: "0 0 18px",
                fontSize: "17px",
                color: "#182640",
              }}
            >
              Agency Information
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#8893a7",
                    marginBottom: "5px",
                  }}
                >
                  Employment Type
                </span>

                <strong
                  style={{
                    fontSize: "13px",
                    color: "#34415a",
                  }}
                >
                  {technician.employment_type || "Agency"}
                </strong>
              </div>

              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#8893a7",
                    marginBottom: "5px",
                  }}
                >
                  Agency
                </span>

                <strong
                  style={{
                    fontSize: "13px",
                    color: "#34415a",
                  }}
                >
                  {technician.agency_name || "Your Agency"}
                </strong>
              </div>

              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "#8893a7",
                    marginBottom: "5px",
                  }}
                >
                  Verification Status
                </span>

                <strong
                  style={{
                    fontSize: "13px",
                    color: verified ? "#21784b" : "#a56a14",
                  }}
                >
                  {verified ? "Verified" : "Pending Verification"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>
        {`
          @keyframes agencyTechnicianDetailsSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 750px) {
            main {
              padding: 25px 16px 40px !important;
            }

            header {
              padding: 18px 16px !important;
            }

            main > div:nth-child(2) {
              grid-template-columns: 1fr !important;
            }

            main > div:nth-child(2) > div {
              grid-column: auto !important;
            }

            main > div:nth-child(2) > div:last-child > div {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default AgencyTechnicianDetails;