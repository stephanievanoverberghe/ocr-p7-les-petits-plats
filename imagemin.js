import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

(async () => {
    const files = await imagemin(['src/assets/img/*.{jpg,png,svg}'], {
        destination: 'dist/assets/img',
        plugins: [
            imageminWebp({ quality: 75 })
        ]
    });

    console.log('Images converted to WebP');
})();
