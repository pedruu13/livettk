const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// IMPORTANT: Change this to your TikTok username
let tiktokUsername = "NOME_DO_SEU_TIKTOK_AQUI"; 

// Create a new wrapper object and pass the username
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// Connect to the chat (streaming events)
tiktokLiveConnection.connect().then(state => {
    console.info(`Conectado na live de ${state.roomInfo.owner.display_id}`);
}).catch(err => {
    console.error('Falha ao conectar. Verifique se o nome de usuário está correto e se a conta está em live.', err);
});

// Listen to chat comments
tiktokLiveConnection.on('chat', data => {
    console.log(`${data.uniqueId} comentou: ${data.comment}`);
    // Send the comment to the web game
    io.emit('tiktok_chat', {
        user: data.uniqueId,
        comment: data.comment
    });
});

// Listen to gifts
tiktokLiveConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) {
        // Presente em combo (streak)
    } else {
        console.log(`${data.uniqueId} enviou o presente ${data.giftName}!`);
        io.emit('tiktok_gift', {
            user: data.uniqueId,
            gift: data.giftName,
            count: data.repeatCount
        });
    }
});

// Start the local web server
server.listen(3000, () => {
    console.log('Servidor rodando! Abra o navegador em: http://localhost:3000');
});
