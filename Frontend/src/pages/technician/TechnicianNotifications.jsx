import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Bell,
  CheckCircle,
  Clock3,
  ShieldAlert,
  ClipboardList,
  X,
} from "lucide-react";

function TechnicianNotifications({ notifications = [] }) {
  const [open, setOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("technician_read_notifications")) || []
      );
    } catch {
      return [];
    }
  });

  const notificationRef = useRef(null);

  /*
   * ==========================================
   * UNREAD NOTIFICATIONS
   * ==========================================
   */

  const unreadNotifications = useMemo(() => {
    return notifications.filter(
      (notification) =>
        Number(notification.is_read) !== 1 &&
        !readNotifications.includes(notification.notification_id),
    );
  }, [notifications, readNotifications]);

  /*
   * ==========================================
   * CLOSE WHEN CLICKING OUTSIDE
   * ==========================================
   */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * ==========================================
   * MARK SINGLE NOTIFICATION AS READ
   * ==========================================
   */

  const markAsRead = async (notificationId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReadNotifications((previous) => {
        if (previous.includes(notificationId)) {
          return previous;
        }

        return [...previous, notificationId];
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  /*
   * ==========================================
   * MARK ALL AS READ
   * ==========================================
   */

  const markAllAsRead = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        return;
      }

      await axios.patch(
        "http://localhost:5000/api/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const allIds = notifications.map(
        (notification) => notification.notification_id,
      );
      setReadNotifications(allIds);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  /*
   * ==========================================
   * NOTIFICATION ICON
   * ==========================================
   */

  const getNotificationIcon = (type) => {
    if (
      type === "verification" ||
      type === "verification_rejected" ||
      type === "verification_approved"
    ) {
      return (
        <div
          style={{
            ...styles.notificationIcon,
            background: "#fff0f0",
            color: "#d94b4b",
          }}
        >
          <ShieldAlert size={17} />
        </div>
      );
    }

    if (type === "request") {
      return (
        <div
          style={{
            ...styles.notificationIcon,
            background: "#eaf2ff",
            color: "#1769e0",
          }}
        >
          <ClipboardList size={17} />
        </div>
      );
    }

    if (type === "success") {
      return (
        <div
          style={{
            ...styles.notificationIcon,
            background: "#eaf9f0",
            color: "#159447",
          }}
        >
          <CheckCircle size={17} />
        </div>
      );
    }

    return (
      <div
        style={{
          ...styles.notificationIcon,
          background: "#f1f5fa",
          color: "#596579",
        }}
      >
        <Clock3 size={17} />
      </div>
    );
  };

  return (
    <div ref={notificationRef} style={styles.container}>
      {/* Notification bell */}

      <button
        type="button"
        style={styles.iconButton}
        title="Notifications"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={20} />

        {unreadNotifications.length > 0 && (
          <span style={styles.notificationDot}>
            {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
          </span>
        )}
      </button>

      {/* Notification dropdown */}

      {open && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <div>
              <h3 style={styles.dropdownTitle}>Notifications</h3>

              <p style={styles.dropdownSubtitle}>
                {unreadNotifications.length > 0
                  ? `${unreadNotifications.length} unread`
                  : "You're all caught up"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={styles.closeButton}
              aria-label="Close notifications"
            >
              <X size={17} />
            </button>
          </div>

          {notifications.length > 0 && (
            <div style={styles.dropdownActions}>
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadNotifications.length === 0}
                style={{
                  ...styles.markAllButton,
                  opacity: unreadNotifications.length === 0 ? 0.5 : 1,
                  cursor:
                    unreadNotifications.length === 0 ? "default" : "pointer",
                }}
              >
                Mark all as read
              </button>
            </div>
          )}

          <div style={styles.notificationList}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <Bell size={20} />
                </div>

                <strong>No notifications</strong>

                <span>New updates will appear here.</span>
              </div>
            ) : (
              notifications.map((notification) => {
                const notificationId = notification.notification_id;

                const isUnread =
                  Number(notification.is_read) !== 1 &&
                  !readNotifications.includes(notificationId);
                return (
                  <button
                    key={notificationId}
                    type="button"
                    onClick={() => {
                      markAsRead(notificationId);

                      if (notification.onClick) {
                        notification.onClick();
                      }
                    }}
                    style={{
                      ...styles.notificationItem,
                      background: isUnread ? "#f8fbff" : "#ffffff",
                    }}
                  >
                    {getNotificationIcon(notification.type)}

                    <div style={styles.notificationContent}>
                      <div style={styles.notificationTitleRow}>
                        <strong
                          style={{
                            ...styles.notificationTitle,
                            fontWeight: isUnread ? "700" : "600",
                          }}
                        >
                          {notification.title}
                        </strong>

                        {isUnread && <span style={styles.unreadIndicator} />}
                      </div>

                      <p style={styles.notificationMessage}>
                        {notification.message}
                      </p>

                      {notification.time && (
                        <span style={styles.notificationTime}>
                          {notification.time}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    display: "inline-flex",
  },

  iconButton: {
    width: "40px",
    height: "40px",
    border: "1px solid #e6eaf0",
    borderRadius: "50%",
    background: "#ffffff",
    color: "#596579",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
  },

  notificationDot: {
    position: "absolute",
    top: "-3px",
    right: "-3px",
    minWidth: "17px",
    height: "17px",
    padding: "0 4px",
    background: "#e05252",
    color: "#ffffff",
    borderRadius: "20px",
    border: "2px solid #ffffff",
    fontSize: "9px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },

  dropdown: {
    position: "absolute",
    top: "50px",
    right: 0,
    width: "370px",
    maxWidth: "calc(100vw - 30px)",
    background: "#ffffff",
    border: "1px solid #e3e8f0",
    borderRadius: "12px",
    boxShadow: "0 12px 35px rgba(23, 32, 51, 0.14)",
    zIndex: 100,
    overflow: "hidden",
  },

  dropdownHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "17px 17px 12px",
    borderBottom: "1px solid #edf0f5",
  },

  dropdownTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#172033",
  },

  dropdownSubtitle: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#8a93a3",
  },

  closeButton: {
    width: "30px",
    height: "30px",
    border: "none",
    background: "transparent",
    color: "#7a8496",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "6px",
  },

  dropdownActions: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "8px 15px",
    borderBottom: "1px solid #edf0f5",
  },

  markAllButton: {
    border: "none",
    background: "transparent",
    color: "#1769e0",
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px",
  },

  notificationList: {
    maxHeight: "420px",
    overflowY: "auto",
  },

  notificationItem: {
    width: "100%",
    border: "none",
    borderBottom: "1px solid #edf0f5",
    padding: "14px 15px",
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    textAlign: "left",
    cursor: "pointer",
  },

  notificationIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  notificationContent: {
    minWidth: 0,
    flex: 1,
  },

  notificationTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  notificationTitle: {
    color: "#172033",
    fontSize: "13px",
    lineHeight: 1.3,
  },

  unreadIndicator: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#1769e0",
    flexShrink: 0,
  },

  notificationMessage: {
    margin: "5px 0 0",
    color: "#697386",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  notificationTime: {
    display: "block",
    marginTop: "5px",
    color: "#a0a8b5",
    fontSize: "10px",
  },

  emptyState: {
    minHeight: "180px",
    padding: "25px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#7a8496",
    gap: "6px",
    fontSize: "12px",
  },

  emptyIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#f1f5fa",
    color: "#8090a5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "5px",
  },
};

export default TechnicianNotifications;
