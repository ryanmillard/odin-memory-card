export default function preloadImages(key, imageURLs) {
  if (!window[key]) {
    window[key] = [];
  }

  const imagesPromises = imageURLs.map(URL => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL;

      img.onload = () => {
        window[key].push(img);
        resolve(img);
      };

      img.onerror = () => {
        reject('Failed to load image.');
      };
    })
  })

  return Promise.all(imagesPromises).then(images => {
    return () => {
      images.forEach(img => {
        img.src = ''; // Allows images to be garbage collected
      });
      window[key] = [];
    };
  })
}