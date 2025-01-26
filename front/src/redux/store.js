import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice.js";
import postReducer from './postSlice.js';
import socketReducer from "./socketSlice.js";
import chatReducer from "./chatSlice.js";
import rtnReducer from "./rtnSlice.js";
import notificationSystemReducer from "../features/notificationSystemSlice";
import socketMiddleware from "./middleware/socketMiddleware";

// Configure persist for auth
const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user'] // only persist user
};

// Configure persist for chat
const chatPersistConfig = {
    key: 'chat',
    storage,
    whitelist: ['messages'] // only persist messages
};

const store = configureStore({
    reducer: {
        auth: persistReducer(authPersistConfig, authReducer),
        post: postReducer,
        socketio: socketReducer,
        chat: persistReducer(chatPersistConfig, chatReducer),
        realTimeNotification: rtnReducer,
        notificationSystem: notificationSystemReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    'persist/REGISTER',
                    'socketio/setSocket'
                ],
                ignoredActionPaths: ['payload.socket', 'register', 'rehydrate'],
                ignoredPaths: ['socketio.socket'],
            },
        }).concat(socketMiddleware()),
});

export const persistor = persistStore(store);
export default store;