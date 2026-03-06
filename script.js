const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const W = 800, H = 480;
const GRAVITY = 0.55, GROUND_Y = H - 70, HEAD_R = 28, BALL_R = 18;
const GOAL_W = 60, GOAL_H = 140, PLAYER_SPD = 5.5, JUMP_V = -14, WIN_SCORE = 5;
const GRID_COLS = 6, GRID_ROWS = 4, CARD_W = 126, CARD_H = 90, CARD_GAP = 4;
const GRID_X = (W - (GRID_COLS * CARD_W + (GRID_COLS - 1) * CARD_GAP)) / 2;
const GRID_Y = 88;

// ── Flag helpers ────────────────────────────────────────────────────────────
const hFlag = (c1,c2,c3) => (c,x,y,w,h) => {
    c.fillStyle=c1;c.fillRect(x,y,w,h/3);
    c.fillStyle=c2;c.fillRect(x,y+h/3,w,h/3);
    c.fillStyle=c3;c.fillRect(x,y+2*h/3,w,h/3);
};
const vFlag = (c1,c2,c3) => (c,x,y,w,h) => {
    c.fillStyle=c1;c.fillRect(x,y,w/3,h);
    c.fillStyle=c2;c.fillRect(x+w/3,y,w/3,h);
    c.fillStyle=c3;c.fillRect(x+2*w/3,y,w/3,h);
};
const crossFlag = (bg,cr) => (c,x,y,w,h) => {
    c.fillStyle=bg;c.fillRect(x,y,w,h);
    c.fillStyle=cr;
    c.fillRect(x+w*.5-h*.17,y,h*.34,h);
    c.fillRect(x,y+h*.5-h*.17,w,h*.34);
};
const circFlag = (bg,ci) => (c,x,y,w,h) => {
    c.fillStyle=bg;c.fillRect(x,y,w,h);
    c.fillStyle=ci;c.beginPath();c.arc(x+w/2,y+h/2,h*.3,0,Math.PI*2);c.fill();
};
const diagFlag = (bg,di,inn) => (c,x,y,w,h) => {
    c.fillStyle=bg;c.fillRect(x,y,w,h);
    c.fillStyle=di;c.beginPath();
    c.moveTo(x+w*.08,y+h/2);c.lineTo(x+w/2,y+h*.1);
    c.lineTo(x+w*.92,y+h/2);c.lineTo(x+w/2,y+h*.9);
    c.closePath();c.fill();
    c.fillStyle=inn;c.beginPath();c.arc(x+w/2,y+h/2,h*.22,0,Math.PI*2);c.fill();
};
// Wide-top flag (Colombia / Ecuador style: top=50%, mid=25%, bot=25%)
const wideTopFlag = (top,mid,bot) => (c,x,y,w,h) => {
    c.fillStyle=top;c.fillRect(x,y,w,h/2);
    c.fillStyle=mid;c.fillRect(x,y+h/2,w,h/4);
    c.fillStyle=bot;c.fillRect(x,y+h*3/4,w,h/4);
};
// Spain: red 25%, yellow 50%, red 25%
const espFlag = (c,x,y,w,h) => {
    c.fillStyle='#c60b1e';c.fillRect(x,y,w,h*.25);
    c.fillStyle='#f1bf00';c.fillRect(x,y+h*.25,w,h*.5);
    c.fillStyle='#c60b1e';c.fillRect(x,y+h*.75,w,h*.25);
};
// Morocco: red with green pentagram star
const marFlag = (c,x,y,w,h) => {
    c.fillStyle='#C1272D';c.fillRect(x,y,w,h);
    c.save();c.strokeStyle='#006233';c.lineWidth=Math.max(1.2,h*.055);c.lineJoin='round';
    const cx=x+w/2,cy=y+h/2,r=h*.27;
    c.beginPath();
    for(let i=0;i<5;i++){const a=i*Math.PI*4/5-Math.PI/2;i===0?c.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):c.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));}
    c.closePath();c.stroke();c.restore();
};
// Croatia: three stripes + checkerboard shield
const croFlag = (c,x,y,w,h) => {
    c.fillStyle='#FF0000';c.fillRect(x,y,w,h/3);
    c.fillStyle='#FFFFFF';c.fillRect(x,y+h/3,w,h/3);
    c.fillStyle='#171796';c.fillRect(x,y+2*h/3,w,h/3);
    const sw=w*.38,sh=h*.52,sx=x+(w-sw)/2,sy=y+(h-sh)/2;
    for(let r=0;r<4;r++)for(let col=0;col<5;col++){
        c.fillStyle=(r+col)%2===0?'#FF0000':'#FFFFFF';
        c.fillRect(sx+col*sw/5,sy+r*sh/4,sw/5+.5,sh/4+.5);
    }
};
// USA: 13 alternating stripes, blue canton
const usaFlag = (c,x,y,w,h) => {
    for(let i=0;i<13;i++){c.fillStyle=i%2===0?'#BF0A30':'#FFFFFF';c.fillRect(x,y+i*h/13,w,h/13+.5);}
    c.fillStyle='#002868';c.fillRect(x,y,w*.38,h*7/13);
};
// Portugal: green left 40%, red right 60%
const porFlag = (c,x,y,w,h) => {
    c.fillStyle='#006600';c.fillRect(x,y,w*.4,h);
    c.fillStyle='#FF0000';c.fillRect(x+w*.4,y,w*.6,h);
};
// South Korea: white bg, yin-yang taegeuk
const korFlag = (c,x,y,w,h) => {
    c.fillStyle='#FFFFFF';c.fillRect(x,y,w,h);
    const cx=x+w/2,cy=y+h/2,r=h*.28;
    c.fillStyle='#003478';c.beginPath();c.arc(cx,cy,r,-Math.PI/2,Math.PI/2);c.fill();
    c.fillStyle='#CD2E3A';c.beginPath();c.arc(cx,cy,r,Math.PI/2,-Math.PI/2);c.fill();
    c.fillStyle='#CD2E3A';c.beginPath();c.arc(cx,cy-r/2,r/4,0,Math.PI*2);c.fill();
    c.fillStyle='#003478';c.beginPath();c.arc(cx,cy+r/2,r/4,0,Math.PI*2);c.fill();
};
// Australia: blue with union jack top-left + stars
const ausFlag = (c,x,y,w,h) => {
    c.fillStyle='#00008B';c.fillRect(x,y,w,h);
    const uw=w*.38,uh=h*.5;
    c.save();c.beginPath();c.rect(x,y,uw,uh);c.clip();
    c.strokeStyle='#FFFFFF';c.lineWidth=uh*.22;
    c.beginPath();c.moveTo(x,y);c.lineTo(x+uw,y+uh);c.stroke();
    c.beginPath();c.moveTo(x+uw,y);c.lineTo(x,y+uh);c.stroke();
    c.strokeStyle='#CF142B';c.lineWidth=uh*.1;
    c.beginPath();c.moveTo(x,y);c.lineTo(x+uw,y+uh);c.stroke();
    c.beginPath();c.moveTo(x+uw,y);c.lineTo(x,y+uh);c.stroke();
    c.strokeStyle='#FFFFFF';c.lineWidth=uh*.32;
    c.beginPath();c.moveTo(x+uw/2,y);c.lineTo(x+uw/2,y+uh);c.stroke();
    c.beginPath();c.moveTo(x,y+uh/2);c.lineTo(x+uw,y+uh/2);c.stroke();
    c.strokeStyle='#CF142B';c.lineWidth=uh*.16;
    c.beginPath();c.moveTo(x+uw/2,y);c.lineTo(x+uw/2,y+uh);c.stroke();
    c.beginPath();c.moveTo(x,y+uh/2);c.lineTo(x+uw,y+uh/2);c.stroke();
    c.restore();
    c.fillStyle='#FFFFFF';
    [[.7,.25],[.55,.6],[.85,.45],[.75,.78],[.62,.82]].forEach(([rx,ry])=>{
        c.beginPath();c.arc(x+rx*w,y+ry*h,h*.033,0,Math.PI*2);c.fill();
    });
};

// ── Teams (World Cup 2026) ──────────────────────────────────────────────────
const TEAMS = [
    {abbr:'ARG',name:'Argentina',  player:'Messi',     color:'#5fa8e0',light:'#aaddff', drawFlag:hFlag('#74ACDF','#FFFFFF','#74ACDF')},
    {abbr:'AUS',name:'Australia',  player:'Leckie',    color:'#003087',light:'#5577cc', drawFlag:ausFlag},
    {abbr:'BEL',name:'Belgium',    player:'Lukaku',    color:'#222222',light:'#F5D90A', drawFlag:vFlag('#000000','#F5D90A','#EF3340')},
    {abbr:'BRA',name:'Brazil',     player:'Vinicius',  color:'#009c3b',light:'#44dd77', drawFlag:diagFlag('#009c3b','#FFDF00','#003087')},
    {abbr:'CAN',name:'Canada',     player:'Davies',    color:'#cc0000',light:'#ff8888', drawFlag:vFlag('#FF0000','#FFFFFF','#FF0000')},
    {abbr:'COL',name:'Colombia',   player:'L. Díaz',   color:'#b07d00',light:'#ffdd44', drawFlag:wideTopFlag('#FCD116','#003893','#CE1126')},
    {abbr:'CRO',name:'Croatia',    player:'Modrić',    color:'#aa0000',light:'#ee5555', drawFlag:croFlag},
    {abbr:'DEN',name:'Denmark',    player:'Eriksen',   color:'#C60C30',light:'#ff6688', drawFlag:crossFlag('#C60C30','#FFFFFF')},
    {abbr:'ECU',name:'Ecuador',    player:'Caicedo',   color:'#8a6700',light:'#ffee55', drawFlag:wideTopFlag('#FFD100','#034EA2','#EF3340')},
    {abbr:'ENG',name:'England',    player:'Kane',      color:'#aa2222',light:'#ff7777', drawFlag:crossFlag('#FFFFFF','#CF142B')},
    {abbr:'ESP',name:'Spain',      player:'Yamal',     color:'#c60b1e',light:'#ff8844', drawFlag:espFlag},
    {abbr:'FRA',name:'France',     player:'Mbappé',    color:'#002395',light:'#5577ff', drawFlag:vFlag('#002395','#FFFFFF','#ED2939')},
    {abbr:'GER',name:'Germany',    player:'Wirtz',     color:'#333333',light:'#FFCE00', drawFlag:hFlag('#000000','#DD0000','#FFCE00')},
    {abbr:'IRN',name:'Iran',       player:'Taremi',    color:'#1a7a2e',light:'#55cc77', drawFlag:hFlag('#239F40','#FFFFFF','#DA0000')},
    {abbr:'ITA',name:'Italy',      player:'Barella',   color:'#003580',light:'#5588ff', drawFlag:vFlag('#009246','#FFFFFF','#CE2B37')},
    {abbr:'JPN',name:'Japan',      player:'Kubo',      color:'#000080',light:'#6666dd', drawFlag:circFlag('#FFFFFF','#BC002D')},
    {abbr:'KOR',name:'S. Korea',   player:'Son',       color:'#8e1a24',light:'#ee5566', drawFlag:korFlag},
    {abbr:'MAR',name:'Morocco',    player:'Hakimi',    color:'#8e1018',light:'#dd4455', drawFlag:marFlag},
    {abbr:'MEX',name:'Mexico',     player:'Lozano',    color:'#006847',light:'#44bb88', drawFlag:vFlag('#006847','#FFFFFF','#CE1126')},
    {abbr:'NED',name:'Netherlands',player:'Van Dijk',  color:'#cc4400',light:'#ff9944', drawFlag:hFlag('#AE1C28','#FFFFFF','#21468B')},
    {abbr:'POR',name:'Portugal',   player:'Ronaldo',   color:'#006600',light:'#44cc55', drawFlag:porFlag},
    {abbr:'SEN',name:'Senegal',    player:'Mané',      color:'#006030',light:'#44bb77', drawFlag:vFlag('#00853F','#FDEF42','#E31B23')},
    {abbr:'URU',name:'Uruguay',    player:'Núñez',     color:'#4a9acc',light:'#88ccff', drawFlag:hFlag('#5CB8E4','#FFFFFF','#5CB8E4')},
    {abbr:'USA',name:'USA',        player:'Pulisic',   color:'#002868',light:'#5577dd', drawFlag:usaFlag},
];

// ── Quiz Questions (100 questions, d:1=easy d:2=medium d:3=hard) ───────────
const QUESTIONS = [
// Easy
{q:"What is the capital of France?",                          o:["London","Berlin","Rome","Paris"],              a:3,d:1},
{q:"How many sides does a triangle have?",                    o:["2","3","4","5"],                               a:1,d:1},
{q:"What is H₂O commonly known as?",                         o:["Salt","Hydrogen","Oxygen","Water"],            a:3,d:1},
{q:"What is the largest ocean on Earth?",                     o:["Atlantic","Indian","Arctic","Pacific"],        a:3,d:1},
{q:"How many legs does a spider have?",                       o:["4","6","7","8"],                               a:3,d:1},
{q:"What force keeps us on the ground?",                      o:["Magnetism","Friction","Electricity","Gravity"],a:3,d:1},
{q:"What is the capital of Japan?",                           o:["Osaka","Kyoto","Hiroshima","Tokyo"],           a:3,d:1},
{q:"Who was the first person to walk on the moon?",           o:["Aldrin","Gagarin","Glenn","Armstrong"],        a:3,d:1},
{q:"How many colors are in a rainbow?",                       o:["5","6","7","8"],                               a:2,d:1},
{q:"What is the fastest land animal?",                        o:["Lion","Leopard","Cheetah","Pronghorn"],        a:2,d:1},
{q:"How many players are on a soccer team?",                  o:["9","10","11","12"],                            a:2,d:1},
{q:"How many strings does a standard guitar have?",           o:["4","5","6","7"],                               a:2,d:1},
{q:"How many keys are on a standard piano?",                  o:["72","80","88","96"],                           a:2,d:1},
{q:"What is the capital of Germany?",                         o:["Munich","Frankfurt","Hamburg","Berlin"],       a:3,d:1},
{q:"How many sides does a hexagon have?",                     o:["5","6","7","8"],                               a:1,d:1},
{q:"Which is the largest animal on Earth?",                   o:["Whale shark","Elephant","Giant squid","Blue whale"],a:3,d:1},
{q:"How many continents are there?",                          o:["5","6","7","8"],                               a:2,d:1},
{q:"What is 7 × 8?",                                          o:["54","56","58","62"],                           a:1,d:1},
{q:"Which country won the 2022 FIFA World Cup?",              o:["France","Brazil","Portugal","Argentina"],      a:3,d:1},
{q:"What is the tallest mountain in the world?",              o:["K2","Kangchenjunga","Lhotse","Everest"],       a:3,d:1},
{q:"Who wrote Romeo and Juliet?",                             o:["Dickens","Austen","Twain","Shakespeare"],      a:3,d:1},
{q:"What is the main ingredient in guacamole?",               o:["Tomato","Lime","Onion","Avocado"],             a:3,d:1},
{q:"How many zeros are in one million?",                      o:["4","5","6","7"],                               a:2,d:1},
{q:"Which sport is Wimbledon famous for?",                    o:["Golf","Squash","Badminton","Tennis"],          a:3,d:1},
{q:"What is the capital of Australia?",                       o:["Sydney","Melbourne","Brisbane","Canberra"],    a:3,d:1},
{q:"What is the square root of 144?",                         o:["11","12","13","14"],                           a:1,d:1},
{q:"Which country is sushi originally from?",                 o:["China","Korea","Vietnam","Japan"],             a:3,d:1},
{q:"How many sides does a pentagon have?",                    o:["4","5","6","7"],                               a:1,d:1},
{q:"What is the capital of Italy?",                           o:["Milan","Naples","Venice","Rome"],              a:3,d:1},
{q:"Who created Mickey Mouse?",                               o:["Pixar","Warner Bros","Chuck Jones","Walt Disney"],a:3,d:1},
{q:"What is the currency of Japan?",                          o:["Won","Yuan","Baht","Yen"],                     a:3,d:1},
{q:"Which planet is called the Red Planet?",                  o:["Jupiter","Saturn","Venus","Mars"],             a:3,d:1},
{q:"How many days are in a leap year?",                       o:["364","365","366","367"],                       a:2,d:1},
{q:"How many cards are in a standard deck?",                  o:["48","50","52","54"],                           a:2,d:1},
{q:"What color is a ripe banana?",                            o:["Green","Orange","Red","Yellow"],               a:3,d:1},
{q:"How many minutes are in one hour?",                       o:["30","45","60","90"],                           a:2,d:1},
{q:"What language do people in Brazil speak?",                o:["Spanish","French","English","Portuguese"],     a:3,d:1},
{q:"How many planets are in our solar system?",               o:["7","8","9","10"],                              a:1,d:1},
{q:"What is 2 + 2?",                                          o:["3","4","5","6"],                               a:1,d:1},
{q:"Which country is the Eiffel Tower in?",                   o:["Italy","Germany","Spain","France"],            a:3,d:1},
// Medium
{q:"What is the largest country by area?",                    o:["Canada","China","USA","Russia"],               a:3,d:2},
{q:"In which year was the first FIFA World Cup held?",        o:["1926","1928","1930","1934"],                   a:2,d:2},
{q:"How many World Cups has Brazil won?",                     o:["4","5","3","6"],                               a:1,d:2},
{q:"What is the capital of Canada?",                          o:["Toronto","Vancouver","Montreal","Ottawa"],     a:3,d:2},
{q:"Who has won the most Ballon d'Or awards?",                o:["Ronaldo","Messi","Pelé","Maradona"],           a:1,d:2},
{q:"Which country has the longest coastline?",                o:["Russia","Australia","Norway","Canada"],        a:3,d:2},
{q:"What is the chemical symbol for gold?",                   o:["Go","Gd","Ag","Au"],                          a:3,d:2},
{q:"In which year did the Berlin Wall fall?",                 o:["1987","1988","1989","1991"],                   a:2,d:2},
{q:"Which planet has the most moons?",                        o:["Jupiter","Uranus","Neptune","Saturn"],         a:3,d:2},
{q:"What is the approximate speed of light in km/s?",         o:["150,000","250,000","300,000","450,000"],       a:2,d:2},
{q:"Who painted the Mona Lisa?",                              o:["Michelangelo","Raphael","Rembrandt","da Vinci"],a:3,d:2},
{q:"What is the powerhouse of the cell?",                     o:["Nucleus","Ribosome","Golgi body","Mitochondria"],a:3,d:2},
{q:"What is the capital of Brazil?",                          o:["Rio de Janeiro","São Paulo","Salvador","Brasília"],a:3,d:2},
{q:"Which country won the 2018 FIFA World Cup?",              o:["Germany","Argentina","Croatia","France"],      a:3,d:2},
{q:"Who plays Iron Man in the MCU?",                          o:["Chris Evans","Mark Ruffalo","Chris Hemsworth","Robert Downey Jr."],a:3,d:2},
{q:"DNA stands for?",                                         o:["Dextrose Nitrogen Acid","Deoxyribose Nitrate","Dual Nucleic Arrangement","Deoxyribonucleic Acid"],a:3,d:2},
{q:"How many bones are in an adult human body?",              o:["196","206","216","226"],                       a:1,d:2},
{q:"Which country hosted the 2014 FIFA World Cup?",           o:["Argentina","Colombia","Brazil","Mexico"],      a:2,d:2},
{q:"Who scored the 'Hand of God' goal?",                      o:["Pelé","Ronaldo","Zidane","Maradona"],          a:3,d:2},
{q:"Which country is Cristiano Ronaldo from?",                o:["Spain","Brazil","Italy","Portugal"],           a:3,d:2},
{q:"How many Harry Potter books are there?",                  o:["5","6","7","8"],                               a:2,d:2},
{q:"What band was Freddie Mercury the lead singer of?",       o:["The Beatles","Rolling Stones","Led Zeppelin","Queen"],a:3,d:2},
{q:"What is the atomic number of carbon?",                    o:["4","5","6","8"],                               a:2,d:2},
{q:"Which country has the most natural lakes?",               o:["Russia","USA","Finland","Canada"],             a:3,d:2},
{q:"Who wrote 'A Song of Ice and Fire'?",                     o:["Tolkien","Stephen King","Robert Jordan","George R.R. Martin"],a:3,d:2},
{q:"In which year did World War I begin?",                    o:["1912","1913","1914","1916"],                   a:2,d:2},
{q:"In which year did World War II end?",                     o:["1943","1944","1945","1946"],                   a:2,d:2},
{q:"What is the world's largest hot desert?",                 o:["Arabian","Gobi","Kalahari","Sahara"],          a:3,d:2},
{q:"Which country is the world's largest coffee producer?",   o:["Colombia","Ethiopia","Vietnam","Brazil"],      a:3,d:2},
{q:"What is π to 2 decimal places?",                          o:["3.12","3.14","3.16","3.18"],                   a:1,d:2},
{q:"Which club did Zidane play for before Real Madrid?",      o:["Monaco","Marseille","Lyon","Juventus"],        a:3,d:2},
{q:"What is the chemical symbol for iron?",                   o:["Ir","In","Fr","Fe"],                          a:3,d:2},
{q:"How many time zones does Russia have?",                   o:["9","10","11","12"],                            a:2,d:2},
{q:"Which African country is the most populated?",            o:["Kenya","Ethiopia","South Africa","Nigeria"],   a:3,d:2},
{q:"What is the sum of angles in a triangle?",                o:["90°","120°","180°","360°"],                    a:2,d:2},
// Hard
{q:"What is the chemical symbol for tungsten?",               o:["Tu","Tg","Wg","W"],                           a:3,d:3},
{q:"In what year was the United Nations founded?",            o:["1943","1944","1945","1946"],                   a:2,d:3},
{q:"Which is the only country with a non-rectangular flag?",  o:["Switzerland","Bhutan","Sri Lanka","Nepal"],   a:3,d:3},
{q:"Who composed 'The Four Seasons'?",                        o:["Mozart","Bach","Handel","Vivaldi"],            a:3,d:3},
{q:"What is the longest bone in the human body?",             o:["Tibia","Fibula","Spine","Femur"],              a:3,d:3},
{q:"Who discovered penicillin?",                              o:["Pasteur","Curie","Lister","Fleming"],          a:3,d:3},
{q:"What is the 10th number in the Fibonacci sequence?",      o:["34","45","55","63"],                           a:2,d:3},
{q:"What is the smallest country in the world?",              o:["Monaco","Liechtenstein","Vatican City","San Marino"],a:2,d:3},
{q:"In what year did the Soviet Union collapse?",             o:["1989","1990","1991","1992"],                   a:2,d:3},
{q:"What is the chemical formula for table salt?",            o:["NaOH","NaCl","KCl","CaCO₃"],                  a:1,d:3},
{q:"Who wrote 'One Hundred Years of Solitude'?",              o:["Neruda","Borges","Allende","García Márquez"],  a:3,d:3},
{q:"What is the approximate speed of sound in air (m/s)?",    o:["243","343","443","543"],                       a:1,d:3},
{q:"Which element has the highest melting point?",            o:["Osmium","Iridium","Tungsten","Carbon"],        a:2,d:3},
{q:"Who painted the Sistine Chapel ceiling?",                 o:["Raphael","da Vinci","Donatello","Michelangelo"],a:3,d:3},
{q:"Which soccer player has the most international goals ever?",o:["Messi","Pelé","Ali Daei","Ronaldo"],        a:3,d:3},
{q:"What is the deepest lake in the world?",                  o:["Superior","Caspian","Tanganyika","Baikal"],   a:3,d:3},
{q:"How many moons does Mars have?",                          o:["0","1","2","3"],                               a:2,d:3},
{q:"Argentina's World Cup wins before 2022 were in which years?",o:["1978 & 1986","1974 & 1982","1982 & 1990","1982 & 1994"],a:0,d:3},
{q:"Who was the first woman to win a Nobel Prize?",           o:["Rosalind Franklin","Dorothy Hodgkin","Mother Teresa","Marie Curie"],a:3,d:3},
{q:"What is the approximate half-life of Carbon-14?",         o:["1,730 years","5,730 years","17,300 years","57,300 years"],a:1,d:3},
{q:"What does 'FIFA' stand for?",                             o:["Fédération Internationale de Football Association","Federation of International Football Associations","Federation of International Football Activities","Fédération Internationale de Football Athlétique"],a:0,d:3},
{q:"Which mountain is the highest outside of Asia?",          o:["Kilimanjaro","Mont Blanc","Aconcagua","Denali"],a:2,d:3},
{q:"What is the chemical symbol for silver?",                 o:["Si","Sr","Sv","Ag"],                          a:3,d:3},
{q:"Which country has the most UNESCO World Heritage Sites?", o:["France","Spain","China","Italy"],              a:3,d:3},
{q:"In what year was the Eiffel Tower built?",                o:["1879","1884","1889","1895"],                   a:2,d:3},
];

// ── Prize ladder ──────────────────────────────────────────────────────────
const PRIZES = ['$100','$200','$300','$500','$1,000','$2,000','$4,000','$8,000','$16,000','$32,000','$64,000','$125,000','$250,000','$500,000','$1,000,000'];
const SAFE_LEVELS = [4, 9]; // 0-indexed (after question 5 and 10)

// ── Input ─────────────────────────────────────────────────────────────────
const keys = {}, prevKeys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
function justPressed(code) { return keys[code] && !prevKeys[code]; }

// ── Game state ────────────────────────────────────────────────────────────
let gameState = 'teamSelect';
let score1 = 0, score2 = 0;
let goalTimer = 0, winner = '', goalScoredBy = '';
let particles = [];
let p1, p2, ball;
let p1Team = TEAMS[0], p2Team = TEAMS[23];
let sel1 = { col: 0, row: 0, confirmed: false };
let sel2 = { col: 5, row: 3, confirmed: false };

// ── Quiz state ────────────────────────────────────────────────────────────
const quiz = {
    open: false, prevGameState: 'teamSelect',
    gs: 'idle',  // 'idle' | 'playing' | 'won' | 'lost'
    level: 0, qs: [], sel: -1,
    phase: 'pick', // 'pick' | 'locking' | 'revealing' | 'done'
    phaseTimer: 0,
    lifelines: { fifty: true, phone: true, audience: true },
    elim: [],        // indices eliminated by 50/50
    phoneTimer: 0,   // frames phone hint shows
    audience: null,  // [pct,pct,pct,pct] or null
    walked: false,
};

const QUIZ_BTN = { x: W - 108, y: H - 36, w: 103, h: 30 };

function quizInit() {
    const easy   = shuffle(QUESTIONS.filter(q => q.d === 1)).slice(0, 5);
    const medium = shuffle(QUESTIONS.filter(q => q.d === 2)).slice(0, 5);
    const hard   = shuffle(QUESTIONS.filter(q => q.d === 3)).slice(0, 5);
    quiz.qs = [...easy, ...medium, ...hard];
    quiz.level = 0; quiz.sel = -1; quiz.phase = 'pick'; quiz.phaseTimer = 0;
    quiz.lifelines = { fifty: true, phone: true, audience: true };
    quiz.elim = []; quiz.phoneTimer = 0; quiz.audience = null; quiz.walked = false;
    quiz.gs = 'playing';
}

function quizWalkAway() {
    quiz.walked = true;
    quiz.gs = 'lost';
}

function quizGuaranteed() {
    for (let i = SAFE_LEVELS.length - 1; i >= 0; i--) {
        if (quiz.level > SAFE_LEVELS[i]) return PRIZES[SAFE_LEVELS[i]];
    }
    return '$0';
}

// ── Canvas click handler ──────────────────────────────────────────────────
canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width, scaleY = H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    handleClick(mx, my);
});

function handleClick(mx, my) {
    if (!quiz.open) {
        // Quiz button
        if (mx >= QUIZ_BTN.x && mx <= QUIZ_BTN.x + QUIZ_BTN.w &&
            my >= QUIZ_BTN.y && my <= QUIZ_BTN.y + QUIZ_BTN.h) {
            quiz.prevGameState = gameState;
            quiz.open = true;
        }
        return;
    }
    // Quiz is open
    if (quiz.gs === 'idle') { quizInit(); return; }
    if (quiz.gs === 'won' || quiz.gs === 'lost') {
        if (inBox(mx, my, 260, 360, 280, 36)) { quiz.open = false; gameState = quiz.prevGameState; }
        return;
    }
    if (quiz.gs !== 'playing') return;
    // Back button (always)
    if (inBox(mx, my, 10, H - 38, 100, 28)) { quiz.open = false; gameState = quiz.prevGameState; return; }

    if (quiz.phase === 'pick') {
        // Answer boxes
        const boxes = getAnswerBoxes();
        boxes.forEach((b, i) => {
            if (!quiz.elim.includes(i) && inBox(mx, my, b.x, b.y, b.w, b.h)) {
                quiz.sel = i;
                quiz.phase = 'locking';
                quiz.phaseTimer = 55;
            }
        });
        // Lifelines
        if (quiz.lifelines.fifty   && inBox(mx, my, 25, 300, 80, 34)) useFifty();
        if (quiz.lifelines.phone   && inBox(mx, my, 115, 300, 80, 34)) usePhone();
        if (quiz.lifelines.audience && inBox(mx, my, 205, 300, 80, 34)) useAudience();
        // Walk away
        if (inBox(mx, my, 10, 345, 120, 30)) quizWalkAway();
    }
}

function inBox(mx, my, x, y, w, h) { return mx >= x && mx <= x+w && my >= y && my <= y+h; }
function getAnswerBoxes() {
    return [
        {x:10, y:152, w:285, h:60},
        {x:305, y:152, w:285, h:60},
        {x:10, y:222, w:285, h:60},
        {x:305, y:222, w:285, h:60},
    ];
}

function shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

function useFifty() {
    quiz.lifelines.fifty = false;
    quiz.elim = [];
    const correct = quiz.qs[quiz.level].a;
    const wrong = [0,1,2,3].filter(i => i !== correct);
    shuffle(wrong).slice(0, 2).forEach(i => quiz.elim.push(i));
}
function usePhone() {
    quiz.lifelines.phone = false;
    quiz.phoneTimer = 200;
}
function useAudience() {
    quiz.lifelines.audience = false;
    const correct = quiz.qs[quiz.level].a;
    const pcts = [5,5,5,5];
    const correctPct = 60 + Math.floor(Math.random() * 20);
    pcts[correct] = correctPct;
    const remaining = 100 - correctPct;
    const wrongIdxs = [0,1,2,3].filter(i => i !== correct && !quiz.elim.includes(i));
    let leftover = remaining;
    wrongIdxs.forEach((idx, i) => {
        if (i === wrongIdxs.length - 1) { pcts[idx] = leftover; }
        else { const p = Math.floor(Math.random() * leftover); pcts[idx] = p; leftover -= p; }
    });
    quiz.elim.forEach(i => pcts[i] = 0);
    quiz.audience = pcts;
}

// ── Entity factories ──────────────────────────────────────────────────────
function makePlayer(x, team, facing) {
    return { x, y: GROUND_Y - HEAD_R, vx: 0, vy: 0, onGround: true, facing, team, kickTimer: 0, kickCooldown: 0 };
}
function makeBall() {
    const d = Math.random() < .5 ? 1 : -1;
    return { x: W/2, y: GROUND_Y - 180, vx: d*2, vy: -3, r: BALL_R, angle: 0 };
}
function resetEntities() {
    p1 = makePlayer(160, p1Team, 1);
    p2 = makePlayer(640, p2Team, -1);
    ball = makeBall(); particles = [];
}

// ── Physics ───────────────────────────────────────────────────────────────
function updatePlayer(p, leftCode, rightCode, jumpCode, kickCode) {
    if (keys[leftCode])  { p.vx -= 1.1; p.facing = -1; }
    if (keys[rightCode]) { p.vx += 1.1; p.facing =  1; }
    p.vx *= 0.78;
    if (Math.abs(p.vx) > PLAYER_SPD) p.vx = Math.sign(p.vx) * PLAYER_SPD;
    if (justPressed(jumpCode) && p.onGround) { p.vy = JUMP_V; p.onGround = false; }
    if (justPressed(kickCode) && p.kickCooldown === 0) {
        p.kickTimer = 18; p.kickCooldown = 42;
        p.vx += p.facing * 10;
        if (p.onGround) p.vy = -4;
    }
    if (p.kickTimer > 0) p.kickTimer--;
    if (p.kickCooldown > 0) p.kickCooldown--;
    p.vy += GRAVITY; p.x += p.vx; p.y += p.vy;
    if (p.y + HEAD_R >= GROUND_Y) { p.y = GROUND_Y - HEAD_R; p.vy = 0; p.onGround = true; }
    if (p.y - HEAD_R < 0) { p.y = HEAD_R; p.vy = Math.abs(p.vy) * .4; }
    if (p.x < GOAL_W + HEAD_R) p.x = GOAL_W + HEAD_R;
    if (p.x > W - GOAL_W - HEAD_R) p.x = W - GOAL_W - HEAD_R;
}

function updateBall() {
    ball.vy += GRAVITY; ball.x += ball.vx; ball.y += ball.vy;
    ball.angle += ball.vx * .04;
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy) * .65; }
    if (ball.y + ball.r > GROUND_Y) { ball.y = GROUND_Y - ball.r; ball.vy = -Math.abs(ball.vy) * .6; ball.vx *= .83; if (Math.abs(ball.vy) < 1.2) ball.vy = 0; }
    const crossY = GROUND_Y - GOAL_H;
    if (ball.x - ball.r < 0 && ball.y + ball.r <= crossY) { ball.x = ball.r; ball.vx = Math.abs(ball.vx) * .65; }
    if (ball.x + ball.r > W && ball.y + ball.r <= crossY) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx) * .65; }
    if (ball.x > 0 && ball.x < GOAL_W && ball.y - ball.r < crossY && ball.y + ball.r > crossY && ball.vy > 0) { ball.y = crossY - ball.r; ball.vy = -Math.abs(ball.vy) * .7; }
    if (ball.x - ball.r < GOAL_W && ball.x + ball.r > GOAL_W && ball.y > crossY && ball.vx > 0) { ball.x = GOAL_W + ball.r; ball.vx = Math.abs(ball.vx) * .65; }
    if (ball.x > W - GOAL_W && ball.x < W && ball.y - ball.r < crossY && ball.y + ball.r > crossY && ball.vy > 0) { ball.y = crossY - ball.r; ball.vy = -Math.abs(ball.vy) * .7; }
    if (ball.x + ball.r > W - GOAL_W && ball.x - ball.r < W - GOAL_W && ball.y > crossY && ball.vx < 0) { ball.x = W - GOAL_W - ball.r; ball.vx = -Math.abs(ball.vx) * .65; }
    const spd = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
    if (spd > 22) { ball.vx *= 22/spd; ball.vy *= 22/spd; }
}

function ballPlayerCollision(p) {
    if (p.kickTimer > 0) {
        const footX = p.x + p.facing*(HEAD_R+16), footY = p.y + HEAD_R + 5;
        const fdx = ball.x - footX, fdy = ball.y - footY;
        const fd = Math.sqrt(fdx*fdx + fdy*fdy);
        if (fd < 18 + ball.r) {
            const nx = fd > .01 ? fdx/fd : p.facing, ny = fd > .01 ? fdy/fd : -.4;
            ball.vx = p.facing*20 + p.vx*.25; ball.vy = -11 + p.vy*.2;
            ball.x = footX + nx*(18+ball.r+2); ball.y = footY + ny*(18+ball.r+2);
            p.kickTimer = 0; spawnKickParticles(ball.x, ball.y, p.facing); return;
        }
    }
    const dx = ball.x - p.x, dy = ball.y - p.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const minDist = HEAD_R + ball.r;
    if (dist < minDist && dist > .01) {
        const nx = dx/dist, ny = dy/dist, overlap = minDist - dist;
        ball.x += nx*overlap*.8; ball.y += ny*overlap*.8;
        p.x -= nx*overlap*.2; p.y -= ny*overlap*.2;
        const rvx = ball.vx - p.vx, rvy = ball.vy - p.vy, dot = rvx*nx + rvy*ny;
        if (dot < 0) {
            const mult = p.kickTimer > 0 ? 2.0 : 1.15;
            ball.vx -= mult*dot*nx; ball.vy -= mult*dot*ny;
            ball.vx += p.vx*.45; ball.vy += p.vy*.35;
        }
        if (p.kickTimer > 0) { p.kickTimer = 0; spawnKickParticles(ball.x, ball.y, p.facing); }
    }
}

function playerPlayerCollision() {
    const dx = p2.x-p1.x, dy = p2.y-p1.y, dist = Math.sqrt(dx*dx+dy*dy);
    if (dist < HEAD_R*2 && dist > .01) {
        const nx = dx/dist, overlap = (HEAD_R*2 - dist)/2;
        p1.x -= nx*overlap; p2.x += nx*overlap;
        const t = p1.vx; p1.vx = p2.vx*.6; p2.vx = t*.6;
    }
}

function checkGoal() {
    if (ball.x+ball.r < GOAL_W && ball.y+ball.r > GROUND_Y-GOAL_H) return 'p2';
    if (ball.x-ball.r > W-GOAL_W && ball.y+ball.r > GROUND_Y-GOAL_H) return 'p1';
    return null;
}

// ── Particles ─────────────────────────────────────────────────────────────
function spawnGoalParticles() {
    for (let i=0;i<70;i++){const a=Math.random()*Math.PI*2,s=2+Math.random()*10;particles.push({x:W/2,y:H/2,vx:Math.cos(a)*s,vy:Math.sin(a)*s-4,life:1,decay:.011+Math.random()*.013,r:4+Math.random()*7,color:`hsl(${Math.random()*60+20},100%,60%)`});}
}
function spawnKickParticles(bx,by,dir) {
    for(let i=0;i<10;i++){const a=(Math.random()-.5)*1.8+(dir>0?0:Math.PI),s=3+Math.random()*7;particles.push({x:bx,y:by,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:1,decay:.07+Math.random()*.06,r:2+Math.random()*4,color:`hsl(${Math.random()*40+15},100%,65%)`});}
}
function updateParticles() {
    for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.vx*=.96;p.life-=p.decay;}
    particles=particles.filter(p=>p.life>0);
}

// ── Drawing ───────────────────────────────────────────────────────────────
function drawBackground() {
    const sky=ctx.createLinearGradient(0,0,0,GROUND_Y);sky.addColorStop(0,'#08081e');sky.addColorStop(1,'#101030');
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,GROUND_Y);
    ctx.save();ctx.globalAlpha=.1;
    for(const lx of [W*.2,W*.8]){const g=ctx.createRadialGradient(lx,10,0,lx,10,220);g.addColorStop(0,'#fff');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,W,GROUND_Y);}
    ctx.restore();
    const sw=W/8;for(let i=0;i<8;i++){ctx.fillStyle=i%2===0?'#1e5012':'#1a4010';ctx.fillRect(i*sw,GROUND_Y,sw,H-GROUND_Y);}
    ctx.fillStyle='#286616';ctx.fillRect(0,GROUND_Y,W,6);
    ctx.save();ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=2;ctx.setLineDash([12,10]);
    ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,GROUND_Y);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='rgba(255,255,255,0.13)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(W/2,GROUND_Y,80,Math.PI,2*Math.PI);ctx.stroke();
    ctx.restore();
}

function drawGoals() {
    const drawGoal = (side) => {
        const gx=side==='left'?0:W-GOAL_W, gy=GROUND_Y-GOAL_H;
        ctx.fillStyle='rgba(255,255,255,0.04)';ctx.fillRect(gx,gy,GOAL_W,GOAL_H);
        ctx.save();ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=.8;
        for(let x=gx+12;x<gx+GOAL_W;x+=12){ctx.beginPath();ctx.moveTo(x,gy);ctx.lineTo(x,GROUND_Y);ctx.stroke();}
        for(let y=gy+14;y<GROUND_Y;y+=14){ctx.beginPath();ctx.moveTo(gx,y);ctx.lineTo(gx+GOAL_W,y);ctx.stroke();}
        ctx.restore();
        ctx.strokeStyle='#e0e0e0';ctx.lineWidth=5;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+GOAL_W,gy);ctx.stroke();
        const postX=side==='left'?gx+GOAL_W:gx;ctx.beginPath();ctx.moveTo(postX,gy);ctx.lineTo(postX,GROUND_Y);ctx.stroke();
    };
    drawGoal('left');drawGoal('right');
}

function drawPlayer(p, label) {
    ctx.save();ctx.translate(p.x,p.y);
    const sd=GROUND_Y-p.y-HEAD_R,sc=Math.max(.1,1-sd/280);
    ctx.save();ctx.translate(0,sd+HEAD_R+8);ctx.scale(1,.28);
    ctx.fillStyle=`rgba(0,0,0,${.38*sc})`;ctx.beginPath();ctx.ellipse(0,0,HEAD_R*.9*sc,HEAD_R*.9*sc,0,0,Math.PI*2);ctx.fill();ctx.restore();

    if (p.kickTimer > 0) {
        const prog=p.kickTimer/18, stretch=Math.sin((1-prog)*Math.PI);
        const legAngle=p.facing*(.3+stretch*1.3), legLen=22+stretch*14;
        const footX=p.facing*5+Math.sin(legAngle)*legLen, footY=HEAD_R+16+Math.cos(Math.abs(legAngle))*legLen*.3;
        ctx.save();ctx.strokeStyle=p.team.color;ctx.lineWidth=9;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(p.facing*5,HEAD_R+14);ctx.lineTo(footX,footY);ctx.stroke();
        ctx.fillStyle='#c8a070';ctx.beginPath();ctx.arc(footX,footY,9,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#333';ctx.beginPath();ctx.ellipse(footX+p.facing*5,footY+2,11,6,0,0,Math.PI*2);ctx.fill();
        ctx.restore();
    }
    ctx.fillStyle=p.team.color;ctx.beginPath();ctx.roundRect(-11,HEAD_R-5,22,26,5);ctx.fill();
    ctx.save();ctx.beginPath();ctx.roundRect(-10,HEAD_R-1,20,13,2);ctx.clip();
    p.team.drawFlag(ctx,-10,HEAD_R-1,20,13);ctx.restore();
    if (p.kickTimer===0) {
        ctx.fillStyle=p.team.color;
        ctx.beginPath();ctx.roundRect(-14,HEAD_R+18,10,20,4);ctx.fill();
        ctx.beginPath();ctx.roundRect(4,HEAD_R+18,10,20,4);ctx.fill();
    }
    ctx.save();ctx.shadowColor=p.team.light;ctx.shadowBlur=22;ctx.beginPath();ctx.arc(0,0,HEAD_R,0,Math.PI*2);ctx.fillStyle=p.team.color;ctx.fill();ctx.restore();
    ctx.beginPath();ctx.arc(0,0,HEAD_R,0,Math.PI*2);ctx.fillStyle=p.team.color;ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.ellipse(-8,-10,8,6,-.4,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.22)';ctx.fill();
    const ex=p.facing*11;
    ctx.fillStyle='white';ctx.beginPath();ctx.ellipse(ex,-6,7,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#111';ctx.beginPath();ctx.arc(ex+p.facing*2,-6,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='white';ctx.beginPath();ctx.arc(ex+p.facing*2+1,-7,1.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.5)';ctx.lineWidth=2;ctx.lineCap='round';
    ctx.beginPath();
    if(p.kickTimer>0) ctx.arc(p.facing*4,10,7,Math.PI+.3,2*Math.PI-.3);
    else ctx.arc(p.facing*4,10,7,.2,Math.PI-.2);
    ctx.stroke();
    if (p.kickCooldown>0) {
        const prog=1-p.kickCooldown/42;ctx.strokeStyle='rgba(255,200,50,0.75)';ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(0,HEAD_R*1.8,10,-Math.PI/2,-Math.PI/2+prog*Math.PI*2);ctx.stroke();
    }
    ctx.fillStyle='rgba(255,255,255,0.9)';ctx.font='bold 11px Arial';ctx.textAlign='center';
    ctx.fillText(label,0,-HEAD_R-8);
    ctx.restore();
}

function drawBall() {
    ctx.save();ctx.translate(ball.x,ball.y);
    const sd=GROUND_Y-ball.y-ball.r;
    if(sd>0){const sc=Math.max(.1,1-sd/280);ctx.save();ctx.translate(0,sd+ball.r+5);ctx.scale(1,.25);ctx.fillStyle=`rgba(0,0,0,${.28*sc})`;ctx.beginPath();ctx.ellipse(0,0,ball.r*sc,ball.r*sc,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    ctx.rotate(ball.angle);
    ctx.save();ctx.shadowColor='rgba(255,255,200,0.5)';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(0,0,ball.r,0,Math.PI*2);ctx.fillStyle='white';ctx.fill();ctx.restore();
    ctx.beginPath();ctx.arc(0,0,ball.r,0,Math.PI*2);ctx.fillStyle='white';ctx.fill();ctx.strokeStyle='#999';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#1a1a1a';
    [[0,0],[0,-ball.r*.58],[ball.r*.55,-ball.r*.18],[ball.r*.34,ball.r*.47],[-ball.r*.34,ball.r*.47],[-ball.r*.55,-ball.r*.18]].forEach(([sx,sy])=>{
        ctx.beginPath();for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2-Math.PI/2,r=ball.r*.19;i===0?ctx.moveTo(sx+r*Math.cos(a),sy+r*Math.sin(a)):ctx.lineTo(sx+r*Math.cos(a),sy+r*Math.sin(a));}ctx.closePath();ctx.fill();
    });
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.ellipse(-5,-7,5,3.5,-.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
}

function drawParticles() {
    for(const p of particles){ctx.save();ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);ctx.fill();ctx.restore();}
}

function drawHUD() {
    ctx.fillStyle='rgba(0,0,0,0.55)';ctx.beginPath();ctx.roundRect(W/2-110,8,220,52,12);ctx.fill();
    ctx.textAlign='center';
    ctx.font='bold 38px Impact';ctx.fillStyle=p1.team.color;ctx.fillText(score1,W/2-42,48);
    ctx.fillStyle='rgba(255,255,255,0.55)';ctx.font='bold 28px Impact';ctx.fillText('-',W/2,46);
    ctx.font='bold 38px Impact';ctx.fillStyle=p2.team.color;ctx.fillText(score2,W/2+42,48);
    ctx.font='10px Arial';ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillText('FIRST TO '+WIN_SCORE,W/2,72);
    ctx.textAlign='left';ctx.font='bold 11px Arial';ctx.fillStyle=p1.team.light;
    ctx.fillText(p1.team.name.toUpperCase(),GOAL_W+8,19);
    ctx.font='italic 10px Arial';ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.fillText(p1.team.player,GOAL_W+8,31);
    ctx.font='10px Arial';ctx.fillStyle='rgba(255,255,255,0.28)';
    ctx.fillText('A/D  W=jump  S=kick',GOAL_W+8,43);
    ctx.textAlign='right';ctx.font='bold 11px Arial';ctx.fillStyle=p2.team.light;
    ctx.fillText(p2.team.name.toUpperCase(),W-GOAL_W-8,19);
    ctx.font='italic 10px Arial';ctx.fillStyle='rgba(255,255,255,0.55)';
    ctx.fillText(p2.team.player,W-GOAL_W-8,31);
    ctx.font='10px Arial';ctx.fillStyle='rgba(255,255,255,0.28)';
    ctx.fillText('←/→  ↑=jump  ↓=kick',W-GOAL_W-8,43);
}

function drawGoalFlash() {
    const progress=1-goalTimer/120, alpha=Math.sin(progress*Math.PI);
    ctx.save();ctx.globalAlpha=alpha*.3;ctx.fillStyle=goalScoredBy==='p1'?p1.team.color:p2.team.color;ctx.fillRect(0,0,W,H);ctx.restore();
    const scale=1+Math.sin(progress*Math.PI)*.25;
    ctx.save();ctx.translate(W/2,H/2-10);ctx.scale(scale,scale);ctx.textAlign='center';
    ctx.font='bold 80px Impact';ctx.strokeStyle='rgba(0,0,0,0.9)';ctx.lineWidth=7;
    ctx.strokeText('GOAL!',0,0);ctx.fillStyle='#ffdd00';ctx.fillText('GOAL!',0,0);ctx.restore();
}

function drawQuizButton() {
    const {x,y,w,h}=QUIZ_BTN;
    ctx.fillStyle='rgba(255,210,0,0.9)';ctx.beginPath();ctx.roundRect(x,y,w,h,8);ctx.fill();
    ctx.fillStyle='#000';ctx.font='bold 13px Impact';ctx.textAlign='center';
    ctx.fillText('QUIZ GAME',x+w/2,y+20);
}

// ── Team Select ───────────────────────────────────────────────────────────
function getTeamAt(col,row){return TEAMS[row*GRID_COLS+col]||null;}

function drawTeamSelect() {
    drawBackground();
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';ctx.font='bold 26px Impact';
    ctx.strokeStyle='#000';ctx.lineWidth=4;ctx.strokeText('WORLD CUP 2026 — SELECT YOUR TEAM',W/2,36);
    const tg=ctx.createLinearGradient(0,12,0,40);tg.addColorStop(0,'#ffee00');tg.addColorStop(1,'#ff8800');
    ctx.fillStyle=tg;ctx.fillText('WORLD CUP 2026 — SELECT YOUR TEAM',W/2,36);
    ctx.font='bold 12px Arial';
    ctx.fillStyle='#4488ff';ctx.textAlign='left';ctx.fillText('P1: WASD navigate   Space = confirm',14,60);
    ctx.fillStyle='#ff4444';ctx.textAlign='right';ctx.fillText('P2: Arrow keys navigate   Enter = confirm',W-14,60);

    for(let row=0;row<GRID_ROWS;row++){
        for(let col=0;col<GRID_COLS;col++){
            const team=getTeamAt(col,row);if(!team)continue;
            const cx=GRID_X+col*(CARD_W+CARD_GAP), cy=GRID_Y+row*(CARD_H+CARD_GAP);
            const isP1=sel1.col===col&&sel1.row===row, isP2=sel2.col===col&&sel2.row===row;
            ctx.fillStyle='rgba(18,18,30,0.8)';ctx.beginPath();ctx.roundRect(cx,cy,CARD_W,CARD_H,6);ctx.fill();
            if(isP1&&isP2){ctx.strokeStyle='#cc44ff';ctx.lineWidth=3;}
            else if(isP1){ctx.strokeStyle=sel1.confirmed?'#4488ff':'#88aaff';ctx.lineWidth=sel1.confirmed?3:2;}
            else if(isP2){ctx.strokeStyle=sel2.confirmed?'#ff4444':'#ff8888';ctx.lineWidth=sel2.confirmed?3:2;}
            else{ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=1;}
            ctx.beginPath();ctx.roundRect(cx,cy,CARD_W,CARD_H,6);ctx.stroke();
            const fx=cx+8,fy=cy+6,fw=CARD_W-16,fh=42;
            ctx.save();ctx.beginPath();ctx.roundRect(fx,fy,fw,fh,3);ctx.clip();team.drawFlag(ctx,fx,fy,fw,fh);ctx.restore();
            ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(fx,fy,fw,fh,3);ctx.stroke();
            ctx.textAlign='center';ctx.fillStyle='white';ctx.font='bold 11px Arial';ctx.fillText(team.name,cx+CARD_W/2,cy+60);
            ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='italic 10px Arial';ctx.fillText(team.player,cx+CARD_W/2,cy+72);
            ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Arial';ctx.fillText(team.abbr,cx+CARD_W/2,cy+83);
            if(isP1){ctx.fillStyle=sel1.confirmed?'#4488ff':'rgba(68,136,255,0.7)';ctx.font='bold 8px Arial';ctx.textAlign='left';ctx.fillText('P1',cx+4,cy+12);}
            if(isP2){ctx.fillStyle=sel2.confirmed?'#ff4444':'rgba(255,68,68,0.7)';ctx.font='bold 8px Arial';ctx.textAlign='right';ctx.fillText('P2',cx+CARD_W-4,cy+12);}
        }
    }
    ctx.textAlign='center';
    if(sel1.confirmed&&sel2.confirmed){
        const pulse=.65+.35*Math.sin(Date.now()/280);ctx.globalAlpha=pulse;ctx.font='bold 20px Impact';ctx.fillStyle='#ffdd00';
        ctx.fillText('PRESS SPACE OR ENTER TO KICK OFF!',W/2,H-14);ctx.globalAlpha=1;
    } else {
        ctx.font='13px Arial';ctx.fillStyle='rgba(255,255,255,0.4)';
        ctx.fillText((sel1.confirmed?`P1: ${p1Team.name} ready!`:'P1: choose & press Space')+'     |     '+(sel2.confirmed?`P2: ${p2Team.name} ready!`:'P2: choose & press Enter'),W/2,H-14);
    }
    drawQuizButton();
}

function drawGameOver() {
    ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';
    const winTeam=winner==='PLAYER 1'?p1.team:p2.team;
    ctx.font='bold 62px Impact';ctx.strokeStyle='#000';ctx.lineWidth=6;
    ctx.strokeText(winner+' WINS!',W/2,H/2-30);ctx.fillStyle=winTeam.color;ctx.fillText(winner+' WINS!',W/2,H/2-30);
    ctx.save();ctx.beginPath();ctx.roundRect(W/2-45,H/2-8,90,58,5);ctx.clip();winTeam.drawFlag(ctx,W/2-45,H/2-8,90,58);ctx.restore();
    ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(W/2-45,H/2-8,90,58,5);ctx.stroke();
    ctx.font='18px Arial';ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText(p1.team.name+' '+score1+' - '+score2+' '+p2.team.name,W/2,H/2+68);
    const pulse=.65+.35*Math.sin(Date.now()/320);ctx.globalAlpha=pulse;ctx.font='bold 18px Impact';ctx.fillStyle='#ffdd00';
    ctx.fillText('PRESS SPACE TO CHOOSE TEAMS',W/2,H/2+96);ctx.globalAlpha=1;
}

// ── Quiz Drawing ──────────────────────────────────────────────────────────
function drawQuizOverlay() {
    // Background
    const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#000820');bg.addColorStop(1,'#001040');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

    // Star field
    ctx.fillStyle='rgba(255,255,255,0.4)';
    for(let i=0;i<60;i++){const x=(i*137.5)%W,y=(i*73.1)%H;ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}

    if(quiz.gs==='idle') { drawQuizIdle(); return; }
    if(quiz.gs==='won')  { drawQuizEnd(true); return; }
    if(quiz.gs==='lost') { drawQuizEnd(false); return; }

    // Prize ladder (right panel)
    const LX=612, LW=183;
    ctx.fillStyle='rgba(0,0,50,0.7)';ctx.beginPath();ctx.roundRect(LX,5,LW,470,8);ctx.fill();
    ctx.strokeStyle='rgba(100,150,255,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(LX,5,LW,470,8);ctx.stroke();
    ctx.textAlign='center';ctx.font='bold 11px Arial';ctx.fillStyle='#aabbff';ctx.fillText('PRIZE LADDER',LX+LW/2,22);
    for(let i=14;i>=0;i--){
        const rowY=28+(14-i)*29;
        const isCurrent=quiz.level===i;
        const isWon=quiz.level>i;
        const isSafe=SAFE_LEVELS.includes(i);
        if(isCurrent){ctx.fillStyle='rgba(255,200,0,0.3)';ctx.beginPath();ctx.roundRect(LX+4,rowY,LW-8,26,4);ctx.fill();}
        else if(isSafe){ctx.fillStyle='rgba(255,100,0,0.12)';ctx.beginPath();ctx.roundRect(LX+4,rowY,LW-8,26,4);ctx.fill();}
        const numColor=isCurrent?'#ffdd00':isWon?'rgba(255,255,255,0.35)':isSafe?'#ff8844':'rgba(200,220,255,0.7)';
        ctx.textAlign='left';ctx.font=isCurrent?'bold 12px Arial':'11px Arial';ctx.fillStyle=numColor;
        ctx.fillText(''+(i+1),LX+10,rowY+18);
        ctx.textAlign='right';ctx.fillStyle=numColor;
        ctx.fillText(PRIZES[i],LX+LW-8,rowY+18);
        if(isSafe){ctx.fillStyle=isCurrent?'#ffdd00':'#ff8844';ctx.font='9px Arial';ctx.textAlign='center';ctx.fillText('✦',LX+LW/2,rowY+18);}
    }

    const q=quiz.qs[quiz.level];
    const boxes=getAnswerBoxes();

    // Question box
    ctx.fillStyle='rgba(0,10,60,0.85)';ctx.beginPath();ctx.roundRect(8,10,595,130,10);ctx.fill();
    ctx.strokeStyle='rgba(100,150,255,0.5)';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(8,10,595,130,10);ctx.stroke();
    ctx.fillStyle='rgba(100,150,255,0.15)';ctx.fillRect(8,10,595,28);
    ctx.textAlign='left';ctx.font='bold 11px Arial';ctx.fillStyle='#aabbff';
    ctx.fillText(`Question ${quiz.level+1} of 15   —   ${PRIZES[quiz.level]}`,18,27);
    ctx.fillStyle='white';ctx.font='bold 15px Arial';
    wrapText(q.q,18,52,580,22,4);

    // Answer boxes
    const labels=['A','B','C','D'];
    boxes.forEach((b,i)=>{
        const isElim=quiz.elim.includes(i);
        const isSel=quiz.sel===i;
        const correct=q.a;
        let fill='rgba(0,20,90,0.85)',stroke='rgba(80,130,255,0.6)',textCol='white';
        if(isElim){fill='rgba(5,5,25,0.7)';stroke='rgba(30,30,60,0.4)';textCol='rgba(255,255,255,0.2)';}
        else if(quiz.phase==='locking'&&isSel){fill='rgba(180,140,0,0.8)';stroke='#ffdd00';textCol='#000';}
        else if(quiz.phase==='revealing'||quiz.phase==='done'){
            if(i===correct){fill='rgba(0,120,0,0.85)';stroke='#00ff66';textCol='white';}
            else if(isSel&&i!==correct){fill='rgba(150,0,0,0.85)';stroke='#ff4444';textCol='white';}
        }
        ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,8);ctx.fill();
        ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,8);ctx.stroke();
        ctx.fillStyle=textCol;
        ctx.textAlign='left';ctx.font='bold 13px Arial';ctx.fillText(labels[i]+':',b.x+12,b.y+37);
        ctx.font='12px Arial';
        const optText=q.o[i];
        const maxW=b.w-52;
        ctx.fillText(ctx.measureText(optText).width>maxW?optText.substring(0,Math.floor(optText.length*maxW/ctx.measureText(optText).width)-1)+'…':optText,b.x+38,b.y+37);
    });

    // Audience bar chart
    if(quiz.audience){
        const bars=['A','B','C','D'];const bx=10,by=295,bw=60,maxH=50;
        ctx.fillStyle='rgba(0,0,0,0.4)';ctx.beginPath();ctx.roundRect(bx-4,by-56,292,76,6);ctx.fill();
        ctx.font='10px Arial';ctx.fillStyle='rgba(255,255,255,0.5)';ctx.textAlign='left';ctx.fillText('Audience vote:',bx,by-43);
        bars.forEach((label,i)=>{
            const pct=quiz.audience[i],h=Math.round(pct/100*maxH);
            const barX=bx+i*70;
            ctx.fillStyle=`hsl(${220+i*30},80%,${quiz.elim.includes(i)?20:50}%)`;
            ctx.fillRect(barX,by-h,bw,h);
            ctx.fillStyle='white';ctx.font='bold 10px Arial';ctx.textAlign='center';
            ctx.fillText(pct+'%',barX+bw/2,by-h-3);
            ctx.fillText(label,barX+bw/2,by+12);
        });
    }

    // Phone hint
    if(quiz.phoneTimer>0){
        quiz.phoneTimer--;
        ctx.fillStyle='rgba(0,0,0,0.7)';ctx.beginPath();ctx.roundRect(10,290,590,50,8);ctx.fill();
        ctx.strokeStyle='rgba(100,200,100,0.5)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(10,290,590,50,8);ctx.stroke();
        ctx.textAlign='left';ctx.font='bold 13px Arial';ctx.fillStyle='#88ff88';
        ctx.fillText(`📞 Your friend says: "I'm pretty sure it's ${labels[q.a]}: ${q.o[q.a]}"`,20,322);
    }

    // Lifelines
    const LL=[['50:50',quiz.lifelines.fifty,'#ffcc00'],['📞 Phone',quiz.lifelines.phone,'#44ff88'],['👥 Audience',quiz.lifelines.audience,'#44aaff']];
    if(!quiz.audience&&quiz.phoneTimer===0){
        LL.forEach(([lbl,avail,col],i)=>{
            const bx2=10+i*95,by2=300;
            ctx.fillStyle=avail?col:'rgba(60,60,60,0.6)';
            ctx.globalAlpha=avail?1:.4;ctx.beginPath();ctx.roundRect(bx2,by2,88,32,6);ctx.fill();
            ctx.globalAlpha=1;ctx.fillStyle=avail?'#000':'#555';ctx.font='bold 10px Arial';ctx.textAlign='center';
            ctx.fillText(lbl,bx2+44,by2+20);
        });
    }

    // Walk away button
    if(quiz.phase==='pick'&&quiz.level>0){
        ctx.fillStyle='rgba(150,50,0,0.8)';ctx.beginPath();ctx.roundRect(10,345,120,30,6);ctx.fill();
        ctx.fillStyle='white';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText('Walk Away',70,364);
        ctx.font='9px Arial';ctx.fillStyle='rgba(255,200,100,0.8)';ctx.fillText(quizGuaranteed(),70,374);
    }

    // Back to soccer button
    ctx.fillStyle='rgba(40,40,80,0.8)';ctx.beginPath();ctx.roundRect(10,H-38,100,28,6);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText('← Soccer',60,H-20);

    // Keyboard hint
    ctx.font='9px Arial';ctx.fillStyle='rgba(255,255,255,0.2)';ctx.textAlign='center';
    ctx.fillText('Click an answer to select   •   1/2/3/4 keys also work',300,H-8);
}

function wrapText(text, x, y, maxW, lineH, maxLines) {
    const words=text.split(' ');let line='',startY=y,lines=0;
    for(const word of words){
        const test=line+word+' ';
        if(ctx.measureText(test).width>maxW&&line!==''){
            if(lines<maxLines-1){ctx.fillText(line,x,startY);line=word+' ';startY+=lineH;lines++;}
            else{ctx.fillText(line+(line?'…':''),x,startY);return;}
        } else line=test;
    }
    ctx.fillText(line,x,startY);
}

function drawQuizIdle() {
    ctx.textAlign='center';
    ctx.font='bold 52px Impact';ctx.strokeStyle='#000';ctx.lineWidth=5;ctx.strokeText('WHO WANTS TO BE',W/2,H/2-80);
    const g1=ctx.createLinearGradient(0,H/2-120,0,H/2-60);g1.addColorStop(0,'#ffdd00');g1.addColorStop(1,'#ff8800');
    ctx.fillStyle=g1;ctx.fillText('WHO WANTS TO BE',W/2,H/2-80);
    ctx.font='bold 44px Impact';ctx.strokeText('A MILLIONAIRE?',W/2,H/2-28);
    ctx.fillStyle=g1;ctx.fillText('A MILLIONAIRE?',W/2,H/2-28);
    ctx.font='16px Arial';ctx.fillStyle='rgba(255,255,255,0.6)';ctx.fillText('15 questions • 3 lifelines • First to $1,000,000',W/2,H/2+20);
    ctx.fillText('Click answers or press 1/2/3/4 to select',W/2,H/2+44);
    const pulse=.65+.35*Math.sin(Date.now()/350);ctx.globalAlpha=pulse;ctx.font='bold 22px Impact';ctx.fillStyle='#ffdd00';ctx.fillText('CLICK TO START',W/2,H/2+96);ctx.globalAlpha=1;
    ctx.fillStyle='rgba(40,40,80,0.8)';ctx.beginPath();ctx.roundRect(10,H-38,100,28,6);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 11px Arial';ctx.fillText('← Soccer',60,H-20);
}

function drawQuizEnd(won) {
    ctx.textAlign='center';
    const prize=won?PRIZES[14]:(quiz.walked?quizGuaranteed():quizGuaranteed());
    ctx.font='bold 52px Impact';ctx.strokeStyle='#000';ctx.lineWidth=5;
    const msg=won?'YOU WIN '+PRIZES[14]+'!':quiz.walked?'You walked away with '+prize:prize==='$0'?'Better luck next time!':'You take home '+prize;
    ctx.strokeText(msg,W/2,H/2-40);ctx.fillStyle=won?'#ffdd00':'#ff8888';ctx.fillText(msg,W/2,H/2-40);
    if(!won&&!quiz.walked){
        const q=quiz.qs[quiz.level];ctx.font='16px Arial';ctx.fillStyle='rgba(255,255,255,0.6)';
        ctx.fillText(`The answer was: ${['A','B','C','D'][q.a]}) ${q.o[q.a]}`,W/2,H/2+10);
    }
    ctx.fillStyle='rgba(255,200,0,0.9)';ctx.beginPath();ctx.roundRect(260,360,280,36,8);ctx.fill();
    ctx.fillStyle='#000';ctx.font='bold 16px Impact';ctx.fillText('PLAY AGAIN / BACK TO SOCCER',400,383);
}

// ── Update ────────────────────────────────────────────────────────────────
function updateTeamSelect() {
    if(!sel1.confirmed){
        if(justPressed('KeyA'))sel1.col=(sel1.col-1+GRID_COLS)%GRID_COLS;
        if(justPressed('KeyD'))sel1.col=(sel1.col+1)%GRID_COLS;
        if(justPressed('KeyW'))sel1.row=(sel1.row-1+GRID_ROWS)%GRID_ROWS;
        if(justPressed('KeyS'))sel1.row=(sel1.row+1)%GRID_ROWS;
        if(justPressed('Space')){const t=getTeamAt(sel1.col,sel1.row);if(t){p1Team=t;sel1.confirmed=true;}}
    } else {
        if(justPressed('KeyA')||justPressed('KeyD')||justPressed('KeyW')||justPressed('KeyS'))sel1.confirmed=false;
    }
    if(!sel2.confirmed){
        if(justPressed('ArrowLeft')) sel2.col=(sel2.col-1+GRID_COLS)%GRID_COLS;
        if(justPressed('ArrowRight'))sel2.col=(sel2.col+1)%GRID_COLS;
        if(justPressed('ArrowUp'))   sel2.row=(sel2.row-1+GRID_ROWS)%GRID_ROWS;
        if(justPressed('ArrowDown')) sel2.row=(sel2.row+1)%GRID_ROWS;
        if(justPressed('Enter')||justPressed('NumpadEnter')){const t=getTeamAt(sel2.col,sel2.row);if(t){p2Team=t;sel2.confirmed=true;}}
    } else {
        if(justPressed('ArrowLeft')||justPressed('ArrowRight')||justPressed('ArrowUp')||justPressed('ArrowDown'))sel2.confirmed=false;
    }
    if(sel1.confirmed&&sel2.confirmed){
        if(justPressed('Space')||justPressed('Enter')||justPressed('NumpadEnter')){score1=0;score2=0;resetEntities();gameState='playing';}
    }
}

function updateQuiz() {
    if(quiz.gs!=='playing')return;
    // Keyboard 1/2/3/4 for answers
    if(quiz.phase==='pick'){
        ['Digit1','Digit2','Digit3','Digit4'].forEach((code,i)=>{
            if(justPressed(code)&&!quiz.elim.includes(i)){quiz.sel=i;quiz.phase='locking';quiz.phaseTimer=55;}
        });
        // Escape to close
        if(justPressed('Escape')){quiz.open=false;gameState=quiz.prevGameState;}
    }
    if(quiz.phase==='locking'){
        quiz.phaseTimer--;
        if(quiz.phaseTimer<=0){
            quiz.phase='revealing';quiz.phaseTimer=80;
        }
    }
    if(quiz.phase==='revealing'){
        quiz.phaseTimer--;
        if(quiz.phaseTimer<=0){
            if(quiz.sel===quiz.qs[quiz.level].a){
                if(quiz.level===14){quiz.gs='won';}
                else{quiz.level++;quiz.sel=-1;quiz.elim=[];quiz.audience=null;quiz.phoneTimer=0;quiz.phase='pick';}
            } else {quiz.gs='lost';}
        }
    }
}

function update() {
    if(quiz.open){updateQuiz();Object.assign(prevKeys,keys);return;}
    if(gameState==='teamSelect'){updateTeamSelect();}
    else if(gameState==='gameover'){
        updateParticles();
        if(justPressed('Space')){sel1.confirmed=false;sel2.confirmed=false;gameState='teamSelect';}
    }
    else if(gameState==='goal'){
        updateParticles();goalTimer--;
        if(goalTimer<=0){gameState='playing';resetEntities();}
    }
    else{
        updatePlayer(p1,'KeyA','KeyD','KeyW','KeyS');
        updatePlayer(p2,'ArrowLeft','ArrowRight','ArrowUp','ArrowDown');
        updateBall();ballPlayerCollision(p1);ballPlayerCollision(p2);playerPlayerCollision();updateParticles();
        const goal=checkGoal();
        if(goal){
            if(goal==='p1'){score1++;goalScoredBy='p1';}else{score2++;goalScoredBy='p2';}
            spawnGoalParticles();goalTimer=120;
            if(score1>=WIN_SCORE){winner='PLAYER 1';gameState='gameover';}
            else if(score2>=WIN_SCORE){winner='PLAYER 2';gameState='gameover';}
            else gameState='goal';
        }
    }
    Object.assign(prevKeys,keys);
}

function draw() {
    ctx.clearRect(0,0,W,H);
    if(quiz.open){drawQuizOverlay();return;}
    if(gameState==='teamSelect'){drawTeamSelect();return;}
    drawBackground();drawGoals();drawParticles();
    drawPlayer(p1,p1.team.player);
    drawPlayer(p2,p2.team.player);
    drawBall();drawHUD();
    if(gameState==='goal')drawGoalFlash();
    if(gameState==='gameover')drawGameOver();
    drawQuizButton();
}

function resize(){
    const scale=Math.min(window.innerWidth/W,window.innerHeight/H);
    canvas.style.width=W*scale+'px';canvas.style.height=H*scale+'px';
}
window.addEventListener('resize',resize);resize();
function loop(){update();draw();requestAnimationFrame(loop);}
loop();
