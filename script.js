// Set current year in credits
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Intro audio (plays on first interaction)
const introAudio = document.getElementById("intro-audio");
let hasTriedPlayIntro = false;

const audioToggleBtn = document.getElementById("audio-toggle");
const audioLabel = document.getElementById("audio-label");

// Update body classes + label for audio UI state
function setAudioUIState(isPlaying) {
  if (isPlaying) {
    document.body.classList.add("audio-is-playing");
    document.body.classList.remove("audio-is-muted");
    if (audioLabel) audioLabel.textContent = "On";
  } else {
    document.body.classList.remove("audio-is-playing");
    document.body.classList.add("audio-is-muted");
    if (audioLabel) audioLabel.textContent = "Off";
  }
}

// Try to play intro audio (respecting browser autoplay rules)
function tryPlayIntro() {
  if (!introAudio) return;

  // We can try multiple times, but don't spam
  if (!hasTriedPlayIntro) {
    hasTriedPlayIntro = true;
  }

  introAudio.volume = 0.9;

  introAudio
    .play()
    .then(() => {
      setAudioUIState(true);
    })
    .catch(() => {
      // Autoplay blocked; user will toggle manually later
      setAudioUIState(false);
    });
}

// Listen for first user interactions to trigger audio try
["click", "keydown", "wheel", "touchstart"].forEach((ev) => {
  document.addEventListener(ev, tryPlayIntro, { once: false });
});

// Toggle button: user can manually play/pause
if (audioToggleBtn && introAudio) {
  audioToggleBtn.addEventListener("click", () => {
    if (introAudio.paused) {
      introAudio
        .play()
        .then(() => setAudioUIState(true))
        .catch(() => setAudioUIState(false));
    } else {
      introAudio.pause();
      setAudioUIState(false);
    }
  });
}

// Keep UI in sync with actual audio events
if (introAudio) {
  introAudio.addEventListener("play", () => setAudioUIState(true));
  introAudio.addEventListener("pause", () => setAudioUIState(false));
  introAudio.addEventListener("ended", () => setAudioUIState(false));
}

// Smooth scroll helper
function smoothScrollTo(targetSelector) {
  const el = document.querySelector(targetSelector);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Buttons with data-scroll-target
document.querySelectorAll("[data-scroll-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-scroll-target");
    if (target) smoothScrollTo(target);
  });
});

// IntersectionObserver for scene visibility & animation triggers
const scenes = document.querySelectorAll(".scene");
const dots = document.querySelectorAll(".scene-dot");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const scene = entry.target;

      if (entry.isIntersecting) {
        scene.classList.add("is-visible");

        // update dots
        const sceneId = scene.getAttribute("id");
        dots.forEach((dot) => {
          const target = dot.getAttribute("data-target");
          if (target === `#${sceneId}`) {
            dot.classList.add("is-active");
          } else {
            dot.classList.remove("is-active");
          }
        });
      }
    });
  },
  {
    threshold: 0.4,
  }
);

scenes.forEach((scene) => observer.observe(scene));

// Dot navigation
dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const target = dot.getAttribute("data-target");
    if (target) smoothScrollTo(target);
  });
});

// Cursor-based lighting (spotlight), desktop only
const scenesContainer = document.querySelector(".scenes");

if (scenesContainer && window.matchMedia("(pointer: fine)").matches) {
  scenesContainer.addEventListener("mousemove", (event) => {
    const { clientX, clientY, currentTarget } = event;
    const rect = currentTarget.getBoundingClientRect();

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    document.documentElement.style.setProperty("--cursor-x", x.toString());
    document.documentElement.style.setProperty("--cursor-y", y.toString());
  });
}
