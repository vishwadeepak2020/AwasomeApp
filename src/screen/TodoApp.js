import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addTodo, toggleTodo, removeTodo, selectTodo, clearSelection } from '../redux/todosSlice';

const TodoApp = () => {
  const [text, setText] = useState('');
  const dispatch = useDispatch();
  const todos = useSelector(state => state.todos.todos);
  const selectedTodo = useSelector(state => state.todos.selectedTodo);

  const handleAddTodo = () => {
    if (text.trim()) {
      dispatch(addTodo(text));
      setText('');
    }
  };

  const handleSelectTodo = (todo) => {
    dispatch(selectTodo(todo));
  };

  const handleClearSelection = () => {
    dispatch(clearSelection());
  };

  const renderItem = ({ item }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
      <TouchableOpacity onPress={() => handleSelectTodo(item)}>
        <Text style={{ textDecorationLine: item.completed ? 'line-through' : 'none' }}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <Button title="Remove" onPress={() => dispatch(removeTodo(item.id))} />
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Add new todo"
        style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <Button title="Add Todo" onPress={handleAddTodo} />
      {selectedTodo && (
        <View style={{ marginVertical: 20 }}>
          <Text>Selected Todo: {selectedTodo.text}</Text>
          <Button title="Clear Selection" onPress={handleClearSelection} />
        </View>
      )}
      <FlatList
        data={todos}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

export default TodoApp;
