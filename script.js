document.addEventListener("DOMContentLoaded", () => {
  // Simboli disponibili nella slot
  const symbols = ["🥃", "🍺", "🍻", "🍷", "🎮", "🎟️"];

  // Pool dei premi con le relative probabilità
  const prizePool = [
    { symbol: "🥃", prize: "Chupito", chance: 0.23 },        // 23% - premio più comune
    { symbol: "🎮", prize: "Partita ai giochi", chance: 0.23 }, // 23%
    { symbol: "🍻", prize: "Birra piccola", chance: 0.10 },      // 10%
    { symbol: "🍺", prize: "Birra media", chance: 0.08 },        // 8%
    { symbol: "🍷", prize: "Calice di vino", chance: 0.03 },     // 3%
    { symbol: "🎟️", prize: "Sconto 10%", chance: 0.01 }         // 1% - premio più raro
  ];

  const winChance = 0.68; // Percentuale complessiva di possibilità di vincita

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

  // 🔧 CONFIGURAZIONI DI BLOCCO GIOCATA
  const singlePlayUntilDateEnabled = true;
  const weeklyBlockEnabled = true;
  const limitDate = new Date("2025-08-25T23:59:59");

  // Seleziona un premio casuale in base alle probabilità
  function getPrize() {
  const totalChance = prizePool.reduce((acc, p) => acc + p.chance, 0);
  const r = Math.random() * totalChance;
  let acc = 0;
  for (let p of prizePool) {
    acc += p.chance;
    if (r <= acc) return p;
  }
  return prizePool[prizePool.length - 1];
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

  // ✅ BLOCCO GIOCATA
  function canPlay() {
    const now = new Date();
    const lastPlayDate = localStorage.getItem("lastPlayDate");
    if (!lastPlayDate) return true;

    const lastPlay = new Date(lastPlayDate);

    if (singlePlayUntilDateEnabled && now <= limitDate) {
      resultMsg.textContent = "Hai già giocato! Riprova dopo il 25 agosto 🎉";
      return false;
    }

    if (weeklyBlockEnabled && now > limitDate) {
      const diff = now - lastPlay;
      const daysSinceLastPlay = diff / (1000 * 60 * 60 * 24);
      if (daysSinceLastPlay < 7) {
        resultMsg.textContent = "Hai già giocato questa settimana! ⏳";
        return false;
      }
    }

    return true;
  }

  // 🎰 GIRA
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
        resultMsg.textContent = "❌ Non hai vinto! Ritenta la prossima settimana 🍀";
        claimSection.classList.add("hidden"); // 👉 Non mostra sezione dati
      });
    }

    const now = new Date();
    localStorage.setItem("lastPlayDate", now.toISOString());

    setTimeout(() => {
      spinBtn.disabled = false;
    }, 3000);
  });

  // ✅ INVIO SU WHATSAPP
  claimBtn.addEventListener("click", () => {
    const consentGiven = document.getElementById("consent-checkbox")?.checked;
    if (!consentGiven) {
      alert("Devi acconsentire al trattamento dei dati per continuare.");
      return;
    }

    const phone = userPhone.value.trim();
    if (!phone) return;

    const prizeText = resultMsg.textContent.replace("🎉 Hai vinto: ", "").trim();
    const isWin = !prizeText.startsWith("❌");

    const uniqueId = generateUniqueId();
    const qrLink = `https://district-pub.github.io/PROVA/claim.html?id=${uniqueId}`;

    const text = encodeURIComponent(
      `Ciao! Ho vinto alla slot del District Pub 🎰\nPremio: ${prizeText}\nNumero: ${phone}\nQR per il ritiro: ${qrLink}`
    );

    const link = `https://wa.me/393793039278?text=${text}`;
    whatsappLink.href = link;
    whatsappLink.classList.remove("hidden");
    whatsappLink.click();

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

  // Genera un ID univoco
  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  }

  // ✅ Salva vincita nel backend
  function saveClaimToBackend(data) {
    console.log("Invio dati al backend:", data);

    fetch("https://district-pub-backend.onrender.com/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (!res.ok) {
          console.error("Errore dal server:", res.status);
        } else {
          console.log("✅ Vincita salvata con successo");
        }
        return res.json();
      })
      .then(json => console.log("Risposta del backend:", json))
      .catch(err => console.error("Errore di rete:", err));
  }
});
