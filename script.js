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

  spinBtn.addEventListener("click", () => {
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
        resultMsg.textContent = 🎉 Hai vinto: ${prize.prize}!;
        claimSection.classList.remove("hidden");
      });
    } else {
      spinReels("❌", () => {
        resultMsg.textContent = "❌ Non hai vinto, Mandaci un messaggio e ti offriamo un Chupito";
        claimSection.classList.remove("hidden");
      });
    }

    setTimeout(() => {
      spinBtn.disabled = false;
    }, 3000);
  });

  claimBtn.addEventListener("click", () => {
    const phone = userPhone.value.trim();
    if (!phone) return;

    const text = encodeURIComponent(Ciao! Ho vinto alla slot del District Pub. Premio: ${resultMsg.textContent} – Numero: ${phone});
    const link = https://wa.me/393793039278?text=${text};
    whatsappLink.href = link;
    whatsappLink.classList.remove("hidden");
    whatsappLink.click(); 
  });
});