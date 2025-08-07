document.addEventListener("DOMContentLoaded", () => {
  // Simboli disponibili nella slot
  const symbols = ["🥃", "🍺", "🍻", "🍷", "🎮", "🎟️"];

  // Pool dei premi con le relative probabilità
  const prizePool = [
    { symbol: "🎟️", prize: "Sconto 10%", chance: 0.03 },
    { symbol: "🎮", prize: "Partita ai giochi", chance: 0.25 },
    { symbol: "🍷", prize: "Calice di vino", chance: 0.06 },
    { symbol: "🍻", prize: "Birra piccola", chance: 0.30 },
    { symbol: "🍺", prize: "Birra media", chance: 0.20 },
  ];

  const winChance = 0.8; // Percentuale di possibilità di vincita

  // Selettori degli elementi della pagina
  const reels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3")
  ];
  const spinBtn = document.getElementById("spin-button");
  const resultMsg = document.getElementById("result-message");
  const claimSection = document.getElementById("claim-section");
  const userPhone = document.getElementById("user-phone");
  const claimBtn = document.getElementById("claim-button");
  const whatsappLink = document.getElementById("whatsapp-link");

  const audioSpin = document.getElementById("audio-spin");
  const audioWin = document.getElementById("audio-win");

  const weeklyBlockEnabled = false; // Imposta a true se vuoi bloccare la giocata per una settimana

  // Seleziona un premio casuale in base alle probabilità
  function getPrize() {
    const r = Math.random();
    let acc = 0;
    for (let p of prizePool) {
      acc += p.chance;
      if (r <= acc) return p;
    }
    return prizePool[prizePool.length - 1]; // Default (fallback)
  }

  // Anima la slot e poi mostra il simbolo vincente
  function spinReels(targetSymbol, callback) {
    let count = 20;
    const interval = setInterval(() => {
      reels.forEach((reel) => {
        reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      });
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setTimeout(() => {
          reels.forEach((reel, i) => {
            setTimeout(() => reel.textContent = targetSymbol, i * 150);
          });
          setTimeout(callback, 700);
        }, 200);
      }
    }, 75);
  }

  // Controlla se l’utente può giocare (es. dopo una settimana)
  function canPlay() {
    if (!weeklyBlockEnabled) return true;

    const lastPlayDate = localStorage.getItem("lastPlayDate");
    if (lastPlayDate) {
      const now = new Date();
      const lastPlay = new Date(lastPlayDate);
      const diff = now - lastPlay;
      const daysSinceLastPlay = diff / (1000 * 60 * 60 * 24);
      if (daysSinceLastPlay < 7) {
        resultMsg.textContent = "Ci vediamo tra una settimana!";
        return false;
      }
    }
    return true;
  }

  // Quando si clicca su "GIRA"
  spinBtn.addEventListener("click", () => {
    if (!canPlay()) return;

    spinBtn.disabled = true;
    resultMsg.textContent = "";
    claimSection.classList.add("hidden");
    whatsappLink.classList.add("hidden");

    if (audioSpin) audioSpin.play();

    const didWin = Math.random() <= winChance;

    if (didWin) {
      const prize = getPrize();
      spinReels(prize.symbol, () => {
        if (audioWin) audioWin.play();
        resultMsg.textContent = `🎉 Hai vinto: ${prize.prize}!`;
        claimSection.classList.remove("hidden");
      });
    } else {
      spinReels("❌", () => {
        resultMsg.textContent = "❌ Non hai vinto, Mandaci un messaggio e ti offriamo un Chupito";
        claimSection.classList.remove("hidden");
      });
    }

    // Salva la data dell’ultima giocata
    const now = new Date();
    localStorage.setItem("lastPlayDate", now.toISOString());

    setTimeout(() => {
      spinBtn.disabled = false;
    }, 3000);
  });

  // Quando si clicca su "Invia messaggio al pub"
  claimBtn.addEventListener("click", () => {
    const phone = userPhone.value.trim();
    if (!phone) return;

    const prizeText = resultMsg.textContent.replace("🎉 Hai vinto: ", "").trim();
    const isWin = !prizeText.startsWith("❌");

    const uniqueId = generateUniqueId();
    const qrLink = `https://districtpub.it/claim.html?id=${uniqueId}`; // Link alla pagina con QR

    const text = encodeURIComponent(
      `Ciao! Ho vinto alla slot del District Pub 🎰\nPremio: ${prizeText}\nNumero: ${phone}\nQR per il ritiro: ${qrLink}`
    );

    const link = `https://wa.me/393793039278?text=${text}`;
    whatsappLink.href = link;
    whatsappLink.classList.remove("hidden");
    whatsappLink.click();

    // Salva la vincita sul backend (solo se è una vera vincita)
    if (isWin) {
      saveClaimToBackend({
        id: uniqueId,
        prize: prizeText,
        phone,
        used: false,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Genera un ID univoco casuale
  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  }

  // Invia i dati della vincita al backend Node.js
  function saveClaimToBackend(data) {
    fetch("https://district-pub-backend.onrender.com/api/save-claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }
});
