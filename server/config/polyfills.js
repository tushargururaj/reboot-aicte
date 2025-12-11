
import { Canvas, Image, ImageData, DOMMatrix, Path2D } from '@napi-rs/canvas';

if (typeof global.DOMMatrix === 'undefined') {
    global.DOMMatrix = DOMMatrix;
}
if (typeof global.ImageData === 'undefined') {
    global.ImageData = ImageData;
}
if (typeof global.Path2D === 'undefined') {
    global.Path2D = Path2D;
}
if (typeof global.Canvas === 'undefined') {
    global.Canvas = Canvas;
}
if (typeof global.Image === 'undefined') {
    global.Image = Image;
}

console.log("Polyfills loaded: DOMMatrix, ImageData, Path2D, Canvas, Image");
