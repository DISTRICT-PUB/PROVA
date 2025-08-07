document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const prizeElement = document.getElementById("prize-message");
  const useBtn = document.getElementById("use-btn");
  const qrCanvas = document.getElementById("qrcode");

  if (!id) {
    prizeElement.textContent = "ID mancante.";
    return;
  }

  fetch(`https://district-pub-backend.onrender.com/api/claim/${id}`)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        prizeElement.textContent = "❌ QR non valido o non trovato.";
        return;
      }

      if (data.used) {
        prizeElement.textContent = `❌ Questo premio è già stato ritirato.`;
      } else {
        prizeElement.textContent = `🎁 Premio: ${data.prize}`;
        useBtn.classList.remove("hidden");

        // Mostra QR code
        const qr = new QRious({
          element: qrCanvas,
          value: window.location.href,
          size: 200
        });
        qrCanvas.classList.remove("hidden");
      }
    })
    .catch(() => {
      prizeElement.textContent = "Errore di rete. Riprova.";
    });

  useBtn.addEventListener("click", () => {
    fetch(`https://district-pub-backend.onrender.com/api/claim/${id}/use`, {
      method: "POST"
    })
      .then(res => res.json())
      .then(() => {
        useBtn.disabled = true;
        useBtn.textContent = "✅ Premio ritirato";
        prizeElement.textContent = "✅ Il premio è stato segnato come usato.";
        qrCanvas.style.display = "none";
      });
  });
});
