import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  FileText,
  CreditCard,
  MapPin,
  Upload,
  Save,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import "./AgencyProfileSetup.css";

import logo from "../assets/proquire-logo.png";

function AgencyProfileSetup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    registrationNumber: "",
    kraPin: "",
    county: "",
    address: "",
    description: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const counties = [
    "Baringo",
    "Bomet",
    "Bungoma",
    "Busia",
    "Elgeyo-Marakwet",
    "Embu",
    "Garissa",
    "Homa Bay",
    "Isiolo",
    "Kajiado",
    "Kakamega",
    "Kericho",
    "Kiambu",
    "Kilifi",
    "Kirinyaga",
    "Kisii",
    "Kisumu",
    "Kitui",
    "Kwale",
    "Laikipia",
    "Lamu",
    "Machakos",
    "Makueni",
    "Mandera",
    "Marsabit",
    "Meru",
    "Migori",
    "Mombasa",
    "Murang'a",
    "Nairobi",
    "Nakuru",
    "Nandi",
    "Narok",
    "Nyamira",
    "Nyandarua",
    "Nyeri",
    "Samburu",
    "Siaya",
    "Taita-Taveta",
    "Tana River",
    "Tharaka-Nithi",
    "Trans Nzoia",
    "Turkana",
    "Uasin Gishu",
    "Vihiga",
    "Wajir",
    "West Pokot",
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setLogoFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /*
     * The login page can store the JWT in either
     * localStorage or sessionStorage depending on
     * whether "Remember me" was selected.
     */
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      setError(
        "Your session has expired. Please log in again."
      );

      navigate("/login?role=agency");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append(
        "company_name",
        formData.companyName
      );

      data.append(
        "registration_number",
        formData.registrationNumber
      );

      data.append(
        "kra_pin",
        formData.kraPin
      );

      data.append(
        "county",
        formData.county
      );

      data.append(
        "address",
        formData.address
      );

      data.append(
        "description",
        formData.description
      );

      if (logoFile) {
        data.append("logo", logoFile);
      }

      const response = await axios.post(
        "http://localhost:5000/api/agencies",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Agency profile response:",
        response.data
      );

      setSuccess(
        "Agency profile created successfully."
      );

      setTimeout(() => {
        navigate("/agency");
      }, 1500);

    } catch (error) {
      console.error(
        "Agency profile creation error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Unable to create the agency profile."
        );
      } else {
        setError(
          "Unable to connect to the server. Make sure the backend is running."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agency-profile-page">

      <div className="agency-profile-card">

        <Link
          to="/agency"
          className="agency-profile-back"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <div className="agency-profile-logo">
          <img
            src={logo}
            alt="ProQuire Logo"
          />
        </div>

        <div className="agency-profile-heading">

          <h1>
            Set Up Your Agency Profile
          </h1>

          <p>
            Complete your agency information to start
            using ProQuire.
          </p>

        </div>

        {error && (
          <div className="agency-profile-error">
            {error}
          </div>
        )}

        {success && (
          <div className="agency-profile-success">
            {success}
          </div>
        )}

        <form
          className="agency-profile-form"
          onSubmit={handleSubmit}
        >

          {/* Agency Information */}

          <div className="agency-profile-section">

            <div className="agency-profile-section-title">

              <Building2 size={20} />

              <div>

                <h2>
                  Agency Information
                </h2>

                <p>
                  Provide your official business details.
                </p>

              </div>

            </div>

          </div>

          {/* Company Name */}

          <div className="agency-profile-form-group">

            <label htmlFor="companyName">
              Agency / Company Name
            </label>

            <div className="agency-profile-input-wrapper">

              <Building2 size={18} />

              <input
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Enter agency or company name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          {/* Registration Number */}

          <div className="agency-profile-form-group">

            <label htmlFor="registrationNumber">
              Business Registration Number
            </label>

            <div className="agency-profile-input-wrapper">

              <FileText size={18} />

              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                placeholder="Enter registration number"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          {/* KRA PIN */}

          <div className="agency-profile-form-group">

            <label htmlFor="kraPin">
              KRA PIN
            </label>

            <div className="agency-profile-input-wrapper">

              <CreditCard size={18} />

              <input
                type="text"
                id="kraPin"
                name="kraPin"
                placeholder="Enter KRA PIN"
                value={formData.kraPin}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          {/* County */}

          <div className="agency-profile-form-group">

            <label htmlFor="county">
              County
            </label>

            <div className="agency-profile-input-wrapper">

              <MapPin size={18} />

              <select
                id="county"
                name="county"
                value={formData.county}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select county
                </option>

                {counties.map((county) => (
                  <option
                    key={county}
                    value={county}
                  >
                    {county}
                  </option>
                ))}

              </select>

            </div>

          </div>

          {/* Address */}

          <div className="agency-profile-form-group">

            <label htmlFor="address">
              Physical Address
            </label>

            <div className="agency-profile-input-wrapper">

              <MapPin size={18} />

              <input
                type="text"
                id="address"
                name="address"
                placeholder="e.g. Westlands, Nairobi"
                value={formData.address}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          {/* Description */}

          <div className="agency-profile-form-group">

            <label htmlFor="description">
              Agency Description
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Describe the services your agency provides..."
              value={formData.description}
              onChange={handleChange}
              rows="6"
              required
            />

          </div>

          {/* Agency Logo */}

          <div className="agency-profile-section">

            <div className="agency-profile-section-title">

              <Upload size={20} />

              <div>

                <h2>
                  Agency Logo
                </h2>

                <p>
                  Upload your agency logo.
                </p>

              </div>

            </div>

          </div>

          <div className="agency-profile-upload-box">

            <Upload size={28} />

            <label htmlFor="agencyLogo">

              <strong>
                {logoFile
                  ? logoFile.name
                  : "Choose agency logo"}
              </strong>

              <span>
                PNG, JPG, JPEG or WEBP
              </span>

            </label>

            <input
              type="file"
              id="agencyLogo"
              name="logo"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleLogoChange}
            />

          </div>

          {/* Submit */}

          <button
            type="submit"
            className="agency-profile-submit"
            disabled={loading}
          >

            <Save size={18} />

            {loading
              ? "Saving Profile..."
              : "Save Agency Profile"}

          </button>

        </form>

        <div className="agency-profile-footer">

          <span>
            ProQuire
          </span>

          <span>
            Professional Service Marketplace
          </span>

        </div>

      </div>

    </div>
  );
}

export default AgencyProfileSetup;