import { useEffect, useState } from "react";
import {
  Users,
  ArrowLeft,
  UserPlus,
  CheckCircle2,
  Clock3,
  MapPin,
  BriefcaseBusiness,
  RefreshCw,
  X,
  Mail,
  Phone,
  Lock,
  FileText,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AgencyTechnicians() {
  const navigate = useNavigate();

  const [technicians, setTechnicians] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [addingTechnician, setAddingTechnician] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
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

  const fetchTechnicians = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login?role=agency");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/agencies/technicians",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTechnicians(response.data || []);
    } catch (err) {
      console.error("Error loading technicians:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login?role=agency");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your technicians. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoryError("");

      const response = await axios.get(
        "http://localhost:5000/api/categories"
      );

      setCategories(response.data || []);
    } catch (err) {
      console.error("Error loading categories:", err);

      setCategoryError(
        err.response?.data?.message ||
          "Unable to load technician categories."
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
    fetchCategories();
  }, []);

  const getInitials = (name) => {
    if (!name) return "T";

    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      category_id: "",
      years_experience: "",
      location: "",
      bio: "",
    });

    setAddError("");
    setAddSuccess("");
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (addingTechnician) return;

    setShowAddModal(false);
    resetForm();
  };

  const handleAddTechnician = async (event) => {
    event.preventDefault();

    setAddError("");
    setAddSuccess("");

    const token = getToken();

    if (!token) {
      navigate("/login?role=agency");
      return;
    }

    if (!formData.category_id) {
      setAddError("Please select a technician category.");
      return;
    }

    if (!formData.years_experience) {
      setAddError("Please enter the years of experience.");
      return;
    }

    try {
      setAddingTechnician(true);

      const response = await axios.post(
        "http://localhost:5000/api/agencies/technicians",
        {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          category_id: Number(formData.category_id),
          years_experience: Number(formData.years_experience),
          location: formData.location,
          bio: formData.bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Technician created successfully:",
        response.data
      );

      setAddSuccess("Technician added successfully.");

      await fetchTechnicians();

      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1200);
    } catch (err) {
      console.error("Error adding technician:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login?role=agency");
        return;
      }

      setAddError(
        err.response?.data?.message ||
          "Unable to add technician. Please try again."
      );
    } finally {
      setAddingTechnician(false);
    }
  };

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
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <button
            onClick={() => navigate("/agency")}
            style={{
              width: "42px",
              height: "42px",
              border: "1px solid #e5e9f2",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#52627a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "23px",
                color: "#14213d",
              }}
            >
              Technicians
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "13px",
                color: "#7b879d",
              }}
            >
              Manage the professionals working under your agency.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          style={{
            border: "none",
            background: "#2166d1",
            color: "#ffffff",
            padding: "11px 17px",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <UserPlus size={17} />
          Add Technician
        </button>
      </header>

      {/* Content */}

      <main
        style={{
          padding: "30px 34px 45px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Summary */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "18px",
            marginBottom: "22px",
          }}
        >
          {/* Total */}

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e9f2",
              borderRadius: "15px",
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
                borderRadius: "13px",
                background: "#eaf2ff",
                color: "#2166d1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={22} />
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#7b879d",
                }}
              >
                Total Technicians
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "3px",
                  fontSize: "22px",
                  color: "#182640",
                }}
              >
                {technicians.length}
              </strong>
            </div>
          </div>

          {/* Verified */}

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e9f2",
              borderRadius: "15px",
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
                borderRadius: "13px",
                background: "#e9f8ef",
                color: "#27985a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#7b879d",
                }}
              >
                Verified
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "3px",
                  fontSize: "22px",
                  color: "#182640",
                }}
              >
                {
                  technicians.filter(
                    (technician) =>
                      Number(technician.is_verified) === 1
                  ).length
                }
              </strong>
            </div>
          </div>

          {/* Pending */}

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e9f2",
              borderRadius: "15px",
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
                borderRadius: "13px",
                background: "#fff3df",
                color: "#a56a14",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock3 size={22} />
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#7b879d",
                }}
              >
                Pending Verification
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "3px",
                  fontSize: "22px",
                  color: "#182640",
                }}
              >
                {
                  technicians.filter(
                    (technician) =>
                      Number(technician.is_verified) !== 1
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>

        {/* Main panel */}

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e9f2",
            borderRadius: "16px",
            padding: "23px",
            boxShadow: "0 3px 12px rgba(25, 45, 80, 0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "15px",
              paddingBottom: "18px",
              borderBottom: "1px solid #edf0f5",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  color: "#182640",
                }}
              >
                Agency Technicians
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "12px",
                  color: "#8893a7",
                }}
              >
                Professionals currently registered under your agency.
              </p>
            </div>

            <button
              onClick={fetchTechnicians}
              disabled={loading}
              title="Refresh technicians"
              style={{
                width: "40px",
                height: "40px",
                border: "1px solid #e5e9f2",
                borderRadius: "9px",
                background: "#ffffff",
                color: "#2166d1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <RefreshCw
                size={18}
                style={{
                  animation: loading
                    ? "agencyTechnicianSpin 1s linear infinite"
                    : "none",
                }}
              />
            </button>
          </div>

          {/* Loading */}

          {loading && (
            <div
              style={{
                padding: "70px 20px",
                textAlign: "center",
                color: "#7b879d",
              }}
            >
              <RefreshCw
                size={30}
                style={{
                  animation:
                    "agencyTechnicianSpin 1s linear infinite",
                  marginBottom: "12px",
                }}
              />

              <p style={{ margin: 0 }}>
                Loading technicians...
              </p>
            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div
              style={{
                padding: "50px 20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#c9384a",
                  marginBottom: "18px",
                }}
              >
                {error}
              </p>

              <button
                onClick={fetchTechnicians}
                style={{
                  border: "none",
                  background: "#2166d1",
                  color: "#ffffff",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}

          {!loading && !error && technicians.length === 0 && (
            <div
              style={{
                padding: "70px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "65px",
                  height: "65px",
                  margin: "0 auto 15px",
                  borderRadius: "18px",
                  background: "#eaf2ff",
                  color: "#2166d1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={30} />
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  color: "#182640",
                }}
              >
                No Technicians Yet
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#7b879d",
                  fontSize: "13px",
                }}
              >
                Your agency has not added any technicians yet.
              </p>
            </div>
          )}

          {/* Technician list */}

          {!loading && !error && technicians.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
                paddingTop: "20px",
              }}
            >
              {technicians.map((technician) => {
                const verified =
                  Number(technician.is_verified) === 1;

                return (
                  <div
                    key={technician.technician_id}
                    style={{
                      border: "1px solid #e5e9f2",
                      borderRadius: "14px",
                      padding: "20px",
                      background: "#fbfcfe",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "18px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "13px",
                          background: "#eaf2ff",
                          color: "#2166d1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(technician.full_name)}
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "15px",
                            color: "#182640",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {technician.full_name ||
                            "Unnamed Technician"}
                        </h3>

                        <span
                          style={{
                            display: "block",
                            marginTop: "3px",
                            fontSize: "12px",
                            color: "#7b879d",
                          }}
                        >
                          {technician.category_name ||
                            "Technician"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 9px",
                        borderRadius: "7px",
                        background: verified
                          ? "#e9f8ef"
                          : "#fff3df",
                        color: verified
                          ? "#21784b"
                          : "#a56a14",
                        fontSize: "11px",
                        fontWeight: 600,
                        marginBottom: "15px",
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

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#68758b",
                          fontSize: "12px",
                        }}
                      >
                        <BriefcaseBusiness size={15} />

                        <span>
                          {technician.years_experience ?? 0} years
                          experience
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#68758b",
                          fontSize: "12px",
                        }}
                      >
                        <MapPin size={15} />

                        <span>
                          {technician.location ||
                            "Location not provided"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/agency/technicians/${technician.technician_id}`
                        )
                      }
                      style={{
                        width: "100%",
                        marginTop: "18px",
                        padding: "9px 12px",
                        border: "1px solid #d8e0ed",
                        borderRadius: "8px",
                        background: "#ffffff",
                        color: "#2166d1",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      View Technician
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Technician Modal */}

      {showAddModal && (
        <div
          onClick={closeAddModal}
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
              maxWidth: "760px",
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
                gap: "15px",
                position: "sticky",
                top: 0,
                background: "#ffffff",
                zIndex: 2,
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
                  Add Technician
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "12px",
                    color: "#7b879d",
                  }}
                >
                  Create a technician account under your agency.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={addingTechnician}
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
                  cursor: addingTechnician
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}

            <form
              onSubmit={handleAddTechnician}
              style={{
                padding: "25px",
              }}
            >
              {addError && (
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
                  {addError}
                </div>
              )}

              {addSuccess && (
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
                  {addSuccess}
                </div>
              )}

              {/* Full Name */}

              <div style={{ marginBottom: "17px" }}>
                <label
                  htmlFor="full_name"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#52627a",
                  }}
                >
                  Full Name
                </label>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #dce3ee",
                    borderRadius: "10px",
                    padding: "0 13px",
                    background: "#ffffff",
                  }}
                >
                  <Users size={17} color="#8190a7" />

                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleFormChange}
                    placeholder="Enter technician's full name"
                    required
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      padding: "13px 10px",
                      fontSize: "13px",
                      color: "#182640",
                      background: "transparent",
                    }}
                  />
                </div>
              </div>

              {/* Email + Phone */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div style={{ marginBottom: "17px" }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#52627a",
                    }}
                  >
                    Email Address
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                      padding: "0 13px",
                    }}
                  >
                    <Mail size={17} color="#8190a7" />

                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="technician@example.com"
                      required
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        padding: "13px 10px",
                        fontSize: "13px",
                        color: "#182640",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "17px" }}>
                  <label
                    htmlFor="phone"
                    style={{
                      display: "block",
                      marginBottom: "7px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#52627a",
                    }}
                  >
                    Phone Number
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                      padding: "0 13px",
                    }}
                  >
                    <Phone size={17} color="#8190a7" />

                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="07XXXXXXXX"
                      required
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        padding: "13px 10px",
                        fontSize: "13px",
                        color: "#182640",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}

              <div style={{ marginBottom: "17px" }}>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#52627a",
                  }}
                >
                  Temporary Password
                </label>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #dce3ee",
                    borderRadius: "10px",
                    padding: "0 13px",
                  }}
                >
                  <Lock size={17} color="#8190a7" />

                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    required
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      padding: "13px 10px",
                      fontSize: "13px",
                      color: "#182640",
                    }}
                  />
                </div>
              </div>

              {/* Category + Experience */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div style={{ marginBottom: "17px" }}>
                  <label
                    htmlFor="category_id"
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

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                      padding: "0 13px",
                      background: "#ffffff",
                    }}
                  >
                    <BriefcaseBusiness
                      size={17}
                      color="#8190a7"
                    />

                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleFormChange}
                      required
                      disabled={categoriesLoading}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        padding: "13px 10px",
                        fontSize: "13px",
                        color: "#182640",
                        background: "transparent",
                        cursor: categoriesLoading
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      <option value="">
                        {categoriesLoading
                          ? "Loading categories..."
                          : "Select a category"}
                      </option>

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

                  {categoryError && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "11px",
                        color: "#c9384a",
                      }}
                    >
                      {categoryError}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: "17px" }}>
                  <label
                    htmlFor="years_experience"
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

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #dce3ee",
                      borderRadius: "10px",
                      padding: "0 13px",
                    }}
                  >
                    <BriefcaseBusiness
                      size={17}
                      color="#8190a7"
                    />

                    <input
                      type="number"
                      id="years_experience"
                      name="years_experience"
                      value={formData.years_experience}
                      onChange={handleFormChange}
                      placeholder="e.g. 5"
                      min="0"
                      required
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        padding: "13px 10px",
                        fontSize: "13px",
                        color: "#182640",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}

              <div style={{ marginBottom: "17px" }}>
                <label
                  htmlFor="location"
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

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #dce3ee",
                    borderRadius: "10px",
                    padding: "0 13px",
                  }}
                >
                  <MapPin
                    size={17}
                    color="#8190a7"
                  />

                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    placeholder="e.g. Nyeri"
                    required
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      padding: "13px 10px",
                      fontSize: "13px",
                      color: "#182640",
                    }}
                  />
                </div>
              </div>

              {/* Bio */}

              <div style={{ marginBottom: "22px" }}>
                <label
                  htmlFor="bio"
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

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    border: "1px solid #dce3ee",
                    borderRadius: "10px",
                    padding: "11px 13px",
                  }}
                >
                  <FileText
                    size={17}
                    color="#8190a7"
                    style={{ marginTop: "2px" }}
                  />

                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormChange}
                    placeholder="Describe the technician's skills and services..."
                    rows={4}
                    required
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      resize: "vertical",
                      padding: "0 10px",
                      fontSize: "13px",
                      color: "#182640",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
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
                  onClick={closeAddModal}
                  disabled={addingTechnician}
                  style={{
                    border: "1px solid #d8e0ed",
                    background: "#ffffff",
                    color: "#52627a",
                    padding: "11px 20px",
                    borderRadius: "9px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: addingTechnician
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingTechnician || categoriesLoading}
                  style={{
                    border: "none",
                    background:
                      addingTechnician || categoriesLoading
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
                    cursor:
                      addingTechnician || categoriesLoading
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <Save size={17} />

                  {addingTechnician
                    ? "Adding Technician..."
                    : "Add Technician"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes agencyTechnicianSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 800px) {
            .agency-technicians-placeholder {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </div>
  );
}

export default AgencyTechnicians;