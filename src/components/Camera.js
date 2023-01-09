import React from 'react'
import Webcam from 'react-webcam'

const Camera = () => {

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
      };
      

    const webcamRef = React.useRef(null);




    return (
        <div>
            <>
                <Webcam
                    mirrored={true}
                    audio={false}
                    height={480}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={720}
                    videoConstraints={videoConstraints}
                />
                <button>Capture photo</button>
            </>
        </div>
    )
}

export default Camera