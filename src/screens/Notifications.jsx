import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView, // make sure SafeAreaView is imported here
} from "react-native";
import React, { useState, useEffect } from "react";
import useUserChallenges from "../hooks/useUserChallenge";
import useNotificationDetails from "../hooks/useNotificationDetails";
import useNotificationRead from "../hooks/useNotificationRead";
import NotificationList from "../components/NotificationList";

const Notifications = () => {
  const { details: userChallengesDetails, isLoading: challengesLoading } =
    useUserChallenges();
  const [displayedUnreadNotifications, setDisplayedUnreadNotifications] =
    useState([]);
  const [displayedReadNotifications, setDisplayedReadNotifications] = useState(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const {
    notifications,
    error: notificationError,
    unreadNotificationIds,
    totalNotifications,
    setNotifications,
  } = useNotificationDetails({
    challengeId: userChallengesDetails?.User?.UserID,
    limit: 10,
    page: currentPage,
    includeRead: true,
  });

  const [unreadPage, setUnreadPage] = useState(1);
  const [readPage, setReadPage] = useState(1);
  const [showMoreButton, setShowMoreButton] = useState(true);

  useEffect(() => {
    if (notifications.length) {
      const sortedNotifications = notifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setDisplayedUnreadNotifications(
        sortedNotifications.filter((notification) => !notification.IsRead)
      );
      if (
        displayedUnreadNotifications.length ===
        sortedNotifications.filter((notification) => !notification.IsRead)
          .length
      ) {
        setShowMoreButton(false);
      }
      setDisplayedReadNotifications(
        sortedNotifications.filter((notification) => notification.IsRead)
      );
    }
  }, [notifications.length]);

  const loadMoreUnread = () => {
    setUnreadPage((prev) => prev + 1);
    setCurrentPage((prev) => prev + 1);
  };
  const loadMoreRead = () => {
    setReadPage((prev) => prev + 1);
    setCurrentPage((prev) => prev + 1);
  };

  const { error: errorUpdate, updateNotification } = useNotificationRead();

  const handleMarkAsRead = (id) => {
    updateNotification([id]).then(() => {
      const updateNotifications = [...notifications];
      const updatedNotification = updateNotifications.find(
        (notification) => notification.ID === id
      );
      if (updatedNotification) {
        updatedNotification.IsRead = true;
      }
      setNotifications(updateNotifications);
      setDisplayedUnreadNotifications(
        notifications.filter((notification) => !notification.IsRead)
      );
      setDisplayedReadNotifications([
        updatedNotification,
        ...displayedReadNotifications,
      ]);
    });
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = displayedUnreadNotifications.map(
      (notification) => notification.ID
    );
    updateNotification(unreadIds).then(() => {
      const updatedNotifications = notifications.map((notification) => {
        if (unreadIds.includes(notification.ID)) {
          notification.IsRead = true;
        }
        return notification;
      });
      setDisplayedUnreadNotifications([]);
      setDisplayedReadNotifications((prev) => [
        ...updatedNotifications.filter((notification) => notification.IsRead),
        ...prev,
      ]);
    });
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (notifications.length) {
      const sortedNotifications = [...notifications].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setDisplayedUnreadNotifications(
        sortedNotifications.filter((notification) => !notification.IsRead)
      );

      setDisplayedReadNotifications(
        sortedNotifications.filter((notification) => notification.IsRead)
      );

      setLoading(false);
    }
  }, [notifications, unreadPage, readPage]);

  if (notificationError) {
    return (
      <Text className="text-red-500">
        Error fetching notifications: {notificationError.message}
      </Text>
    );
  }
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView className="bg-gray-100 p-4 min-h-screen mb-10">
        <View className="flex flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold">Notifications</Text>
          {displayedUnreadNotifications.length > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              className="flex justify-between gap-1 flex-row items-center px-4 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              <Text>Mark All as Read</Text>
            </TouchableOpacity>
          )}
        </View>
        {displayedUnreadNotifications.length > 0 ? (
          <>
            <NotificationList
              title="NEW"
              notifications={displayedUnreadNotifications}
              onMarkAsRead={handleMarkAsRead}
            />
            <View className="flex justify-center mb-10">
              {showMoreButton ? (
                <TouchableOpacity
                  onPress={loadMoreUnread}
                  className="p-4 bg-blue-500 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex justify-center items-center"
                >
                  <Text className="text-white">Show More +</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        ) : (
          <Text>No New Notifications!</Text>
        )}
        {displayedReadNotifications.length > 0 ? (
          <>
            <NotificationList
              title="THIS WEEK"
              notifications={displayedReadNotifications}
            />
            <View className="flex justify-center mb-14">
              {displayedReadNotifications[displayedReadNotifications.length - 1]
                .Title !== "Welcome Aboard!" ? (
                <TouchableOpacity
                  onPress={loadMoreRead}
                  className="p-4 bg-blue-500  rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex justify-center items-center"
                >
                  <Text className="text-white">Show More +</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notifications;
