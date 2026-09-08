const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const logDiv = document.getElementById('log');

// Jogador básico (um quadrado)
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 50,
    color: 'red'
};

// Função para desenhar o jogo
function draw() {
    // Limpar tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar jogador
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - player.size/2, player.y - player.size/2, player.size, player.size);
    
    // Animação continua
    requestAnimationFrame(draw);
}

// Iniciar desenho
draw();

// Escutando eventos do servidor Node.js (Comentários do TikTok)
socket.on('tiktok_chat', (data) => {
    logDiv.innerText = `${data.user} comentou: ${data.comment}`;
    
    // Lógica do jogo: move o quadrado se comentar "direita" ou "esquerda"
    if (data.comment.toLowerCase() === 'direita') {
        player.x += 20;
    } else if (data.comment.toLowerCase() === 'esquerda') {
        player.x -= 20;
    } else if (data.comment.toLowerCase() === 'sobe') {
        player.y -= 20;
    } else if (data.comment.toLowerCase() === 'desce') {
        player.y += 20;
    }
});

// Escutando eventos de Presentes do TikTok
socket.on('tiktok_gift', (data) => {
    logDiv.innerText = `${data.user} enviou ${data.count}x ${data.gift}!`;
    
    // Lógica do jogo: se enviar presente, muda de cor e fica maior
    player.color = 'gold';
    player.size += 30;
    
    // Volta ao normal depois de 1 segundo
    setTimeout(() => {
        player.color = 'red';
        player.size -= 30;
    }, 1000);
});
