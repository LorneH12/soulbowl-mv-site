// Set current year in credits
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Intro audio (plays on first interaction)
const introAudio = document.getElementById("intro-audio");
let hasPlayedIntro = false;

function tryPlayIntro() {
  if (hasPlayedIntro || !introAudio) return;

  // optional: adjust volume
  introAudio.volume = 0.9;

  introAudio
    .play()
    .then(() => {
      hasPlayedIntro = true;
    })
    .catch(() => {
      // autoplay may be blocked; user will trigger it on a later interaction
    });
}

// Listen for first user interaction to trigger audio
["click", "keydown", "wheel", "touchstart"].forEach((ev) => {
  document.addEventListener(ev, tryPlayIntro, { once: false });
});

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
