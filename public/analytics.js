let analyticsSession = null;
try {
  analyticsSession = JSON.parse(localStorage.getItem("session") || "null");
} catch (error) {
  console.error("Could not read the saved analytics session:", error);
}

document.getElementById("analyticsAdminName").textContent =
  analyticsSession?.admin?.name || "Administrator";

async function loadAnalytics() {
  const visitMessage = document.getElementById("visitAnalyticsMessage");
  const installClickMessage = document.getElementById("installClickAnalyticsMessage");
  const adminLoginMessage = document.getElementById("adminLoginAnalyticsMessage");
  const memberLoginMessage = document.getElementById("memberLoginAnalyticsMessage");
  visitMessage.textContent = "Loading visit statistics...";
  installClickMessage.textContent = "Loading install button click statistics...";
  adminLoginMessage.textContent = "Loading admin login statistics...";
  memberLoginMessage.textContent = "Loading member login statistics...";

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

  const requests = statsRequests.map(async request => {
    try {
      const response = await fetch(request.url, { credentials: "same-origin" });
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
  });

  requests.push(loadAdminLoginAnalytics(adminLoginMessage));
  requests.push(loadMemberLoginAnalytics(memberLoginMessage));
  await Promise.all(requests);
}

async function loadAdminLoginAnalytics(message) {
  const attemptsBody = document.getElementById("adminLoginAttempts");
  try {
    const response = await fetch("/api/admin-logins/stats", {
      credentials: "same-origin"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    document.getElementById("adminLoginTotal").textContent = data.total;
    document.getElementById("adminLoginSuccessful").textContent = data.successful;
    document.getElementById("adminLoginFailed").textContent = data.failed;
    document.getElementById("adminLoginToday").textContent = data.today;

    attemptsBody.replaceChildren();
    if (!data.recent.length) {
      const row = attemptsBody.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 3;
      cell.textContent = "No admin login attempts recorded yet.";
    } else {
      data.recent.forEach(attempt => {
        const row = attemptsBody.insertRow();
        row.insertCell().textContent = new Date(attempt.attempted_at).toLocaleString();
        row.insertCell().textContent = attempt.attempted_email || "Unknown";
        row.insertCell().textContent = attempt.outcome === "success" ? "Successful" : "Failed";
      });
    }

    message.textContent = "";
    message.className = "message";
  } catch (error) {
    message.textContent = `Could not load admin login statistics. ${error.message}`;
    message.className = "message error";
    attemptsBody.replaceChildren();
    const row = attemptsBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 3;
    cell.textContent = "Could not load recent login attempts.";
  }
}

async function loadMemberLoginAnalytics(message) {
  const attemptsBody = document.getElementById("memberLoginAttempts");
  try {
    const response = await fetch("/api/member-logins/stats", {
      credentials: "same-origin"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    document.getElementById("memberLoginTotal").textContent = data.total;
    document.getElementById("memberLoginSuccessful").textContent = data.successful;
    document.getElementById("memberLoginFailed").textContent = data.failed;
    document.getElementById("memberLoginToday").textContent = data.today;

    attemptsBody.replaceChildren();
    if (!data.recent.length) {
      const row = attemptsBody.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 4;
      cell.textContent = "No member login attempts recorded yet.";
    } else {
      data.recent.forEach(attempt => {
        const row = attemptsBody.insertRow();
        row.insertCell().textContent = new Date(attempt.attempted_at).toLocaleString();
        row.insertCell().textContent = attempt.vn_number || "Unknown";
        row.insertCell().textContent = attempt.member_name || "Unknown member";
        row.insertCell().textContent = attempt.outcome === "success" ? "Successful" : "Failed";
      });
    }

    message.textContent = "";
    message.className = "message";
  } catch (error) {
    message.textContent = `Could not load member login statistics. ${error.message}`;
    message.className = "message error";
    attemptsBody.replaceChildren();
    const row = attemptsBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.textContent = "Could not load recent login attempts.";
  }
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
