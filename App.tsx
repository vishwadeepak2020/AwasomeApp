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
  const [loadingMore, setLoadingMore] = useState(false);
  const [counter, setCounter] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    if (result === RESULTS.GRANTED) {
      console.log('Notification permission is already granted');
      initializePushNotifications();
      fetchData(1); 
    } else {
      const requestResult = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      if (requestResult === RESULTS.GRANTED) {
        console.log('Notification permission granted');
        initializePushNotifications();
        fetchData(1); 
      } else {
        fetchData(1);
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

  const fetchData = async (pageNumber = 1) => {
    if (loading || loadingMore) return;
    if (pageNumber === 1) setLoading(true); 
    else setLoadingMore(true);
    
    sendNotification('FETCHING DATA');
    try {
      const response = await axios.get(`${API_URL}?_page=${pageNumber}&_limit=10`);
      const newPosts = response.data;

      if (pageNumber === 1) {
        setData(newPosts);
      } else {
        setData((prevData) => [...prevData, ...newPosts]);
      }

      setHasMore(newPosts.length === 10); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
        <Text>{item?.id} {item?.title}</Text>
      </View>
    </TouchableOpacity>
  ), [handleItemPress]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      setPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchData(nextPage);
        return nextPage;
      });
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  };

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
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
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
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
