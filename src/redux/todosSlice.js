import { createSlice } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    todos: [],
    selectedTodo: null,
  },
  reducers: {
    addTodo: (state, action) => {
      state.todos.push({ id: Date.now(), text: action.payload, completed: false });
    },
    toggleTodo: (state, action) => {
      const todo = state.todos.find(todo => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    removeTodo: (state, action) => {
      state.todos = state.todos.filter(todo => todo.id !== action.payload);
    },
    selectTodo: (state, action) => {
      state.selectedTodo = action.payload;
    },
    clearSelection: (state) => {
      state.selectedTodo = null;
    },
  }
});

export const { addTodo, toggleTodo, removeTodo, selectTodo, clearSelection } = todosSlice.actions;
export default todosSlice.reducer;
