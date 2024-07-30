import React, { memo, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const ChildComponent = ({ item }) => {
  const [details, setDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchDetails = async () => {
    if (showDetails) {
     
      setShowDetails(false);
      setDetails(null);
    } else {
    
      try {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${item.id}`);
        setDetails(response.data);
        setShowDetails(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    console.log('Child component re-rendered');
  });

  return (
    <View style={styles.itemContainer}>
      <Text>{item.id}: {item.title}</Text>
      <Button title={showDetails ? "Hide Details" : "View Details"} onPress={fetchDetails} color={showDetails ? "red":null }/>
      {showDetails && details && (
        <View>
          <Text>{details.body}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 8,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
});

export default memo(ChildComponent);
