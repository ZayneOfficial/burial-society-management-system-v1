fetch("/api/visits", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ page: window.location.pathname })
}).catch(error => console.error("Website visit tracking failed:", error));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .catch(error => console.error("Service worker registration failed:", error));
  });
}

const installIdStorageKey = "burialSocietyAppInstallId";
const isInstalled = window.matchMedia("(display-mode: standalone)").matches
  || navigator.standalone === true;

function recordAppInstallation(source) {
  try {
    let installId = localStorage.getItem(installIdStorageKey);
    if (!installId) {
      installId = window.crypto.randomUUID();
      localStorage.setItem(installIdStorageKey, installId);
    }

    fetch("/api/installs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ install_id: installId, source })
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
    }).catch(error => console.error("App installation tracking failed:", error));
  } catch (error) {
    console.error("Could not prepare app installation tracking:", error);
  }
}

if (isInstalled) {
  recordAppInstallation("standalone-launch");
}

const installButton = document.getElementById("installApp");
const installHelp = document.getElementById("installHelp");
let installPrompt;

window.addEventListener("appinstalled", () => {
  if (installButton) installButton.hidden = true;
  if (installHelp) installHelp.hidden = true;
  installPrompt = null;
  recordAppInstallation("browser-event");
});

if (installButton) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS && !isInstalled) {
    installButton.hidden = false;
    installButton.textContent = "How to install";
    installButton.addEventListener("click", () => {
      installHelp.hidden = !installHelp.hidden;
    });
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
    installButton.textContent = "Install app";
  });

  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
}
