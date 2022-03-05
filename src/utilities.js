import * as poseDetection from '@tensorflow-models/pose-detection';
import { SCALE } from './constants';

const getByName = (array, name) => {
  let points = '';
  array.forEach(value => {
    if (value.name == name) {
      points = [value.x, value.y, value.score];
    }
  })
  return points;
}


function drawSegment([ax, ay], [bx, by], scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax*SCALE, ay*SCALE);
  ctx.lineTo(bx*SCALE, by*SCALE);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';
  ctx.stroke();
}

const round = (num) => {
  return Math.round(num * 100) / 100;
}

const getAngle = (start, mid, end) => {
  const angle = (
    Math.atan2(
      start[1] - mid[1],
      start[0] - mid[0]
    )
    - Math.atan2(
      end[1] - mid[1],
      end[0] - mid[0]
    )
  ) * (180 / Math.PI);
  return angle > 180 ? 360 - angle : angle;
}

const drawSkeleton = (keypoints, ctx) => {
  const leftShoulder = getByName(keypoints, 'left_shoulder');
  const leftHip = getByName(keypoints, 'left_hip');
  const rightShoulder = getByName(keypoints, 'right_shoulder');
  const rightHip = getByName(keypoints, 'right_hip');
  const leftKnee = getByName(keypoints, 'left_knee');
  const rightKnee = getByName(keypoints, 'right_knee');
  const leftAnkle = getByName(keypoints, 'left_ankle');
  const rightAnkle = getByName(keypoints, 'right_ankle');
  // console.log('left_shoulder', leftShoulder);
  // console.log('left_hip', leftHip);
  drawSegment(leftShoulder, leftHip, 1, ctx);
  drawSegment(rightShoulder, rightHip, 1, ctx);
  drawSegment(leftHip, leftKnee, 1, ctx);
  drawSegment(rightHip, rightKnee, 1, ctx);
  drawSegment(leftKnee, leftAnkle, 1, ctx);
  drawSegment(rightKnee, rightAnkle,1, ctx);
  if (rightAnkle[2] < .6) {
    return;
  }
  const kneeAngle = getAngle(rightAnkle, rightKnee, rightHip);
  const hipAngle = getAngle(rightKnee, rightHip, rightShoulder);
  ctx.fillStyle = 'green';
  ctx.font = "18px Verdana";
  ctx.fillText(round(kneeAngle), rightKnee[0]*SCALE, rightKnee[1]*SCALE);
  ctx.fillText(round(hipAngle), rightHip[0]*SCALE, rightHip[1]*SCALE);
  // console.log('kneeFlexion: ', kneeFlexion)
}


function drawPoint(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x*SCALE, y*SCALE, r, 0, 2 * Math.PI);
  ctx.fillStyle = "aqua";
  ctx.fill();
}

export const drawCanvas = (pose, video, canvas) => {
  const ctx = canvas.current.getContext("2d");
  canvas.current.width = 640;
  canvas.current.height = 480;
  
  const {  keypoints } = pose;
  keypoints.forEach(point => {
    const { x, y, name, score } = point;
    
    if (score < 0.5) {
      return
    }
    drawPoint(ctx, x, y, 3);
    console.log(`${round(x)},${round(y)},${name},${round(score)}`)
  })
  poseDetection.util
    .getAdjacentPairs(poseDetection.SupportedModels.MoveNet)
    .forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      // If score is null, just show the keypoint.
      const score1 = kp1.score != null ? kp1.score : 1;
      const score2 = kp2.score != null ? kp2.score : 1;
      const scoreThreshold = 0.3 || 0;

      if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
        ctx.beginPath();
        ctx.moveTo(kp1.x*SCALE, kp1.y*SCALE);
        ctx.lineTo(kp2.x*SCALE, kp2.y*SCALE);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.stroke();
      }
    });
  // drawSkeleton(keypoints, ctx);
  console.log('-----------------------------------------------------------------')
};


// BLOG: https://jmablog.com/post/posenet-app/

// knee = poses[0].pose.leftKnee;
// hip = poses[0].pose.leftHip;
// ankle = poses[0].pose.leftAnkle;
// shoulder = poses[0].pose.leftShoulder;
// anKnee = { x: knee.x, y: ankle.y };
// sHip = { x: shoulder.x, y: hip.y };

// kneeFlexion =
// (Math.atan2(ankle.y - knee.y, ankle.x - knee.x) - Math.atan2(hip.y - knee.y, hip.x - knee.x)) *
// (180 / Math.PI);
// hipFlexion =
// 360 -
// (Math.atan2(knee.y - hip.y, knee.x - hip.x) -
//   Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)) *
//   (180 / Math.PI);
// dorsiflexion =
// 360 -
// (Math.atan2(anKnee.y - ankle.y, anKnee.x - ankle.x) -
//   Math.atan2(knee.y - ankle.y, knee.x - ankle.x)) *
//   (180 / Math.PI);
// trunkLean =
// 360 -
// (Math.atan2(sHip.y - hip.y, sHip.x - hip.x) -
//   Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)) *
//   (180 / Math.PI);
