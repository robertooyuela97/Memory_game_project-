document.addEventListener('DOMContentLoaded', () => {
  const gameBoard = document.getElementById('game-board');
  const attemptsLeftSpan = document.getElementById('attempts-left');
  const timeLeftSpan = document.getElementById('time-left');
  const victorySound = document.getElementById('victory-sound');
  const defeatSound = document.getElementById('defeat-sound');
  const backgroundMusic = document.getElementById('background-music');

  // ===== SFX opcionales/adicionales =====
  const flipSound = document.getElementById('flip-sound') || null;
  const matchSound = document.getElementById('match-sound') || null;      // opcional
  const mismatchSound = document.getElementById('mismatch-sound') || null;  // opcional

  // Helper para reproducir efectos (permite solapar reproducciones)
  function playSfx(el, volume = 1.0) {
    if (!el) return;
    try {
      const node = el.cloneNode(true);
      node.volume = volume;
      node.play().catch(() => {});
    } catch (_) {}
  }

  // Requiere que el template defina ANTES de cargar este archivo:
  // - cardsData           (array)
  // - gameSessionId       (int)
  // - gameLevelName       (str: "Básico" | "Medio" | "Avanzado")
  // - endGameUrl          (str: url memgame:game_end_api)
  // - selectLevelUrl      (str: url memgame:select_level)

  // --- CSRF helper (único) ---
  function getCsrfToken() {
    const name = 'csrftoken';
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='));
    return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : '';
  }
  const csrfToken = getCsrfToken();

  // Música por nivel (opcional)
  const backgroundMusicFileNames = {
    'Básico': 'background_music_basic.mp3',
    'Medio': 'background_music_medium.mp3',
    'Avanzado': 'background_music_advanced.mp3'
  };

  try {
    const fileName = backgroundMusicFileNames[gameLevelName];
    if (fileName) {
      backgroundMusic.src = `/static/memgame/sounds/${fileName}`;
    }
  } catch {}


  const icons = ['🍇', '🍉', '🍊', '🍓', '🍍', '🍎', '🍐', '🍋', '🍌', '🥭', '🥝', '🍒'];

  let attempts = parseInt(attemptsLeftSpan.textContent || '0', 10);
  let timeLeft = parseInt(timeLeftSpan.textContent || '0', 10);
  let timer;
  let matchedPairs = 0;
  const totalPairs = (Array.isArray(cardsData) ? cardsData.length : 0) / 2;

  let flippedCards = [];
  let lockBoard = false;

  // Música de fondo
  try {
    backgroundMusic.volume = 0.3;
    backgroundMusic.play().catch(() => {});
  } catch {}

  function createBoard() {
    if (Array.isArray(cardsData) && cardsData.length > 0) {
      cardsData.forEach((cardValue, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.cardValue = cardValue;
        cardElement.dataset.index = index;

        // ** Lógica corregida para obtener el icono **
        const icon = icons[cardValue - 1];

        cardElement.innerHTML = `
          <div class="card-inner">
            <div class="card-front"></div>
            <div class="card-back">${icon}</div>
          </div>
        `;
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
      });
    } else {
      console.error("No hay datos de cartas para crear el tablero. Revisa que 'cardsData' se pase desde Django.");
      gameBoard.innerHTML = "<p>No se pudieron cargar las cartas. Por favor, intente de nuevo.</p>";
    }
  }

  function flipCard() {
    if (lockBoard) return;
    if (this === flippedCards[0]) return;
    if (this.classList.contains('matched')) return;

    this.classList.add('flipped');
    playSfx(flipSound, 0.6);             // ← SFX: voltear
    flippedCards.push(this);

    if (flippedCards.length === 2) {
      lockBoard = true;
      checkForMatch();
    }
  }

  function checkForMatch() {
    const [firstCard, secondCard] = flippedCards;
    const isMatch = firstCard.dataset.cardValue === secondCard.dataset.cardValue;

    if (isMatch) {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      playSfx(matchSound, 0.7);         // ← SFX: acierto (si existe)
      disableCards();
      matchedPairs++;
      if (matchedPairs === totalPairs) {
        endGame(true);
      } else {
        lockBoard = false;
      }
    } else {
      attempts--;
      attemptsLeftSpan.textContent = String(attempts);
      playSfx(mismatchSound, 0.6);      // ← SFX: fallo (si existe)
      if (attempts <= 0) {
        endGame(false);
      } else {
        unflipCards();
      }
    }
  }

  function disableCards() {
    flippedCards.forEach(card => card.removeEventListener('click', flipCard));
    resetBoard();
  }

  function unflipCards() {
    setTimeout(() => {
      flippedCards.forEach(card => card.classList.remove('flipped'));
      resetBoard();
    }, 800);
  }

  function resetBoard() {
    flippedCards = [];
    lockBoard = false;
  }

  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      timeLeftSpan.textContent = String(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        endGame(false);
      }
    }, 1000);
  }

  function computeDuration(isWon) {
    const initialTimeLimit = parseInt(timeLeftSpan.dataset.initialTimeLimit || '0', 10);
    const finalTimeLeft = parseInt(timeLeftSpan.textContent || '0', 10);
    let duration = isWon
      ? (initialTimeLimit - finalTimeLeft)
      : (initialTimeLimit - Math.max(0, finalTimeLeft));
    if (!Number.isFinite(duration) || duration < 0) duration = initialTimeLimit;
    return duration;
  }

  // ==== Modal de fin y post a backend orientado a niveles ====
  function openEndGameModal({ title, message, nextUrl = null, autoRedirectMs = null }) {
    const $modal = $('#endGameModal');
    $('#endGameLabel').text(title);
    $('#endGameMessage').html(message);

    const $nextBtn = $('#next-level-btn');
    if (nextUrl) {
      $nextBtn.removeClass('d-none').attr('href', nextUrl);
    } else {
      $nextBtn.addClass('d-none').attr('href', '#');
    }

    $modal.modal({ backdrop: 'static', keyboard: false });
    $modal.modal('show');

    if (autoRedirectMs && nextUrl) {
      setTimeout(() => {
        window.location.href = nextUrl;
      }, autoRedirectMs);
    }
  }

  function postEndGameResult(resultPayload) {
    const url = (typeof endGameUrl === 'string' && endGameUrl)
      ? endGameUrl
      : `/game/end/${encodeURIComponent(gameSessionId)}/`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '',
      },
      credentials: 'same-origin',
      body: JSON.stringify(resultPayload),
    }).then(res => {
      if (!res.ok) throw new Error('Error al registrar fin de juego');
      return res.json();
    });
  }

  // Para evitar doble sonido al terminar
  let endSfxPlayed = false;

  // ==== GANA ====
  function handleWin({ timeUsedSeconds, attemptsLeft }) {
    if (!endSfxPlayed) {
      endSfxPlayed = true;
      try { victorySound.play().catch(() => {}); } catch {}
    }

    postEndGameResult({
      result: 'win',
      level: String(gameLevelName || ''),
      time_used: timeUsedSeconds,
      attempts_left: attemptsLeft,
    })
      .then(data => {
        const nextUrl = data.next_level_url || null;
        const msg = data.message || '¡Buenísima! Nivel superado.';

        openEndGameModal({
          title: '¡Victoria!',
          message: msg, 
          nextUrl,
          autoRedirectMs: null, 
        });
      })
      .catch(() => {

        const fallback = (typeof selectLevelUrl === 'string' && selectLevelUrl) ? selectLevelUrl : '/memgame/select_level/';
        openEndGameModal({
          title: '¡Victoria!',
          message: 'Nivel superado, pero no pude registrar el resultado. Elige el siguiente nivel.',
          nextUrl: fallback,
          autoRedirectMs: null, 
        });
      });
  }

  // ==== PIERDE ====
  function handleLose({ timeUsedSeconds, attemptsLeft }) {
    if (!endSfxPlayed) {
      endSfxPlayed = true;
      try { defeatSound.play().catch(() => {}); } catch {}
    }

    postEndGameResult({
      result: 'lose',
      level: String(gameLevelName || ''),
      time_used: timeUsedSeconds,
      attempts_left: attemptsLeft,
    }).finally(() => {
      openEndGameModal({
        title: 'Sin intentos / Tiempo agotado',
        message: 'No pasa nada, ¡intenta nuevamente!',
        nextUrl: null,
        autoRedirectMs: null,
      });
    });
  }

  // ==== Fin de juego (único lugar que se llama desde la lógica) ====
  function endGame(isWon) {
    clearInterval(timer);
    lockBoard = true;
    try { 
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0; 
    } catch {}

    const timeUsed = computeDuration(isWon);
    const attemptsLeftNow = parseInt(attemptsLeftSpan.textContent || '0', 10);

    if (isWon) {
      handleWin({ timeUsedSeconds: timeUsed, attemptsLeft: attemptsLeftNow });
    } else {
      handleLose({ timeUsedSeconds: timeUsed, attemptsLeft: attemptsLeftNow });
    }
  }

  // Init
  createBoard();
  startTimer();
});