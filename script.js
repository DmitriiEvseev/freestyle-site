const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canUseObservers = "IntersectionObserver" in window;

const revealTargets = [
  ...document.querySelectorAll("section, .panel, .tile, .media-block"),
];

if (!prefersReducedMotion.matches && canUseObservers) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
} else {
  revealTargets.forEach((el) => {
    el.classList.add("visible");
  });
}

if (canUseObservers) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll("video").forEach((video) => {
    videoObserver.observe(video);
  });
}
