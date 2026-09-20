import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import axios from "axios";
import "./TechnicianProfile.css";

function TechnicianProfile() {
  const navigate = useNavigate();

  const [categoryId, setCategoryId] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("Independent");

  const [agencies, setAgencies] = useState([]);
  const [agencyId, setAgencyId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingAgencies, setLoadingAgencies] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load registered agencies
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoadingAgencies(true);

        const response = await axios.get(
          "http://localhost:5000/api/agencies"
        );

        setAgencies(response.data);

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


  /*
  |--------------------------------------------------------------------------
  | Handle Employment Type Change
  |--------------------------------------------------------------------------
  */

  const handleEmploymentTypeChange = (event) => {
    const value = event.target.value;

    setEmploymentType(value);

    // Clear agency selection when technician chooses Independent
    if (value === "Independent") {
      setAgencyId("");
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Submit Profile
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !categoryId ||
      !bio ||
      !yearsExperience ||
      !location ||
      !employmentType
    ) {
      setError("Please fill in all profile fields.");
      return;
    }

    /*
    * Agency technicians must select an agency.
    */

    if (employmentType === "Agency" && !agencyId) {
      setError("Please select the agency you work for.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Your session has expired. Please log in again.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/technicians/profile",
        {
          category_id: Number(categoryId),
          bio,
          years_experience: Number(yearsExperience),
          location,
          employment_type: employmentType,
          agency_id:
            employmentType === "Agency"
              ? Number(agencyId)
              : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Profile created:", response.data);

      setSuccess(
        "Professional profile saved successfully."
      );

      setTimeout(() => {
        navigate("/technician");
      }, 1500);

    } catch (err) {
      console.error("Profile creation error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Unable to create your professional profile."
        );
      } else {
        setError(
          "Unable to connect to the ProQuire server. Make sure the backend is running."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="technician-profile-page">

      <div className="technician-profile-card">

        {/* Back */}

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/technician")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>


        {/* Heading */}

        <div className="profile-heading">

          <h1>
            Complete Your Professional Profile
          </h1>

          <p>
            Provide your professional information so clients
            can learn more about your services.
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}


        {/* Success */}

        {success && (
          <div className="profile-success">
            {success}
          </div>
        )}


        {/* Form */}

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

              <option value="1">
                Electrician
              </option>

              <option value="2">
                Plumber
              </option>

              <option value="3">
                Mason
              </option>

              <option value="4">
                Carpenter
              </option>

              <option value="5">
                Painter
              </option>

              <option value="6">
                Welder
              </option>

              <option value="7">
                Mechanic
              </option>

              <option value="8">
                Roofer
              </option>

              <option value="9">
                CCTV Installer
              </option>

              <option value="10">
                Solar Installer
              </option>

              <option value="11">
                Tiles Specialist
              </option>

              <option value="12">
                Interior Designer
              </option>

              <option value="13">
                Water Tank Installer
              </option>

              <option value="14">
                Borehole Technician
              </option>

              <option value="15">
                Locksmith
              </option>

              <option value="16">
                Appliance Repair Technician
              </option>

              <option value="17">
                Fridge Repair Technician
              </option>

              <option value="18">
                TV Repair Technician
              </option>

              <option value="19">
                Phone Repair Technician
              </option>

              <option value="20">
                Internet Service Provider
              </option>

              <option value="21">
                Computer Repair Technician
              </option>

            </select>

          </div>


          {/* Bio */}

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


          {/* Experience */}

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


          {/* Employment Type */}

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


          {/* Agency */}

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


          {/* Submit */}

          <button
            type="submit"
            className="profile-submit"
            disabled={loading}
          >

            <Save size={18} />

            {loading
              ? "Saving Profile..."
              : "Save Professional Profile"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default TechnicianProfile;