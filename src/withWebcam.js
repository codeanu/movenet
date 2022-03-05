import * as tf from '@tensorflow/tfjs';
import { useEffect, useRef } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import Webcam from 'react-webcam';
import './App.css';

function App() {
  const webcamRef = useRef(null);

  //  Load posenet
  const createDetector = async () => {

    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

    //
    setInterval(() => {
      detect(detector);
    }, 500);
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
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Make Detections
      const pose = await detector.estimatePoses(video);
      // console.log(pose);
      console.log(pose[0].keypoints);
    }
  }


  return (
    <div className="App">
      <header className="App-header">
        <Webcam
            ref={webcamRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 9,
              width: 640,
              height: 480,
            }}
          />
      </header>
    </div>
  );
}

export default App;
