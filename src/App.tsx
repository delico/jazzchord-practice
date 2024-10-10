import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';

const noteFrequencies: { [key: string]: number } = {
  'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63,
  'F': 349.23, 'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00,
  'A#': 466.16, 'B': 493.88
};

const jazzChords = [
  'Cm7', 'C7', 'Cmaj7', 'C#m7', 'C#7', 'C#maj7',
  'Dm7', 'D7', 'Dmaj7', 'D#m7', 'D#7', 'D#maj7',
  'Em7', 'E7', 'Emaj7', 'Fm7', 'F7', 'Fmaj7',
  'F#m7', 'F#7', 'F#maj7', 'Gm7', 'G7', 'Gmaj7',
  'G#m7', 'G#7', 'G#maj7', 'Am7', 'A7', 'Amaj7',
  'A#m7', 'A#7', 'A#maj7', 'Bm7', 'B7', 'Bmaj7'
];

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentChord, setCurrentChord] = useState('');
  const [chordForm, setChordForm] = useState('A');
  const [audioInitialized, setAudioInitialized] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioInitialized) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        setAudioInitialized(true);
      }
    };

    window.addEventListener('click', initAudio);
    return () => {
      window.removeEventListener('click', initAudio);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioInitialized]);

  const playRootNote = (chord: string) => {
    if (!audioContextRef.current || !gainNodeRef.current || isMuted) return;

    const rootNote = chord.replace(/maj7|m7|7/, '');
    const rootFrequency = noteFrequencies[rootNote];
    
    if (!rootFrequency) {
      console.error(`Unknown root note: ${rootNote}`);
      return;
    }

    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
    }
    
    oscillatorRef.current = audioContextRef.current.createOscillator();
    oscillatorRef.current.type = 'sine';
    oscillatorRef.current.frequency.setValueAtTime(rootFrequency, audioContextRef.current.currentTime);
    
    const oscGain = audioContextRef.current.createGain();
    oscGain.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 10);
    
    oscillatorRef.current.connect(oscGain);
    oscGain.connect(gainNodeRef.current);
    
    oscillatorRef.current.start();
    oscillatorRef.current.stop(audioContextRef.current.currentTime + 10);
  };

  const togglePlay = () => {
    if (!audioInitialized) return;

    setIsPlaying((prev) => !prev);
    if (!isPlaying) {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      const playNextChord = () => {
        const randomChord = jazzChords[Math.floor(Math.random() * jazzChords.length)];
        setCurrentChord(randomChord);
        playRootNote(randomChord);
      };
      playNextChord(); // 即座に最初のコードを再生
      intervalRef.current = window.setInterval(playNextChord, 10000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCurrentChord('');
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
    }
  };

  const toggleSound = () => {
    setIsMuted((prev) => !prev);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0.5 : 0, audioContextRef.current.currentTime);
    }
  };

  const getChordNotes = (chord: string) => {
    const chordType = chord.replace(/[A-G]#?/, '');
    const rootNote = chord.replace(/maj7|m7|7/, '');
    
    let notes: string[] = [];
    switch (chordForm) {
      case 'A':
        switch (chordType) {
          case '7':
            notes = ['♭7th', '9th', '3rd', '13th'];
            break;
          case 'm7':
            notes = ['♭3rd', '5th', '♭7th', '9th'];
            break;
          case 'maj7':
            notes = ['3rd', '5th', '7th', '9th'];
            break;
        }
        break;
      // B フォームの場合はここに追加
    }
    return `${rootNote}: ${notes.join(', ')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">ジャズコード練習</h1>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={togglePlay}
            className={`px-4 py-2 rounded-full ${
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white font-semibold focus:outline-none transition duration-300 ease-in-out transform hover:scale-105`}
          >
            {isPlaying ? '停止' : '再生'}
          </button>
          <button
            onClick={toggleSound}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">現在のコード</h2>
          <p className="text-4xl font-bold text-blue-600">{currentChord}</p>
          {currentChord && (
            <p className="text-lg text-gray-600 mt-2">{getChordNotes(currentChord)}</p>
          )}
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setChordForm('A')}
            className={`px-4 py-2 rounded ${
              chordForm === 'A' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            } font-semibold focus:outline-none transition duration-300 ease-in-out`}
          >
            A フォーム
          </button>
          <button
            onClick={() => setChordForm('B')}
            className={`px-4 py-2 rounded ${
              chordForm === 'B' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            } font-semibold focus:outline-none transition duration-300 ease-in-out`}
          >
            B フォーム
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;