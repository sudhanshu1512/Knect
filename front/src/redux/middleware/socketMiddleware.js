import io from 'socket.io-client';

const socketMiddleware = () => {
  let socket = null;

  return store => next => action => {
    switch (action.type) {
      case 'socketio/connect':
        if (socket) {
          socket.disconnect();
        }
        socket = io('http://localhost:8000');
        
        // Handle socket events here instead of storing socket in Redux
        socket.on('connect', () => {
          store.dispatch({ type: 'socketio/connected' });
        });

        socket.on('disconnect', () => {
          store.dispatch({ type: 'socketio/disconnected' });
        });

        socket.on('getMessage', (message) => {
          store.dispatch({ type: 'chat/addMessage', payload: message });
        });

        socket.on('getOnlineUsers', (users) => {
          store.dispatch({ type: 'chat/setOnlineUsers', payload: users });
        });

        break;
      case 'socketio/disconnect':
        if (socket) {
          socket.disconnect();
          socket = null;
        }
        break;
      case 'socketio/emit':
        if (socket) {
          socket.emit(action.event, action.payload);
        }
        break;
      default:
        return next(action);
    }

    return next(action);
  };
};

export default socketMiddleware;
