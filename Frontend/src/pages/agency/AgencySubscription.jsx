import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, CheckCircle, CreditCard, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./AgencySubscription.css";

const API = "http://localhost:5000/api";

const getToken = () => sessionStorage.getItem("token");

const AgencySubscription = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [mpesaMessage, setMpesaMessage] = useState("");
  const [mpesaError, setMpesaError] = useState("");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      setLoading(true);
      setError("");

      try {
        const [plansResponse, subscriptionResponse, paymentsResponse] =
          await Promise.all([
            axios.get(`${API}/subscriptions/plans?type=agency`),

            axios
              .get(`${API}/subscriptions/my-subscription`, authConfig)
              .catch((err) => {
                if (err.response?.status === 404) {
                  return { data: null };
                }
                throw err;
              }),

            axios.get(`${API}/payments/my-payments`, authConfig),
          ]);

        setPlans(Array.isArray(plansResponse.data) ? plansResponse.data : []);

        setSubscription(subscriptionResponse.data);

        const payments = Array.isArray(paymentsResponse.data)
          ? paymentsResponse.data
          : [];

        const currentSubscriptionId =
          subscriptionResponse.data?.subscription_id;

        const currentPayment = payments.find(
          (payment) =>
            Number(payment.subscription_id) === Number(currentSubscriptionId),
        );

        setPaymentStatus(currentPayment?.payment_status || "");
      } catch (err) {
        console.error("Error loading subscriptions:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load subscription information.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  const handleSubscribe = async (planId) => {
    const token = getToken();

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
        { plan_id: planId },
        authConfig,
      );

      setSubscription(response.data.subscription);

      setMessage(
        "Subscription created successfully. Please continue with payment.",
      );
    } catch (err) {
      console.error("Error creating subscription:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create subscription. Please try again.",
      );
    } finally {
      setSubscribing(false);
      setSelectedPlanId(null);
    }
  };

  const handleMpesaPayment = async () => {
    const token = getToken();

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
          "M-Pesa payment request sent. Check your phone and complete the payment.",
      );
    } catch (err) {
      console.error("Error initiating M-Pesa payment:", err);

      setMpesaError(
        err.response?.data?.message ||
          "Unable to start M-Pesa payment. Please try again.",
      );
    } finally {
      setMpesaLoading(false);
    }
  };

  return (
    <div className="agency-subscription-page">
      <header className="agency-subscription-header">
        <div>
          <h1>Agency Subscription</h1>
          <p>Manage your agency plan and subscription status.</p>
        </div>

        <button
          type="button"
          className="agency-subscription-back"
          onClick={() => navigate("/agency")}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </header>

      {error && (
        <p className="agency-subscription-error" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="agency-subscription-message" role="status">
          {message}
        </p>
      )}

      {loading ? (
        <p>Loading subscription information...</p>
      ) : (
        <>
          <section className="agency-subscription-section">
            <h2>Current Subscription</h2>

            {subscription ? (
              <div className="agency-current-card">
                <p>Status: {subscription.status}</p>
                <p>Price: KSh {Number(subscription.price).toLocaleString()}</p>
                <p>
                  End date:{" "}
                  {subscription.end_date
                    ? new Date(subscription.end_date).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>
            ) : (
              <p>You do not have a subscription yet.</p>
            )}
          </section>

          {subscription?.status === "pending" && (
            <section className="agency-payment-card">
              <h2>Complete Your Payment</h2>

              <p>
                Complete your M-Pesa payment to activate your{" "}
                {subscription.plan_name} subscription.
              </p>

              {mpesaMessage && (
                <p className="agency-subscription-message" role="status">
                  {mpesaMessage}
                </p>
              )}

              {mpesaError && (
                <p className="agency-subscription-error" role="alert">
                  {mpesaError}
                </p>
              )}

              <div className="agency-payment-amount">
                Amount to Pay: KSh{" "}
                {Number(subscription.price).toLocaleString("en-KE")}
              </div>

              <div className="agency-payment-field">
                <input
                  id="agency-mpesa-phone"
                  type="tel"
                  value={mpesaPhone}
                  onChange={(event) => setMpesaPhone(event.target.value)}
                  placeholder="2547XXXXXXXX"
                  disabled={mpesaLoading}
                />
              </div>

              <button
                type="button"
                className="agency-primary-button"
                onClick={handleMpesaPayment}
                disabled={mpesaLoading}
              >
                <CreditCard size={16} />
                {mpesaLoading
                  ? "Sending Payment Request..."
                  : "Pay with M-Pesa"}
              </button>
            </section>
          )}

          <section className="agency-subscription-section">
            <h2>Available Plans</h2>

            {plans.length === 0 ? (
              <p>No active subscription plans are available.</p>
            ) : (
              <div className="agency-plans-grid">
                {plans.map((plan) => (
                  <article className="agency-plan-card" key={plan.plan_id}>
                    <h3>{plan.plan_name}</h3>

                    <p className="agency-plan-description">
                      {plan.description}
                    </p>

                    <div className="agency-plan-price">
                      KSh {Number(plan.price).toLocaleString("en-KE")}
                    </div>

                    <p className="agency-plan-duration">
                      Duration: {plan.duration_days} days
                    </p>

                    {plan.features && (
                      <p>
                        {Array.isArray(plan.features)
                          ? plan.features.join(", ")
                          : String(plan.features)}
                      </p>
                    )}

                    <button
                      type="button"
                      className="agency-plan-button"
                      disabled={
                        subscribing ||
                        subscription?.status === "pending" ||
                        (Number(subscription?.plan_id) ===
                          Number(plan.plan_id) &&
                          subscription?.status === "active")
                      }
                      onClick={() => handleSubscribe(plan.plan_id)}
                    >
                      <CreditCard size={16} />
                      {subscribing && selectedPlanId === plan.plan_id
                        ? "Creating..."
                        : subscription?.status === "pending"
                          ? "Payment Pending"
                          : Number(subscription?.plan_id) ===
                                Number(plan.plan_id) &&
                              subscription?.status === "active"
                            ? "Current Plan"
                            : "Choose Plan"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AgencySubscription;
