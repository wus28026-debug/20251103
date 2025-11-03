let questions = [];
let currentQuestions = [];
let currentAnswers = [];
let score = 0;
let questionIndex = 0;
let testStarted = false;
let testFinished = false;
let feedback = "";
let particles = [];
let welcomeParticles = [];
let correctParticles = [];

// 粒子系統設置
const WELCOME_PARTICLES = 100;
const CORRECT_PARTICLES = 30;
const RESULT_PARTICLES = 50;

function preload() {
  loadQuestions();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  selectRandomQuestions();
  createWelcomeParticles(); // 創建開場特效
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(230, 240, 255);
  
  if (!testStarted) {
    displayStartScreen();
  } else if (!testFinished) {
    displayQuestion();
  } else {
    displayResults();
  }
  
  updateAllParticles(); // 更新所有特效
}

function loadQuestions() {
  loadTable('questions.csv', 'csv', 'header', (table) => {
    for (let row of table.rows) {
      let options = [
        { text: row.get('選項A'), isCorrect: row.get('正確答案') === 'A' },
        { text: row.get('選項B'), isCorrect: row.get('正確答案') === 'B' },
        { text: row.get('選項C'), isCorrect: row.get('正確答案') === 'C' },
        { text: row.get('選項D'), isCorrect: row.get('正確答案') === 'D' }
      ];
      questions.push({
        question: row.get('題目'),
        options: options,
        shuffledOptions: null // 將在選擇題目時重新打亂
      });
    }
  });
}

function shuffleArray(array) {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function selectRandomQuestions() {
  let shuffled = [...questions];
  shuffleArray(shuffled);
  currentQuestions = shuffled.slice(0, 4);
  
  // 為每個選出的題目打亂選項順序
  currentQuestions.forEach(q => {
    q.shuffledOptions = shuffleArray([...q.options]);
  });
}

function displayStartScreen() {
  textSize(32);
  fill(0);
  text("點擊開始測驗", width/2, height/2);
}

function displayQuestion() {
  let q = currentQuestions[questionIndex];
  
  // 計算題目區域的垂直位置（在畫面中心偏上）
  let centerY = height * 0.4;
  let spacing = height * 0.1; // 選項之間的間距
  
  // 顯示題目（較大字型）
  textSize(32);
  fill(0);
  text(q.question, width/2, centerY);
  
  // 顯示選項
  let optionWidth = min(width * 0.6, 800); // 選項寬度最大值為800像素
  
  for (let i = 0; i < 4; i++) {
    let y = centerY + spacing * (i + 1.5);
    let isHover = mouseX > width/2 - optionWidth/2 && mouseX < width/2 + optionWidth/2 &&
                  mouseY > y - 30 && mouseY < y + 30;
    
    // 選項背景
    fill(isHover ? color(200, 220, 255) : 255);
    rect(width/2 - optionWidth/2, y - 30, optionWidth, 60, 10);
    
    // 選項文字
    textSize(24);
    fill(0);
    text(String.fromCharCode(65 + i) + ". " + q.shuffledOptions[i].text, width/2, y);
  }
}

function displayResults() {
  textSize(48);
  fill(0);
  text(`測驗完成！`, width/2, height * 0.35);
  
  textSize(36);
  text(`得分：${score}/4`, width/2, height * 0.45);
  
  textSize(32);
  text(feedback, width/2, height * 0.55);
}

function mouseClicked() {
  if (!testStarted) {
    testStarted = true;
    welcomeParticles = []; // 清除開場特效
    return;
  }
  
  if (!testFinished) {
    let q = currentQuestions[questionIndex];
    let centerY = height * 0.4;
    let spacing = height * 0.1;
    let optionWidth = min(width * 0.6, 800);
    
    for (let i = 0; i < 4; i++) {
      let y = centerY + spacing * (i + 1.5);
      if (mouseX > width/2 - optionWidth/2 && mouseX < width/2 + optionWidth/2 &&
          mouseY > y - 30 && mouseY < y + 30) {
        
        if (q.shuffledOptions[i].isCorrect) {
          score++;
          // 在點擊位置產生正確答案特效
          createCorrectParticles(mouseX, y);
        }
        currentAnswers.push(i);
        
        if (questionIndex < 3) {
          questionIndex++;
        } else {
          testFinished = true;
          generateFeedback();
          createResultParticles(); // 使用新的結果特效函數
        }
        break;
      }
    }
  }
}

function generateFeedback() {
  if (score === 4) {
    feedback = "太棒了！完美的表現！";
  } else if (score >= 3) {
    feedback = "做得很好！繼續保持！";
  } else if (score >= 2) {
    feedback = "還不錯，但還有進步空間！";
  } else {
    feedback = "需要多加油！別灰心！";
  }
}

function createParticle(type, x, y) {
  let particle = {
    x: x || random(width),
    y: y || random(height),
    vx: random(-2, 2),
    vy: random(-2, 2),
    size: random(5, 15),
    alpha: 255,
    decay: random(0.02, 0.05),
    color: color(random(255), random(255), random(255))
  };

  switch(type) {
    case 'welcome':
      particle.vy = random(-1, -3); // 向上飄動
      particle.vx = random(-1, 1);
      particle.color = color(random([
        '#FFD700', // 金色
        '#FF69B4', // 粉紅
        '#4169E1', // 寶藍
        '#32CD32'  // 翠綠
      ]));
      break;
    case 'correct':
      particle.vy = random(-5, -8); // 快速向上
      particle.vx = random(-2, 2);
      particle.size = random(10, 20);
      particle.color = color(random([
        '#FFD700', // 金色
        '#FFA500', // 橙色
        '#00FF00', // 亮綠
        '#87CEEB'  // 天藍
      ]));
      break;
    case 'result':
      // 原有的隨機顏色效果
      break;
  }
  return particle;
}

function createWelcomeParticles() {
  for (let i = 0; i < WELCOME_PARTICLES; i++) {
    welcomeParticles.push(createParticle('welcome'));
  }
}

function createCorrectParticles(x, y) {
  for (let i = 0; i < CORRECT_PARTICLES; i++) {
    correctParticles.push(createParticle('correct', x, y));
  }
}

function createResultParticles() {
  for (let i = 0; i < RESULT_PARTICLES; i++) {
    particles.push(createParticle('result'));
  }
}

function updateParticleSystem(particleArray, removeParticles = true) {
  for (let i = particleArray.length - 1; i >= 0; i--) {
    let p = particleArray[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.alpha * p.decay;
    
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
    
    // 設定透明度
    p.color.setAlpha(p.alpha);
    fill(p.color);
    noStroke();
    circle(p.x, p.y, p.size);
    
    // 移除消失的粒子
    if (removeParticles && p.alpha < 5) {
      particleArray.splice(i, 1);
    }
  }
}

function updateAllParticles() {
  // 更新所有粒子系統
  updateParticleSystem(welcomeParticles);
  updateParticleSystem(correctParticles);
  updateParticleSystem(particles, false);
  
  // 補充歡迎粒子
  if (!testStarted && welcomeParticles.length < WELCOME_PARTICLES / 2) {
    createWelcomeParticles();
  }
}
