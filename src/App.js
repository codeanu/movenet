import * as tf from '@tensorflow/tfjs';
import { useEffect, useRef } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import './App.css';
import { drawCanvas } from './utilities';
import Webcam from 'react-webcam';

function App() {
  // const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const webcamRef = useRef(null);
  const createDetector = async () => {
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    setInterval(() => {
      detect(detector);
    }, 200);
  };

  useEffect(() => {
    createDetector();
  }, [])

  const detect = async (detector) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // const video = document.getElementById('videoId');
      const video = webcamRef.current.video;
      const pose = await detector.estimatePoses(video);
      drawCanvas(pose[0], video, canvasRef);
    }
  }

  return (
    <div class="grid grid-cols-3 gap-4">
        {/* <video id="videoId" ref={videoRef} width="640" height="480" controls muted>
          <source src="squat.mp4" type="video/mp4" />
        </video> */}
        <Webcam
          ref={webcamRef}
        />
        <canvas ref={canvasRef}></canvas>
        <div className="p-5">
          <p class="text-lg">Angles</p>

        </div>
    </div>
  );
}

export default App;
