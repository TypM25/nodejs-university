// socket.js
const db = require("../app/models");
const ChatHistory = db.chatHistory
const welcomedUsers = new Set();

//สร้างroomเเชทจาก user_id1-user_id2 
function getRoomName(user_id1, user_id2) {
    const sorted = [user_id1, user_id2].sort((a, b) => a - b); //เรียงน้อย --> มาก
    return `room_${sorted[0]}_${sorted[1]}`;
}

module.exports = (io) => {
    //on มีcallback
    io.on('connection', (socket) => {
        const userId = socket.handshake.auth.user_id;
        const chatPartnerId = socket.handshake.auth.chat_partner_id;
        /* ตัวอย่างตอนส่ง
            const socket = io("http://localhost:3000", {
                auth: {
                    user_id: 5,
                    chat_partner_id: 10
                }
            });
        */
        if (!userId || !chatPartnerId) {
            socket.disconnect();
            return;
        }
        //เข้า chat room
        const roomName = getRoomName(userId, chatPartnerId);
        socket.join(roomName);
        socket.emit('welcome', `คุณเข้าร่วมห้องแชทกับผู้ใช้ ${chatPartnerId}`);
        console.log(`User ${userId} joined room ${roomName}`);

        socket.on('chat_message', async (msg) => {
            // บันทึกข้อความลงฐานข้อมูล
            try {
                await ChatHistory.create({
                    user_id1: Math.min(userId, chatPartnerId), //เก็บเลขน้อย
                    user_id2: Math.max(userId, chatPartnerId), //เก็บเลขมากพ
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

