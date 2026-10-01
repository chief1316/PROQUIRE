import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ImagePlus,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import axios from "axios";

import "./TechnicianPortfolio.css";


function TechnicianPortfolio() {

  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  /* =========================================================
     LOAD TECHNICIAN PROFILE + PORTFOLIO
  ========================================================= */

  useEffect(() => {

    const loadPortfolio = async () => {

      try {

        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {

          navigate("/login");

          return;

        }


        /* =========================
           GET MY PROFILE
        ========================= */

        const profileResponse =
          await axios.get(
            "http://localhost:5000/api/technicians/my-profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );


        const technicianId =
          profileResponse.data.technician_id;


        if (!technicianId) {

          setError(
            "Technician profile could not be found."
          );

          return;

        }


        /* =========================
           GET PORTFOLIO
        ========================= */

        const portfolioResponse =
          await axios.get(
            `http://localhost:5000/api/portfolios/${technicianId}`
          );


        setPortfolio(
          portfolioResponse.data || []
        );

      }

      catch (err) {

        console.error(
          "Error loading portfolio:",
          err
        );

        if (
          err.response?.status === 401
        ) {

          navigate("/login");

          return;

        }

        setError(
          err.response?.data?.message ||
          "Unable to load your portfolio."
        );

      }

      finally {

        setLoading(false);

      }

    };


    loadPortfolio();

  }, [navigate]);


  /* =========================================================
     IMAGE SELECTION
  ========================================================= */

  const handleImageChange = (event) => {

    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setImage(selectedFile);

    setPreview(
      URL.createObjectURL(selectedFile)
    );

  };


  /* =========================================================
     CREATE PORTFOLIO ITEM
  ========================================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");


    if (!title.trim()) {

      setError(
        "Please enter a project title."
      );

      return;

    }


    try {

      setSaving(true);


      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");


      const formData =
        new FormData();


      formData.append(
        "title",
        title.trim()
      );


      formData.append(
        "project_description",
        projectDescription.trim()
      );


      if (image) {

        formData.append(
          "image",
          image
        );

      }


      await axios.post(
        "http://localhost:5000/api/portfolios",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      setSuccess(
        "Portfolio project added successfully."
      );


      /* =========================
         CLEAR FORM
      ========================= */

      setTitle("");
      setProjectDescription("");
      setImage(null);
      setPreview(null);

      setShowForm(false);


      /* =========================
         RELOAD PORTFOLIO
      ========================= */

      const profileResponse =
        await axios.get(
          "http://localhost:5000/api/technicians/my-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


      const technicianId =
        profileResponse.data.technician_id;


      const portfolioResponse =
        await axios.get(
          `http://localhost:5000/api/portfolios/${technicianId}`
        );


      setPortfolio(
        portfolioResponse.data || []
      );

    }

    catch (err) {

      console.error(
        "Error creating portfolio item:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to save portfolio project."
      );

    }

    finally {

      setSaving(false);

    }

  };

  /* =========================================================
   DELETE PORTFOLIO ITEM
========================================================= */

const handleDelete = async (
  portfolioId
) => {

  const confirmed =
    window.confirm(
      "Are you sure you want to delete this portfolio project? This action cannot be undone."
    );


  if (!confirmed) {
    return;
  }


  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");


  if (!token) {

    navigate("/login");

    return;

  }


  try {

    setDeletingId(
      portfolioId
    );

    setError("");
    setSuccess("");


    await axios.delete(
      `http://localhost:5000/api/portfolios/${portfolioId}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );


    /*
     * Remove the deleted project immediately
     * from the page.
     */

    setPortfolio(
      (previousPortfolio) =>
        previousPortfolio.filter(
          (item) =>
            item.portfolio_id !==
            portfolioId
        )
    );


    setSuccess(
      "Portfolio project deleted successfully."
    );

  }

  catch (err) {

    console.error(
      "Portfolio deletion error:",
      err
    );


    if (
      err.response?.status === 401
    ) {

      navigate("/login");

      return;

    }


    setError(
      err.response?.data?.message ||
      "Unable to delete portfolio project."
    );

  }

  finally {

    setDeletingId(null);

  }

};


  /* =========================================================
     CANCEL FORM
  ========================================================= */

  const handleCancel = () => {

    setTitle("");
    setProjectDescription("");
    setImage(null);
    setPreview(null);

    setError("");

    setShowForm(false);

  };


  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      "en-KE",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );

  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="portfolio-page">

        <div className="portfolio-loading">

          Loading your portfolio...

        </div>

      </div>

    );

  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="portfolio-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="portfolio-header">

        <button
          type="button"
          className="portfolio-back-button"
          onClick={() => navigate("/technician")}
        >

          <ArrowLeft size={19} />

          Back to Dashboard

        </button>


        <div className="portfolio-heading">

          <div className="portfolio-title-row">

            <div className="portfolio-title-icon">

              <BriefcaseBusiness size={25} />

            </div>

            <div>

              <span className="portfolio-label">
                PROFESSIONAL PORTFOLIO
              </span>

              <h1>
                My Portfolio
              </h1>

            </div>

          </div>


          <p>
            Showcase your previous projects and professional
            experience to potential clients.
          </p>

        </div>


        {!showForm && (

          <button
            type="button"
            className="portfolio-add-button"
            onClick={() => {

              setError("");
              setSuccess("");
              setShowForm(true);

            }}
          >

            <Plus size={19} />

            Add Project

          </button>

        )}

      </div>


      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {error && (

        <div className="portfolio-message portfolio-error">

          {error}

        </div>

      )}


      {success && (

        <div className="portfolio-message portfolio-success">

          {success}

        </div>

      )}


      {/* =====================================================
          ADD PROJECT FORM
      ===================================================== */}

      {showForm && (

        <div className="portfolio-form-card">

          <div className="portfolio-form-header">

            <div>

              <h2>
                Add Portfolio Project
              </h2>

              <p>
                Add a project that demonstrates your professional work.
              </p>

            </div>

          </div>


          <form onSubmit={handleSubmit}>


            {/* =========================
                TITLE
            ========================= */}

            <div className="portfolio-field">

              <label>
                Project Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Residential Plumbing Installation"
                disabled={saving}
              />

            </div>


            {/* =========================
                DESCRIPTION
            ========================= */}

            <div className="portfolio-field">

              <label>
                Project Description
              </label>

              <textarea
                value={projectDescription}
                onChange={(event) =>
                  setProjectDescription(
                    event.target.value
                  )
                }
                placeholder="Describe the work you completed..."
                rows={5}
                disabled={saving}
              />

            </div>


            {/* =========================
                IMAGE
            ========================= */}

            <div className="portfolio-field">

              <label>
                Project Image
              </label>


              <label className="portfolio-upload-box">

                {preview ? (

                  <img
                    src={preview}
                    alt="Project preview"
                    className="portfolio-upload-preview"
                  />

                ) : (

                  <>

                    <ImagePlus size={34} />

                    <span>
                      Click to choose an image
                    </span>

                    <small>
                      JPG, PNG or WEBP
                    </small>

                  </>

                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  disabled={saving}
                />

              </label>

            </div>


            {/* =========================
                ACTIONS
            ========================= */}

            <div className="portfolio-form-actions">

              <button
                type="button"
                className="portfolio-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >

                Cancel

              </button>


              <button
                type="submit"
                className="portfolio-save-button"
                disabled={saving}
              >

                <Upload size={18} />

                {saving
                  ? "Saving..."
                  : "Save Project"
                }

              </button>

            </div>


          </form>

        </div>

      )}


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!showForm &&
        portfolio.length === 0 && (

          <div className="portfolio-empty-card">

            <div className="portfolio-empty-icon">

              <BriefcaseBusiness size={32} />

            </div>

            <h2>
              Your portfolio is empty
            </h2>

            <p>
              Add your first project to showcase your work
              to potential clients.
            </p>

            <button
              type="button"
              className="portfolio-empty-button"
              onClick={() => setShowForm(true)}
            >

              <Plus size={18} />

              Add Your First Project

            </button>

          </div>

        )}


      {/* =====================================================
          PORTFOLIO GRID
      ===================================================== */}

      {!showForm &&
        portfolio.length > 0 && (

          <div className="portfolio-grid">

            {portfolio.map((item) => (

              <article
                key={item.portfolio_id}
                className="portfolio-card"
              >


                {/* =========================
                    IMAGE
                ========================= */}

                <div className="portfolio-card-image">

                  {item.image_path ? (

                    <img
                      src={`http://localhost:5000${item.image_path}`}
                      alt={item.title}
                    />

                  ) : (

                    <div className="portfolio-no-image">

                      <BriefcaseBusiness size={40} />

                      <span>
                        No project image
                      </span>

                    </div>

                  )}

                </div>


                {/* =========================
                    CONTENT
                ========================= */}

                <div className="portfolio-card-content">

                  <h2>
                    {item.title}
                  </h2>


                  {item.project_description && (

                    <p>
                      {item.project_description}
                    </p>

                  )}


                  <div className="portfolio-card-footer">

                    <div className="portfolio-card-date">

                      Added{" "}
                      {formatDate(item.uploaded_at)}

                    </div>


                    <button
                      type="button"
                      className="portfolio-delete-button"
                      onClick={() =>
                        handleDelete(
                      item.portfolio_id
                      )
          }
    disabled={
      deletingId ===
      item.portfolio_id
    }
  >

    <Trash2 size={16} />

    {deletingId ===
    item.portfolio_id
      ? "Deleting..."
      : "Delete"}

  </button>

</div>

                </div>

              </article>

            ))}

          </div>

        )}


    </div>

  );

}


export default TechnicianPortfolio;