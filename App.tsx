import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios'; // Add this import for iOS support
import ChildComponent from './src/component/ChildComponent';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    if (result === RESULTS.GRANTED) {
      console.log('Notification permission is already granted');
      initializePushNotifications();
      fetchData(); 
    } else {
      const requestResult = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      if (requestResult === RESULTS.GRANTED) {
        console.log('Notification permission granted');
        initializePushNotifications();
        fetchData(); 
      } else {
        fetchData()
        console.log('Notification permission denied');
      }
    }
  };

  const initializePushNotifications = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: false,
    });

    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: "default-channel-id", // (required)
          channelName: "Default Channel", // (required)
          channelDescription: "A channel for default notifications", // (optional)
          sound: "default", // (optional)
          importance: PushNotification.Importance.HIGH, // (optional)
          vibrate: true, // (optional)
        },
        (created) => console.log(`createChannel returned '${created}'`) // (optional)
      );
    }
  };

  const fetchData = async () => {
    setLoading(true);
    sendNotification('FETCHING DATA');
    try {
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      sendNotification('FETCHING DATA COMPLETE');
    }
  };

  const sendNotification = (message) => {
    PushNotification.localNotification({
      channelId: "default-channel-id",
      message,
    });
  };

  const handleItemPress = useCallback((postId) => {
    setSelectedPostId(prevPostId => prevPostId === postId ? null : postId);
  }, []);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item.id)}>
      <View style={styles.itemContainer}>
        <Text>{item?.id} {item.title}</Text>
      </View>
    </TouchableOpacity>
  ), [handleItemPress]);

  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        <Button title="-" onPress={() => setCounter(counter - 1)} />
        <Text style={styles.counter}>{counter}</Text>
        <Button title="+" onPress={() => setCounter(counter + 1)} />
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size={"large"} color={"blue"} />
        </View>
      ) : (
        <>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
          {selectedPostId && <ChildComponent postId={selectedPostId} />}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  counter: {
    fontSize: 24,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default App;
