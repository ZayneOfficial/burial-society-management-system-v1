const analyticsSession = JSON.parse(localStorage.getItem("session") || "null");
if (!analyticsSession || analyticsSession.role !== "admin") {
  location.href = "/";
}

document.getElementById("analyticsAdminName").textContent =
  analyticsSession.admin?.name || "Administrator";

async function loadAnalytics() {
  const visitMessage = document.getElementById("visitAnalyticsMessage");
  const installClickMessage = document.getElementById("installClickAnalyticsMessage");
  visitMessage.textContent = "Loading visit statistics...";
  installClickMessage.textContent = "Loading install button click statistics...";

  const statsRequests = [
    {
      url: "/api/visits/stats",
      message: visitMessage,
      fields: {
        total: "visitTotal",
        today: "visitToday",
        thisWeek: "visitThisWeek",
        thisMonth: "visitThisMonth"
      },
      error: "Could not load website visit statistics."
    },
    {
      url: "/api/install-clicks/stats",
      message: installClickMessage,
      fields: {
        total: "installClickTotal",
        today: "installClickToday",
        thisWeek: "installClickThisWeek",
        thisMonth: "installClickThisMonth"
      },
      error: "Could not load install button click statistics."
    }
  ];

  await Promise.all(statsRequests.map(async request => {
    try {
      const response = await fetch(request.url);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      Object.entries(request.fields).forEach(([key, elementId]) => {
        document.getElementById(elementId).textContent = data[key];
      });
      request.message.textContent = "";
      request.message.className = "message";
    } catch (error) {
      request.message.textContent = `${request.error} ${error.message}`;
      request.message.className = "message error";
    }
  }));
}

document.getElementById("refreshAnalytics").addEventListener("click", loadAnalytics);
document.getElementById("analyticsLogoutBtn").addEventListener("click", async () => {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch (error) {
    console.error("Logout request failed:", error);
  }
  localStorage.removeItem("session");
  location.href = "/";
});

loadAnalytics();
