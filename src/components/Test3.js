import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js';

const Test3 = () => {

  const videoHeight = 480;
  const videoWidth = 640;

  const videoRef = useRef(null)
  const canvasRef = useRef(null)


  const [modelsLoaded, setModelsLoaded] = React.useState(false);


  React.useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),

      ]).then(setModelsLoaded(true));

    }
    loadModels();
  }, []);

  const handleVideoOnPlay = async () => {


    canvasRef.current.innerHTML = faceapi.createCanvas(videoRef.current);
    const displaySize = {
      width: videoWidth,
      height: videoHeight
    }

    faceapi.matchDimensions(canvasRef.current, displaySize)
    // console.log(videoRef.current)


    setInterval(async () => {

      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender();

      // console.log(detections)
      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight)

      faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections.map(res => res.detection))
                resizedDetections.forEach(result => {
                    const { age, gender, genderProbability } = result
                    new faceapi.draw.DrawTextField(
                        [
                            `${faceapi.utils.round(age, 0)} years`,
                            `${gender} (${faceapi.utils.round(genderProbability)})`
                        ],
                        result.detection.box
                    ).draw(canvasRef.current)
                })

    }, 2000);
  }


  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  }

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '10px' }}>
        <button onClick={startVideo} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '25px', border: 'none', borderRadius: '10px' }}>
          Open Webcam
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>

        <video id='video' muted autoPlay width={videoWidth} height={videoHeight} ref={videoRef} onPlay={handleVideoOnPlay} style={{ position: 'absolute' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute' }} width={videoWidth} height={videoHeight} />
      </div>

    </div>
  )
}

export default Test3