document.addEventListener("DOMContentLoaded", () => {

  let mediaRecorder = null;
  let audioChunks = [];
  let recordings = [];
  let timerInterval = null;
  let seconds = 0;
  const MAX_DURATION = 300;

  let audioContext = null;
  let analyser = null;
  let dataArray = null;
  let bufferLength = null;
  let animationId = null;
  let recognition = null;

  const startBtn = document.getElementById("start");
  const pauseBtn = document.getElementById("pause");
  const stopBtn = document.getElementById("stop");
  const downloadWebmBtn = document.getElementById("downloadWebm");

  const audio = document.getElementById("audio");
  const timer = document.getElementById("timer");
  const transcript = document.getElementById("transcript");
  const recordingsList = document.getElementById("recordings");
  const canvas = document.getElementById("waveform");
  const canvasCtx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function updateTimer() {
    seconds++;
    timer.textContent =
      String(Math.floor(seconds / 60)).padStart(2, "0") +
      ":" +
      String(seconds % 60).padStart(2, "0");

    if (seconds >= MAX_DURATION) stopRecording();
  }

  function drawWaveform() {
    animationId = requestAnimationFrame(drawWaveform);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = "#020617";
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "#38bdf8";
    canvasCtx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      drawWaveform();

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);

        audio.src = url;
        audio.load();
        audio.play();

        recordings.push({
          name: "Recording " + (recordings.length + 1),
          url: url
        });

        renderRecordings();
        downloadWebmBtn.disabled = false;
      };

      mediaRecorder.start();

      seconds = 0;
      timer.textContent = "00:00";
      timerInterval = setInterval(updateTimer, 1000);

      startSpeechToText();

      startBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;

    } catch (error) {
      alert("Microphone permission denied or unsupported browser.");
      console.error(error);
    }
  }

  function pauseRecording() {
    if (!mediaRecorder) return;

    if (mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      pauseBtn.textContent = "Resume";
      if (recognition) recognition.stop();
    } else if (mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      pauseBtn.textContent = "Pause";
      if (recognition) recognition.start();
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    clearInterval(timerInterval);

    if (recognition) recognition.stop();

    if (animationId) cancelAnimationFrame(animationId);
    if (audioContext) audioContext.close();

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.textContent = "Pause";
  }

  function renderRecordings() {
    recordingsList.innerHTML = "";

    recordings.forEach((rec, index) => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.justifyContent = "space-between";
      li.style.gap = "6px";

      const name = document.createElement("span");
      name.textContent = rec.name;
      name.style.flex = "1";

      const playBtn = document.createElement("button");
      playBtn.textContent = "▶";
      playBtn.onclick = () => {
        audio.src = rec.url;
        audio.play();
      };

      const renameBtn = document.createElement("button");
      renameBtn.textContent = "✏";
      renameBtn.onclick = () => {
        const newName = prompt("Rename recording:", rec.name);
        if (newName) {
          recordings[index].name = newName;
          renderRecordings();
        }
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑";
      deleteBtn.onclick = () => {
        if (confirm("Delete this recording?")) {
          recordings.splice(index, 1);
          renderRecordings();
        }
      };

      li.appendChild(name);
      li.appendChild(playBtn);
      li.appendChild(renameBtn);
      li.appendChild(deleteBtn);

      recordingsList.appendChild(li);
    });
  }

  function startSpeechToText() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      transcript.value = text;
    };

    recognition.onend = () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        recognition.start();
      }
    };

    recognition.start();
  }

  downloadWebmBtn.addEventListener("click", () => {
    if (!audio.src) return;
    const a = document.createElement("a");
    a.href = audio.src;
    a.download = "recording.webm";
    a.click();
  });

  startBtn.addEventListener("click", startRecording);
  pauseBtn.addEventListener("click", pauseRecording);
  stopBtn.addEventListener("click", stopRecording);

});