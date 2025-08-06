const prizeProbabilities = [
  { prize: "🎮 Partita ai giochi", probability: 0.25 },
  { prize: "🍻 Birra piccola", probability: 0.30 },
  { prize: "🍺 Birra media", probability: 0.20 },
  { prize: "🍷 Calice di vino", probability: 0.06 },
  { prize: "🎟️ Sconto 10%", probability: 0.03 }
];

function getRandomPrize() {
  const rand = Math.random();
  let sum = 0;
  for (const item of prizeProbabilities) {
    sum += item.probability;
    if (rand <= sum) {
      return item.prize;
    }
  }
  return null; // Nessuna vincita
}

function playSlot() {
  const result = getRandomPrize();
  if (result) {
    document.getElementById("result").innerHTML =
      "🎉 Complimenti! Hai vinto: <strong>" + result + "</strong>";
    document.getElementById("form").classList.remove("hidden");
    document.getElementById("prize").value = result;
  } else {
    document.getElementById("result").innerHTML =
      "😅 Non hai vinto... <strong>MA UN CHUPITO TE LO OFFRIAMO LO STESSO!</strong>";
    document.getElementById("form").classList.remove("hidden");
    document.getElementById("prize").value = "🥃 Chupito (offerto)";
  }
}

function sendWhatsApp() {
  const phone = document.getElementById("phone").value;
  const prize = document.getElementById("prize").value;

  if (!phone) {
    alert("Inserisci il numero di telefono per inviare il messaggio.");
    return;
  }

  const pubNumber = "+393793039278";
  const message = `Ciao! Ho vinto ${prize} al District Pub! Il mio numero è ${phone}.`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${pubNumber}?text=${encodedMessage}`;

  window.location.href = whatsappUrl;
}
