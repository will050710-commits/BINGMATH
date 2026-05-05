let totalSeconds = 60 * 60; // 60 minutes
const timeEl = document.getElementById("time");

function updateTimer() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  timeEl.textContent =
    `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (totalSeconds > 0) {
    totalSeconds--;
  } else {
    alert("Time's up!");
    clearInterval(timer);
  }
}

const timer = setInterval(updateTimer, 1000);
updateTimer();
