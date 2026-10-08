const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

toggle?.addEventListener('click', () => nav.classList.toggle('open'));

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

document.getElementById('year').textContent = new Date().getFullYear();


/* Keep the original TSS artwork, but replace only its outer black background with white. */
function whitenLogoBackground(img) {
  if (img.dataset.whiteBgProcessed === 'true') return;
  img.dataset.whiteBgProcessed = 'true';

  const process = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = image.data;
      const w = canvas.width;
      const h = canvas.height;
      const visited = new Uint8Array(w * h);
      const queue = new Int32Array(w * h);
      let head = 0, tail = 0;

      const isDark = (p) => data[p] < 90 && data[p + 1] < 90 && data[p + 2] < 90;

      const add = (x, y) => {
        const i = y * w + x;
        if (!visited[i] && isDark(i * 4)) {
          visited[i] = 1;
          queue[tail++] = i;
        }
      };

      for (let x = 0; x < w; x++) { add(x, 0); add(x, h - 1); }
      for (let y = 0; y < h; y++) { add(0, y); add(w - 1, y); }

      while (head < tail) {
        const i = queue[head++];
        const x = i % w;
        const y = (i / w) | 0;
        const p = i * 4;

        data[p] = 255;
        data[p + 1] = 255;
        data[p + 2] = 255;
        data[p + 3] = 255;

        if (x > 0) add(x - 1, y);
        if (x < w - 1) add(x + 1, y);
        if (y > 0) add(x, y - 1);
        if (y < h - 1) add(x, y + 1);
      }

      ctx.putImageData(image, 0, 0);
      img.src = canvas.toDataURL('image/png');
    } catch (error) {
      console.warn('TSS logo background adjustment skipped:', error);
    }
  };

  if (img.complete && img.naturalWidth) process();
  else img.addEventListener('load', process, { once: true });
}

document.querySelectorAll('img[src="tss-logo.jpg"]').forEach(whitenLogoBackground);
