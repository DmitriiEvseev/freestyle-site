const ball = document.getElementById("ball");
const stage = document.querySelector(".stage");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let targetPosX = window.innerWidth * 0.7;
let targetPosY = window.innerHeight * 0.2;
let currentPosX = targetPosX;
let currentPosY = targetPosY;
let isDragging = false;
const spinRate = 0.72;

function animateBall() {
  currentX += (targetX - currentX) * 0.08;
  currentY += (targetY - currentY) * 0.08;

  ball.style.transform = `rotateZ(${performance.now() * spinRate}deg) rotateX(${currentY}deg) rotateY(${currentX}deg)`;
  currentPosX += (targetPosX - currentPosX) * 0.08;
  currentPosY += (targetPosY - currentPosY) * 0.08;
  stage.style.transform = `translate3d(${currentPosX}px, ${currentPosY}px, 0)`;

  requestAnimationFrame(animateBall);
}

function handlePointer(event) {
  if (!isDragging) {
    return;
  }
  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;

  targetX = x * 18;
  targetY = -y * 18;

  const halfW = stage.offsetWidth / 2;
  const halfH = stage.offsetHeight / 2;
  const maxX = window.innerWidth - stage.offsetWidth;
  const maxY = window.innerHeight - stage.offsetHeight;
  targetPosX = Math.min(Math.max(event.clientX - halfW, 0), maxX);
  targetPosY = Math.min(Math.max(event.clientY - halfH, 0), maxY);
}

window.addEventListener("pointermove", handlePointer);

stage.addEventListener("pointerdown", (event) => {
  isDragging = true;
  stage.classList.remove("idle");
  stage.setPointerCapture(event.pointerId);
  handlePointer(event);
});

function stopDrag(event) {
  isDragging = false;
  stage.classList.add("idle");
  targetX = 0;
  targetY = 0;
  if (event && stage.hasPointerCapture(event.pointerId)) {
    stage.releasePointerCapture(event.pointerId);
  }
}

window.addEventListener("pointerup", stopDrag);
window.addEventListener("pointercancel", stopDrag);

window.addEventListener("mouseleave", () => {
  targetX = 0;
  targetY = 0;
});

window.addEventListener("resize", () => {
  const maxX = window.innerWidth - stage.offsetWidth;
  const maxY = window.innerHeight - stage.offsetHeight;
  targetPosX = Math.min(Math.max(currentPosX, 0), maxX);
  targetPosY = Math.min(Math.max(currentPosY, 0), maxY);
});

stage.classList.add("idle");

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

const revealTargets = [
  ...document.querySelectorAll("section, .panel, .tile, .media-block"),
];

revealTargets.forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});

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

animateBall();
