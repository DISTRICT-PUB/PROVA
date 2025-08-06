document.addEventListener("DOMContentLoaded", () => {
  const symbols = ["🥃", "🍺", "🍻", "🍷", "🎮", "🎟️"];
  const prizePool = [
    { symbol: "🎟️", prize: "Sconto 10%", chance: 0.03 },
    { symbol: "🎮", prize: "Partita ai giochi", chance: 0.25 },
    { symbol: "🍷", prize: "Calice di vino", chance: 0.06 },
    { symbol: "🍻", prize: "Birra piccola", chance: 0.30 },
    { symbol: "🍺", prize: "Birra media", chance: 0.20 },
  ];

  const winChance = 0.8;

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

  // Variabile di configurazione per abilitare/disabilitare il blocco settimanale
  const weeklyBlockEnabled = true;  // Imposta a 'false' per disabilitare il blocco settimanale

  function getPrize() {
    const r = Math.random();
    let acc = 0;
    for (let p of prizePool) {
      acc += p.chance;
      if (r <= acc) return p;
    }
    return prizePool[prizePool.length - 1];
  }

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

  // Funzione per verificare se è passata una settimana dall'ultima giocata
  function canPlay() {
    if (!weeklyBlockEnabled) return true; // Se il blocco settimanale è disabilitato, consente la giocata

    const lastPlayDate = localStorage.getItem("lastPlayDate");
    if (lastPlayDate) {
      const now = new Date();
      const lastPlay = new Date(lastPlayDate);
      const diff = now - lastPlay;
      const daysSinceLastPlay = diff / (1000 * 60 * 60 * 24); // Converte la differenza in giorni

      if (daysSinceLastPlay < 7) {
        resultMsg.textContent = "Ci vediamo tra una settimana!";
        return false; // Blocca il gioco se non è passato abbastanza tempo
      }
    }
    return true; // Permetti il gioco se è passato abbastanza tempo
  }

  spinBtn.addEventListener("click", () => {
    if (!canPlay()) return; // Blocca la giocata se non è passato abbastanza tempo

    spinBtn.disabled = true; // Disabilita il pulsante mentre gira la slot
    resultMsg.textContent = ""; // Resetta il messaggio di risultato
    claimSection.classList.add("hidden"); // Nasconde la sezione per il premio
    whatsappLink.classList.add("hidden"); // Nasconde il link WhatsApp

    if (audioSpin) audioSpin.play(); // Suona il suono di spin

    const didWin = Math.random() <= winChance; // Determina se l'utente ha vinto

    if (didWin) {
      const prize = getPrize();
      spinReels(prize.symbol, () => {
        if (audioWin) audioWin.play(); // Suona il suono di vincita
        resultMsg.textContent = `🎉 Hai vinto: ${prize.prize}!`; // Mostra il premio vinto
        claimSection.classList.remove("hidden"); // Mostra la sezione per reclamare il premio
      });
    } else {
      spinReels("❌", () => {
        resultMsg.textContent = "❌ Non hai vinto, Mandaci un messaggio e ti offriamo un Chupito"; // Messaggio di perdita
        claimSection.classList.remove("hidden"); // Mostra la sezione per reclamare il chupito
      });
    }

    // Salva la data dell'ultima giocata
    const now = new Date();
    localStorage.setItem("lastPlayDate", now.toISOString());

    setTimeout(() => {
      spinBtn.disabled = false; // Riabilita il pulsante dopo 3 secondi
    }, 3000);
  });

  claimBtn.addEventListener("click", () => {
    const phone = userPhone.value.trim();
    if (!phone) return;

    const text = encodeURIComponent(`Ciao! Ho vinto alla slot del District Pub. Premio: ${resultMsg.textContent} – Numero: ${phone}`);
    const link = `https://wa.me/393793039278?text=${text}`;
    whatsappLink.href = link;
    whatsappLink.classList.remove("hidden");
    whatsappLink.click(); 
  });
});
