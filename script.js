const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const W = 800, H = 480;
const GRAVITY = 0.55;
const GROUND_Y = H - 70;
const HEAD_R = 28;
const BALL_R = 18;
const GOAL_W = 60;
const GOAL_H = 140;
const PLAYER_SPD = 5.5;
const JUMP_V = -14;
const WIN_SCORE = 5;
const GRID_COLS = 6, GRID_ROWS = 4;
const CARD_W = 126, CARD_H = 86, CARD_GAP = 4;
const GRID_X = (W - (GRID_COLS * CARD_W + (GRID_COLS - 1) * CARD_GAP)) / 2;
const GRID_Y = 90;

// ---- Flag drawing helpers ----
const hFlag = (c1, c2, c3) => (c, x, y, w, h) => {
    c.fillStyle = c1; c.fillRect(x, y, w, h / 3);
    c.fillStyle = c2; c.fillRect(x, y + h / 3, w, h / 3);
    c.fillStyle = c3; c.fillRect(x, y + 2 * h / 3, w, h / 3);
};
const vFlag = (c1, c2, c3) => (c, x, y, w, h) => {
    c.fillStyle = c1; c.fillRect(x, y, w / 3, h);
    c.fillStyle = c2; c.fillRect(x + w / 3, y, w / 3, h);
    c.fillStyle = c3; c.fillRect(x + 2 * w / 3, y, w / 3, h);
};
const crossFlag = (bg, cr) => (c, x, y, w, h) => {
    c.fillStyle = bg; c.fillRect(x, y, w, h);
    c.fillStyle = cr;
    c.fillRect(x + w * 0.5 - h * 0.17, y, h * 0.34, h);
    c.fillRect(x, y + h * 0.5 - h * 0.17, w, h * 0.34);
};
const circFlag = (bg, ci) => (c, x, y, w, h) => {
    c.fillStyle = bg; c.fillRect(x, y, w, h);
    c.fillStyle = ci; c.beginPath(); c.arc(x + w / 2, y + h / 2, h * 0.3, 0, Math.PI * 2); c.fill();
};
const diagFlag = (bg, di, inn) => (c, x, y, w, h) => {
    c.fillStyle = bg; c.fillRect(x, y, w, h);
    c.fillStyle = di; c.beginPath();
    c.moveTo(x + w * 0.08, y + h / 2); c.lineTo(x + w / 2, y + h * 0.1);
    c.lineTo(x + w * 0.92, y + h / 2); c.lineTo(x + w / 2, y + h * 0.9);
    c.closePath(); c.fill();
    c.fillStyle = inn; c.beginPath(); c.arc(x + w / 2, y + h / 2, h * 0.22, 0, Math.PI * 2); c.fill();
};

// ---- World Cup 2026 Teams ----
const TEAMS = [
    { abbr: 'ARG', name: 'Argentina',   color: '#5fa8e0', light: '#aaddff', drawFlag: hFlag('#74ACDF', '#FFFFFF', '#74ACDF') },
    { abbr: 'AUS', name: 'Australia',   color: '#003087', light: '#5577cc', drawFlag: crossFlag('#00008B', '#FF0000') },
    { abbr: 'BEL', name: 'Belgium',     color: '#222222', light: '#F5D90A', drawFlag: vFlag('#000000', '#F5D90A', '#EF3340') },
    { abbr: 'BRA', name: 'Brazil',      color: '#009c3b', light: '#44dd77', drawFlag: diagFlag('#009c3b', '#FFDF00', '#003087') },
    { abbr: 'CAN', name: 'Canada',      color: '#cc0000', light: '#ff8888', drawFlag: vFlag('#FF0000', '#FFFFFF', '#FF0000') },
    { abbr: 'COL', name: 'Colombia',    color: '#b07d00', light: '#ffdd44', drawFlag: hFlag('#FCD116', '#003893', '#CE1126') },
    { abbr: 'CRO', name: 'Croatia',     color: '#aa0000', light: '#ee5555', drawFlag: hFlag('#FF0000', '#FFFFFF', '#002395') },
    { abbr: 'DEN', name: 'Denmark',     color: '#C60C30', light: '#ff6688', drawFlag: crossFlag('#C60C30', '#FFFFFF') },
    { abbr: 'ECU', name: 'Ecuador',     color: '#8a6700', light: '#ffee55', drawFlag: hFlag('#FFD100', '#034EA2', '#EF3340') },
    { abbr: 'ENG', name: 'England',     color: '#aa2222', light: '#ff7777', drawFlag: crossFlag('#FFFFFF', '#CF142B') },
    { abbr: 'ESP', name: 'Spain',       color: '#c60b1e', light: '#ff6677', drawFlag: hFlag('#c60b1e', '#f1bf00', '#c60b1e') },
    { abbr: 'FRA', name: 'France',      color: '#002395', light: '#5577ff', drawFlag: vFlag('#002395', '#FFFFFF', '#ED2939') },
    { abbr: 'GER', name: 'Germany',     color: '#333333', light: '#FFCE00', drawFlag: hFlag('#000000', '#DD0000', '#FFCE00') },
    { abbr: 'IRN', name: 'Iran',        color: '#1a7a2e', light: '#55cc77', drawFlag: hFlag('#239F40', '#FFFFFF', '#DA0000') },
    { abbr: 'ITA', name: 'Italy',       color: '#003580', light: '#5588ff', drawFlag: vFlag('#009246', '#FFFFFF', '#CE2B37') },
    { abbr: 'JPN', name: 'Japan',       color: '#000080', light: '#6666dd', drawFlag: circFlag('#FFFFFF', '#BC002D') },
    { abbr: 'KOR', name: 'S. Korea',    color: '#8e1a24', light: '#ee5566', drawFlag: circFlag('#FFFFFF', '#CD2E3A') },
    { abbr: 'MAR', name: 'Morocco',     color: '#8e1018', light: '#dd4455', drawFlag: hFlag('#C1272D', '#006233', '#C1272D') },
    { abbr: 'MEX', name: 'Mexico',      color: '#006847', light: '#44bb88', drawFlag: vFlag('#006847', '#FFFFFF', '#CE1126') },
    { abbr: 'NED', name: 'Netherlands', color: '#cc4400', light: '#ff9944', drawFlag: hFlag('#AE1C28', '#FFFFFF', '#21468B') },
    { abbr: 'POR', name: 'Portugal',    color: '#006600', light: '#44cc55', drawFlag: vFlag('#006600', '#FF0000', '#006600') },
    { abbr: 'SEN', name: 'Senegal',     color: '#006030', light: '#44bb77', drawFlag: vFlag('#00853F', '#FDEF42', '#E31B23') },
    { abbr: 'URU', name: 'Uruguay',     color: '#4a9acc', light: '#88ccff', drawFlag: hFlag('#5CB8E4', '#FFFFFF', '#5CB8E4') },
    { abbr: 'USA', name: 'USA',         color: '#002868', light: '#5577dd', drawFlag: hFlag('#BF0A30', '#FFFFFF', '#002868') },
];

// ---- Input ----
const keys = {}, prevKeys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
function justPressed(code) { return keys[code] && !prevKeys[code]; }

// ---- State ----
let gameState = 'teamSelect';
let score1 = 0, score2 = 0;
let goalTimer = 0, winner = '', goalScoredBy = '';
let particles = [];
let p1, p2, ball;
let p1Team = TEAMS[0], p2Team = TEAMS[23];
let sel1 = { col: 0, row: 0, confirmed: false };
let sel2 = { col: 5, row: 3, confirmed: false };

// ---- Entity factories ----
function makePlayer(x, team, facing) {
    return { x, y: GROUND_Y - HEAD_R, vx: 0, vy: 0, onGround: true, facing, team, kickTimer: 0, kickCooldown: 0 };
}
function makeBall() {
    const d = Math.random() < 0.5 ? 1 : -1;
    return { x: W / 2, y: GROUND_Y - 180, vx: d * 2, vy: -3, r: BALL_R, angle: 0 };
}
function resetEntities() {
    p1 = makePlayer(160, p1Team, 1);
    p2 = makePlayer(640, p2Team, -1);
    ball = makeBall();
    particles = [];
}

// ---- Physics ----
function updatePlayer(p, leftCode, rightCode, jumpCode, kickCode) {
    if (keys[leftCode])  { p.vx -= 1.1; p.facing = -1; }
    if (keys[rightCode]) { p.vx += 1.1; p.facing =  1; }
    p.vx *= 0.78;
    if (Math.abs(p.vx) > PLAYER_SPD) p.vx = Math.sign(p.vx) * PLAYER_SPD;

    if (justPressed(jumpCode) && p.onGround) { p.vy = JUMP_V; p.onGround = false; }

    // Kick
    if (justPressed(kickCode) && p.kickCooldown === 0) {
        p.kickTimer = 18;
        p.kickCooldown = 42;
        p.vx += p.facing * 10;
        if (p.onGround) p.vy = -4;
    }
    if (p.kickTimer > 0) p.kickTimer--;
    if (p.kickCooldown > 0) p.kickCooldown--;

    p.vy += GRAVITY;
    p.x += p.vx;
    p.y += p.vy;

    if (p.y + HEAD_R >= GROUND_Y) { p.y = GROUND_Y - HEAD_R; p.vy = 0; p.onGround = true; }
    if (p.y - HEAD_R < 0) { p.y = HEAD_R; p.vy = Math.abs(p.vy) * 0.4; }
    if (p.x < GOAL_W + HEAD_R) p.x = GOAL_W + HEAD_R;
    if (p.x > W - GOAL_W - HEAD_R) p.x = W - GOAL_W - HEAD_R;
}

function updateBall() {
    ball.vy += GRAVITY;
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.angle += ball.vx * 0.04;

    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy) * 0.65; }
    if (ball.y + ball.r > GROUND_Y) {
        ball.y = GROUND_Y - ball.r;
        ball.vy = -Math.abs(ball.vy) * 0.6;
        ball.vx *= 0.83;
        if (Math.abs(ball.vy) < 1.2) ball.vy = 0;
    }

    const crossY = GROUND_Y - GOAL_H;

    // Left wall (bounce above goal)
    if (ball.x - ball.r < 0 && ball.y + ball.r <= crossY) { ball.x = ball.r; ball.vx = Math.abs(ball.vx) * 0.65; }
    // Right wall (bounce above goal)
    if (ball.x + ball.r > W && ball.y + ball.r <= crossY) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx) * 0.65; }

    // Left crossbar
    if (ball.x > 0 && ball.x < GOAL_W && ball.y - ball.r < crossY && ball.y + ball.r > crossY && ball.vy > 0) {
        ball.y = crossY - ball.r; ball.vy = -Math.abs(ball.vy) * 0.7;
    }
    // Left post — only deflect balls exiting rightward (out of goal)
    if (ball.x - ball.r < GOAL_W && ball.x + ball.r > GOAL_W && ball.y > crossY && ball.vx > 0) {
        ball.x = GOAL_W + ball.r; ball.vx = Math.abs(ball.vx) * 0.65;
    }
    // Right crossbar
    if (ball.x > W - GOAL_W && ball.x < W && ball.y - ball.r < crossY && ball.y + ball.r > crossY && ball.vy > 0) {
        ball.y = crossY - ball.r; ball.vy = -Math.abs(ball.vy) * 0.7;
    }
    // Right post — only deflect balls exiting leftward (out of goal)
    if (ball.x + ball.r > W - GOAL_W && ball.x - ball.r < W - GOAL_W && ball.y > crossY && ball.vx < 0) {
        ball.x = W - GOAL_W - ball.r; ball.vx = -Math.abs(ball.vx) * 0.65;
    }

    const spd = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (spd > 22) { ball.vx *= 22 / spd; ball.vy *= 22 / spd; }
}

function ballPlayerCollision(p) {
    // Foot/kick collision
    if (p.kickTimer > 0) {
        const footX = p.x + p.facing * (HEAD_R + 16);
        const footY = p.y + HEAD_R + 5;
        const fdx = ball.x - footX, fdy = ball.y - footY;
        const fd = Math.sqrt(fdx * fdx + fdy * fdy);
        if (fd < 18 + ball.r) {
            const nx = fd > 0.01 ? fdx / fd : p.facing;
            const ny = fd > 0.01 ? fdy / fd : -0.4;
            ball.vx = p.facing * 20 + p.vx * 0.25;
            ball.vy = -11 + p.vy * 0.2;
            ball.x = footX + nx * (18 + ball.r + 2);
            ball.y = footY + ny * (18 + ball.r + 2);
            p.kickTimer = 0;
            spawnKickParticles(ball.x, ball.y, p.facing);
            return;
        }
    }

    // Head collision
    const dx = ball.x - p.x, dy = ball.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = HEAD_R + ball.r;
    if (dist < minDist && dist > 0.01) {
        const nx = dx / dist, ny = dy / dist;
        const overlap = minDist - dist;
        ball.x += nx * overlap * 0.8; ball.y += ny * overlap * 0.8;
        p.x -= nx * overlap * 0.2; p.y -= ny * overlap * 0.2;
        const relVx = ball.vx - p.vx, relVy = ball.vy - p.vy;
        const dot = relVx * nx + relVy * ny;
        if (dot < 0) {
            const mult = p.kickTimer > 0 ? 2.0 : 1.15;
            ball.vx -= mult * dot * nx; ball.vy -= mult * dot * ny;
            ball.vx += p.vx * 0.45; ball.vy += p.vy * 0.35;
        }
        if (p.kickTimer > 0) { p.kickTimer = 0; spawnKickParticles(ball.x, ball.y, p.facing); }
    }
}

function playerPlayerCollision() {
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < HEAD_R * 2 && dist > 0.01) {
        const nx = dx / dist;
        const overlap = (HEAD_R * 2 - dist) / 2;
        p1.x -= nx * overlap; p2.x += nx * overlap;
        const t = p1.vx; p1.vx = p2.vx * 0.6; p2.vx = t * 0.6;
    }
}

function checkGoal() {
    if (ball.x + ball.r < GOAL_W && ball.y + ball.r > GROUND_Y - GOAL_H) return 'p2';
    if (ball.x - ball.r > W - GOAL_W && ball.y + ball.r > GROUND_Y - GOAL_H) return 'p1';
    return null;
}

// ---- Particles ----
function spawnGoalParticles() {
    for (let i = 0; i < 70; i++) {
        const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 10;
        particles.push({ x: W / 2, y: H / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, life: 1, decay: 0.011 + Math.random() * 0.013, r: 4 + Math.random() * 7, color: `hsl(${Math.random() * 60 + 20},100%,60%)` });
    }
}
function spawnKickParticles(bx, by, dir) {
    for (let i = 0; i < 10; i++) {
        const a = (Math.random() - 0.5) * 1.8 + (dir > 0 ? 0 : Math.PI);
        const s = 3 + Math.random() * 7;
        particles.push({ x: bx, y: by, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, life: 1, decay: 0.07 + Math.random() * 0.06, r: 2 + Math.random() * 4, color: `hsl(${Math.random() * 40 + 15},100%,65%)` });
    }
}
function updateParticles() {
    for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.vx *= 0.96; p.life -= p.decay; }
    particles = particles.filter(p => p.life > 0);
}

// ---- Drawing ----
function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#08081e'); sky.addColorStop(1, '#101030');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, GROUND_Y);

    ctx.save(); ctx.globalAlpha = 0.1;
    for (const lx of [W * 0.2, W * 0.8]) {
        const g = ctx.createRadialGradient(lx, 10, 0, lx, 10, 220);
        g.addColorStop(0, '#fff'); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, GROUND_Y);
    }
    ctx.restore();

    const sw = W / 8;
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 === 0 ? '#1e5012' : '#1a4010'; ctx.fillRect(i * sw, GROUND_Y, sw, H - GROUND_Y); }
    ctx.fillStyle = '#286616'; ctx.fillRect(0, GROUND_Y, W, 6);

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, GROUND_Y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W / 2, GROUND_Y, 80, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.restore();
}

function drawGoals() {
    const drawGoal = (side) => {
        const gx = side === 'left' ? 0 : W - GOAL_W;
        const gy = GROUND_Y - GOAL_H;
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(gx, gy, GOAL_W, GOAL_H);
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8;
        for (let x = gx + 12; x < gx + GOAL_W; x += 12) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, GROUND_Y); ctx.stroke(); }
        for (let y = gy + 14; y < GROUND_Y; y += 14) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + GOAL_W, y); ctx.stroke(); }
        ctx.restore();
        ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + GOAL_W, gy); ctx.stroke();
        const postX = side === 'left' ? gx + GOAL_W : gx;
        ctx.beginPath(); ctx.moveTo(postX, gy); ctx.lineTo(postX, GROUND_Y); ctx.stroke();
    };
    drawGoal('left'); drawGoal('right');
}

function drawPlayer(p, label) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Shadow
    const sd = GROUND_Y - p.y - HEAD_R;
    const sc = Math.max(0.1, 1 - sd / 280);
    ctx.save(); ctx.translate(0, sd + HEAD_R + 8); ctx.scale(1, 0.28);
    ctx.fillStyle = `rgba(0,0,0,${0.38 * sc})`; ctx.beginPath(); ctx.ellipse(0, 0, HEAD_R * 0.9 * sc, HEAD_R * 0.9 * sc, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    // Kick leg (extended forward)
    if (p.kickTimer > 0) {
        const prog = p.kickTimer / 18; // 1 at start, 0 at end
        const stretch = Math.sin((1 - prog) * Math.PI); // peaks in middle
        const legAngle = p.facing * (0.3 + stretch * 1.3);
        const legLen = 22 + stretch * 14;
        const footX = p.facing * 5 + Math.sin(legAngle) * legLen;
        const footY = HEAD_R + 16 + Math.cos(Math.abs(legAngle)) * legLen * 0.3;

        ctx.save();
        ctx.strokeStyle = p.team.color; ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.facing * 5, HEAD_R + 14); ctx.lineTo(footX, footY); ctx.stroke();
        ctx.fillStyle = '#c8a070'; ctx.beginPath(); ctx.arc(footX, footY, 9, 0, Math.PI * 2); ctx.fill();
        // Shoe
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.ellipse(footX + p.facing * 5, footY + 2, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // Body (jersey)
    ctx.fillStyle = p.team.color;
    ctx.beginPath(); ctx.roundRect(-11, HEAD_R - 5, 22, 26, 5); ctx.fill();

    // Mini flag on jersey
    ctx.save();
    ctx.beginPath(); ctx.roundRect(-10, HEAD_R - 1, 20, 13, 2); ctx.clip();
    p.team.drawFlag(ctx, -10, HEAD_R - 1, 20, 13);
    ctx.restore();

    // Legs (resting)
    if (p.kickTimer === 0) {
        ctx.fillStyle = p.team.color;
        ctx.beginPath(); ctx.roundRect(-14, HEAD_R + 18, 10, 20, 4); ctx.fill();
        ctx.beginPath(); ctx.roundRect(4, HEAD_R + 18, 10, 20, 4); ctx.fill();
    }

    // Head glow
    ctx.save();
    ctx.shadowColor = p.team.light; ctx.shadowBlur = 22;
    ctx.beginPath(); ctx.arc(0, 0, HEAD_R, 0, Math.PI * 2); ctx.fillStyle = p.team.color; ctx.fill();
    ctx.restore();

    // Head
    ctx.beginPath(); ctx.arc(0, 0, HEAD_R, 0, Math.PI * 2);
    ctx.fillStyle = p.team.color; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; ctx.stroke();

    // Shine
    ctx.beginPath(); ctx.ellipse(-8, -10, 8, 6, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();

    // Eyes
    const ex = p.facing * 11;
    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.ellipse(ex, -6, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex + p.facing * 2, -6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(ex + p.facing * 2 + 1, -7, 1.5, 0, Math.PI * 2); ctx.fill();

    // Mouth (grimace when kicking, smile otherwise)
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    if (p.kickTimer > 0) {
        ctx.beginPath(); ctx.arc(p.facing * 4, 10, 7, Math.PI + 0.3, 2 * Math.PI - 0.3); ctx.stroke();
    } else {
        ctx.beginPath(); ctx.arc(p.facing * 4, 10, 7, 0.2, Math.PI - 0.2); ctx.stroke();
    }

    // Kick cooldown arc
    if (p.kickCooldown > 0) {
        const prog = 1 - p.kickCooldown / 42;
        ctx.strokeStyle = 'rgba(255,200,50,0.75)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, HEAD_R * 1.8, 10, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2); ctx.stroke();
    }

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center';
    ctx.fillText(label, 0, -HEAD_R - 8);

    ctx.restore();
}

function drawBall() {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    const sd = GROUND_Y - ball.y - ball.r;
    if (sd > 0) {
        const sc = Math.max(0.1, 1 - sd / 280);
        ctx.save(); ctx.translate(0, sd + ball.r + 5); ctx.scale(1, 0.25);
        ctx.fillStyle = `rgba(0,0,0,${0.28 * sc})`; ctx.beginPath(); ctx.ellipse(0, 0, ball.r * sc, ball.r * sc, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.rotate(ball.angle);
    ctx.save(); ctx.shadowColor = 'rgba(255,255,200,0.5)'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(0, 0, ball.r, 0, Math.PI * 2); ctx.fillStyle = 'white'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, ball.r, 0, Math.PI * 2); ctx.fillStyle = 'white'; ctx.fill();
    ctx.strokeStyle = '#999'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    const spots = [[0, 0], [0, -ball.r * 0.58], [ball.r * 0.55, -ball.r * 0.18], [ball.r * 0.34, ball.r * 0.47], [-ball.r * 0.34, ball.r * 0.47], [-ball.r * 0.55, -ball.r * 0.18]];
    spots.forEach(([sx, sy]) => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2, r = ball.r * 0.19; if (i === 0) ctx.moveTo(sx + r * Math.cos(a), sy + r * Math.sin(a)); else ctx.lineTo(sx + r * Math.cos(a), sy + r * Math.sin(a)); }
        ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-5, -7, 5, 3.5, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function drawParticles() {
    for (const p of particles) { ctx.save(); ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
}

function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath(); ctx.roundRect(W / 2 - 110, 8, 220, 52, 12); ctx.fill();
    ctx.textAlign = 'center';
    ctx.font = 'bold 38px Impact'; ctx.fillStyle = p1.team.color; ctx.fillText(score1, W / 2 - 42, 48);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = 'bold 28px Impact'; ctx.fillText('-', W / 2, 46);
    ctx.font = 'bold 38px Impact'; ctx.fillStyle = p2.team.color; ctx.fillText(score2, W / 2 + 42, 48);
    ctx.font = '10px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillText('FIRST TO ' + WIN_SCORE, W / 2, 72);

    ctx.textAlign = 'left'; ctx.font = 'bold 11px Arial'; ctx.fillStyle = p1.team.light;
    ctx.fillText(p1.team.name.toUpperCase(), GOAL_W + 8, 20);
    ctx.font = '10px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('A/D  W=jump  S=kick', GOAL_W + 8, 33);

    ctx.textAlign = 'right'; ctx.font = 'bold 11px Arial'; ctx.fillStyle = p2.team.light;
    ctx.fillText(p2.team.name.toUpperCase(), W - GOAL_W - 8, 20);
    ctx.font = '10px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('←/→  ↑=jump  ↓=kick', W - GOAL_W - 8, 33);
}

function drawGoalFlash() {
    const progress = 1 - goalTimer / 120;
    const alpha = Math.sin(progress * Math.PI);
    ctx.save(); ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = goalScoredBy === 'p1' ? p1.team.color : p2.team.color;
    ctx.fillRect(0, 0, W, H); ctx.restore();
    const scale = 1 + Math.sin(progress * Math.PI) * 0.25;
    ctx.save(); ctx.translate(W / 2, H / 2 - 10); ctx.scale(scale, scale); ctx.textAlign = 'center';
    ctx.font = 'bold 80px Impact'; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.lineWidth = 7;
    ctx.strokeText('GOAL!', 0, 0); ctx.fillStyle = '#ffdd00'; ctx.fillText('GOAL!', 0, 0);
    ctx.restore();
}

// ---- Team Select Screen ----
function getTeamAt(col, row) { return TEAMS[row * GRID_COLS + col] || null; }

function drawTeamSelect() {
    drawBackground();
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, W, H);

    // Title
    ctx.textAlign = 'center'; ctx.font = 'bold 28px Impact';
    ctx.strokeStyle = '#000'; ctx.lineWidth = 4; ctx.strokeText('WORLD CUP 2026 — SELECT YOUR TEAM', W / 2, 38);
    const tg = ctx.createLinearGradient(0, 14, 0, 42);
    tg.addColorStop(0, '#ffee00'); tg.addColorStop(1, '#ff8800');
    ctx.fillStyle = tg; ctx.fillText('WORLD CUP 2026 — SELECT YOUR TEAM', W / 2, 38);

    // Player labels
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#4488ff'; ctx.textAlign = 'left'; ctx.fillText('P1: WASD navigate   Space = confirm', 14, 64);
    ctx.fillStyle = '#ff4444'; ctx.textAlign = 'right'; ctx.fillText('P2: Arrow keys navigate   Enter = confirm', W - 14, 64);

    // Grid
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const team = getTeamAt(col, row);
            if (!team) continue;
            const cx = GRID_X + col * (CARD_W + CARD_GAP);
            const cy = GRID_Y + row * (CARD_H + CARD_GAP);

            const isP1 = sel1.col === col && sel1.row === row;
            const isP2 = sel2.col === col && sel2.row === row;
            const isP1Sel = sel1.confirmed && p1Team === team;
            const isP2Sel = sel2.confirmed && p2Team === team;

            // Card bg
            let bgAlpha = 0.65;
            if (isP1Sel || isP2Sel) bgAlpha = 0.85;
            ctx.fillStyle = `rgba(18,18,30,${bgAlpha})`;
            ctx.beginPath(); ctx.roundRect(cx, cy, CARD_W, CARD_H, 6); ctx.fill();

            // Border
            if (isP1 && isP2) { ctx.strokeStyle = '#cc44ff'; ctx.lineWidth = 3; }
            else if (isP1) { ctx.strokeStyle = sel1.confirmed ? '#4488ff' : '#88aaff'; ctx.lineWidth = isP1Sel ? 3 : 2; }
            else if (isP2) { ctx.strokeStyle = sel2.confirmed ? '#ff4444' : '#ff8888'; ctx.lineWidth = isP2Sel ? 3 : 2; }
            else { ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1; }
            ctx.beginPath(); ctx.roundRect(cx, cy, CARD_W, CARD_H, 6); ctx.stroke();

            // Flag
            const fx = cx + 8, fy = cy + 7, fw = CARD_W - 16, fh = 42;
            ctx.save(); ctx.beginPath(); ctx.roundRect(fx, fy, fw, fh, 3); ctx.clip();
            team.drawFlag(ctx, fx, fy, fw, fh);
            ctx.restore();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(fx, fy, fw, fh, 3); ctx.stroke();

            // Team name
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white'; ctx.font = 'bold 11px Arial';
            ctx.fillText(team.name, cx + CARD_W / 2, cy + 60);
            ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '9px Arial';
            ctx.fillText(team.abbr, cx + CARD_W / 2, cy + 72);

            // P1/P2 badges
            if (isP1) { ctx.fillStyle = sel1.confirmed ? '#4488ff' : 'rgba(68,136,255,0.7)'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'left'; ctx.fillText('P1', cx + 4, cy + 12); }
            if (isP2) { ctx.fillStyle = sel2.confirmed ? '#ff4444' : 'rgba(255,68,68,0.7)'; ctx.font = 'bold 8px Arial'; ctx.textAlign = 'right'; ctx.fillText('P2', cx + CARD_W - 4, cy + 12); }
        }
    }

    // Bottom status
    ctx.textAlign = 'center';
    if (sel1.confirmed && sel2.confirmed) {
        const pulse = 0.65 + 0.35 * Math.sin(Date.now() / 280);
        ctx.globalAlpha = pulse; ctx.font = 'bold 20px Impact'; ctx.fillStyle = '#ffdd00';
        ctx.fillText('PRESS SPACE OR ENTER TO KICK OFF!', W / 2, H - 14);
        ctx.globalAlpha = 1;
    } else {
        ctx.font = '13px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
        const s1 = sel1.confirmed ? `P1: ${p1Team.name} ready!` : 'P1: choose & press Space';
        const s2 = sel2.confirmed ? `P2: ${p2Team.name} ready!` : 'P2: choose & press Enter';
        ctx.fillText(s1 + '     |     ' + s2, W / 2, H - 14);
    }
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    const isP1Win = winner === 'PLAYER 1';
    const winTeam = isP1Win ? p1.team : p2.team;

    ctx.font = 'bold 62px Impact'; ctx.strokeStyle = '#000'; ctx.lineWidth = 6;
    ctx.strokeText(winner + ' WINS!', W / 2, H / 2 - 30);
    ctx.fillStyle = winTeam.color; ctx.fillText(winner + ' WINS!', W / 2, H / 2 - 30);

    // Winner flag
    ctx.save(); ctx.beginPath(); ctx.roundRect(W / 2 - 45, H / 2 - 10, 90, 58, 5); ctx.clip();
    winTeam.drawFlag(ctx, W / 2 - 45, H / 2 - 10, 90, 58);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(W / 2 - 45, H / 2 - 10, 90, 58, 5); ctx.stroke();

    ctx.font = '18px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(p1.team.name + '  ' + score1 + ' - ' + score2 + '  ' + p2.team.name, W / 2, H / 2 + 68);

    const pulse = 0.65 + 0.35 * Math.sin(Date.now() / 320);
    ctx.globalAlpha = pulse; ctx.font = 'bold 18px Impact'; ctx.fillStyle = '#ffdd00';
    ctx.fillText('PRESS SPACE TO CHANGE TEAMS', W / 2, H / 2 + 96);
    ctx.globalAlpha = 1;
}

// ---- Update ----
function updateTeamSelect() {
    // P1: WASD
    if (!sel1.confirmed) {
        if (justPressed('KeyA')) sel1.col = (sel1.col - 1 + GRID_COLS) % GRID_COLS;
        if (justPressed('KeyD')) sel1.col = (sel1.col + 1) % GRID_COLS;
        if (justPressed('KeyW')) sel1.row = (sel1.row - 1 + GRID_ROWS) % GRID_ROWS;
        if (justPressed('KeyS')) sel1.row = (sel1.row + 1) % GRID_ROWS;
        if (justPressed('Space')) { const t = getTeamAt(sel1.col, sel1.row); if (t) { p1Team = t; sel1.confirmed = true; } }
    } else {
        if (justPressed('KeyA') || justPressed('KeyD') || justPressed('KeyW') || justPressed('KeyS')) sel1.confirmed = false;
    }

    // P2: Arrows
    if (!sel2.confirmed) {
        if (justPressed('ArrowLeft'))  sel2.col = (sel2.col - 1 + GRID_COLS) % GRID_COLS;
        if (justPressed('ArrowRight')) sel2.col = (sel2.col + 1) % GRID_COLS;
        if (justPressed('ArrowUp'))    sel2.row = (sel2.row - 1 + GRID_ROWS) % GRID_ROWS;
        if (justPressed('ArrowDown'))  sel2.row = (sel2.row + 1) % GRID_ROWS;
        if (justPressed('Enter') || justPressed('NumpadEnter')) { const t = getTeamAt(sel2.col, sel2.row); if (t) { p2Team = t; sel2.confirmed = true; } }
    } else {
        if (justPressed('ArrowLeft') || justPressed('ArrowRight') || justPressed('ArrowUp') || justPressed('ArrowDown')) sel2.confirmed = false;
    }

    // Both confirmed → start
    if (sel1.confirmed && sel2.confirmed) {
        if (justPressed('Space') || justPressed('Enter') || justPressed('NumpadEnter')) {
            score1 = 0; score2 = 0;
            resetEntities();
            gameState = 'playing';
        }
    }
}

function update() {
    if (gameState === 'teamSelect') {
        updateTeamSelect();
    } else if (gameState === 'gameover') {
        updateParticles();
        if (justPressed('Space')) {
            sel1.confirmed = false; sel2.confirmed = false;
            gameState = 'teamSelect';
        }
    } else if (gameState === 'goal') {
        updateParticles();
        goalTimer--;
        if (goalTimer <= 0) { gameState = 'playing'; resetEntities(); }
    } else {
        // Playing
        updatePlayer(p1, 'KeyA', 'KeyD', 'KeyW', 'KeyS');
        updatePlayer(p2, 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown');
        updateBall();
        ballPlayerCollision(p1);
        ballPlayerCollision(p2);
        playerPlayerCollision();
        updateParticles();

        const goal = checkGoal();
        if (goal) {
            if (goal === 'p1') { score1++; goalScoredBy = 'p1'; }
            else { score2++; goalScoredBy = 'p2'; }
            spawnGoalParticles();
            goalTimer = 120;
            if (score1 >= WIN_SCORE) { winner = 'PLAYER 1'; gameState = 'gameover'; }
            else if (score2 >= WIN_SCORE) { winner = 'PLAYER 2'; gameState = 'gameover'; }
            else { gameState = 'goal'; }
        }
    }

    Object.assign(prevKeys, keys);
}

function draw() {
    ctx.clearRect(0, 0, W, H);

    if (gameState === 'teamSelect') {
        drawTeamSelect();
        return;
    }

    drawBackground();
    drawGoals();
    drawParticles();
    drawPlayer(p1, p1.team.abbr);
    drawPlayer(p2, p2.team.abbr);
    drawBall();
    drawHUD();

    if (gameState === 'goal') drawGoalFlash();
    if (gameState === 'gameover') drawGameOver();
}

function resize() {
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    canvas.style.width = W * scale + 'px';
    canvas.style.height = H * scale + 'px';
}
window.addEventListener('resize', resize);
resize();

function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();
