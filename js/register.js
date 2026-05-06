(function () {
  const form = document.getElementById("registerForm");
  const nameInput = document.getElementById("registerName");
  const emailInput = document.getElementById("registerEmail");
  const passwordInput = document.getElementById("registerPassword");
  const statusEl = document.getElementById("registerStatus");

  if (!form || !nameInput || !emailInput || !passwordInput || !statusEl) {
    return;
  }

  const setStatus = (message, isSuccess) => {
    statusEl.textContent = message;
    statusEl.classList.toggle("is-success", Boolean(isSuccess));
  };

  const meetsPasswordRules = (value) => {
    // Frontend gatekeeper: enforce the assignment password rules.
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    return hasMinLength && hasUppercase && hasSpecial;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Creating account...", false);

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!meetsPasswordRules(password)) {
      setStatus(
        "Password must be 8+ chars with 1 uppercase and 1 special (!@#$%^&*)",
        false
      );
      return;
    }

    try {
      // Send registration envelope to the backend.
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload.message || "Registration failed", false);
        return;
      }

      // Package: show success, then route back to login.
      setStatus("Registration successful. Redirecting...", true);
      window.location.href = "login.html";
    } catch (error) {
      setStatus("Network error. Please try again.", false);
    }
  });
})();
