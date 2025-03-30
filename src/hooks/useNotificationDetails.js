import { useState, useEffect } from "react";
import { notification } from "../utils/Apicalls";

const useNotificationDetails = ({
  challengeId = 0,
  limit = 10,
  page = 1,
  includeRead
}) => {
  const [notifications, setNotifications] = useState([]); // Assuming you will receive an array of notifications
  const [error, setError] = useState("");
  const [unreadNotificationIds, setUnreadNotificationIds] = useState([]);
  const [totalNotifications, setTotalNotifications] = useState(0); // New state for total notifications

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching upcoming notification...");
        const response = await notification({
          challengeId: challengeId,
          limit: 10,
          page: page,
          includeRead: includeRead,
        }); // Pass parameters directly to notification function
        console.log("Notification response:", response);
        setNotifications([...notifications, ...response.data]);

        // Set total notifications count using length of response.data
        const total = response.data.length;
        setTotalNotifications(
          (totalNotifications) => totalNotifications + total
        );
        console.log("totalNotifications 💀", total);

        // Filter out unread notifications and extract IDs
        const unreadIds = response.data
          .filter((notification) => !notification.IsRead)
          .map((notification) => notification.ID);
        setUnreadNotificationIds(unreadIds);
      } catch (error) {
        console.error("Failed to fetch notification:", error);
        setError("Failed to fetch notification: " + error.message);
      }
    };

    fetchData();
  }, [page]);

  return {
    notifications,
    setNotifications,
    error,
    unreadNotificationIds,
    totalNotifications,
  };
};

export default useNotificationDetails;