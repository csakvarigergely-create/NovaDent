const form = document.querySelector(".appointment-form");

if (form) {
  const nameInput = form.querySelector("#name");
  const phoneInput = form.querySelector("#phone");
  const emailInput = form.querySelector("#email");
  const treatmentInput = form.querySelector("#treatment");
  const messageInput = form.querySelector("#message");
  const privacyInput = form.querySelector("input[name='privacy']");
  const submitButton = form.querySelector("button[type='submit']");
  const feedback = form.querySelector(".form-feedback");

  const initialButtonText = submitButton ? submitButton.textContent : "Időpontot kérek";

  const state = {
    name: "",
    phone: "",
    email: "",
    treatment: "",
    message: "",
    acceptedPrivacy: false
  };

  const setFeedback = (text, type) => {
    if (!feedback) return;
    feedback.textContent = text;
    feedback.classList.remove("is-error", "is-success");
    if (type) feedback.classList.add(type);
  };

  const normalizeHungarianPhone = (rawValue) => {
    const digits = (rawValue || "").replace(/\D/g, "");
    let normalized = digits;

    if (normalized.startsWith("00")) {
      normalized = normalized.slice(2);
    }
    if (normalized.startsWith("36")) {
      normalized = normalized.slice(2);
    } else if (normalized.startsWith("06")) {
      normalized = normalized.slice(2);
    } else if (normalized.startsWith("6")) {
      normalized = normalized.slice(1);
    }

    normalized = normalized.slice(0, 9);

    if (!normalized) return "";

    const p1 = normalized.slice(0, 2);
    const p2 = normalized.slice(2, 5);
    const p3 = normalized.slice(5, 9);

    let formatted = "+36";
    if (p1) formatted += ` ${p1}`;
    if (p2) formatted += ` ${p2}`;
    if (p3) formatted += ` ${p3}`;

    return formatted.trim();
  };

  const isValidHungarianPhone = (value) => {
    return /^\+36 \d{2} \d{3} \d{4}$/.test(value);
  };

  const readStateFromInputs = () => {
    state.name = nameInput.value.trim();
    state.phone = phoneInput.value.trim();
    state.email = emailInput.value.trim();
    state.treatment = treatmentInput.value.trim();
    state.message = messageInput.value.trim();
    state.acceptedPrivacy = Boolean(privacyInput.checked);
  };

  const setLoading = (loading) => {
    if (!submitButton) return;
    submitButton.disabled = loading;
    submitButton.textContent = loading ? "Küldés..." : initialButtonText;
  };

  const validate = () => {
    if (!state.name) return "Név megadása kötelező.";
    if (!state.phone) return "Telefonszám megadása kötelező.";
    if (!isValidHungarianPhone(state.phone)) return "Kérjük, adjon meg érvényes telefonszámot.";
    if (!state.email) return "Email cím megadása kötelező.";
    if (!state.treatment) return "Kérjük, válasszon kezelést.";
    if (!state.acceptedPrivacy) return "Az adatkezelési feltételek elfogadása kötelező.";
    return "";
  };

  phoneInput.addEventListener("input", (event) => {
    const formatted = normalizeHungarianPhone(event.target.value);
    event.target.value = formatted;
    state.phone = formatted;
  });

  phoneInput.addEventListener("blur", (event) => {
    const formatted = normalizeHungarianPhone(event.target.value);
    event.target.value = formatted;
    state.phone = formatted;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFeedback("", "");
    readStateFromInputs();
    phoneInput.value = normalizeHungarianPhone(phoneInput.value);
    state.phone = phoneInput.value;

    const validationError = validate();
    if (validationError) {
      setFeedback(validationError, "is-error");
      return;
    }

    const payload = {
      name: state.name,
      phone: state.phone,
      email: state.email,
      treatment: state.treatment,
      message: state.message,
      acceptedPrivacy: state.acceptedPrivacy,
      source: "NovaDent landing",
      date: new Date().toISOString()
    };

    setLoading(true);
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      state.name = "";
      state.phone = "";
      state.email = "";
      state.treatment = "";
      state.message = "";
      state.acceptedPrivacy = false;
      setFeedback("Köszönjük, megkaptuk az időpontkérést. Hamarosan felvesszük Önnel a kapcsolatot.", "is-success");
    } catch {
      setFeedback("Valami nem sikerült. Kérjük, próbálja újra később, vagy hívjon minket telefonon.", "is-error");
    } finally {
      setLoading(false);
    }
  });
}
