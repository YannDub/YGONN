const getPixels = require('get-pixels');
const jpg = require('jpeg-js');
const fs = require('fs');

exports.imread = async (path) => {
    return await new Promise((resolve, reject) => {
        getPixels(path, (err, pixels) => {
            if(err) {
                reject(err);
            } else {
                let [width, height, channels] = pixels.shape.slice();
                let rgba = []
                for(let i = 0; i < width; i++) {
                    let channelKernel = [];
                    for(let j = 0; j < height; j++) {
                        let row = [];
                        for(let k = 0; k < 3; k++) {
                            row.push(pixels.get(i,j,k));
                        }
                        channelKernel.push(row);
                    }
                    rgba.push(channelKernel);
                }
                resolve(rgba);
            }
        })
    });
}

exports.imwrite = (img, path) => {
    const width = img.length;
    const height = img[0].length;
    const channel = 4;

    let frameData = new Buffer(width * height * channel);
    let i = 0;
    while(i < frameData.length) {
        let x = Math.trunc((i / 4) % width);
        let y = Math.trunc(i / 4 / width)
        let pixel = img[x][y];

        let r = pixel[0];
        let g = pixel[1];
        let b = pixel[2];
        let a = 0xFF;

        frameData[i++] = r;
        frameData[i++] = g;
        frameData[i++] = b;
        frameData[i++] = a;
    }

    const resImg = {
        data: frameData,
        width: width,
        height: height
    }

    const jpegImage = jpg.encode(resImg, 100)
    fs.writeFileSync(path, jpegImage.data);
}