import * as tf from '@tensorflow/tfjs';
import { useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import './App.css';

function App() {

  //  Load posenet
  const createDetector = async () => {
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    //
    var imageElement = document.getElementById('cat');
    const poses = await detector.estimatePoses(imageElement);
    console.log(poses[0].keypoints);

  };

  useEffect(() => {
    createDetector()
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img id='cat' src='./squat.png' crossOrigin='anonymous' />
      </header>
    </div>
  );
}

export default App;
