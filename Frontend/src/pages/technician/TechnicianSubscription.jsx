import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

const TechnicianSubscription = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);

  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [subscribing, setSubscribing] = useState(false);

  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [mpesaMessage, setMpesaMessage] = useState("");
  const [mpesaError, setMpesaError] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchPlans();
    fetchSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);

      const response = await axios.get(`${API}/subscriptions/plans`);

      setPlans(response.data);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);

      setError(
        error.response?.data?.message || "Unable to load subscription plans.",
      );
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      setLoadingSubscription(true);

      const response = await axios.get(
        `${API}/subscriptions/my-subscription`,
        authConfig,
      );

      setSubscription(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setSubscription(null);
      } else {
        console.error("Error fetching subscription:", error);
      }
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    try {
      setSubscribing(true);
      setSelectedPlanId(planId);
      setMessage("");
      setError("");

      const response = await axios.post(
        `${API}/subscriptions/subscribe`,
        {
          plan_id: planId,
        },
        authConfig,
      );

      setSubscription(response.data.subscription);

      setMessage(
        "Subscription created successfully. Please continue with payment.",
      );
    } catch (error) {
      console.error("Error creating subscription:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create subscription. Please try again.",
      );
    } finally {
      setSubscribing(false);
      setSelectedPlanId(null);
    }
  };

  const handleMpesaPayment = async () => {
    if (!token) {
      setMpesaError("Your session has expired. Please log in again.");
      return;
    }

    if (!subscription?.subscription_id) {
      setMpesaError("No pending subscription was found.");
      return;
    }

    if (!mpesaPhone.trim()) {
      setMpesaError("Please enter the M-Pesa phone number.");
      return;
    }

    try {
      setMpesaLoading(true);
      setMpesaMessage("");
      setMpesaError("");

      const response = await axios.post(
        `${API}/payments/mpesa/stkpush`,
        {
          subscription_id: subscription.subscription_id,
          phone_number: mpesaPhone.trim(),
        },
        authConfig,
      );

      setMpesaMessage(
        response.data?.message ||
          "M-Pesa payment request sent. Please check your phone and complete the payment.",
      );
    } catch (error) {
      console.error("Error initiating M-Pesa payment:", error);

      setMpesaError(
        error.response?.data?.message ||
          "Unable to start the M-Pesa payment. Please try again.",
      );
    } finally {
      setMpesaLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `KSh ${Number(price).toLocaleString("en-KE")}`;
  };

  const getFeatures = (features) => {
    if (!features) {
      return [];
    }

    if (Array.isArray(features)) {
      return features;
    }

    try {
      const parsed = JSON.parse(features);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Continue with text format.
    }

    return String(features)
      .split(/\r?\n|,/)
      .map((feature) => feature.trim())
      .filter(Boolean);
  };

  const getStatusLabel = (status) => {
    if (status === "active") {
      return "Active";
    }

    if (status === "pending") {
      return "Pending Payment";
    }

    if (status === "expired") {
      return "Expired";
    }

    if (status === "cancelled") {
      return "Cancelled";
    }

    return status || "No Subscription";
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button
          type="button"
          onClick={() => navigate("/technician")}
          style={styles.backButton}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Subscription</h1>

            <p style={styles.subtitle}>
              Choose a subscription plan that works best for your business.
            </p>
          </div>

          <div style={styles.headerIcon}>
            <CreditCard size={28} />
          </div>
        </div>

        {message && <div style={styles.successMessage}>{message}</div>}

        {error && <div style={styles.errorMessage}>{error}</div>}

        <section style={styles.currentSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Current Subscription</h2>

              <p style={styles.sectionSubtitle}>
                Your current ProQuire subscription status.
              </p>
            </div>

            <ShieldCheck size={24} style={styles.sectionIcon} />
          </div>

          {loadingSubscription ? (
            <div style={styles.loading}>
              <Loader2 size={20} style={styles.spinner} />
              Loading subscription...
            </div>
          ) : subscription ? (
            <div style={styles.currentCard}>
              <div>
                <span style={styles.currentLabel}>Current Plan</span>

                <h3 style={styles.currentPlan}>{subscription.plan_name}</h3>

                <p style={styles.currentPrice}>
                  {formatPrice(subscription.price)} /{" "}
                  {subscription.duration_days} days
                </p>
              </div>

              <div
                style={{
                  ...styles.statusBadge,
                  ...(subscription.status === "active"
                    ? styles.activeBadge
                    : styles.pendingBadge),
                }}
              >
                {getStatusLabel(subscription.status)}
              </div>
            </div>
          ) : (
            <div style={styles.noSubscription}>
              <p>You do not currently have a subscription.</p>

              <span>Choose a plan below to get started.</span>
            </div>
          )}
        </section>

        {subscription?.status === "pending" && (
          <section style={styles.paymentSection}>
            <div style={styles.paymentHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Complete Your Payment</h2>

                <p style={styles.sectionSubtitle}>
                  Complete your M-Pesa payment to activate your{" "}
                  {subscription.plan_name} subscription.
                </p>
              </div>

              <CreditCard size={24} style={styles.sectionIcon} />
            </div>

            {mpesaMessage && (
              <div style={styles.paymentSuccess}>{mpesaMessage}</div>
            )}

            {mpesaError && <div style={styles.paymentError}>{mpesaError}</div>}

            <div style={styles.paymentCard}>
              <div style={styles.paymentAmount}>
                <span style={styles.paymentLabel}>Amount to Pay</span>

                <strong>{formatPrice(subscription.price)}</strong>
              </div>

              <div style={styles.phoneField}>
                <label style={styles.phoneLabel}>M-Pesa Phone Number</label>

                <input
                  type="tel"
                  value={mpesaPhone}
                  onChange={(event) => setMpesaPhone(event.target.value)}
                  placeholder="2547XXXXXXXX"
                  style={styles.phoneInput}
                  disabled={mpesaLoading}
                />

                <span style={styles.phoneHint}>
                  Enter the number that should receive the M-Pesa payment
                  prompt.
                </span>
              </div>

              <button
                type="button"
                onClick={handleMpesaPayment}
                disabled={mpesaLoading}
                style={{
                  ...styles.mpesaButton,
                  ...(mpesaLoading ? styles.mpesaButtonDisabled : {}),
                }}
              >
                {mpesaLoading ? (
                  <>
                    <Loader2 size={18} style={styles.spinner} />
                    Sending Payment Request...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Pay with M-Pesa
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        <section>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Available Plans</h2>

              <p style={styles.sectionSubtitle}>
                Select a plan for your technician account.
              </p>
            </div>
          </div>

          {loadingPlans ? (
            <div style={styles.loading}>
              <Loader2 size={20} style={styles.spinner} />
              Loading subscription plans...
            </div>
          ) : (
            <div style={styles.plansGrid}>
              {plans.map((plan) => {
                const features = getFeatures(plan.features);

                const isCurrent =
                  subscription &&
                  Number(subscription.plan_id) === Number(plan.plan_id) &&
                  subscription.status === "active";

                const hasPendingSubscription =
                  subscription && subscription.status === "pending";

                return (
                  <div
                    key={plan.plan_id}
                    style={{
                      ...styles.planCard,
                      ...(isCurrent ? styles.currentPlanCard : {}),
                    }}
                  >
                    {isCurrent && (
                      <div style={styles.currentBadge}>Current Plan</div>
                    )}

                    <h3 style={styles.planName}>{plan.plan_name}</h3>

                    <div style={styles.priceRow}>
                      <span style={styles.planPrice}>
                        {formatPrice(plan.price)}
                      </span>

                      <span style={styles.duration}>
                        / {plan.duration_days} days
                      </span>
                    </div>

                    <p style={styles.planDescription}>{plan.description}</p>

                    <div style={styles.featureList}>
                      {features.map((feature, index) => (
                        <div key={index} style={styles.feature}>
                          <Check size={17} style={styles.checkIcon} />

                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={
                        subscribing || isCurrent || hasPendingSubscription
                      }
                      onClick={() => handleSubscribe(plan.plan_id)}
                      style={{
                        ...styles.planButton,
                        ...(isCurrent ? styles.currentButton : {}),
                      }}
                    >
                      {subscribing && selectedPlanId === plan.plan_id ? (
                        <>
                          <Loader2 size={18} style={styles.spinner} />
                          Creating...
                        </>
                      ) : isCurrent ? (
                        "Current Plan"
                      ) : hasPendingSubscription ? (
                        "Payment Pending"
                      ) : (
                        "Upgrade to Plan"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "32px 20px",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    background: "transparent",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "0",
    marginBottom: "24px",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
  },

  title: {
    margin: "0 0 6px",
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "15px",
  },

  headerIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#2563eb",
  },

  successMessage: {
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    borderRadius: "10px",
    padding: "13px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },

  errorMessage: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "13px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },

  paymentSection: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "28px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
  },

  paymentHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  },

  paymentCard: {
    padding: "20px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },

  paymentAmount: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    color: "#0f172a",
    fontSize: "18px",
  },

  paymentLabel: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },

  phoneField: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "18px",
  },

  phoneLabel: {
    color: "#334155",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "7px",
  },

  phoneInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    background: "#ffffff",
  },

  phoneHint: {
    marginTop: "7px",
    color: "#64748b",
    fontSize: "12px",
  },

  mpesaButton: {
    width: "100%",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  mpesaButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  paymentSuccess: {
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    borderRadius: "10px",
    padding: "13px 16px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: "600",
  },

  paymentError: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "13px 16px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: "600",
  },

  currentSection: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "28px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: "700",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  sectionIcon: {
    color: "#2563eb",
  },

  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "30px",
    color: "#64748b",
    fontSize: "14px",
  },

  spinner: {
    animation: "spin 1s linear infinite",
  },

  currentCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "20px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },

  currentLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "5px",
  },

  currentPlan: {
    margin: "0",
    color: "#0f172a",
    fontSize: "22px",
  },

  currentPrice: {
    margin: "5px 0 0",
    color: "#475569",
    fontSize: "14px",
  },

  statusBadge: {
    padding: "8px 13px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  activeBadge: {
    background: "#dcfce7",
    color: "#166534",
  },

  pendingBadge: {
    background: "#fef3c7",
    color: "#92400e",
  },

  noSubscription: {
    padding: "20px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },

  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  planCard: {
    position: "relative",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
    display: "flex",
    flexDirection: "column",
  },

  currentPlanCard: {
    border: "2px solid #2563eb",
  },

  currentBadge: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },

  planName: {
    margin: "0 0 12px",
    color: "#0f172a",
    fontSize: "21px",
    fontWeight: "700",
  },

  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    marginBottom: "14px",
  },

  planPrice: {
    color: "#2563eb",
    fontSize: "27px",
    fontWeight: "800",
  },

  duration: {
    color: "#64748b",
    fontSize: "13px",
  },

  planDescription: {
    minHeight: "42px",
    margin: "0 0 18px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "11px",
    marginBottom: "24px",
    flex: 1,
  },

  feature: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    color: "#334155",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  checkIcon: {
    flexShrink: 0,
    color: "#16a34a",
    marginTop: "1px",
  },

  planButton: {
    width: "100%",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  currentButton: {
    background: "#e2e8f0",
    color: "#475569",
    cursor: "default",
  },
};

export default TechnicianSubscription;
