// MindCare Mental Health, Self-Assessment & Wellness Support

export function initMindCare() {
  setupAssessmentQuiz();
  setupBreathingExercise();
  setupPeerSupportChat();
}

// 1. Interactive Assessment Quiz
const quizQuestions = [
  {
    id: "q1",
    text: "1. Over the past 2 weeks, how often have you felt nervous, anxious, or on edge?",
    options: [
      { text: "Not at all", score: 0 },
      { text: "Several days", score: 1 },
      { text: "More than half the days", score: 2 },
      { text: "Nearly every day", score: 3 }
    ]
  },
  {
    id: "q2",
    text: "2. Not being able to stop or control worrying?",
    options: [
      { text: "Not at all", score: 0 },
      { text: "Several days", score: 1 },
      { text: "More than half the days", score: 2 },
      { text: "Nearly every day", score: 3 }
    ]
  },
  {
    id: "q3",
    text: "3. Little interest or pleasure in doing things you usually enjoy?",
    options: [
      { text: "Not at all", score: 0 },
      { text: "Several days", score: 1 },
      { text: "More than half the days", score: 2 },
      { text: "Nearly every day", score: 3 }
    ]
  },
  {
    id: "q4",
    text: "4. Feeling down, depressed, overwhelmed, or hopeless?",
    options: [
      { text: "Not at all", score: 0 },
      { text: "Several days", score: 1 },
      { text: "More than half the days", score: 2 },
      { text: "Nearly every day", score: 3 }
    ]
  }
];

let userScores = { q1: null, q2: null, q3: null, q4: null };

function setupAssessmentQuiz() {
  const quizForm = document.getElementById('mindcare-quiz-form');
  const quizQuestionsContainer = document.getElementById('quiz-questions-list');
  const quizResultsCard = document.getElementById('quiz-results-card');
  const retakeBtn = document.getElementById('retake-quiz-btn');

  if (!quizQuestionsContainer) return;

  quizQuestionsContainer.innerHTML = quizQuestions.map((q, qIndex) => `
    <div class="quiz-question-block" data-qid="${q.id}">
      <p class="quiz-q-title">${q.text}</p>
      <div class="quiz-options-group">
        ${q.options.map((opt, optIndex) => `
          <label class="quiz-option-pill">
            <input type="radio" name="${q.id}" value="${opt.score}" required />
            <span>${opt.text}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let total = 0;
      let allAnswered = true;

      quizQuestions.forEach(q => {
        const checked = quizForm.querySelector(`input[name="${q.id}"]:checked`);
        if (!checked) {
          allAnswered = false;
        } else {
          total += parseInt(checked.value, 10);
        }
      });

      if (!allAnswered) return;

      displayQuizResults(total);
    });
  }

  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      if (quizForm) quizForm.reset();
      if (quizResultsCard) quizResultsCard.style.display = 'none';
      if (quizQuestionsContainer) quizQuestionsContainer.style.display = 'block';
      const submitBtn = document.getElementById('calculate-quiz-score-btn');
      if (submitBtn) submitBtn.style.display = 'inline-flex';
    });
  }
}

function displayQuizResults(score) {
  const quizQuestionsContainer = document.getElementById('quiz-questions-list');
  const quizResultsCard = document.getElementById('quiz-results-card');
  const submitBtn = document.getElementById('calculate-quiz-score-btn');
  const scoreValue = document.getElementById('quiz-score-value');
  const scoreBadge = document.getElementById('quiz-score-badge');
  const scoreAdvice = document.getElementById('quiz-score-advice');
  const actionBtn = document.getElementById('quiz-action-btn');

  if (quizQuestionsContainer) quizQuestionsContainer.style.display = 'none';
  if (submitBtn) submitBtn.style.display = 'none';
  if (quizResultsCard) quizResultsCard.style.display = 'block';

  if (scoreValue) scoreValue.textContent = `${score} / 12`;

  let tier = '';
  let badgeClass = '';
  let advice = '';

  if (score <= 2) {
    tier = 'Resilient / Minimal Distress';
    badgeClass = 'badge-green';
    advice = 'Your responses reflect healthy resilience and manageable stress levels. Keep up your healthy sleep routines, stay hydrated, and maintain social connections!';
  } else if (score <= 5) {
    tier = 'Mild Stress & Academic Fatigue';
    badgeClass = 'badge-yellow';
    advice = 'You may be experiencing typical college exam fatigue or situational stress. Consider practicing the 4-7-8 breathing exercise below, joining our weekly mindfulness circles, or scheduling a quick check-in with a peer mentor.';
  } else if (score <= 8) {
    tier = 'Moderate Anxiety / Low Mood';
    badgeClass = 'badge-orange';
    advice = 'Your score indicates noticeable emotional strain. You do not have to carry this alone. Confidential, zero-cost support is available with Dr. Elena Rostova and our licensed counselors at the Wellness Pavilion.';
  } else {
    tier = 'High Emotional Strain';
    badgeClass = 'badge-red';
    advice = 'You are experiencing significant distress. Please remember your mental health is as essential as your physical health. Free same-day walk-in crisis counseling is available right now at Student Wellness Pavilion, Suite 204. You can also dial/text 988 anytime 24/7.';
  }

  if (scoreBadge) {
    scoreBadge.textContent = tier;
    scoreBadge.className = `score-tier-badge ${badgeClass}`;
  }
  if (scoreAdvice) scoreAdvice.textContent = advice;

  if (actionBtn) {
    actionBtn.onclick = () => {
      const target = document.getElementById('professionals') || document.getElementById('campus-map');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    };
  }
}

// 2. Guided 4-7-8 Breathing Circle
let breathingInterval = null;
let isBreathingActive = false;

function setupBreathingExercise() {
  const startBtn = document.getElementById('start-breathing-btn');
  const circle = document.getElementById('breathing-circle-pacer');
  const instruction = document.getElementById('breathing-instruction-text');
  const timer = document.getElementById('breathing-timer-count');

  if (!startBtn || !circle) return;

  startBtn.addEventListener('click', () => {
    if (isBreathingActive) {
      stopBreathing();
    } else {
      startBreathing();
    }
  });

  function startBreathing() {
    isBreathingActive = true;
    startBtn.innerHTML = `<span>⏹ Stop Exercise</span>`;
    startBtn.classList.add('btn-active');
    runBreathingCycle();
  }

  function stopBreathing() {
    isBreathingActive = false;
    clearTimeout(breathingInterval);
    circle.className = 'breathing-circle';
    if (instruction) instruction.textContent = 'Click Start to begin 4-7-8 breathwork';
    if (timer) timer.textContent = 'Ready';
    startBtn.innerHTML = `<span>▶ Begin Breathwork</span>`;
    startBtn.classList.remove('btn-active');
  }

  function runBreathingCycle() {
    if (!isBreathingActive) return;

    // Step 1: Inhale (4s)
    circle.className = 'breathing-circle inhale';
    if (instruction) instruction.textContent = 'Inhale slowly through your nose...';
    countdownStep(4, () => {
      if (!isBreathingActive) return;
      // Step 2: Hold (7s)
      circle.className = 'breathing-circle hold';
      if (instruction) instruction.textContent = 'Hold your breath gently...';
      countdownStep(7, () => {
        if (!isBreathingActive) return;
        // Step 3: Exhale (8s)
        circle.className = 'breathing-circle exhale';
        if (instruction) instruction.textContent = 'Exhale gently through your mouth...';
        countdownStep(8, () => {
          if (!isBreathingActive) return;
          runBreathingCycle();
        });
      });
    });
  }

  function countdownStep(seconds, onComplete) {
    let count = seconds;
    if (timer) timer.textContent = `${count}s`;

    const tick = () => {
      if (!isBreathingActive) return;
      count--;
      if (count > 0) {
        if (timer) timer.textContent = `${count}s`;
        breathingInterval = setTimeout(tick, 1000);
      } else {
        onComplete();
      }
    };
    breathingInterval = setTimeout(tick, 1000);
  }
}

// 3. Anonymous Peer Support Chat
export function setupPeerSupportChat() {
  const openChatBtn = document.getElementById('open-peer-chat-btn');
  const chatModal = document.getElementById('peer-chat-modal');
  const closeChatBtn = document.getElementById('close-peer-chat-modal');
  const chatForm = document.getElementById('peer-chat-form');
  const chatInput = document.getElementById('peer-chat-input');
  const messagesArea = document.getElementById('peer-chat-messages');

  if (openChatBtn && chatModal) {
    openChatBtn.addEventListener('click', () => {
      chatModal.classList.add('active');
    });
  }

  if (closeChatBtn && chatModal) {
    closeChatBtn.addEventListener('click', () => {
      chatModal.classList.remove('active');
    });
  }

  if (chatForm && chatInput && messagesArea) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userText = chatInput.value.trim();
      if (!userText) return;

      appendChatMessage('user', userText);
      chatInput.value = '';

      // Simulate typing indicator & empathetic peer response
      setTimeout(() => {
        const reply = generatePeerReply(userText);
        appendChatMessage('peer', reply);
      }, 1200);
    });
  }

  function appendChatMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-bubble ${sender}-bubble`;
    msgDiv.innerHTML = `
      <div class="bubble-sender">${sender === 'user' ? 'You (Anonymous Student)' : '🌿 Campus Peer Counselor'}</div>
      <div class="bubble-content">${text}</div>
    `;
    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function generatePeerReply(input) {
    const lower = input.toLowerCase();
    if (lower.includes('exam') || lower.includes('study') || lower.includes('grade') || lower.includes('fail')) {
      return "Exam pressure can feel overwhelming, but please remember your worth is never defined by a letter grade. Would you like to practice the 4-7-8 breathing exercise, or book a quick strategy session with our academic wellness coach?";
    }
    if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia')) {
      return "Sleep disruption is very common during midterms and finals. Try keeping your room dark, avoid screens 45 mins before bed, and check out our free chamomile tea bar at the Wellness Pavilion!";
    }
    if (lower.includes('sad') || lower.includes('depress') || lower.includes('lonely') || lower.includes('cry')) {
      return "I hear you, and it takes real strength to acknowledge feeling this way. You are not alone on this campus. Dr. Elena Rostova and our team are here without any judgment. You can also drop by the MindCare Lounge anytime today for quiet rest and peer company.";
    }
    if (lower.includes('crisis') || lower.includes('suicid') || lower.includes('hurt') || lower.includes('end it')) {
      return "Please stay with us. Your life has immense value and there is support right this second. Please call or text 988 (free 24/7) or campus emergency at (555) 019-0911. We care about you deeply.";
    }
    return "Thank you for reaching out and sharing. Remember that taking care of your mental well-being is just as vital as physical fitness. Our counselors offer 10 free 100% confidential sessions each year. Would you like to book a slot?";
  }
}
