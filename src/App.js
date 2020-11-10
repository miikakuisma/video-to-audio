import React, { useState, useRef } from "react";
import FileDrop from "./FileDrop";
import { loadFile, loadMultipleFiles, drawWaveForm } from "./lib";
import "./styles.css";

export default function App() {
  const inputRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [wave, setWave] = useState(null);
  const [progress, setProgress] = useState(null);

  const handleDropFile = (e) => {
    if (e.length < 1) {
      return;
    }
    if (e.length === 1) {
      const file = e[0];
      setSpinner(true);
      loadFile(file)
        .catch((e) => {
          alert(e);
        })
        .then((response) => {
          setSpinner(false);
          setHovering(false);
          if (response) {
            setWave(response);
            drawWaveForm({ data: response.audioBuffer });
          }
        });
    }
    if (e.length > 1) {
      setSpinner(true);
      loadMultipleFiles(e).then((mergedBuffers) => {
        setSpinner(false);
        setHovering(false);
        setWave(mergedBuffers);
        drawWaveForm({ data: mergedBuffers.audioBuffer });
      });
    }
  };

  const handleDragIn = () => {
    setHovering(true);
  };

  const handleDragOut = () => {
    setHovering(false);
  };

  const handleLoadFile = () => {
    handleDropFile(inputRef.current.files);
  };

  const handleDownload = () => {
    setSpinner(true);
    var audioEncoder = require("audio-encoder");
    const format = 0; // 0 = wav
    const buffer = wave.audioBuffer;
    audioEncoder(
      buffer,
      format,
      (e) => {
        setProgress(e);
      },
      (newBlob) => {
        // Download the blob
        let a = document.createElement("a");
        a.href = URL.createObjectURL(newBlob);
        a.download = wave.filename + ".wav";
        a.click();
        setSpinner(false);
      }
    );
  };

  return (
    <div className="App">
      <FileDrop
        onDrop={handleDropFile}
        onDragIn={handleDragIn}
        onDragOut={handleDragOut}
        onClick={() => inputRef.current.click()}
      />
      <input
        type="file"
        ref={inputRef}
        id="movieFile"
        onChange={handleLoadFile}
        style={{ display: "none" }}
      />
      <div className="message">
        {spinner && (
          <div className="spinner">
            <img src="/spinner.svg" alt="spinner" />
            {progress && `${progress}%`}
          </div>
        )}
        {wave && <canvas id="waveform" width="320" height="80" />}
        {hovering
          ? "Now drop it!"
          : wave
          ? wave.filename
          : !spinner && "Drop video file"}
        <br />
        {wave &&
          wave.filename &&
          `${Math.floor(wave.audioBuffer.duration)} sec, ${
            wave.audioBuffer.sampleRate
          }kHz, ${wave.audioBuffer.numberOfChannels === 1 ? "Mono" : "Stereo"}`}
        {wave && <button onClick={handleDownload}>Download as WAV</button>}
      </div>
    </div>
  );
}
