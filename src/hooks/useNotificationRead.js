import { useState } from "react";
import { notificationRead } from "../utils/Apicalls";

const useNotificationRead = () => {
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const updateNotification = async (id) => {
    try {
      const response = await notificationRead({ id });
      console.log("Notification response:", response);

      // Assuming response.data contains updated notifications
      setNotifications(response.data); // Update state with fetched notifications
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError("Failed to fetch notifications: " + error.message);
    }
  };

  return { notifications, error, updateNotification };
};

export default useNotificationRead;
