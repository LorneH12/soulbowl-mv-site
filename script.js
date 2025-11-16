// ---------- YEAR IN FOOTER ----------
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// ---------- AUDIO LOGIC ----------
const introAudio = document.getElementById("intro-audio");
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

// Try to start audio on load (music starts ON)
if (introAudio) {
  introAudio.volume = 0.9;

  // Start with UI as "On" + bars moving
  setAudioUIState(true);

  introAudio
    .play()
    .then(() => {
      // playing successfully, nothing else to do
    })
    .catch(() => {
      // Browser blocked autoplay: visually show "On" & bars,
      // but there won't be sound until user clicks.
      // That's okay; first click will really start audio.
    });
}

// Toggle audio on button click
if (audioToggleBtn && introAudio) {
  audioToggleBtn.addEventListener("click", () => {
    if (introAudio.paused) {
      // Turn ON
      introAudio
        .play()
        .then(() => setAudioUIState(true))
        .catch(() => {
          // Even if it can't play, keep UI as "On"
          setAudioUIState(true);
        });
    } else {
      // Turn OFF
      introAudio.pause();
      setAudioUIState(false);
    }
  });
}

// Keep UI in sync with actual audio events (safety net)
if (introAudio) {
  introAudio.addEventListener("play", () => setAudioUIState(true));
  introAudio.addEventListener("pause", () => setAudioUIState(false));
  introAudio.addEventListener("ended", () => setAudioUIState(false));
}

// ---------- SMOOTH SCROLL ----------
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

// ---------- INTERSECTION OBSERVER (SCENE TRANSITIONS) ----------
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

// ---------- DOT NAVIGATION ----------
dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const target = dot.getAttribute("data-target");
    if (target) smoothScrollTo(target);
  });
});

// ---------- CURSOR-BASED LIGHTING (DESKTOP ONLY) ----------
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
