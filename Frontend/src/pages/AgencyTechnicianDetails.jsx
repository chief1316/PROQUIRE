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
  Edit3,
  X,
  Save,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function AgencyTechnicianDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [technician, setTechnician] = useState(null);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const [editForm, setEditForm] = useState({
    category_id: "",
    years_experience: "",
    location: "",
    bio: "",
  });

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

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/categories"
      );

      setCategories(response.data || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    fetchTechnician();
    fetchCategories();
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

  const openEditModal = () => {
    setEditForm({
      category_id: technician.category_id || "",
      years_experience: technician.years_experience ?? "",
      location: technician.location || "",
      bio: technician.bio || "",
    });

    setEditError("");
    setEditSuccess("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (saving) return;

    setShowEditModal(false);
    setEditError("");
    setEditSuccess("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateTechnician = async (event) => {
    event.preventDefault();

    setEditError("");
    setEditSuccess("");

    const token = getToken();

    if (!token) {
      navigate("/login?role=agency");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.put(
        `http://localhost:5000/api/agencies/technicians/${id}`,
        {
          category_id: Number(editForm.category_id),
          years_experience: Number(editForm.years_experience),
          location: editForm.location,
          bio: editForm.bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Technician updated successfully:", response.data);

      setEditSuccess("Technician information updated successfully.");

      await fetchTechnician();

      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess("");
      }, 1200);
    } catch (err) {
      console.error("Error updating technician:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login?role=agency");
        return;
      }

      setEditError(
        err.response?.data?.message ||
          "Unable to update technician information."
      );
    } finally {
      setSaving(false);
    }
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
              animation:
                "agencyTechnicianDetailsSpin 1s linear infinite",
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
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

        <button
          onClick={openEditModal}
          style={{
            border: "none",
            background: "#2166d1",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <Edit3 size={17} />
          Edit Technician
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

      {/* Edit Technician Modal */}

      {showEditModal && (
        <div
          onClick={closeEditModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 33, 61, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.18)",
            }}
          >
            {/* Modal Header */}

            <div
              style={{
                padding: "22px 25px",
                borderBottom: "1px solid #edf0f5",
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
                    color: "#182640",
                  }}
                >
                  Edit Technician
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "12px",
                    color: "#7b879d",
                  }}
                >
                  Update professional information for{" "}
                  {technician.full_name}.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                style={{
                  width: "38px",
                  height: "38px",
                  border: "1px solid #e5e9f2",
                  borderRadius: "9px",
                  background: "#ffffff",
                  color: "#68758b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}

            <form
              onSubmit={handleUpdateTechnician}
              style={{
                padding: "25px",
              }}
            >
              {editError && (
                <div
                  style={{
                    marginBottom: "18px",
                    padding: "12px 14px",
                    borderRadius: "9px",
                    background: "#fff0f2",
                    border: "1px solid #f2c4cb",
                    color: "#b52d40",
                    fontSize: "13px",
                  }}
                >
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div
                  style={{
                    marginBottom: "18px",
                    padding: "12px 14px",
                    borderRadius: "9px",
                    background: "#eaf8ef",
                    border: "1px solid #bfe4cc",
                    color: "#23794a",
                    fontSize: "13px",
                  }}
                >
                  {editSuccess}
                </div>
              )}

              {/* Category */}

              <div style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="edit-category"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#52627a",
                  }}
                >
                  Technician Category
                </label>

                <select
                  id="edit-category"
                  name="category_id"
                  value={editForm.category_id}
                  onChange={handleEditChange}
                  required
                  style={{
                    width: "100%",
                    border: "1px solid #dce3ee",
                    borderRadius: "10px",
                    outline: "none",
                    padding: "13px",
                    fontSize: "13px",
                    color: "#182640",
                    background: "#ffffff",
                  }}
                >
                  <option value="">Select category</option>

                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Years + Location */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div style={{ marginBottom: "18px" }}>
                  <label
                    htmlFor="edit-years"
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#52627a",
                    }}
                  >
                    Years of Experience
                  </label>

                  <input
                    type="number"
                    id="edit-years"
                    name="years_experience"
                    value={editForm.years_experience}
                    onChange={handleEditChange}
                    min="0"
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                      outline: "none",
                      padding: "13px",
                      fontSize: "13px",
                      color: "#182640",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label
                    htmlFor="edit-location"
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#52627a",
                    }}
                  >
                    Location
                  </label>

                  <input
                    type="text"
                    id="edit-location"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    placeholder="e.g. Nairobi"
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                      outline: "none",
                      padding: "13px",
                      fontSize: "13px",
                      color: "#182640",
                    }}
                  />
                </div>
              </div>

              {/* Bio */}

              <div style={{ marginBottom: "23px" }}>
                <label
                  htmlFor="edit-bio"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#52627a",
                  }}
                >
                  Professional Bio
                </label>

                <textarea
                  id="edit-bio"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditChange}
                  rows={6}
                  required
                  placeholder="Describe the technician's professional skills and experience..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #dce3ee",
                    borderRadius: "10px",
                    outline: "none",
                    resize: "vertical",
                    padding: "13px",
                    fontSize: "13px",
                    color: "#182640",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Buttons */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  style={{
                    border: "1px solid #d8e0ed",
                    background: "#ffffff",
                    color: "#52627a",
                    padding: "11px 20px",
                    borderRadius: "9px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    border: "none",
                    background: saving
                      ? "#91addb"
                      : "#2166d1",
                    color: "#ffffff",
                    padding: "11px 20px",
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  <Save size={17} />

                  {saving
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            header {
              flex-wrap: wrap;
            }
          }
        `}
      </style>
    </div>
  );
}

export default AgencyTechnicianDetails;