import htm from "https://cdn.skypack.dev/pin/htm@v3.0.4-G00WqxRFzynxIFjzzbrT/mode=imports,min/optimized/htm.js";
import {
  h,
  render,
} from "https://cdn.skypack.dev/pin/preact@v10.5.13-e7Xat0QM1JW9GKsSFwR3/mode=imports,min/optimized/preact.js";
import {
  setup,
  styled,
} from "https://cdn.skypack.dev/pin/goober@v2.0.37-T6xis7rOWKgsQPJ6RAcO/mode=imports,min/optimized/goober.js";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "https://cdn.skypack.dev/pin/preact@v10.5.13-e7Xat0QM1JW9GKsSFwR3/mode=imports,min/optimized/preact/hooks.js";

// Setup goober and htm
setup(h);
const html = htm.bind(h);

// Draw a waveform on canvas
function drawWave(canvasCtx, dataArray, height, width, cutoff) {
  // clear
  canvasCtx.clearRect(0, 0, width, height);

  // background
  canvasCtx.fillStyle = "rgb(255, 255, 255)";
  canvasCtx.fillRect(0, 0, width, height);

  // wave
  const diff =
    dataArray.reduce((prev, curr) => Math.max(prev, curr)) -
    dataArray.reduce((prev, curr) => Math.min(prev, curr));

  canvasCtx.lineWidth = 3;
  canvasCtx.strokeStyle =
    diff > cutoff
      ? `rgb(${diff}, ${Math.floor((255 - diff) / 2)}, 20)`
      : "rgba(0, 0, 0, 0.2)";
  canvasCtx.beginPath();

  const angleStep = (2 * Math.PI) / dataArray.length;
  const scaling = height / 128.0 / 4;
  let angle = 0;
  const offset = height / 2;

  dataArray.forEach((value, i) => {
    const amplitude = value * scaling;
    const x = Math.cos(angle) * amplitude + offset;
    const y = Math.sin(angle) * amplitude + offset;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }
    angle += angleStep;
  });
  const firstX = dataArray[0] * scaling + offset;
  canvasCtx.lineTo(firstX, offset);
  canvasCtx.stroke();
}

// Get an audio analyser node from microphone
async function startAudio() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyser);

  function stopStream() {
    stream.getTracks().forEach((track) => track.stop());
  }

  return { dataArray, analyser, stopStream };
}

// For use in a react component
export function useWave(cutoff = 10) {
  const [isRunning, setIsRunning] = useState(false);
  const cutoffRef = useRef(cutoff);
  const frameIdRef = useRef(null);
  const canvasRef = useRef(null);
  const stopRef = useRef(null);

  // Update cutoffRef
  useEffect(() => (cutoffRef.current = cutoff), [cutoff]);

  // For stopping the visualisation
  const stop = useCallback(() => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
  }, []);

  // For starting the visualisation
  const start = useCallback(async () => {
    if (!canvasRef.current) {
      console.error("Canvas not mounted");
      return;
    }
    if (frameIdRef.current || isRunning) {
      console.error("Already running");
      return;
    }

    const { stopStream, dataArray, analyser } = await startAudio();
    const canvasCtx = canvasRef.current.getContext("2d");
    const [height, width] = [canvasRef.current.height, canvasRef.current.width];
    setIsRunning(true);

    function loop() {
      frameIdRef.current = window.requestAnimationFrame(loop);
      analyser.getByteTimeDomainData(dataArray);
      drawWave(canvasCtx, dataArray, height, width, cutoffRef.current);
    }

    stopRef.current = () => {
      if (frameIdRef.current) {
        window.cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
        setIsRunning(false);
      }
      stopStream();
    };

    loop();
  }, [isRunning]);

  // For toggling the visualisation
  const toggle = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning]);

  // For connecting to a DOM element
  const ref = useCallback((canvas) => {
    if (canvas) {
      // Canvas mounted
      canvasRef.current = canvas;
    } else {
      // Cleanup
      stop();
    }
  }, []);
  return { ref, toggle, start, stop, isRunning };
}

const Btn = styled("button")`
  width: 100px;
  padding: 5px 20px;
`;

const Centered = styled("div")`
  display: flex;
  justify-content: center;
  border-right: 2px solid rgba(0, 0, 0, 0.5);
`;

function AudioWave() {
  const { isRunning, ref, toggle } = useWave(20);
  return html`<div>
    <div>
      <${Btn} onClick=${() => toggle()}>${isRunning ? "Stop" : "Start"}<//>
    </div>
    <${Centered}>
      <canvas width="200" height="200" ref=${ref}></canvas>
    <//>
  <//>`;
}

// Create a web component
class AudioWaveComponent extends HTMLElement {
  constructor() {
    super();
    render(html`<${AudioWave} />`, this);
  }
}
customElements.define("audio-wave", AudioWaveComponent);
