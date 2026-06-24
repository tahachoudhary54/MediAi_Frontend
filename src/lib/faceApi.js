let faceapi;
let modelsLoaded = false;

export const loadFaceApiModels = async () => {
    if (typeof window === 'undefined') return;
    if (modelsLoaded) return;
    try {
        // Dynamically import to prevent Next.js SSR "TextEncoder is not a constructor" errors
        faceapi = await import('@vladmandic/face-api');
        
        // Explicitly set the WebGL hardware acceleration backend and await readiness
        await faceapi.tf.setBackend('webgl');
        await faceapi.tf.ready();

        const MODEL_URL = '/models';
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        modelsLoaded = true;
        console.log('FaceAPI models loaded on frontend using WebGL backend.');
    } catch (error) {
        console.error('Failed to load FaceAPI models:', error);
    }
};

export const getFaceEmbeddingLocal = async (imageElement) => {
    if (typeof window === 'undefined') return null;
    await loadFaceApiModels();
    if (!faceapi) return null;
    
    try {
        // Resize massive camera images to prevent the browser from hanging during WebGL tensor operations
        // A max width of 400px is still plenty for Face API to extract an accurate 128-d descriptor.
        const MAX_WIDTH = 400;
        let scale = 1;
        if (imageElement.width > MAX_WIDTH) {
            scale = MAX_WIDTH / imageElement.width;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = imageElement.width * scale;
        canvas.height = imageElement.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

        const detection = await faceapi.detectSingleFace(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 }))
            .withFaceLandmarks()
            .withFaceDescriptor();
            
        if (!detection) return null;
        // Convert Float32Array to standard array so it can be serialized in JSON
        return Array.from(detection.descriptor);
    } catch (error) {
        console.error('Error during local face extraction:', error);
        return null;
    }
};
