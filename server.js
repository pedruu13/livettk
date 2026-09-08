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

let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

tiktokLiveConnection.connect().then(state => {
    console.info(`Conectado na live de ${state.roomInfo.owner.display_id}`);
}).catch(err => {
    console.error('Falha ao conectar.', err);
});

// Comentários
tiktokLiveConnection.on('chat', data => {
    io.emit('tiktok_chat', {
        user: data.uniqueId,
        comment: data.comment
    });
});

// Presentes
tiktokLiveConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return;
    io.emit('tiktok_gift', {
        user: data.uniqueId,
        gift: data.giftName,
        count: data.repeatCount
    });
});

// Curtidas (Likes) - NOVIDADE!
tiktokLiveConnection.on('like', data => {
    io.emit('tiktok_like', {
        user: data.uniqueId,
        count: data.likeCount
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando! Abra o navegador em: http://localhost:3000');
});
