const Jimp = require('jimp');
const request = require('request');

module.exports = {
    getAvgRGBValues: async function(imageSrc) {
        return new Promise((resolve, reject) => {
            request.get({ url: imageSrc, encoding: null }, async (error, response, body) => {
                if (error) {
                    reject(error);
                    return;
                }
        
                try {
                    const image = await Jimp.read(body);
            
                    let rTotal = 0;
                    let gTotal = 0;
                    let bTotal = 0;
                    let numPixels = 0;
            
                    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                        const r = image.bitmap.data[idx + 0];
                        const g = image.bitmap.data[idx + 1];
                        const b = image.bitmap.data[idx + 2];
            
                        rTotal += r;
                        gTotal += g;
                        bTotal += b;
            
                        numPixels++;
                    });
            
                    let r = Math.round(rTotal / numPixels);
                    let g = Math.round(gTotal / numPixels);
                    let b = Math.round(bTotal / numPixels);

                    if (r < 101 && g < 101 && b < 101) {
                        const mostProminent = Math.max(r, Math.max(g, b));
                        if (r === mostProminent) {
                            r += 50;
                        }
                        if (g === mostProminent) {
                            g += 50;
                            b += 25;
                            r += 25;
                        }
                        if (b === mostProminent) {
                            b += 50;
                        }
                    }
            
                    resolve({
                        r: r,
                        g: g,
                        b: b
                    });
                } catch (err) {
                    reject(err);
                }
            });
        });
    }
}