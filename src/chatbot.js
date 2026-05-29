const chatbotRoot = document.querySelector(".chatbot");

if (chatbotRoot) {
  const toggleButton = chatbotRoot.querySelector(".chatbot-toggle");
  const panel = chatbotRoot.querySelector(".chatbot-panel");
  const closeButton = chatbotRoot.querySelector(".chatbot-close");
  const questionsContainer = chatbotRoot.querySelector(".chatbot-questions");
  const answerWrap = chatbotRoot.querySelector(".chatbot-answer-wrap");
  const answerElement = chatbotRoot.querySelector(".chatbot-answer");
  const cta = chatbotRoot.querySelector(".chatbot-cta");

  const faqItems = [
    {
      question: "Mennyibe kerül az állapotfelmérés?",
      answer:
        "Az állapotfelmérés ára 12 900 Ft-tól indul. A pontos kezelési tervet és árat személyes vizsgálat után tudjuk megadni."
    },
    {
      question: "Fájdalmas a kezelés?",
      answer:
        "A kezelések során korszerű érzéstelenítést alkalmazunk, és végig figyelünk arra, hogy Ön nyugodtan érezze magát. Ha tart a fogászati kezeléstől, ezt már az időpontkérésnél jelezheti."
    },
    {
      question: "Milyen gyorsan kapok időpontot?",
      answer:
        "Általában rövid időn belül visszajelzünk az időpontkérésekre. Sürgős panasz esetén érdemes telefonon érdeklődni."
    },
    {
      question: "Van sürgősségi ellátás?",
      answer:
        "Sürgős fogászati panasz esetén igyekszünk mielőbbi időpontot biztosítani. Erős fájdalom, duzzanat vagy baleset esetén kérjük, telefonon vegye fel velünk a kapcsolatot."
    },
    {
      question: "Hogyan kérhetek időpontot?",
      answer:
        "Az oldalon található időpontkérő űrlapon keresztül elküldheti adatait, és kollégánk hamarosan felveszi Önnel a kapcsolatot."
    }
  ];

  const setOpen = (open) => {
    toggleButton.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    if (open) {
      const firstQuestion = questionsContainer.querySelector("button");
      if (firstQuestion) firstQuestion.focus();
    } else {
      toggleButton.focus();
    }
  };

  const showAnswer = (answerText) => {
    answerElement.textContent = answerText;
    answerWrap.hidden = false;
  };

  faqItems.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chatbot-question";
    button.textContent = item.question;
    button.setAttribute("aria-label", item.question);
    button.addEventListener("click", () => showAnswer(item.answer));
    questionsContainer.appendChild(button);
  });

  toggleButton.addEventListener("click", () => {
    const currentlyOpen = toggleButton.getAttribute("aria-expanded") === "true";
    setOpen(!currentlyOpen);
  });

  closeButton.addEventListener("click", () => setOpen(false));

  cta.addEventListener("click", () => {
    const section = document.querySelector("#idopont");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  setOpen(false);
}
