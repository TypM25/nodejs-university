// socket.js
const db = require("../app/models");
const ChatHistory = db.chatHistory
const welcomedUsers = new Set();

function getRoomName(user_id1, user_id2) {
    // เพื่อไม่ให้ user_id1 กับ user_id2 สลับตำแหน่งแล้วได้ห้องต่างกัน
    const sorted = [user_id1, user_id2].sort((a, b) => a - b);
    return `room_${sorted[0]}_${sorted[1]}`;
}

// function socketHandler(io) {
//     io.on('connection', (socket) => {
//         const userId = socket.handshake.auth.user_id;
//         console.log("userId -----> " + userId);


//         if (!welcomedUsers.has(userId)) {
//             socket.emit('welcome', 'ยินดีต้อนรับเข้าสู่เซิร์ฟเวอร์!');
//             welcomedUsers.add(userId);
//         }


//         socket.on('chat_message', (msg) => {
//             io.emit('chat_message', msg);
//             console.log('message: ' + msg);
//         });

//         socket.broadcast.emit('newUser', 'มีผู้ใช้ใหม่เชื่อมต่อ');

//         socket.on('disconnect', () => {
//             console.log('user disconnected');
//         });
//     });
// }

module.exports = (io) => {
    io.on('connection', (socket) => {
        const userId = socket.handshake.auth.user_id;
        const chatPartnerId = socket.handshake.auth.chat_partner_id; // สมมติว่า client ส่งคู่สนทนามาด้วย

        if (!userId || !chatPartnerId) {
            socket.disconnect();
            return;
        }

        const roomName = getRoomName(userId, chatPartnerId);
        socket.join(roomName);
        console.log(`User ${userId} joined room ${roomName}`);

        // ส่งข้อความต้อนรับเฉพาะห้องนี้
        socket.emit('welcome', `คุณเข้าร่วมห้องแชทกับผู้ใช้ ${chatPartnerId}`);

        socket.on('chat_message', async (msg) => {
            // บันทึกข้อความลงฐานข้อมูล
            try {
                await ChatHistory.create({
                    user_id1: Math.min(userId, chatPartnerId),
                    user_id2: Math.max(userId, chatPartnerId),
                    sender_id: userId,
                    message: msg,
                });

                // ส่งข้อความนี้ให้สมาชิกห้องเดียวกัน (ทั้งสองฝ่าย)
                io.to(roomName).emit('chat_message', {
                    sender_id: userId,
                    message: msg,
                });

            } catch (error) {
                console.error('Error saving chat:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected from room ${roomName}`);
        });
    });
};


