const forms = document.querySelectorAll(".appointment-form");

forms.forEach((form) => {
  const nameInput = form.querySelector("[name='name']");
  const phoneInput = form.querySelector("[name='phone']");
  const emailInput = form.querySelector("[name='email']");
  const treatmentInput = form.querySelector("[name='treatment']");
  const messageInput = form.querySelector("[name='message']");
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
    let localNumber = digits;

    if (localNumber.startsWith("0036")) {
      localNumber = localNumber.slice(4);
    } else if (localNumber.startsWith("36")) {
      localNumber = localNumber.slice(2);
    } else if (localNumber.startsWith("06")) {
      localNumber = localNumber.slice(2);
    } else if (localNumber.startsWith("0")) {
      localNumber = localNumber.slice(1);
    }

    const isMobile = /^(20|30|70)/.test(localNumber);
    const isBudapestLandline = localNumber.startsWith("1");
    const maxLength = isMobile ? 9 : 8;
    localNumber = localNumber.slice(0, maxLength);

    if (!localNumber) return "";

    const areaCodeLength = isBudapestLandline ? 1 : 2;
    const lastGroupLength = isMobile || isBudapestLandline ? 4 : 3;
    const areaCode = localNumber.slice(0, areaCodeLength);
    const subscriber = localNumber.slice(areaCodeLength);
    const middleGroup = subscriber.slice(0, Math.max(0, subscriber.length - lastGroupLength));
    const lastGroup = subscriber.slice(-lastGroupLength);

    let formatted = "+36";
    if (areaCode) formatted += ` ${areaCode}`;
    if (middleGroup) formatted += ` ${middleGroup}`;
    if (lastGroup) formatted += ` ${lastGroup}`;

    return formatted.trim();
  };

  const isValidHungarianPhone = (value) => {
    const digits = (value || "").replace(/\D/g, "");
    const localNumber = digits.startsWith("36") ? digits.slice(2) : digits;
    return /^(?:(?:20|30|70)\d{7}|[1-9]\d{7})$/.test(localNumber);
  };

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const readStateFromInputs = () => {
    state.name = nameInput.value.trim();
    state.phone = phoneInput.value.trim();
    state.email = emailInput.value.trim();
    state.treatment = treatmentInput.value.trim();
    state.message = messageInput ? messageInput.value.trim() : "";
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
    if (!isValidEmail(state.email)) return "Kérjük, adjon meg érvényes email címet.";
    if (!state.treatment) return "Kérjük, válasszon kezelést.";
    if (!state.acceptedPrivacy) return "Az adatkezelési feltételek elfogadása kötelező.";
    return "";
  };

  phoneInput.addEventListener("input", (event) => {
    state.phone = event.target.value;
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
});
