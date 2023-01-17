import React from 'react'
import ShapeDetect from 'react-shape-detect';
import sample1 from '../images/sample2.jpg';
import sample2 from '../images/sample3.jpg';

const path = 'path-or-url-to-image';
const overlay = 'path-or-url-to-overlay';

const func = function(data) {
  console.log('objects detected: ', data);
}

const Shape = () => {
  return (
    <ShapeDetect 
      image={sample1} 
      onRender={func} 
      options={{ 
        type: 'face', 
        overlay: { 
          input: overlay
        //   options: {
        //     width: '70%'
        //   }
        }
      }} 
    />
  )
}

export default Shape