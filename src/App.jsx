import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Logo from './assets/logo.png';
import User from './assets/user.jpg'; 
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from 'react-icons/fa';

const App = () => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [view, setView] = useState('forYou');
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { data } = await axios.get('https://cms.samespace.com/items/songs', {
          params: view === 'topTracks' ? { filter: { top_track: true } } : {},
        });
        setSongs(data.data.map(song => ({
          ...song,
          coverUrl: `https://cms.samespace.com/assets/${song.cover}`,
          audioUrl: `https://cms.samespace.com/assets/${song.url}`
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load songs.');
      }
    };

    fetchSongs();
  }, [view]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(err => setError('Failed to play audio.'));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [currentSong, isPlaying]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play().catch(err => setError('Failed to play audio.'));
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (songs.length && currentSong) {
      const nextIndex = (songs.findIndex(song => song.id === currentSong.id) + 1) % songs.length;
      setCurrentSong(songs[nextIndex]);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (songs.length && currentSong) {
      const prevIndex = (songs.findIndex(song => song.id === currentSong.id) - 1 + songs.length) % songs.length;
      setCurrentSong(songs[prevIndex]);
      setIsPlaying(true);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 col-sm-12 bg-dark text-white p-4 d-flex flex-column justify-content-between">
          <div className="text-center">
            <img src={Logo} alt="Logo" className="img-fluid" style={{ maxWidth: '100%' }} />
          </div>
          <div className="text-center">
            <img src={User} alt="User" className="img-fluid rounded-circle mb-4" style={{ width: '50px', height: '50px' }} />
          </div>
        </div>

        <div className="col-md-4 col-sm-12 sidebar bg-dark text-white p-4">
          <div className="nav nav-pills">
            {['forYou', 'topTracks'].map(type => (
              <button 
                key={type}
                className={`nav-link ${view === type ? 'active' : ''}`} 
                onClick={() => setView(type)}
              >
                {type.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
          <input type="text" className="form-control my-3" placeholder="Search Song, Artist" />
          <div className="song-list mt-4">
            {songs.length ? songs.map(song => (
              <div
                key={song.id}
                className={`song-item d-flex justify-content-between align-items-center p-2 ${currentSong && currentSong.id === song.id ? 'active' : ''}`}
                onClick={() => { setCurrentSong(song); setIsPlaying(true); }}
              >
                <div className="d-flex align-items-center">
                  <img src={song.coverUrl} alt={song.title} className="img-fluid rounded-circle me-2" style={{ width: '40px', height: '40px' }} />
                  <div>
                    <p className="mb-0">{song.title}</p>
                    <small>{song.artist}</small>
                  </div>
                </div>
                <span>{song.duration}</span>
              </div>
            )) : <p>No songs available.</p>}
          </div>
        </div>

        <div className="col-md-6 col-sm-12 main-content p-4">
          {currentSong ? (
            <div className="current-song text-center">
              <h2 className="fw-bold">{currentSong.title}</h2>
              <p className="fw-bold">{currentSong.artist}</p>
              <img src={currentSong.coverUrl} alt={currentSong.title} className="img-fluid mb-4" style={{ width: '300px', height: '300px', objectFit: 'cover' }} />
              <div className="controls d-flex justify-content-center align-items-center mt-4">
                <button onClick={handlePrevious} className="btn btn-dark"><FaStepBackward /></button>
                <button onClick={handlePlayPause} className="btn btn-dark mx-3">{isPlaying ? <FaPause /> : <FaPlay />}</button>
                <button onClick={handleNext} className="btn btn-dark"><FaStepForward /></button>
              </div>
              <audio ref={audioRef} preload="auto" />
            </div>
          ) : <p className="fw-bold">Select a song to play</p>}
        </div>
      </div>
    </div>
  );
}

export default App;
