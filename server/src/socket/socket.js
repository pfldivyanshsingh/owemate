const socketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a group room
    socket.on('join_group', (groupId) => {
      socket.join(groupId);
      console.log(`Socket ${socket.id} joined group: ${groupId}`);
    });

    // Leave a group room
    socket.on('leave_group', (groupId) => {
      socket.leave(groupId);
      console.log(`Socket ${socket.id} left group: ${groupId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandlers;
