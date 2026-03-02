#  Smart Voice Recorder with Waveform & Speech Recognition

An advanced browser-based voice recorder built using the MediaRecorder API and Web Audio API.
The application supports real-time waveform visualization, speech-to-text transcription, recording management, and downloadable audio files.


## Features

-  Live microphone recording
-  Real-time waveform visualization (Canvas + AnalyserNode)
-  Recording timer with auto-stop (5 minutes max)
-  Pause & resume functionality
-  Speech-to-text transcription (Web Speech API)
-  Recording list management
- Play recordings
- Rename recordings
- Delete recordings
-  Download recordings (WEBM)
-  Responsive UI

## Built With

- HTML5
- CSS3
- Vanilla JavaScript
- MediaRecorder API
- Web Audio API
- Web Speech API
- Canvas API

## What I Learned

- Working with real-time audio streams
- Using the AnalyserNode for waveform rendering
- Managing browser permissions
- Handling Blob data and Object URLs
- Implementing speech recognition
- State management for recording lifecycle
- Performance optimization with requestAnimationFrame

## Future Improvements

- MP3 conversion support
- Save recordings to LocalStorage / IndexedDB
- Dark / Light theme toggle
- Audio trimming
- Noise visualization options
- Upload to cloud storage
- Download transcript as .txt

  
## Browser Support
- Best supported in Chromium-based browsers (Chrome, Edge)
- Speech recognition may not work in all browsers
