const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const portfolioRoutes =
require("./routes/portfolioRoutes");

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const adminRoutes = require("./routes/adminRoutes");
const technicianRoutes = require("./routes/technicianRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const agencyRoutes = require("./routes/agencyRoutes");
const documentRoutes = require("./routes/documentRoutes");
const agencyTechnicianRoutes =
require("./routes/agencyTechnicianRoutes");
const userRoutes = require("./routes/userRoutes");


// Subscription routes
const subscriptionRoutes =
require("./routes/subscriptionRoutes");

const paymentRoutes =
require("./routes/paymentRoutes");

const availabilityRoutes =
require("./routes/availabilityRoutes");

// Report routes
const reportRoutes =
require("./routes/reportRoutes");

// Client routes
const clientRoutes =
require("./routes/clientRoutes");

const categoryRoutes = require("./routes/categoryRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use(
    "/uploads",
    express.static("uploads")
);

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/portfolios", portfolioRoutes);
app.use("/api/documents", documentRoutes);

app.use(
    "/api/agencies/technicians",
    agencyTechnicianRoutes
);

app.use("/api/agencies", agencyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);


// Subscription module
app.use(
    "/api/subscriptions",
    subscriptionRoutes
);

app.use(
    "/api/payments",
    paymentRoutes
);

app.use(
    "/api/availability",
    availabilityRoutes
);

// Report module
app.use(
    "/api/reports",
    reportRoutes
);

// Client module
app.use(
    "/api/clients",
    clientRoutes
);

app.get("/", (req, res) => {
    res.send("ProQuire API Running");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});