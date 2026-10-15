if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .catch(error => console.error("Service worker registration failed:", error));
  });
}

const installButton = document.getElementById("installApp");
const installHelp = document.getElementById("installHelp");
let installPrompt;

if (installButton) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isInstalled = window.matchMedia("(display-mode: standalone)").matches
    || navigator.standalone === true;

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

  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    installHelp.hidden = true;
    installPrompt = null;
  });
}
