const util = require("audio-buffer-utils");

export function loadFile(file) {
  return new Promise((resolve, reject) => {
    if (file.type.match(/video/)) {
      let videoReader = new FileReader();
      videoReader.onload = function () {
        let videoFileAsBuffer = videoReader.result;
        let audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioContext
          .decodeAudioData(videoFileAsBuffer)
          .catch((e) => {
            reject("This video doesn't seem to have audio track");
          })
          .then(function (decodedAudioData) {
            if (decodedAudioData) {
              const duration = decodedAudioData.duration;
              const sampleRate = decodedAudioData.sampleRate;
              const numberOfChannels = decodedAudioData.numberOfChannels;
              let offlineAudioContext = new OfflineAudioContext(
                numberOfChannels,
                sampleRate * duration,
                sampleRate
              );
              let soundSource = offlineAudioContext.createBufferSource();
              soundSource.buffer = decodedAudioData;
              soundSource.connect(offlineAudioContext.destination);
              soundSource.start();
              offlineAudioContext
                .startRendering()
                .then(function (renderedBuffer) {
                  resolve({
                    audioBuffer: renderedBuffer,
                    filename: file.name
                  });
                })
                .catch(function (err) {
                  console.log("Rendering failed: " + err);
                });
            }
          });
      };
      videoReader.readAsArrayBuffer(file);
    } else {
      reject("Not video file");
    }
  });
}

export function loadMultipleFiles(e) {
  return new Promise((resolve, reject) => {
    let files = [];
    Object.keys(e).forEach((file) => {
      files.push(loadFile(e[file]));
    });
    Promise.all(files).then((audioBuffers) => {
      if (audioBuffers.length > 0) {
        const mergedBuffers = util.concat(
          audioBuffers.map((buffer) => buffer.audioBuffer)
        );
        resolve({
          audioBuffer: mergedBuffers,
          filename:
            audioBuffers
              .map((file) => file.filename)
              .toString()
              .substring(0, 30) + "..."
        });
      }
    });
  });
}

export function drawWaveForm({ data }) {
  if (!data) {
    return;
  }
  const element = document.getElementById("waveform");
  const width = 320;
  const height = 80;
  const zoom = 1;
  const offset = 0;
  if (!element) {
    return;
  }

  // Render mono track
  if (data.numberOfChannels === 1) {
    const dataMono = data.getChannelData(0);
    const dataFrom = Math.floor(dataMono.length * offset);
    const canvasContext = element.getContext("2d");
    let stepPure = dataMono.length / (width * zoom);
    let step = Math.round(dataMono.length / (width * zoom));
    let amp = height / 2;
    canvasContext.clearRect(0, 0, width, height);
    canvasContext.strokeStyle = "rgb(255,255,255)";
    canvasContext.beginPath();
    canvasContext.moveTo(0, amp);
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j <= step; j++) {
        let datum = dataMono[dataFrom + Math.round(i * stepPure + j)];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      canvasContext.lineTo(i, (1 + min) * amp);
      canvasContext.lineTo(i, (1 + max) * amp);
    }
    canvasContext.stroke();
  }

  if (data.numberOfChannels === 2) {
    const dataLeft = data.getChannelData(0);
    const dataRight = data.getChannelData(1);
    const dataFrom = Math.floor(dataLeft.length * offset);
    const canvasContext = element.getContext("2d");
    canvasContext.globalCompositeOperation = "screen";
    let stepPure = dataLeft.length / (width * zoom);
    let step = Math.round(dataLeft.length / (width * zoom));
    let amp = height / 2;
    canvasContext.clearRect(0, 0, width, height);
    canvasContext.strokeStyle = "rgb(255,0,255)";
    canvasContext.beginPath();
    canvasContext.moveTo(0, amp);
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j <= step; j++) {
        let datum = dataLeft[dataFrom + Math.round(i * stepPure + j)];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      canvasContext.lineTo(i, (1 + min) * amp);
      canvasContext.lineTo(i, (1 + max) * amp);
    }
    canvasContext.stroke();
    canvasContext.strokeStyle = "rgb(0,255,255)";
    canvasContext.beginPath();
    canvasContext.moveTo(0, amp);
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j <= step; j++) {
        let datum = dataRight[dataFrom + Math.round(i * stepPure + j)];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      canvasContext.lineTo(i, (1 + min) * amp);
      canvasContext.lineTo(i, (1 + max) * amp);
    }
    canvasContext.stroke();
  }
}
