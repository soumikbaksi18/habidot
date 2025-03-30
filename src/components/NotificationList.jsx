import React from 'react';
import NotificationItem from './NotificationItem';
import { View, Text } from 'react-native';

const NotificationList = ({ title, notifications, onMarkAsRead}) => {
    return (
        <View className="my-2">
            {notifications.length >0 && <Text className="text-left font-bold mb-4">{title}</Text>}
            {notifications.map((notification, index) => (
                <NotificationItem
                    key={index}
                    id= {notification.ID}
                    heading={notification.Title}
                    description={notification.Description}
                    isNew={!notification.IsRead}
                    createdAt={notification.createdAt}
                    type={notification.Type}
                    challengeId={notification.Challenge?.ChallengeID}
                    onMarkAsRead={() => onMarkAsRead(notification.ID)}
                />
            ))}
        </View>
    );
};

export default NotificationList;
