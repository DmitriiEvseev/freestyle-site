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
let dragDelayId = null;
let pendingTouch = false;
let touchStartX = 0;
let touchStartY = 0;
const spinRate = 0.72;
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

function animateBall() {
  currentX += (targetX - currentX) * 0.08;
  currentY += (targetY - currentY) * 0.08;

  ball.style.transform = `rotateZ(${performance.now() * spinRate}deg) rotateX(${currentY}deg) rotateY(${currentX}deg)`;
  currentPosX += (targetPosX - currentPosX) * 0.08;
  currentPosY += (targetPosY - currentPosY) * 0.08;
  stage.style.transform = `translate3d(${currentPosX}px, ${currentPosY}px, 0)`;

  requestAnimationFrame(animateBall);
}

function updateDrag(clientX, clientY) {
  if (!isDragging) {
    return;
  }
  const x = clientX / window.innerWidth - 0.5;
  const y = clientY / window.innerHeight - 0.5;

  targetX = x * 18;
  targetY = -y * 18;

  const halfW = stage.offsetWidth / 2;
  const halfH = stage.offsetHeight / 2;
  const maxX = window.innerWidth - stage.offsetWidth;
  const maxY = window.innerHeight - stage.offsetHeight;
  targetPosX = Math.min(Math.max(clientX - halfW, 0), maxX);
  targetPosY = Math.min(Math.max(clientY - halfH, 0), maxY);
}

function handlePointer(event) {
  updateDrag(event.clientX, event.clientY);
}

if (!isTouchDevice) {
  window.addEventListener("pointermove", handlePointer);

  stage.addEventListener("pointerdown", (event) => {
    isDragging = true;
    stage.classList.remove("idle");
    stage.setPointerCapture(event.pointerId);
    updateDrag(event.clientX, event.clientY);
  });
}

function stopDrag(event) {
  if (dragDelayId) {
    window.clearTimeout(dragDelayId);
    dragDelayId = null;
  }
  pendingTouch = false;
  isDragging = false;
  stage.classList.add("idle");
  stage.style.touchAction = "";
  targetX = 0;
  targetY = 0;
  if (event && stage.hasPointerCapture(event.pointerId)) {
    stage.releasePointerCapture(event.pointerId);
  }
}

if (!isTouchDevice) {
  window.addEventListener("pointerup", stopDrag);
  window.addEventListener("pointercancel", stopDrag);
}

if (isTouchDevice) {
  stage.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length !== 1) {
        return;
      }
      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      pendingTouch = true;
      dragDelayId = window.setTimeout(() => {
        if (!pendingTouch) {
          return;
        }
        isDragging = true;
        stage.classList.remove("idle");
        stage.style.touchAction = "none";
        updateDrag(touchStartX, touchStartY);
      }, 220);
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (!pendingTouch && !isDragging) {
        return;
      }
      const touch = event.touches[0];
      if (!isDragging) {
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        if (Math.hypot(dx, dy) > 10) {
          stopDrag();
        }
        return;
      }
      event.preventDefault();
      updateDrag(touch.clientX, touch.clientY);
    },
    { passive: false }
  );

  window.addEventListener("touchend", stopDrag, { passive: true });
  window.addEventListener("touchcancel", stopDrag, { passive: true });
}

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
