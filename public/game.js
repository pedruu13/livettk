let socket;
try {
    socket = io();
} catch(e) {
    console.log("Modo Offline");
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const logDiv = document.getElementById('log');

// Jogo de Luta - Candidatos
let p1 = { name: "Candidato 1", emoji: "🔴", hp: 100, x: 200, y: 300, base_x: 200 };
let p2 = { name: "Candidato 2", emoji: "🔵", hp: 100, x: 600, y: 300, base_x: 600 };

function attack(attacker, defender) {
    // Animação simples de ir para frente
    attacker.x = (attacker === p1) ? attacker.base_x + 100 : attacker.base_x - 100;
    
    setTimeout(() => {
        // Volta pra trás e tira vida do oponente
        attacker.x = attacker.base_x;
        defender.hp -= 5;
        
        if (defender.hp <= 0) {
            defender.hp = 0;
            logDiv.innerText = `${attacker.name} VENCEU!`;
            setTimeout(resetGame, 3000); // Reseta depois de 3 segundos
        }
    }, 200);
}

function resetGame() {
    p1.hp = 100;
    p2.hp = 100;
    logDiv.innerText = "Nova Luta Começou! Digite 1 ou 2";
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenha Chão (Ringue)
    ctx.fillStyle = "#555";
    ctx.fillRect(0, 350, canvas.width, 50);
    
    // Desenha Barra de Vida P1
    ctx.fillStyle = "red";
    ctx.fillRect(50, 50, 300, 30);
    ctx.fillStyle = "green";
    ctx.fillRect(50, 50, 300 * (p1.hp / 100), 30);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(p1.name + " (Digite 1)", 50, 40);
    
    // Desenha Barra de Vida P2
    ctx.fillStyle = "red";
    ctx.fillRect(450, 50, 300, 30);
    ctx.fillStyle = "green";
    ctx.fillRect(450, 50, 300 * (p2.hp / 100), 30);
    ctx.fillText(p2.name + " (Digite 2)", 450, 40);
    
    // Desenha Personagens
    ctx.font = "100px Arial";
    ctx.textAlign = "center";
    ctx.fillText(p1.emoji, p1.x, p1.y);
    ctx.fillText(p2.emoji, p2.x, p2.y);
    
    requestAnimationFrame(draw);
}

draw();

// Conexão com TikTok
if (socket) {
    socket.on('tiktok_chat', (data) => {
        if (p1.hp <= 0 || p2.hp <= 0) return; // Luta acabou
        
        if (data.comment.trim() === '1') {
            attack(p1, p2);
            logDiv.innerText = `${data.user} votou no ${p1.name}!`;
        } else if (data.comment.trim() === '2') {
            attack(p2, p1);
            logDiv.innerText = `${data.user} votou no ${p2.name}!`;
        }
    });

    socket.on('tiktok_gift', (data) => {
        // Presentes tiram muita vida do adversário!
        logDiv.innerText = `OFERENDA DE ${data.user}! ESPECIAL!`;
        // Lógica de presentes pode ser adicionada aqui
    });
} else {
    logDiv.innerText = "Modo Demo: Atualize a página para ver o ringue de luta!";
}
