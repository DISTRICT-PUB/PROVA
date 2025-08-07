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
  const weeklyBlockEnabled = false;

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

  // Funzione per generare un identificatore unico per ogni premio
  function generateUniqueCode() {
    return 'VINCITA-' + Math.random().toString(36).substr(2, 9);  // Crea un ID univoco
  }

  // Funzione per generare un QR code e restituirlo come base64
  function generateQRCodeBase64(prizeId, callback) {
    QRCode.toDataURL(prizeId, { width: 200 }, function (error, url) {
      if (error) {
        console.error(error);
        return;
      }
      callback(url); // Ritorna l'URL base64 dell'immagine del QR code
    });
  }

  // Funzione che invia il QR code come parte del messaggio su WhatsApp
  function sendWhatsappMessageWithQRCode(prizeId) {
    generateQRCodeBase64(prizeId, (qrCodeUrl) => {
      const phone = userPhone.value.trim();
      if (!phone) {
        alert("Per favore inserisci un numero di telefono valido.");
        return;
      }

      const text = encodeURIComponent(`
        Ciao! Ho vinto alla slot del District Pub. Premio: ${resultMsg.textContent} 
        Puoi ritirare il premio mostrando questo QR code: 
        ${qrCodeUrl} 
        Numero: ${phone}`);
      
      const link = `https://wa.me/393793039278?text=${text}`;
      console.log("WhatsApp URL:", link); // Verifica l'URL generato

      // Mostra l'URL per il debug
      alert(`URL WhatsApp generato: ${link}`);

      // Crea il link di WhatsApp senza aprirlo automaticamente
      whatsappLink.href = link;
      whatsappLink.classList.remove("hidden");
    });
  }

  // Funzione per verificare se è passata una settimana dall'ultima giocata
  function canPlay() {
    if (!weeklyBlockEnabled) return true;

    const lastPlayDate = localStorage.getItem("lastPlayDate");
    if (lastPlayDate) {
      const now = new Date();
      const lastPlay = new Date(lastPlayDate);
      const diff = now - lastPlay;
      const daysSinceLastPlay = diff / (1000 * 60 * 60 * 24); // Converte la differenza in giorni

      if (daysSinceLastPlay < 7) {
        resultMsg.textContent = "Ci vediamo tra una settimana!";
        return false;
      }
    }
    return true;
  }

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
      const prizeId = generateUniqueCode();
      spinReels(prize.symbol, () => {
        if (audioWin) audioWin.play();
        resultMsg.textContent = `🎉 Hai vinto: ${prize.prize}!`;
        generateQRCode(prizeId);
        claimSection.classList.remove("hidden");

        // Invia il messaggio di WhatsApp con il QR code
        sendWhatsappMessageWithQRCode(prizeId);
      });
    } else {
      spinReels("❌", () => {
        resultMsg.textContent = "❌ Non hai vinto, Mandaci un messaggio e ti offriamo un Chupito";
        claimSection.classList.remove("hidden");
      });
    }

    // Salva la data dell'ultima giocata
    const now = new Date();
    localStorage.setItem("lastPlayDate", now.toISOString());

    setTimeout(() => {
      spinBtn.disabled = false;
    }, 3000);
  });

  claimBtn.addEventListener("click", () => {
    const phone = userPhone.value.trim();
    if (!phone) {
      alert("Per favore inserisci un numero di telefono valido.");
      return;
    }

    const text = encodeURIComponent(`Ciao! Ho vinto alla slot del District Pub. Premio: ${resultMsg.textContent} – Numero: ${phone}`);
    const link = `https://wa.me/393793039278?text=${text}`;
    console.log("WhatsApp link:", link); // Verifica l'URL generato

    // Mostra l'URL per il debug
    alert(`URL WhatsApp generato: ${link}`);
    whatsappLink.href = link;
    whatsappLink.classList.remove("hidden");
    whatsappLink.click();
  });
});

