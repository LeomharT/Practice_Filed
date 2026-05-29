const el = document.querySelector('#root');

// Video
const video = document.createElement('video');
el?.append(video);

// Canvas
const canvas = document.createElement('canvas');
el?.append(canvas);

const ctx = canvas.getContext('bitmaprenderer');

async function render(video?: HTMLVideoElement) {
  if (video) {
    const bitmap = await createImageBitmap(video);
    ctx?.transferFromImageBitmap(bitmap);
  }
  requestAnimationFrame(() => render(video));
}

navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((value) => {
  video.srcObject = value;
  video.play().then(async function () {
    render(video);
  });
});
