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

  setAudioUIState(true);

  introAudio
    .play()
    .then(() => {
      // playing successfully
    })
    .catch(() => {
      // Browser blocked autoplay: UI still shows On,
      // sound will come when user presses the toggle
    });
}

// Toggle audio on button click
if (audioToggleBtn && introAudio) {
  audioToggleBtn.addEventListener("click", () => {
    if (introAudio.paused) {
      introAudio
        .play()
        .then(() => setAudioUIState(true))
        .catch(() => {
          setAudioUIState(true);
        });
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

// ---------- INTERSECTION OBSERVER (SCENE VISIBILITY + DOTS) ----------
const scenes = document.querySelectorAll(".scene");
const dots = document.querySelectorAll(".scene-dot");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const scene = entry.target;

      if (entry.isIntersecting) {
        scene.classList.add("is-visible");

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

// ---------- SCROLL HINT ----------
const scrollHint = document.getElementById("scroll-hint");

if (scenesContainer && scrollHint) {
  let hintHidden = false;

  function hideScrollHint() {
    if (hintHidden) return;
    hintHidden = true;
    scrollHint.classList.add("is-hidden");
  }

  // Hide once the user scrolls a bit
  scenesContainer.addEventListener("scroll", () => {
    if (scenesContainer.scrollTop > 40) {
      hideScrollHint();
    }
  });

  // Also hide if they interact with audio
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", hideScrollHint);
  }
}

// ---------- SCROLL-BASED SCENE ANIMATION ----------
function updateSceneScrollEffects() {
  if (!scenesContainer) return;

  const viewportHeight = window.innerHeight;
  const viewportCenter = viewportHeight / 2;

  scenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    const sceneCenter = rect.top + rect.height / 2;

    // Distance of scene center from viewport center
    const distance = Math.abs(sceneCenter - viewportCenter);

    // Normalize to 0–1: 1 when centered, ~0 when far away
    let progress = 1 - distance / (viewportHeight * 0.75);
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    scene.style.setProperty("--scene-progress", progress.toString());

    const bg = scene.querySelector(".scene-bg");
    const overlay = scene.querySelector(".scene-overlay");
    const card = scene.querySelector(".scene-copy");

    // Background zoom + vertical ease
    if (bg) {
      const zoom = 1.25 - progress * 0.15; // from 1.25 down to ~1.10
      const translateY = 40 - progress * 40; // from 40px down to 0
      bg.style.transform = `scale(${zoom}) translate3d(0, ${translateY}px, 0)`;
    }

    // Overlay opacity ramp
    if (overlay) {
      const overlayOpacity = 0.15 + progress * 0.85; // 0.15 -> 1.0
      overlay.style.opacity = overlayOpacity.toString();
    }

    // Card (glass overlay + text) fade/slide in
    if (card) {
      // Start card motion a bit later so BG gets a head start
      const cardProgress = Math.max(0, (progress - 0.2) / 0.8); // 0 at 0.2, 1 at 1
      const opacity = cardProgress;
      const translateY = (1 - cardProgress) * 32; // 32px -> 0

      card.style.opacity = opacity.toString();
      card.style.transform = `translateY(${translateY}px)`;
    }
  });
}

if (scenesContainer) {
  scenesContainer.addEventListener("scroll", updateSceneScrollEffects);
  window.addEventListener("resize", updateSceneScrollEffects);
  window.addEventListener("load", updateSceneScrollEffects);
}

// ---------- OVERLAYS (CHARACTERS & TEASER) ----------
const charactersOverlay = document.getElementById("characters-overlay");
const charactersOverlayBackdrop = document.getElementById(
  "characters-overlay-backdrop"
);
const openCharactersBtn = document.getElementById("open-characters");
const closeCharactersBtn = document.getElementById("close-characters");

const teaserOverlay = document.getElementById("teaser-overlay");
const teaserOverlayBackdrop = document.getElementById(
  "teaser-overlay-backdrop"
);
const openTeaserBtn = document.getElementById("open-teaser-modal");
const closeTeaserBtn = document.getElementById("close-teaser");

function openOverlay(el) {
  if (!el) return;
  el.classList.add("is-open");
}

function closeOverlay(el) {
  if (!el) return;
  el.classList.remove("is-open");
}

// Characters overlay events
if (openCharactersBtn && charactersOverlay) {
  openCharactersBtn.addEventListener("click", () => {
    openOverlay(charactersOverlay);
  });
}

if (closeCharactersBtn && charactersOverlay) {
  closeCharactersBtn.addEventListener("click", () => {
    closeOverlay(charactersOverlay);
  });
}

if (charactersOverlayBackdrop && charactersOverlay) {
  charactersOverlayBackdrop.addEventListener("click", () => {
    closeOverlay(charactersOverlay);
  });
}

// Teaser overlay events
if (openTeaserBtn && teaserOverlay) {
  openTeaserBtn.addEventListener("click", () => {
    openOverlay(teaserOverlay);
  });
}

if (closeTeaserBtn && teaserOverlay) {
  closeTeaserBtn.addEventListener("click", () => {
    closeOverlay(teaserOverlay);
  });
}

if (teaserOverlayBackdrop && teaserOverlay) {
  teaserOverlayBackdrop.addEventListener("click", () => {
    closeOverlay(teaserOverlay);
  });
}

// Close overlays on Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeOverlay(charactersOverlay);
    closeOverlay(teaserOverlay);
  }
});
