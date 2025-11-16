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

  // Also hide if they interact with audio (optional extra signal)
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", hideScrollHint);
  }
}
