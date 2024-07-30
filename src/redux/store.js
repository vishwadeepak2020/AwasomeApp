import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '@react-native-async-storage/async-storage';
import todosReducer from '../redux/todosSlice';

const persistConfig = {
    key: 'root',
    storage,
  };

  const persistedReducer = persistReducer(persistConfig, todosReducer);


export const store = configureStore({
  reducer: {
    todos: persistedReducer
  }
});

export const persistor = persistStore(store);
