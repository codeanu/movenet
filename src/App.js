import * as tf from '@tensorflow/tfjs';
import { useEffect, useRef, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import './App.css';
import { drawCanvas } from './utilities';
import Webcam from 'react-webcam';
import { round } from './utilities';

const WEBCAM = 'webcam';
const MP4_VIDEO = 'mp4_video';
const MP4_LOCATION = 'videos/squat.mp4';

const VIDEO_MODE = WEBCAM;

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const webcamRef = useRef(null);
  const [currentAngles, setCurrentAngles] = useState({});
  const createDetector = async () => {
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    setInterval(() => {
      detect(detector);
    }, 200);
  };

  useEffect(() => {
    createDetector();
  }, [])

  const getVideoObj = () => {
    if(VIDEO_MODE === MP4_VIDEO) {
      return document.getElementById('videoId');
    }
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      return webcamRef.current.video;
    }
  }

  const detect = async (detector) => {
    const video = getVideoObj();
    if (!video ){
      console.log('video object not found')
      return;
    }
    const pose = await detector.estimatePoses(video);
    const angles = drawCanvas(pose[0], video, canvasRef);
    if (!angles) {
      return;
    }
    setCurrentAngles(angles);
  }

  const getVideo = () => {
    if (VIDEO_MODE === WEBCAM) {
      return <Webcam
        ref={webcamRef}
      />
    }
    else {
      return (
        <video id="videoId" ref={videoRef} width="640" height="480" controls muted>
          <source src={MP4_LOCATION} type="video/mp4" />
        </video>);
    }
  }
  function printCurrentAngles () {
    console.log('currentAngles: ', currentAngles)
    return (
      <ul>
        <li>Knee: {round(currentAngles.kneeAngle)}</li>
        <li>Hip: {round(currentAngles.hipAngle)}</li>
      </ul>
    )
    // return currentAngles.map(angle => {
    //   return <li></li>
    // });
  }

  return (
    <div className="grid grid-cols-3 gap-4">
        {getVideo()}
        <canvas ref={canvasRef}></canvas>
        <div className="p-5">
          <p className="text-lg">Angles</p>
            {printCurrentAngles()}
        </div>
    </div>
  );
}

export default App;
