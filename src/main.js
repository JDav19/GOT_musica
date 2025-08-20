import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';

const trackList = [
  { file: 'lightOfSeven.mp3', name: 'Light of the Seven' },
  { file: 'mainTitle.mp3', name: 'Main Title' },
  { file: 'motherOfDragons.mp3', name: 'Mother of Dragons' },
  { file: 'rainsOfCastamere.mp3', name: 'The Rains of Castamere' },
  { file: 'theKingsArrival.mp3', name: "The King's Arrival" },
  { file: 'windsOfWinter.mp3', name: 'The Winds of Winter' },
  { file: 'winterHasCome.mp3', name: 'Winter Has Come' }
];

const trackGradients = [
  ['#000000', '#4A306B', '#8B7CA3'],
  ['#000000', '#1E3A5F', '#6B8CAF'],
  ['#000000', '#1F4A32', '#7A9B8A'],
  ['#000000', '#5A252A', '#A67B7F'],
  ['#000000', '#6a5623ff', '#C4B089'],
  ['#000000', '#4A6B7C', '#B8CDD6'],
  ['#000000', '#2F4F5F', '#9BB0BF']
];

let currentTrackIndex = 0;
let currentAudio = null;
let isPlaying = false;

const trackNameElement = document.getElementById('track-name');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

function setGradientBackground(colors) {
  document.body.style.background = `linear-gradient(
    to bottom,
    ${colors[0]} 0%,
    ${colors[1]} 60%,
    ${colors[2]} 100%
  )`;
}

function loadTrack(index, autoPlay = false) {
  if (currentAudio && isPlaying) {
    const fadeDuration = 1500;
    fadeOut(currentAudio, () => {
      currentAudio.pause();
      currentAudio = null;
      startNewTrack(index, autoPlay, fadeDuration);
    }, fadeDuration);
    setTimeout(() => {
      transitionBackground(index, fadeDuration / 2);
    }, fadeDuration / 2);
  } else {
    startNewTrack(index, autoPlay);
    setGradientBackground(trackGradients[index]);
  }
}

function startNewTrack(index, autoPlay, fadeDuration = 1000) {
  currentTrackIndex = index;
  trackNameElement.textContent = trackList[index].name;
  if (!currentAudio) {
    setGradientBackground(trackGradients[index]);
  }
  currentAudio = new Audio(`./assets/audio/${trackList[index].file}`);
  currentAudio.loop = true;
  currentAudio.volume = 0;
  currentAudio.preload = 'auto';
  if (autoPlay) {
    currentAudio.play();
    fadeIn(currentAudio, fadeDuration);
    updatePlayPauseButton(true);
  } else {
    updatePlayPauseButton(false);
  }
}

function transitionBackground(index, duration = 750) {
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '0';
  tempDiv.style.left = '0';
  tempDiv.style.width = '100%';
  tempDiv.style.height = '100%';
  tempDiv.style.zIndex = '-1';
  tempDiv.style.opacity = '0';
  tempDiv.style.transition = `opacity ${duration}ms ease-in-out`;
  const colors = trackGradients[index];
  tempDiv.style.background = `linear-gradient(
    to bottom,
    ${colors[0]} 0%,
    ${colors[1]} 60%,
    ${colors[2]} 100%
  )`;
  document.body.appendChild(tempDiv);
  setTimeout(() => {
    tempDiv.style.opacity = '1';
  }, 10);
  setTimeout(() => {
    setGradientBackground(colors);
    document.body.removeChild(tempDiv);
  }, duration);
}

function fadeIn(audio, duration = 1000) {
  const steps = 60;
  const targetVolume = 0.8;
  const timeStep = duration / steps;
  let currentStep = 0;
  audio.volume = 0;
  const fadeInterval = setInterval(() => {
    if (currentStep < steps && audio) {
      const progress = currentStep / steps;
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      audio.volume = Math.min(easedProgress * targetVolume, targetVolume);
      currentStep++;
    } else {
      clearInterval(fadeInterval);
    }
  }, timeStep);
}

function fadeOut(audio, callback, duration = 1000) {
  const steps = 60;
  const initialVolume = audio.volume;
  const timeStep = duration / steps;
  let currentStep = 0;
  const fadeInterval = setInterval(() => {
    if (currentStep < steps && audio) {
      const progress = currentStep / steps;
      const easedProgress = Math.pow(progress, 2);
      audio.volume = Math.max(initialVolume * (1 - easedProgress), 0);
      currentStep++;
    } else {
      clearInterval(fadeInterval);
      if (callback) callback();
    }
  }, timeStep);
}

function updatePlayPauseButton(playing) {
  isPlaying = playing;
  playPauseIcon.src = playing ? './assets/pause.svg' : './assets/play.svg';
  playPauseIcon.alt = playing ? 'Pause' : 'Play';
}
playPauseBtn.addEventListener('click', () => {
  if (!currentAudio) {
    loadTrack(currentTrackIndex, true);
  } else if (isPlaying) {
    currentAudio.pause();
    updatePlayPauseButton(false);
  } else {
    currentAudio.play();
    fadeIn(currentAudio);
    updatePlayPauseButton(true);
  }
});
prevBtn.addEventListener('click', () => {
  const prevIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : trackList.length - 1;
  loadTrack(prevIndex, isPlaying);
});
nextBtn.addEventListener('click', () => {
  const nextIndex = currentTrackIndex < trackList.length - 1 ? currentTrackIndex + 1 : 0;
  loadTrack(nextIndex, isPlaying);
});

setGradientBackground(trackGradients[currentTrackIndex]);
trackNameElement.textContent = trackList[currentTrackIndex].name;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  100
);
camera.position.set(0, 1.5, 12);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

let model = null;

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  if (model) {
    const width = window.innerWidth;
    if (width < 500) {
      model.scale.set(0.13, 0.13, 0.13);
      model.position.set(0.6, 0.5, 0);
    } else if (width < 900) {
      model.scale.set(0.18, 0.18, 0.18);
      model.position.set(0.6, 0, 0);
    } else {
      model.scale.set(0.25, 0.25, 0.25);
      model.position.set(0.6, 0, 0);
    }
  }
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.12;
controls.minDistance = 0;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI * 0.75;
controls.target.set(0, 1, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 8, 4);
scene.add(directionalLight);

const loader = new GLTFLoader();
loader.load(
  './assets/dragon.glb',
  (gltf) => {
    model = gltf.scene;
    const width = window.innerWidth;
    if (width < 500) {
      model.scale.set(0.13, 0.13, 0.13);
      model.position.set(0.6, 0.5, 0);
    } else if (width < 900) {
      model.scale.set(0.18, 0.18, 0.18);
      model.position.set(0.6, 0, 0);
    } else {
      model.scale.set(0.25, 0.25, 0.25);
      model.position.set(0.6, 0, 0);
    }
    model.rotation.y = Math.PI;
    scene.add(model);
  },
  undefined,
  (err) => { console.error('Error al cargar modelo:', err); }
);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();