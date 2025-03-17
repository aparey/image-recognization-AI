import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Upload, Camera, Loader2 } from 'lucide-react';

function App() {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [predictions, setPredictions] = useState<Array<{ className: string; probability: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        // Initialize TensorFlow.js backend
        await tf.ready();
        // Load the MobileNet model
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load model:', error);
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !model) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      setImageUrl(img.src);

      img.onload = async () => {
        const predictions = await model.classify(img);
        setPredictions(predictions);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDemoImage = async () => {
    if (!model) return;
    const demoImageUrl = 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800';
    setImageUrl(demoImageUrl);
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = demoImageUrl;
    img.onload = async () => {
      const predictions = await model.classify(img);
      setPredictions(predictions);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Image Recognition</h1>
          <p className="text-gray-300">Upload an image and let AI identify what's in it</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="animate-spin" />
            <span>Loading AI model...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-8 transition-colors hover:border-gray-400">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
              />
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Uploaded" 
                  className="max-w-full max-h-[400px] rounded-lg shadow-lg mb-4"
                />
              ) : (
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
              <button
                onClick={handleDemoImage}
                className="mt-4 text-gray-400 hover:text-gray-300 underline"
              >
                Try with demo image
              </button>
            </div>

            {predictions.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Predictions</h2>
                <div className="space-y-3">
                  {predictions.map((prediction, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-gray-300">{prediction.className}</span>
                      <span className="text-blue-400">
                        {(prediction.probability * 100).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;