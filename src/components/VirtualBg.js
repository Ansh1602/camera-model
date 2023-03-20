// import { useEffect, useRef } from "react";
import React, { useEffect, useRef, useState } from 'react'
import { Camera } from "@mediapipe/camera_utils/camera_utils.js";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import * as faceapi from 'face-api.js';
import bg1 from '../images/bg1.jpg'
// import bg2 from '../images/bg2.jpg'

function VirtualBg() {
    const inputVideoRef = useRef();
    const canvasRef = useRef();
    let ctx = null;

    const videoHeight = 480;
    const videoWidth = 640;

    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [age, setAge] = useState(null)
    const [gender, setGender] = useState(null)
    const [expression, setExpression] = useState(null)


    useEffect(() => {
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

    }, [])

    const handleVideoOnPlay = async () => {

        canvasRef.current.innerHTML = faceapi.createCanvas(inputVideoRef.current);
        const displaySize = {
            width: videoWidth,
            height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize)
        // console.log(videoRef.current)


        setInterval(async () => {

            const detections = await faceapi.detectAllFaces(inputVideoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender();

            // console.log(detections[0])
            // console.log(detections[0].age)

            detections.forEach(result => {
                const { age, gender, genderProbability } = result
                console.log(result.expressions)
                const obj = result.expressions
                // console.log(`${faceapi.utils.round(age, 0)} years`)
                setAge(`${faceapi.utils.round(age, 0)} years`)
                // console.log(`${gender} (${faceapi.utils.round(genderProbability)})`)
                setGender(`${gender} (${faceapi.utils.round(genderProbability)})`)

                var max = Math.max.apply(null, Object.keys(obj).map(function (x) { return obj[x] }));
                // console.log(Object.keys(obj).filter(function (x) { return obj[x] === max; })[0]);
                setExpression(Object.keys(obj).filter(function (x) { return obj[x] === max; })[0]);

            })

        }, 2000);
    }





    const init = () => {
        const selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });

        ctx = canvasRef.current.getContext("2d");

        const constraints = {
            video: { width: { min: 640 }, height: { min: 480 } },
        };
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            inputVideoRef.current.srcObject = stream;
            // sendToMediaPipe();
        });

        selfieSegmentation.setOptions({
            modelSelection: 1,
            selfieMode: true,
        });

        selfieSegmentation.onResults(onResults);

        const camera = new Camera(inputVideoRef.current, {
            onFrame: async () => {
                await selfieSegmentation.send({ image: inputVideoRef.current });
            },
            width: 640,
            height: 480,
        });
        camera.start();
    };

    useEffect(() => {
        if (inputVideoRef.current) {
            init();
        }
    }, [inputVideoRef.current]);

    const onResults = (results) => {
        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
            results.segmentationMask,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
        );
        // Only overwrite existing pixels.
        // ctx.globalCompositeOperation = "source-out";
        // ctx.fillStyle = "#00FF00";
        // ctx.fillRect(
        //   0,
        //   0,
        //   canvasRef.current.width,
        //   canvasRef.current.height
        // );

        // Only overwrite missing pixels.
        // ctx.globalCompositeOperation = "destination-atop";
        ctx.globalCompositeOperation = "source-in";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
            results.image,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
        );

        ctx.restore();
    };

    return (
        <div >
            <video autoPlay ref={inputVideoRef} width={640} height={480} onPlay={handleVideoOnPlay} />
            <canvas ref={canvasRef} style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: '40%',
                // right: '55%',
                textAlign: "center",
                zindex: 9,
                width: 640,
                height: 480,
            }} width={640} height={480} />
            <img alt='' src={bg1} width='640' height='480' />
            <div className="container">
                <p className="text-center"><h2 style={{ display: 'contents' }}>Age: </h2>{age}</p>
                <p className="text-center"><h2 style={{ display: 'contents' }}>Gender: </h2>{gender}</p>
                <p className="text-center"><h2 style={{ display: 'contents' }}>Expression: </h2>{expression}</p>
            </div>
        </div>
    );
}

export default VirtualBg;
