import { useState, useRef } from 'react';

export const useAudioPlayer = (audioRef: React.RefObject<HTMLAudioElement>, progressBarRef: React.RefObject<HTMLInputElement>) => {
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animationRef = useRef<number | null>(null); // reference the animation

  const onLoadedMetadata = () => {
    if (audioRef?.current?.duration) {
      const seconds = Math.floor(audioRef.current.duration);
      setDuration(seconds);
      progressBarRef!.current!.max = seconds.toString();
    }
  };

  // when the playhead is moved, update the current time (text)
  const updateCurrentTime = () => {
    setCurrentTime(Number(progressBarRef!.current!.value));
  };

  const pause = () => {
    if (audioRef.current && animationRef?.current) {
      audioRef.current.pause();
      cancelAnimationFrame(animationRef.current);
    }
  };

  const restart = () => {
    progressBarRef!.current!.value = "0";
    updateCurrentTime();
    pause();
  };

  const whilePlaying = () => {
    progressBarRef!.current!.value = Math.floor(audioRef!.current!.currentTime).toString();
    progressBarRef!.current!.style.setProperty(
      '--seek-before-width',
      `${(Number(progressBarRef!.current!.value) / duration) * 100}%`
    );
    updateCurrentTime();

    // when you reach the end of the song
    if (Number(progressBarRef!.current!.value) === duration) {
      restart();
      return;
    }

    animationRef.current = requestAnimationFrame(whilePlaying);
  };

  const play = () => {
    audioRef!.current!.play();
    animationRef.current = requestAnimationFrame(whilePlaying);
  };

  const changePlaybackSpeed = () => {
    switch (speed) {
      case 1:
        audioRef!.current!.playbackRate = 1.2;
        setSpeed(1.2);
        break;
      case 1.2:
        audioRef!.current!.playbackRate = 1.5;
        setSpeed(1.5);
        break;
      case 1.5:
        audioRef!.current!.playbackRate = 1.7;
        setSpeed(1.7);
        break;
      case 1.7:
        audioRef!.current!.playbackRate = 2;
        setSpeed(2);
        break;
      case 2:
      default:
        audioRef!.current!.playbackRate = 1;
        setSpeed(1);
        break;
    }
  };

  const togglePlaying = () => {
    const prevState = isPlaying;
    setIsPlaying(!prevState);
    if (!prevState) {
      play();
    } else {
      pause();
    }
  };

  // the playhead moves when you click on the progress bar
  // update the audio player to the new point
  const changeAudioToPlayhead = () => {
    audioRef!.current!.currentTime = Number(progressBarRef!.current!.value);
    setCurrentTime(Number(progressBarRef!.current!.value));
    progressBarRef!.current!.style.setProperty(
      '--seek-before-width',
      `${(Number(progressBarRef!.current!.value) / duration) * 100}%`
    );
  };

  const timeTravel = (newTime: number) => {
    progressBarRef!.current!.value = newTime.toString();
    updateCurrentTime();
    changeAudioToPlayhead();
  };

  const backThirty = () => {
    timeTravel(Number(progressBarRef!.current!.value) - 30);
  };

  const forwardThirty = () => {
    timeTravel(Number(progressBarRef!.current!.value) + 30);
  };

  const skipToTime = (newTime: number) => {
    timeTravel(newTime);
    play();
  };

  // toggle play / pause when you tap the space bar
  const tapSpaceBar = (e: KeyboardEvent) => {
    if (e.keyCode === 32) {
      togglePlaying();
    }
  };

  return {
    backThirty,
    changeAudioToPlayhead,
    changePlaybackSpeed,
    currentTime,
    duration,
    forwardThirty,
    isPlaying,
    onLoadedMetadata,
    play,
    skipToTime,
    speed,
    tapSpaceBar,
    togglePlaying,
  };
};
