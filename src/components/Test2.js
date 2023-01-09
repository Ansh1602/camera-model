import React, { useEffect, useRef } from 'react';
import '../App.css';
import * as faceapi from 'face-api.js';
import sample1 from '../images/sample2.jpg';
import sample2 from '../images/sample3.jpg';
import sample3 from '../images/sample1.webp';
import sample4 from '../images/sample4.jpg';
import sample5 from '../images/sample5.png'
import sample6 from '../images/sample6.webp';
import sample7 from '../images/sample7.png';
import sample8 from '../images/sample8.png';
import sample10 from '../images/sample10.jpg';

// import { FaceExpressionNet, FaceLandmark68Net, FaceRecognitionNet, TinyFaceDetector } from 'face-api.js';


function Test2() {

  const imgRef = useRef()
  const canvasRef = useRef()

  const imageWidth = 900;
  const imageHeight = 540;

  const handleImage = async () => {
    const detections = await faceapi.detectAllFaces(
      imgRef.current,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceExpressions().withAgeAndGender();

    // console.log(detections);
    canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(imgRef.current)
    faceapi.matchDimensions(canvasRef.current, {
      width: imageWidth,
      height: imageHeight
    })

    const resized = faceapi.resizeResults(detections, {
      width: imageWidth,
      height: imageHeight
    })
    // faceapi.draw.drawDetections(canvasRef.current, resized)
    // faceapi.draw.drawFaceExpressions(canvasRef.current, resized)
    // faceapi.draw.drawFaceLandmarks(canvasRef.current, resized)

    faceapi.draw.drawDetections(canvasRef.current, resized.map(res => res.detection))
    resized.forEach(result => {
      const { age, gender, genderProbability } = result
      new faceapi.draw.DrawTextField(
        [
          `${faceapi.utils.round(age, 0)} years`,
          `${gender} (${faceapi.utils.round(genderProbability)})`
        ],
        result.detection.box
      ).draw(canvasRef.current)
    })
    
  }

  useEffect(() => {
    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        faceapi.nets.ageGenderNet.loadFromUri("/models"),
      ])
        .then(handleImage)
        .catch((e) => console.log(e));
    };

    imgRef.current && loadModels()
  }, [])


  
  return (
    <div className="app">
      <img ref={imgRef} src={sample10} alt="" width={imageWidth} height={imageHeight} />
      <canvas ref={canvasRef} width={imageWidth} height={imageHeight}/>
    </div>
  );
}

export default Test2;
