import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AgencyServiceRequests.css";

const API = "http://localhost:5000/api";

function getToken() {
  return sessionStorage.getItem("token");
}

const AgencyServiceRequests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await axios.get(
        `${API}/service-requests/agency/my-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const formattedRequests = response.data.map((request) => ({
        id: request.request_id,
        client: request.client_name,
        service: request.service_description,
        location: request.service_address,
        requestedDate: request.service_date,
        status: request.request_status,
        technicianId: request.technician_id || null,
        technician: request.technician_name || null,
        agency: request.agency_name,
      }));

      setRequests(formattedRequests);
    } catch (err) {
      console.error("Error fetching agency service requests:", err);

      setError(
        err.response?.data?.message || "Unable to load service requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const token = getToken();

      const response = await axios.get(
        `${API}/technicians/agency/my-technicians`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTechnicians(response.data);
    } catch (err) {
      console.error("Error fetching agency technicians:", err);

      setError(
        err.response?.data?.message || "Unable to load agency technicians.",
      );
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchTechnicians();
  }, []);

  // Temporary technician list.
  // This will later come from the agency's technicians API.

  const handleAccept = async (requestId) => {
    try {
      const token = getToken();

      await axios.patch(
        `${API}/service-requests/agency/${requestId}/status`,
        {
          request_status: "accepted",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchRequests();
    } catch (err) {
      console.error("Error accepting request:", err);

      setError(
        err.response?.data?.message || "Failed to accept service request.",
      );
    }
  };

  const handleDecline = async (requestId) => {
    try {
      const token = getToken();

      await axios.patch(
        `${API}/service-requests/agency/${requestId}/status`,
        {
          request_status: "rejected",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchRequests();
    } catch (err) {
      console.error("Error declining request:", err);

      setError(
        err.response?.data?.message || "Failed to decline service request.",
      );
    }
  };

  const handleAssignTechnician = async (requestId, technicianId) => {
    if (!technicianId) {
      return;
    }

    try {
      const token = getToken();

      await axios.patch(
        `${API}/service-requests/agency/${requestId}/assign-technician`,
        {
          technician_id: technicianId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchRequests();
      closeAssignModal();
    } catch (err) {
      console.error("Error assigning technician:", err);

      setError(err.response?.data?.message || "Failed to assign technician.");
    }
  };

  const openAssignModal = (request) => {
    setSelectedRequest(request);
    setSelectedTechnician(
      request.technicianId ? String(request.technicianId) : "",
    );
  };

  const closeAssignModal = () => {
    setSelectedRequest(null);
    setSelectedTechnician("");
  };

  const getStatusClass = (status, technician) => {
    const normalizedStatus = String(status || "").toLowerCase();
    if (normalizedStatus === "accepted" && technician) {
      return "status-assigned";
    }

    switch (normalizedStatus) {
      case "pending":
        return "status-pending";

      case "accepted":
        return "status-accepted";

      case "rejected":
      case "declined":
        return "status-declined";

      case "completed":
        return "status-completed";

      default:
        return "";
    }
  };

  return (
    <div className="agency-service-requests">
      {/* Header */}
      <div className="service-requests-header">
        <div>
          <h1>Service Requests</h1>
          <p>
            Manage incoming client requests and assign work to your technicians.
          </p>
        </div>

        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/agency")}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Summary */}
      <div className="request-summary">
        <div className="summary-card">
          <span>Total Requests</span>
          <strong>{requests.length}</strong>
        </div>

        <div className="summary-card">
          <span>Pending</span>
          <strong>
            {requests.filter((request) => request.status === "pending").length}
          </strong>
        </div>

        <div className="summary-card">
          <span>Assigned</span>
          <strong>
            {
              requests.filter(
                (request) =>
                  request.status === "accepted" && request.technician,
              ).length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>Completed</span>
          <strong>
            {
              requests.filter((request) => request.status === "completed")
                .length
            }
          </strong>
        </div>
      </div>

      {/* Requests */}
      <div className="requests-section">
        <div className="section-title">
          <h2>Incoming Requests</h2>
        </div>

        {loading ? (
          <div className="empty-state">
            <h3>Loading service requests...</h3>
            <p>Please wait while we load your requests.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to load requests</h3>
            <p>{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <h3>No service requests</h3>
            <p>New client service requests will appear here.</p>
          </div>
        ) : (
          <div className="requests-table-wrapper">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Location</th>
                  <th>Requested Date</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.client || "Unknown Client"}</strong>
                    </td>

                    <td>{request.service || "No description"}</td>

                    <td>{request.location || "Not specified"}</td>

                    <td>
                      {request.requestedDate
                        ? new Date(request.requestedDate).toLocaleDateString()
                        : "Not specified"}
                    </td>

                    <td>
                      {request.technician ? (
                        <span className="technician-name">
                          {request.technician}
                        </span>
                      ) : (
                        <span className="not-assigned">Not Assigned</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`request-status ${getStatusClass(
                          request.status,
                        )}`}
                      >
                        {request.status === "rejected"
                          ? "Declined"
                          : (request.status || "pending")
                              .charAt(0)
                              .toUpperCase() +
                            (request.status || "pending").slice(1)}
                      </span>
                    </td>

                    <td>
                      <div className="request-actions">
                        {request.status === "pending" && (
                          <>
                            <button
                              className="accept-btn"
                              onClick={() => handleAccept(request.id)}
                            >
                              Accept
                            </button>

                            <button
                              className="decline-btn"
                              onClick={() => handleDecline(request.id)}
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {(request.status === "accepted" ||
                          request.status === "assigned") && (
                          <button
                            className="assign-btn"
                            onClick={() => openAssignModal(request)}
                          >
                            {request.technician
                              ? "Reassign"
                              : "Assign Technician"}
                          </button>
                        )}

                        {request.status === "rejected" && (
                          <span className="no-action">Declined</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Technician Modal */}
      {selectedRequest && (
        <div className="assign-modal-overlay" onClick={closeAssignModal}>
          <div
            className="assign-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Assign Technician</h2>
                <p>Assign this request to one of your technicians.</p>
              </div>

              <button className="modal-close" onClick={closeAssignModal}>
                ×
              </button>
            </div>

            <div className="request-details">
              <div>
                <span>Client</span>
                <strong>{selectedRequest.client}</strong>
              </div>

              <div>
                <span>Service</span>
                <strong>{selectedRequest.service}</strong>
              </div>

              <div>
                <span>Location</span>
                <strong>{selectedRequest.location}</strong>
              </div>
            </div>

            <div className="technician-selection">
              <label htmlFor="technician">Select Technician</label>

              <select
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
              >
                <option value="">Select a technician</option>

                {technicians.map((technician) => (
                  <option
                    key={technician.technician_id}
                    value={technician.technician_id}
                  >
                    {technician.full_name} — {technician.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeAssignModal}>
                Cancel
              </button>

              <button
                className="confirm-assign-btn"
                onClick={() =>
                  handleAssignTechnician(selectedRequest.id, selectedTechnician)
                }
                disabled={!selectedTechnician}
              >
                Assign Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyServiceRequests;
