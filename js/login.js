(function () {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const statusEl = document.getElementById("loginStatus");

  if (!form || !emailInput || !passwordInput || !statusEl) {
    return;
  }

  const setStatus = (message, isSuccess) => {
    statusEl.textContent = message;
    statusEl.classList.toggle("is-success", Boolean(isSuccess));
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Signing in...", false);

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload.message || "Login failed", false);
        return;
      }

      if (payload.token) {
        localStorage.setItem("authToken", payload.token);
      }
      localStorage.setItem("authEmail", emailInput.value.trim());

      setStatus("Login successful. Redirecting...", true);
      window.location.href = "shop.html";
    } catch (error) {
      setStatus("Network error. Please try again.", false);
    }
  });
})();
