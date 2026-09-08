const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const logDiv = document.getElementById('log');

// Jogador
let player = {
    x: canvas.width / 2,
    y: canvas.height - 50, // Coloquei ele mais para baixo agora
    size: 50,
    emoji: '😎',
    score: 0
};

// Arrays para guardar as coisas que estão na tela
let particles = [];
let fallingItems = [];

// Função para criar itens caindo do céu
function spawnItem() {
    const isBad = Math.random() > 0.7; // 30% de chance de ser uma bomba
    fallingItems.push({
        x: Math.random() * canvas.width,
        y: -50,
        size: 40,
        emoji: isBad ? '💣' : '💰',
        type: isBad ? 'bad' : 'good',
        speed: Math.random() * 2 + 2 // Velocidade de queda
    });
}
// Cria um item novo a cada 1 segundo (1000 milissegundos)
setInterval(spawnItem, 1000);

// Função para checar colisão (se o jogador encostou no item)
function checkCollision(item) {
    const distance = Math.hypot(player.x - item.x, player.y - item.y);
    return distance < (player.size/2 + item.size/2); // Se bateram
}

function draw() {
    // Fundo limpo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configura texto para Emoji
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Desenha o jogador (Emoji)
    ctx.font = `${player.size}px Arial`;
    ctx.fillText(player.emoji, player.x, player.y);
    
    // Desenha a Pontuação na tela
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Pontuação: ${player.score}`, canvas.width / 2, 30);
    
    // Anima os itens caindo e checa colisões
    for (let i = fallingItems.length - 1; i >= 0; i--) {
        let item = fallingItems[i];
        ctx.font = `${item.size}px Arial`;
        ctx.fillText(item.emoji, item.x, item.y);
        item.y += item.speed; // O item cai
        
        // Se encostou no jogador
        if (checkCollision(item)) {
            if (item.type === 'good') {
                player.score += 50; // Ganha pontos com o dinheiro
                player.emoji = '🤑';
                setTimeout(() => player.emoji = '😎', 500);
            } else {
                player.score -= 50; // Perde pontos com a bomba
                player.emoji = '😵';
                setTimeout(() => player.emoji = '😎', 500);
            }
            fallingItems.splice(i, 1); // Remove o item da tela
            continue;
        }
        
        // Remove se passou do fundo da tela
        if (item.y > canvas.height + 50) {
            fallingItems.splice(i, 1);
        }
    }
    
    // Desenha e anima as partículas de Like (Corações)
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        ctx.font = "20px Arial";
        ctx.fillText('❤️', p.x, p.y);
        p.y -= p.speed;
        p.life -= 1;
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    requestAnimationFrame(draw);
}

draw();

// Comentários: Movimentação (Mantendo o jogador dentro da tela)
socket.on('tiktok_chat', (data) => {
    logDiv.innerText = `${data.user} comentou: ${data.comment}`;
    
    if (data.comment.toLowerCase() === 'direita' && player.x < canvas.width - 25) player.x += 30;
    if (data.comment.toLowerCase() === 'esquerda' && player.x > 25) player.x -= 30;
});

// Presentes: Fica gigante e ganha muitos pontos
socket.on('tiktok_gift', (data) => {
    logDiv.innerText = `${data.user} enviou ${data.gift}! (+500 Pontos)`;
    player.score += 500;
    player.size += 40;
    setTimeout(() => player.size -= 40, 2000);
});

// Curtidas: Corações voadores e pontinhos
socket.on('tiktok_like', (data) => {
    player.score += data.count;
    for(let i=0; i<3; i++) {
        particles.push({
            x: player.x + (Math.random() * 40 - 20),
            y: player.y,
            speed: Math.random() * 2 + 1,
            life: 60
        });
    }
});
