const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const logDiv = document.getElementById('log');

// Jogador (Agora é um Emoji e tem pontuação!)
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 50,
    emoji: '😎',
    score: 0
};

// Partículas para quando receber curtidas
let particles = [];

function draw() {
    // Fundo limpo
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configura texto para Emoji
    ctx.font = `${player.size}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Desenha o jogador (Emoji)
    ctx.fillText(player.emoji, player.x, player.y);
    
    // Desenha a Pontuação na tela
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Pontuação: ${player.score}`, canvas.width / 2, 30);
    
    // Desenha e anima as partículas de Like (Corações)
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        ctx.font = "20px Arial";
        ctx.fillText('❤️', p.x, p.y);
        p.y -= p.speed; // Sobe
        p.life -= 1; // Fica velho
    }
    // Remove partículas velhas
    particles = particles.filter(p => p.life > 0);
    
    requestAnimationFrame(draw);
}

draw();

// Comentários: Movimentação
socket.on('tiktok_chat', (data) => {
    logDiv.innerText = `${data.user} comentou: ${data.comment}`;
    
    if (data.comment.toLowerCase() === 'direita') player.x += 20;
    if (data.comment.toLowerCase() === 'esquerda') player.x -= 20;
    if (data.comment.toLowerCase() === 'sobe') player.y -= 20;
    if (data.comment.toLowerCase() === 'desce') player.y += 20;
});

// Presentes: Fica gigante e feliz
socket.on('tiktok_gift', (data) => {
    logDiv.innerText = `${data.user} enviou ${data.gift}! (+100 Pontos)`;
    
    player.emoji = '🤑';
    player.size += 40;
    player.score += 100;
    
    setTimeout(() => {
        player.emoji = '😎';
        player.size -= 40;
    }, 2000);
});

// Curtidas: Cria coraçõezinhos voando e dá pontos
socket.on('tiktok_like', (data) => {
    logDiv.innerText = `${data.user} curtiu a live!`;
    player.score += data.count; // Cada like dá ponto
    
    // Adiciona algumas partículas (corações voadores)
    for(let i=0; i<3; i++) {
        particles.push({
            x: player.x + (Math.random() * 40 - 20),
            y: player.y,
            speed: Math.random() * 2 + 1,
            life: 60
        });
    }
});
