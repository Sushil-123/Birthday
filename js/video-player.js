let currentSpeed = 1;
const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
let hideControlsTimeout;

function initializeVideoPlayer() {
    const video = document.getElementById('modalVideo');
    const player = document.getElementById('videoPlayer');
    const centerControls = document.getElementById('centerControls');
    const videoControls = document.getElementById('videoControls');
    
    if (!video || !player) return;
    
    // Force controls to be visible initially
    if (videoControls) {
        videoControls.classList.add('show');
    }
    
    // Show controls initially
    showControls();
    
    // Event listeners
    video.addEventListener('loadedmetadata', updateTimeDisplay);
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    
    player.addEventListener('mousemove', showControls);
    player.addEventListener('mouseleave', startHideTimer);
    video.addEventListener('mousemove', showControls);
    video.addEventListener('mouseleave', startHideTimer);
    
    // Add listeners to controls to prevent hiding when interacting
    if (videoControls) {
        videoControls.addEventListener('mouseenter', () => clearTimeout(hideControlsTimeout));
        videoControls.addEventListener('mouseleave', startHideTimer);
    }
    
    // Double tap functionality
    let tapCount = 0;
    let tapTimer = null;
    
    player.addEventListener('click', function(e) {
        // Don't handle double tap if clicking on controls
        if (e.target.closest('.video-controls')) {
            return;
        }
        
        tapCount++;
        
        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 300);
        } else if (tapCount === 2) {
            clearTimeout(tapTimer);
            tapCount = 0;
            
            const rect = player.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const playerWidth = rect.width;
            const leftZone = playerWidth * 0.3;  // Left 30%
            const rightZone = playerWidth * 0.7; // Right 30%
            
            if (clickX < leftZone) {
                // Left side - skip backward
                skipBackward();
                showSkipIndicator('backward');
            } else if (clickX > rightZone) {
                // Right side - skip forward
                skipForward();
                showSkipIndicator('forward');
            }
            // Middle area (30%-70%) does nothing on double tap
        }
    });
    
    // Initialize volume
    updateVolumeDisplay();
}

function showControls() {
    const videoControls = document.getElementById('videoControls');
    
    if (videoControls) {
        videoControls.classList.add('show');
    }
    
    const player = document.getElementById('videoPlayer');
    if (player) {
        player.style.cursor = 'default';
    }
    
    clearTimeout(hideControlsTimeout);
    startHideTimer();
}

function startHideTimer() {
    clearTimeout(hideControlsTimeout);
    
    hideControlsTimeout = setTimeout(() => {
        hideControls();
    }, 3000);
}

function hideControls() {
    const video = document.getElementById('modalVideo');
    // Don't hide controls if video is paused
    if (video && video.paused) return;
    
    const videoControls = document.getElementById('videoControls');
    
    if (videoControls) {
        videoControls.classList.remove('show');
    }
    
    const player = document.getElementById('videoPlayer');
    if (player) {
        player.style.cursor = 'none';
    }
}

function handlePlayerClick(e) {
    if (e.target.closest('.video-controls')) {
        return;
    }
    // No action on single click - only buttons control play/pause
}

function onPlay() {
    const player = document.getElementById('videoPlayer');
    const playControl = document.getElementById('playControl');
    
    if (player) player.classList.add('playing');
    
    // Update play button icon
    const pauseIcon = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    if (playControl) playControl.querySelector('svg path').setAttribute('d', pauseIcon.match(/d="([^"]+)"/)[1]);
    
    startHideTimer();
}

function onPause() {
    const player = document.getElementById('videoPlayer');
    const playControl = document.getElementById('playControl');
    
    if (player) player.classList.remove('playing');
    
    // Update play button icon
    const playIcon = 'M8 5v14l11-7z';
    if (playControl) playControl.querySelector('svg path').setAttribute('d', playIcon);
    
    showControls();
    clearTimeout(hideControlsTimeout);
}

function updateProgress() {
    const video = document.getElementById('modalVideo');
    const progressFill = document.getElementById('progressFill');
    const progressHandle = document.getElementById('progressHandle');
    
    if (video && video.duration && progressFill) {
        const percent = (video.currentTime / video.duration) * 100;
        progressFill.style.width = percent + '%';
        if (progressHandle) progressHandle.style.left = percent + '%';
    }
    updateTimeDisplay();
}

function updateTimeDisplay() {
    const video = document.getElementById('modalVideo');
    const timeDisplay = document.getElementById('timeDisplay');
    
    if (video && timeDisplay) {
        const current = formatTime(video.currentTime || 0);
        const duration = formatTime(video.duration || 0);
        timeDisplay.textContent = `${current} / ${duration}`;
    }
}

function togglePlay() {
    const video = document.getElementById('modalVideo');
    if (video) {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }
}

function skipBackward() {
    const video = document.getElementById('modalVideo');
    if (video) {
        video.currentTime = Math.max(0, video.currentTime - 10);
    }
    showSkipIndicator('backward');
}

function skipForward() {
    const video = document.getElementById('modalVideo');
    if (video) {
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
    }
    showSkipIndicator('forward');
}

function showSkipIndicator(direction) {
    const player = document.getElementById('videoPlayer');
    if (!player) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'skip-indicator';
    
    const isBackward = direction === 'backward';
    indicator.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="${isBackward ? 'M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z' : 'M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z'}"/>
        </svg>
        <span>${isBackward ? '-10s' : '+10s'}</span>
    `;
    
    indicator.style.cssText = `
        position: absolute;
        top: 50%;
        ${isBackward ? 'left: 2%' : 'right: 2%'};
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.24);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        z-index: 25;
        pointer-events: none;
        animation: skipFade 0.8s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes skipFade {
            0% { opacity: 0; transform: translateY(-50%) scale(0.9); }
            20% { opacity: 1; transform: translateY(-50%) scale(1); }
            80% { opacity: 1; transform: translateY(-50%) scale(1); }
            100% { opacity: 0; transform: translateY(-50%) scale(0.9); }
        }
        @media (max-width: 768px) {
            .skip-indicator {
                padding: 6px 10px !important;
                font-size: 11px !important;
            }
            .skip-indicator svg {
                width: 20px !important;
                height: 20px !important;
            }
        }
        @media (max-width: 480px) {
            .skip-indicator {
                padding: 5px 8px !important;
                font-size: 10px !important;
            }
            .skip-indicator svg {
                width: 18px !important;
                height: 18px !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    player.appendChild(indicator);
    
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 800);
}

function setProgress(e) {
    const video = document.getElementById('modalVideo');
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    
    if (video && video.duration) {
        video.currentTime = pos * video.duration;
    }
}

function toggleMute() {
    const video = document.getElementById('modalVideo');
    if (video) {
        video.muted = !video.muted;
        updateVolumeDisplay();
    }
}

function setVolume(e) {
    const video = document.getElementById('modalVideo');
    const volumeSlider = e.currentTarget;
    const rect = volumeSlider.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    
    if (video) {
        video.volume = pos;
        video.muted = false;
        updateVolumeDisplay();
    }
}

function updateVolumeDisplay() {
    const video = document.getElementById('modalVideo');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeFill = document.getElementById('volumeFill');
    
    if (!video || !volumeBtn || !volumeFill) return;
    
    const volume = video.muted ? 0 : video.volume;
    volumeFill.style.width = (volume * 100) + '%';
    
    let icon;
    if (video.muted || volume === 0) {
        icon = 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z';
    } else if (volume < 0.5) {
        icon = 'M3 9v6h4l5 5V4L7 9H3z';
    } else {
        icon = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z';
    }
    
    volumeBtn.querySelector('svg path').setAttribute('d', icon);
}

function toggleSpeed() {
    const video = document.getElementById('modalVideo');
    const speedBtn = document.getElementById('speedBtn');
    
    if (video && speedBtn) {
        const currentIndex = speeds.indexOf(currentSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        currentSpeed = speeds[nextIndex];
        
        video.playbackRate = currentSpeed;
        speedBtn.textContent = currentSpeed + 'x';
    }
}

function togglePiP() {
    const video = document.getElementById('modalVideo');
    
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled && video) {
        video.requestPictureInPicture();
    }
}

let currentRotation = 0;

function toggleRotation() {
    const player = document.getElementById('videoPlayer');
    if (!document.fullscreenElement) return;
    
    currentRotation = (currentRotation + 90) % 360;
    player.style.transition = 'transform 0.3s ease';
    player.style.transform = `rotate(${currentRotation}deg)`;
    
    // Adjust player size for portrait/landscape
    if (currentRotation === 90 || currentRotation === 270) {
        player.style.width = '100vh';
        player.style.height = '100vw';
    } else {
        player.style.width = '100%';
        player.style.height = '100%';
    }
}

function toggleFullscreen() {
    const player = document.getElementById('videoPlayer');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    
    if (!document.fullscreenElement) {
        if (player.requestFullscreen) {
            player.requestFullscreen();
        }
        // Show rotate button in fullscreen
        if (rotateBtn) {
            rotateBtn.style.display = 'flex';
        }
        // Update icon to exit fullscreen
        if (fullscreenBtn) {
            fullscreenBtn.querySelector('svg path').setAttribute('d', 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z');
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        // Reset rotation and hide rotate button
        currentRotation = 0;
        player.style.transform = 'rotate(0deg)';
        player.style.width = '100%';
        player.style.height = '100%';
        if (rotateBtn) {
            rotateBtn.style.display = 'none';
        }
        // Update icon to enter fullscreen
        if (fullscreenBtn) {
            fullscreenBtn.querySelector('svg path').setAttribute('d', 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z');
        }
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === null || seconds === undefined) {
        return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showTimeTooltip(e) {
    const video = document.getElementById('modalVideo');
    const tooltip = document.getElementById('timeTooltip');
    const progressBar = e.currentTarget;
    
    if (!video || !video.duration || !tooltip) return;
    
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * video.duration;
    
    tooltip.textContent = formatTime(time);
    tooltip.style.left = (pos * 100) + '%';
    tooltip.style.opacity = '1';
}

function hideTimeTooltip() {
    const tooltip = document.getElementById('timeTooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
    }
}