
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Pencil,
  X,
  MapPin,
  BriefcaseBusiness,
  Clock,
  UserRound
} from "lucide-react";
import axios from "axios";
import "./TechnicianProfile.css";

function TechnicianProfile() {
  const navigate = useNavigate();

  // Form fields
  const [categoryId, setCategoryId] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("Independent");

  // Agency fields
  const [agencies, setAgencies] = useState([]);
  const [agencyId, setAgencyId] = useState("");
  const [loadingAgencies, setLoadingAgencies] = useState(false);

  // Status fields
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Saved database profile
  const [savedProfile, setSavedProfile] = useState(null);

  // API base URL
  const API_URL = "http://localhost:5000/api";

  // Get authentication token
  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  // Load registered agencies
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoadingAgencies(true);

        const response = await axios.get(
          `${API_URL}/agencies`
        );

        setAgencies(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (err) {
        console.error("Agency loading error:", err);

        setError(
          "Unable to load registered agencies. Please try again."
        );
      } finally {
        setLoadingAgencies(false);
      }
    };

    fetchAgencies();
  }, []);

  // Load the logged-in technician's profile
  useEffect(() => {
    const fetchMyProfile = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoadingProfile(true);

        const response = await axios.get(
          `${API_URL}/technicians/my-profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const profile = response.data;

        if (!profile || !profile.technician_id) {
          setProfileExists(false);
          setSavedProfile(null);
          setIsEditing(false);
          return;
        }

        setSavedProfile(profile);
        setProfileExists(true);
        setIsEditing(false);

        // Populate form with saved database values
        setCategoryId(
          profile.category_id != null
            ? String(profile.category_id)
            : ""
        );

        setBio(profile.bio || "");

        setYearsExperience(
          profile.years_experience != null
            ? String(profile.years_experience)
            : ""
        );

        setLocation(profile.location || "");

        setEmploymentType(
          profile.employment_type || "Independent"
        );

        setAgencyId(
          profile.agency_id != null
            ? String(profile.agency_id)
            : ""
        );

      } catch (err) {
        console.error(
          "Error loading technician profile:",
          err
        );

        if (err.response?.status === 401) {
          navigate("/login");
        } else if (err.response?.status === 404) {
          // No profile exists yet. Show the creation form.
          setProfileExists(false);
          setSavedProfile(null);
          setIsEditing(false);
        } else {
          setError(
            "Unable to load your saved profile. Please refresh the page."
          );
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchMyProfile();
  }, [navigate]);

  // Restore form values from the saved database profile
  const restoreSavedProfile = () => {
    if (!savedProfile) return;

    setCategoryId(
      savedProfile.category_id != null
        ? String(savedProfile.category_id)
        : ""
    );

    setBio(savedProfile.bio || "");

    setYearsExperience(
      savedProfile.years_experience != null
        ? String(savedProfile.years_experience)
        : ""
    );

    setLocation(savedProfile.location || "");

    setEmploymentType(
      savedProfile.employment_type || "Independent"
    );

    setAgencyId(
      savedProfile.agency_id != null
        ? String(savedProfile.agency_id)
        : ""
    );
  };

  // Handle employment type changes
  const handleEmploymentTypeChange = (event) => {
    const value = event.target.value;

    setEmploymentType(value);

    if (value === "Independent") {
      setAgencyId("");
    }
  };

  // Open the edit form
  const handleEditProfile = () => {
    restoreSavedProfile();
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  // Cancel editing and discard unsaved changes
  const handleCancelEdit = () => {
    restoreSavedProfile();
    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  // Create a new profile or update an existing profile
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Validate required fields
    if (
      !categoryId ||
      !bio.trim() ||
      yearsExperience === "" ||
      !location.trim() ||
      !employmentType
    ) {
      setError("Please fill in all profile fields.");
      return;
    }

    if (
      !Number.isFinite(Number(yearsExperience)) ||
      Number(yearsExperience) < 0
    ) {
      setError("Please enter valid years of experience.");
      return;
    }

    if (
      employmentType === "Agency" &&
      !agencyId
    ) {
      setError("Please select the agency you work for.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your session has expired. Please log in again."
      );
      navigate("/login");
      return;
    }

    const isUpdate = profileExists;

    const profileData = {
      category_id: Number(categoryId),
      bio: bio.trim(),
      years_experience: Number(yearsExperience),
      location: location.trim(),
      employment_type: employmentType,
      agency_id:
        employmentType === "Agency"
          ? Number(agencyId)
          : null
    };

    try {
      setLoading(true);

      // Update existing profile
      if (isUpdate) {
        await axios.put(
          `${API_URL}/technicians/my-profile`,
          profileData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        // Create profile for the first time
        await axios.post(
          `${API_URL}/technicians/profile`,
          profileData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      // Fetch the latest saved profile from the database
      const updatedResponse = await axios.get(
        `${API_URL}/technicians/my-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedProfile = updatedResponse.data;

      // Update saved profile and form state
      setSavedProfile(updatedProfile);
      setProfileExists(true);

      setCategoryId(
        updatedProfile.category_id != null
          ? String(updatedProfile.category_id)
          : ""
      );

      setBio(updatedProfile.bio || "");

      setYearsExperience(
        updatedProfile.years_experience != null
          ? String(updatedProfile.years_experience)
          : ""
      );

      setLocation(updatedProfile.location || "");

      setEmploymentType(
        updatedProfile.employment_type || "Independent"
      );

      setAgencyId(
        updatedProfile.agency_id != null
          ? String(updatedProfile.agency_id)
          : ""
      );

      setIsEditing(false);

      setSuccess(
        isUpdate
          ? "Professional profile updated successfully."
          : "Professional profile created successfully."
      );

    } catch (err) {
      console.error("Profile save error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
        "Unable to save your professional profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="technician-profile-page">
      <div className="technician-profile-card">

        {/* Back to dashboard */}
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/technician")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Page heading */}
        <div className="profile-heading">
          <h1>
            {loadingProfile
              ? "My Professional Profile"
              : profileExists
                ? isEditing
                  ? "Edit Professional Profile"
                  : "My Professional Profile"
                : "Complete Your Professional Profile"}
          </h1>

          <p>
            {profileExists && !isEditing
              ? "View and manage your professional information."
              : "Provide your professional information so clients can learn more about your services."}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="profile-success">
            {success}
          </div>
        )}

        {/* Loading profile */}
        {loadingProfile && (
          <div className="profile-loading">
            Loading your professional profile...
          </div>
        )}

        {/* ======================================
            SAVED PROFILE VIEW MODE
        ====================================== */}
        {!loadingProfile &&
          profileExists &&
          !isEditing &&
          savedProfile && (
            <div className="saved-profile-view">

              <div className="saved-profile-header">
                <div className="saved-profile-avatar">
                  <UserRound size={32} />
                </div>

                <div className="saved-profile-title">
                  <h2>
                    {savedProfile.full_name || "Technician"}
                  </h2>

                  <p>
                    {savedProfile.category_name || "Technician"}
                  </p>

                  <span className="profile-status">
                    {savedProfile.is_verified
                      ? "Verified Technician"
                      : "Profile Created"}
                  </span>
                </div>
              </div>

              <div className="saved-profile-divider"></div>

              <div className="saved-profile-details">

                <div className="saved-profile-field">
                  <h4>Professional Bio</h4>
                  <p>
                    {savedProfile.bio || "No bio provided."}
                  </p>
                </div>

                <div className="saved-profile-field">
                  <h4>
                    <Clock size={16} />
                    Years of Experience
                  </h4>

                  <p>
                    {savedProfile.years_experience ?? 0}{" "}
                    {Number(savedProfile.years_experience) === 1
                      ? "year"
                      : "years"}
                  </p>
                </div>

                <div className="saved-profile-field">
                  <h4>
                    <MapPin size={16} />
                    Location
                  </h4>

                  <p>
                    {savedProfile.location || "Not provided"}
                  </p>
                </div>

                <div className="saved-profile-field">
                  <h4>
                    <BriefcaseBusiness size={16} />
                    Employment Type
                  </h4>

                  <p>
                    {savedProfile.employment_type || "Independent"}
                  </p>
                </div>

                {savedProfile.employment_type === "Agency" && (
                  <div className="saved-profile-field">
                    <h4>Agency</h4>

                    <p>
                      {savedProfile.agency_name || "Agency"}
                    </p>
                  </div>
                )}

              </div>

              <button
                type="button"
                className="profile-submit edit-profile-button"
                onClick={handleEditProfile}
              >
                <Pencil size={18} />
                Edit Profile
              </button>
            </div>
          )}

        {/* ======================================
            CREATE OR EDIT PROFILE FORM
        ====================================== */}
        {!loadingProfile &&
          (!profileExists || isEditing) && (
            <form
              className="technician-profile-form"
              onSubmit={handleSubmit}
            >

              {/* Category */}
              <div className="form-group">
                <label htmlFor="categoryId">
                  Category
                </label>

                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select your category
                  </option>

                  <option value="1">Electrician</option>
                  <option value="2">Plumber</option>
                  <option value="3">Mason</option>
                  <option value="4">Carpenter</option>
                  <option value="5">Painter</option>
                  <option value="6">Welder</option>
                  <option value="7">Mechanic</option>
                  <option value="8">Roofer</option>
                  <option value="9">CCTV Installer</option>
                  <option value="10">Solar Installer</option>
                  <option value="11">Tiles Specialist</option>
                  <option value="12">Interior Designer</option>
                  <option value="13">Water Tank Installer</option>
                  <option value="14">Borehole Technician</option>
                  <option value="15">Locksmith</option>
                  <option value="16">Appliance Repair Technician</option>
                  <option value="17">Fridge Repair Technician</option>
                  <option value="18">TV Repair Technician</option>
                  <option value="19">Phone Repair Technician</option>
                  <option value="20">Internet Service Provider</option>
                  <option value="21">Computer Repair Technician</option>
                </select>
              </div>

              {/* Professional bio */}
              <div className="form-group">
                <label htmlFor="bio">
                  Professional Bio
                </label>

                <textarea
                  id="bio"
                  rows="5"
                  placeholder="Describe your skills, services and professional experience"
                  value={bio}
                  onChange={(event) =>
                    setBio(event.target.value)
                  }
                  required
                />
              </div>

              {/* Years of experience */}
              <div className="form-group">
                <label htmlFor="yearsExperience">
                  Years of Experience
                </label>

                <input
                  type="number"
                  id="yearsExperience"
                  min="0"
                  placeholder="e.g. 5"
                  value={yearsExperience}
                  onChange={(event) =>
                    setYearsExperience(event.target.value)
                  }
                  required
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label htmlFor="location">
                  Location
                </label>

                <input
                  type="text"
                  id="location"
                  placeholder="e.g. Nyeri"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  required
                />
              </div>

              {/* Employment type */}
              <div className="form-group">
                <label htmlFor="employmentType">
                  Employment Type
                </label>

                <select
                  id="employmentType"
                  value={employmentType}
                  onChange={handleEmploymentTypeChange}
                  required
                >
                  <option value="Independent">
                    Independent
                  </option>

                  <option value="Agency">
                    Agency
                  </option>
                </select>
              </div>

              {/* Agency selection */}
              {employmentType === "Agency" && (
                <div className="form-group">
                  <label htmlFor="agencyId">
                    Select Agency
                  </label>

                  <select
                    id="agencyId"
                    value={agencyId}
                    onChange={(event) =>
                      setAgencyId(event.target.value)
                    }
                    required
                    disabled={loadingAgencies}
                  >
                    <option value="">
                      {loadingAgencies
                        ? "Loading agencies..."
                        : "Select your agency"}
                    </option>

                    {agencies.map((agency) => (
                      <option
                        key={agency.agency_id}
                        value={agency.agency_id}
                      >
                        {agency.company_name}
                        {agency.county
                          ? ` — ${agency.county}`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {!loadingAgencies &&
                    agencies.length === 0 && (
                      <small>
                        No registered agencies are currently
                        available.
                      </small>
                    )}
                </div>
              )}

              {/* Form buttons */}
              <div className="profile-form-actions">
                <button
                  type="submit"
                  className="profile-submit"
                  disabled={loading || loadingProfile}
                >
                  <Save size={18} />

                  {loading
                    ? "Saving Changes..."
                    : profileExists
                      ? "Save Changes"
                      : "Save Professional Profile"}
                </button>

                {profileExists && isEditing && (
                  <button
                    type="button"
                    className="profile-cancel-button"
                    disabled={loading}
                    onClick={handleCancelEdit}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                )}
              </div>

            </form>
          )}

      </div>
    </div>
  );
}

export default TechnicianProfile;