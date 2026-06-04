from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech, SpeechT5HifiGan
from datasets import load_dataset
import soundfile as sf
import io
import os
import numpy as np

app = Flask(__name__)
CORS(app)

# Global variables to store models
processor = None
model = None
vocoder = None
embeddings_dataset = None

def load_models():
    """Load SpeechT5 models and processor"""
    global processor, model, vocoder, embeddings_dataset
    
    print("Loading SpeechT5 models...")
    
    # Load processor and model
    processor = SpeechT5Processor.from_pretrained("microsoft/speecht5_tts")
    model = SpeechT5ForTextToSpeech.from_pretrained("microsoft/speecht5_tts")
    vocoder = SpeechT5HifiGan.from_pretrained("microsoft/speecht5_hifigan")
    
    # Load speaker embeddings
    embeddings_dataset = load_dataset("Matthijs/cmu-arctic-xvectors", split="validation")
    
    print("Models loaded successfully!")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "models_loaded": model is not None})

@app.route('/synthesize', methods=['POST'])
def synthesize_speech():
    """Synthesize speech from text"""
    try:
        data = request.json
        text = data.get('text', '')
        speaker_id = data.get('speaker_id', 0)  # Default to first speaker
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Prepare inputs
        inputs = processor(text=text, return_tensors="pt")
        
        # Get speaker embedding
        speaker_embedding = torch.tensor(embeddings_dataset[speaker_id]["xvector"]).unsqueeze(0)
        
        # Generate speech
        with torch.no_grad():
            speech = model.generate_speech(inputs["input_ids"], speaker_embedding, vocoder=vocoder)
        
        # Convert to numpy and save to memory
        speech_np = speech.numpy()
        
        # Create in-memory file
        audio_buffer = io.BytesIO()
        sf.write(audio_buffer, speech_np, samplerate=16000, format='WAV')
        audio_buffer.seek(0)
        
        return send_file(
            audio_buffer,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='speech.wav'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/speakers', methods=['GET'])
def get_speakers():
    """Get available speaker IDs"""
    try:
        num_speakers = len(embeddings_dataset)
        return jsonify({
            "total_speakers": num_speakers,
            "speaker_ids": list(range(num_speakers)),
            "sample_speakers": [0, 1, 2, 3, 4]  # First 5 as examples
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/synthesize_json', methods=['POST'])
def synthesize_speech_json():
    """Synthesize speech and return as base64 JSON (alternative endpoint)"""
    try:
        import base64
        
        data = request.json
        text = data.get('text', '')
        speaker_id = data.get('speaker_id', 0)
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Prepare inputs
        inputs = processor(text=text, return_tensors="pt")
        
        # Get speaker embedding
        speaker_embedding = torch.tensor(embeddings_dataset[speaker_id]["xvector"]).unsqueeze(0)
        
        # Generate speech
        with torch.no_grad():
            speech = model.generate_speech(inputs["input_ids"], speaker_embedding, vocoder=vocoder)
        
        # Convert to numpy and encode
        speech_np = speech.numpy()
        
        # Create in-memory file
        audio_buffer = io.BytesIO()
        sf.write(audio_buffer, speech_np, samplerate=16000, format='WAV')
        audio_data = audio_buffer.getvalue()
        
        # Encode to base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return jsonify({
            "audio_base64": audio_base64,
            "sample_rate": 16000,
            "format": "wav"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Load models on startup
    load_models()
    
    # Start Flask app
    app.run(host='0.0.0.0', port=8000, debug=False)