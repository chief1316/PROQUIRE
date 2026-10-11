import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Users,
} from "lucide-react";
import "./AgencyReports.css";

export default function AgencyReports() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportPeriod, setReportPeriod] = useState("all");

  const filteredRequests = requests.filter((request) => {
    if (reportPeriod === "all") {
      return true;
    }

    const requestDate = new Date(request.request_date);
    const today = new Date();

    const daysAgo = new Date();
    daysAgo.setDate(today.getDate() - Number(reportPeriod));

    return requestDate >= daysAgo && requestDate <= today;
  });

  const completedRequests = filteredRequests.filter(
    (request) => request.request_status?.toLowerCase() === "completed",
  ).length;

  const pendingRequests = filteredRequests.filter(
    (request) => request.request_status?.toLowerCase() === "pending",
  ).length;

  const assignedRequests = filteredRequests.filter(
    (request) => request.request_status?.toLowerCase() === "assigned",
  ).length;

  const completionRate =
    filteredRequests.length > 0
      ? Math.round((completedRequests / filteredRequests.length) * 100)
      : 0;

  const technicianPerformance = technicians.map((technician) => {
    const technicianId =
      technician.technician_id || technician.user_id || technician.id;

    const completedJobs = filteredRequests.filter(
      (request) =>
        Number(request.technician_id) === Number(technicianId) &&
        request.request_status?.toLowerCase() === "completed",
    ).length;

    return {
      ...technician,
      completedJobs,
    };
  });

  const handleExportReport = () => {
    const rows = [
      [`${agency?.company_name || "ProQuire Agency"} Report`],
      [
        "Report Period",
        reportPeriod === "all" ? "All Time" : `Last ${reportPeriod} Days`,
      ],
      [],
      ["Total Requests", filteredRequests.length],
      ["Completed Requests", completedRequests],
      ["Pending Requests", pendingRequests],
      ["Assigned Requests", assignedRequests],
      ["Total Technicians", technicians.length],
      ["Completion Rate", `${completionRate}%`],
      [],
      ["Technician", "Completed Jobs"],
      ...technicianPerformance.map((technician) => [
        technician.full_name ||
          technician.technician_name ||
          technician.name ||
          "Technician",
        technician.completedJobs,
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    const safeAgencyName = (agency?.company_name || "proquire-agency")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    link.download = `${safeAgencyName}-report-${reportPeriod}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchReportData = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login?role=agency");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const requestsResponse = await axios.get(
          "http://localhost:5000/api/service-requests/agency/my-requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setRequests(
          Array.isArray(requestsResponse.data)
            ? requestsResponse.data
            : requestsResponse.data.requests || [],
        );

        const techniciansResponse = await axios.get(
          "http://localhost:5000/api/agencies/technicians",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setTechnicians(
          Array.isArray(techniciansResponse.data)
            ? techniciansResponse.data
            : techniciansResponse.data.technicians || [],
        );

        const agencyResponse = await axios.get(
          "http://localhost:5000/api/agencies/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setAgency(agencyResponse.data);
      } catch (err) {
        console.error("Error loading report data:", err);
        setError("Unable to load agency report data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [navigate]);

  return (
    <div className="agency-reports-page">
      <div>
        <div className="agency-reports-header">
          <button
            type="button"
            className="agency-reports-back"
            onClick={() => navigate("/agency")}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="agency-reports-title">
            <h1>Reports</h1>
            <p>View your agency's performance and service activity.</p>
          </div>
        </div>

        <div className="agency-reports-filter">
          <label htmlFor="reportPeriod">Report Period</label>

          <select
            id="reportPeriod"
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
          <button
            type="button"
            className="agency-reports-export"
            onClick={handleExportReport}
          >
            <Download size={17} />
            Export Report
          </button>
        </div>

        <div className="agency-reports-stats">
          {/* Total Requests */}
          <div className="agency-reports-stat">
            <div className="agency-reports-icon">
              <FileText size={22} />
            </div>

            <div>
              <span>Total Requests</span>
              <strong>{loading ? "..." : filteredRequests.length}</strong>
              <small>Service requests received</small>
            </div>
          </div>

          {/* Total Technicians */}
          <div className="agency-reports-stat">
            <div className="agency-reports-icon">
              <Users size={22} />
            </div>

            <div>
              <span>Total Technicians</span>
              <strong>{loading ? "..." : technicians.length}</strong>
              <small>Registered team members</small>
            </div>
          </div>

          <div className="agency-reports-stat">
            <div className="agency-reports-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Completed Requests</span>
              <strong>{loading ? "..." : completedRequests}</strong>
              <small>Successfully completed jobs</small>
            </div>
          </div>
          <div className="agency-reports-stat">
            <div className="agency-reports-icon">
              <Clock3 size={22} />
            </div>

            <div>
              <span>Pending Requests</span>
              <strong>{loading ? "..." : pendingRequests}</strong>
              <small>Requests awaiting action</small>
            </div>
          </div>
        </div>

        <div className="agency-reports-panel">
          <h2>Service Request Performance</h2>
          <p>Overview of your agency's current service request activity.</p>

          <div className="agency-report-row">
            <span>Assigned Requests</span>
            <strong>{assignedRequests}</strong>
          </div>

          <div className="agency-report-row">
            <span>Pending Requests</span>
            <strong>{pendingRequests}</strong>
          </div>

          <div className="agency-report-row">
            <span>Completed Requests</span>
            <strong>{completedRequests}</strong>
          </div>

          <div className="agency-report-row">
            <span>Completion Rate</span>
            <strong>{completionRate}%</strong>
          </div>
        </div>
        <div className="agency-reports-panel agency-technician-performance">
          <h2>Technician Performance</h2>
          <p>Completed service requests handled by your agency technicians.</p>

          {technicianPerformance.length === 0 ? (
            <div className="agency-report-empty">
              No technicians registered under this agency.
            </div>
          ) : (
            technicianPerformance.map((technician) => (
              <div
                className="agency-report-row"
                key={
                  technician.technician_id ||
                  technician.user_id ||
                  technician.id
                }
              >
                <span>
                  {technician.full_name ||
                    technician.technician_name ||
                    technician.name ||
                    "Technician"}
                </span>

                <strong>{technician.completedJobs} completed</strong>
              </div>
            ))
          )}
        </div>
        <div className="agency-reports-panel agency-performance-summary">
          <h2>Agency Summary</h2>
          <p>Overall performance based on your current service activity.</p>

          <div className="agency-report-row">
            <span>Total Service Requests</span>
            <strong>{filteredRequests.length}</strong>
          </div>

          <div className="agency-report-row">
            <span>Jobs Completed</span>
            <strong>{completedRequests}</strong>
          </div>

          <div className="agency-report-row">
            <span>Active Technicians</span>
            <strong>{technicians.length}</strong>
          </div>

          <div className="agency-report-row">
            <span>Overall Completion Rate</span>
            <strong>{completionRate}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
