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
                if (tapCount === 1) {
                    // Single tap - toggle play/pause
                    togglePlay();
                }
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
    
    // Add drag functionality to progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        let isDragging = false;
        
        progressBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            setProgress(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                setProgress(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Touch events for mobile
        progressBar.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            setProgress(mouseEvent);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                setProgress(mouseEvent);
            }
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
    
    // Add gesture controls
    initGestureControls();
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
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;
    
    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    
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

let isPortrait = false;

function toggleRotation() {
    if (!document.fullscreenElement) {
        alert('Rotation only works in fullscreen mode');
        return;
    }
    
    if (!screen.orientation || !screen.orientation.lock) {
        alert('Screen orientation API not supported on this browser');
        return;
    }
    
    isPortrait = !isPortrait;
    
    try {
        const orientation = isPortrait ? 'portrait-primary' : 'landscape-primary';
        screen.orientation.lock(orientation).then(() => {
            console.log('Screen rotated to:', orientation);
        }).catch(err => {
            console.warn('Rotation failed:', err);
            // Fallback to CSS rotation if API fails
            const player = document.getElementById('videoPlayer');
            if (player) {
                player.style.transform = isPortrait ? 'rotate(90deg)' : 'rotate(0deg)';
                player.style.transformOrigin = 'center center';
                player.style.transition = 'transform 0.3s ease';
            }
        });
    } catch (err) {
        console.warn('Screen orientation lock error:', err);
        // Fallback to CSS rotation
        const player = document.getElementById('videoPlayer');
        if (player) {
            player.style.transform = isPortrait ? 'rotate(90deg)' : 'rotate(0deg)';
            player.style.transformOrigin = 'center center';
            player.style.transition = 'transform 0.3s ease';
        }
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
        isPortrait = false;
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
        // Clear CSS fallback styles
        player.style.transform = '';
        player.style.transformOrigin = '';
        player.style.transition = '';
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

let currentBrightness = 100;
let gestureStartX = 0;
let gestureStartY = 0;
let isGesturing = false;

function initGestureControls() {
    const player = document.getElementById('videoPlayer');
    if (!player) return;
    
    player.addEventListener('mousedown', startGesture);
    player.addEventListener('touchstart', startGesture);
    document.addEventListener('mousemove', handleGesture);
    document.addEventListener('touchmove', handleGesture);
    document.addEventListener('mouseup', endGesture);
    document.addEventListener('touchend', endGesture);
}

function startGesture(e) {
    if (e.target.closest('.video-controls')) return;
    
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    gestureStartX = clientX;
    gestureStartY = clientY;
    isGesturing = true;
}

function handleGesture(e) {
    if (!isGesturing) return;
    
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    const deltaX = clientX - gestureStartX;
    const deltaY = clientY - gestureStartY;
    
    const player = document.getElementById('videoPlayer');
    const rect = player.getBoundingClientRect();
    const playerWidth = rect.width;
    
    // Define control areas: 20% left, 60% center, 20% right
    const leftZone = playerWidth * 0.2;   // 0-20%
    const rightZone = playerWidth * 0.8;  // 80-100%
    
    // Determine gesture type based on movement and position
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
        // Horizontal swipe - seek video (only in center 60%)
        if (gestureStartX >= leftZone && gestureStartX <= rightZone) {
            const seekAmount = (deltaX / playerWidth) * 3; // Max 3 seconds
            handleSeekGesture(seekAmount);
        }
    } else if (Math.abs(deltaY) > 20) {
        // Vertical swipe - brightness/volume (only in side 20% zones)
        if (gestureStartX < leftZone) {
            // Left 20% - brightness (up = increase, down = decrease)
            const brightnessChange = (-deltaY / rect.height) * 0.05;
            handleBrightnessGesture(brightnessChange);
        } else if (gestureStartX > rightZone) {
            // Right 20% - volume (up = increase, down = decrease)
            const volumeChange = (-deltaY / rect.height) * 0.05;
            handleVolumeGesture(volumeChange);
        }
    }
}

function endGesture() {
    isGesturing = false;
    hideGestureIndicator();
}

function handleSeekGesture(seekAmount) {
    const video = document.getElementById('modalVideo');
    if (!video || !video.duration) return;
    
    const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seekAmount));
    video.currentTime = newTime;
    
    const currentTimeStr = formatTime(newTime);
    const totalTimeStr = formatTime(video.duration);
    const seekText = seekAmount > 0 ? `+${Math.round(seekAmount)}s` : `${Math.round(seekAmount)}s`;
    
    showSeekIndicator(newTime, video.duration, seekText, currentTimeStr, totalTimeStr);
}

function handleVolumeGesture(volumeChange) {
    const video = document.getElementById('modalVideo');
    if (!video) return;
    
    const newVolume = Math.max(0, Math.min(1, video.volume + volumeChange));
    video.volume = newVolume;
    video.muted = false;
    updateVolumeDisplay();
    
    showGestureIndicator('volume', `${Math.round(newVolume * 100)}%`);
}

function handleBrightnessGesture(brightnessChange) {
    const video = document.getElementById('modalVideo');
    if (!video) return;
    
    const change = brightnessChange * 100;
    currentBrightness = Math.max(0, Math.min(100, currentBrightness + change));
    
    // Map 0-100% to 0.3-1.2 range (30% to 120% actual brightness)
    // This prevents complete blackness and allows slight over-brightness
    const actualBrightness = 0.3 + (currentBrightness / 100) * 0.9;
    video.style.filter = `brightness(${actualBrightness})`;
    
    showGestureIndicator('brightness', `${Math.round(currentBrightness)}%`);
}

function showGestureIndicator(type, value) {
    const player = document.getElementById('videoPlayer');
    if (!player) return;
    
    // Update existing indicator or create new one
    let indicator = player.querySelector('.gesture-indicator');
    const isNewIndicator = !indicator;
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'gesture-indicator';
    }
    
    const rect = player.getBoundingClientRect();
    let position = 'center';
    
    if (type === 'brightness') position = 'left';
    else if (type === 'volume') position = 'right';
    
    const icons = {
        seek: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
        volume: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>',
        brightness: '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 9c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/></svg>'
    };
    
    const currentValue = type === 'brightness' ? currentBrightness : 
                        type === 'volume' ? Math.round(parseFloat(value)) : value;
    
    indicator.innerHTML = `
        <div class="gesture-content">
            <div class="gesture-icon">${icons[type]}</div>
            <div class="gesture-value">${value}</div>
            ${type !== 'seek' ? `
                <div class="vertical-bar">
                    <div class="bar-fill" style="height: ${currentValue}%"></div>
                    <div class="bar-handle" style="bottom: ${currentValue}%"></div>
                </div>
            ` : ''}
        </div>
    `;
    
    const positions = {
        left: 'left: 3%; transform: translateY(-50%);',
        right: 'right: 3%; transform: translateY(-50%);',
        center: 'left: 50%; transform: translate(-50%, -50%);'
    };
    
    indicator.style.cssText = `
        position: absolute;
        top: 50%;
        ${positions[position]}
        background: rgba(0, 0, 0, 0.28);
        color: white;
        padding: 8px 12px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        font-size: 13px;
        font-weight: 600;
        z-index: 30;
        pointer-events: none;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        animation: gestureAppear 0.2s ease-out;
        width: 60px;
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes gestureAppear {
            0% { opacity: 0; transform: ${position === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)'} scale(0.8); }
            100% { opacity: 1; transform: ${position === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)'} scale(1); }
        }
        .gesture-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            width: 100%;
        }
        .vertical-bar {
            width: 6px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            position: relative;
            overflow: hidden;
        }
        .bar-fill {
            position: absolute;
            bottom: 0;
            width: 100%;
            background: ${type === 'brightness' ? 'linear-gradient(0deg, #ffa500, #ffd700)' : 'linear-gradient(0deg, #4ecdc4, #44a08d)'};
            border-radius: 3px;
            transition: height 0.1s ease;
        }
        .bar-handle {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            transition: bottom 0.1s ease;
        }
        @media (max-width: 768px) {
            .gesture-indicator {
                padding: 6px 10px !important;
                font-size: 11px !important;
                width: 50px !important;
            }
            .vertical-bar {
                height: 50px !important;
                width: 5px !important;
            }
        }
    `;
    
    if (isNewIndicator) {
        document.head.appendChild(style);
        player.appendChild(indicator);
    } else {
        // Update existing indicator content
        const valueElement = indicator.querySelector('.gesture-value');
        const barFill = indicator.querySelector('.bar-fill');
        const barHandle = indicator.querySelector('.bar-handle');
        
        if (valueElement) valueElement.textContent = value;
        if (barFill && type !== 'seek') {
            const currentValue = type === 'brightness' ? currentBrightness : Math.round(parseFloat(value));
            barFill.style.height = currentValue + '%';
            barHandle.style.bottom = currentValue + '%';
        }
    }
}

function showSeekIndicator(currentTime, duration, seekText, currentTimeStr, totalTimeStr) {
    const player = document.getElementById('videoPlayer');
    if (!player) return;
    
    // Remove existing indicator
    const existing = player.querySelector('.seek-indicator');
    if (existing) existing.remove();
    
    const indicator = document.createElement('div');
    indicator.className = 'seek-indicator';
    
    const progressPercent = (currentTime / duration) * 100;
    
    indicator.innerHTML = `
        <div class="seek-progress">
            <div class="seek-track">
                <div class="seek-fill" style="width: ${progressPercent}%"></div>
                <div class="seek-handle" style="left: ${progressPercent}%"></div>
            </div>
        </div>
        <div class="seek-times">
            <span class="current-time">${currentTimeStr}</span>
            <span class="total-time">${totalTimeStr}</span>
        </div>
    `;
    
    indicator.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        padding: 12px 16px;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.28);
        color: white;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        font-weight: 600;
        z-index: 30;
        pointer-events: none;
        width: 180px;
        height: 80px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    `;
    
    // Add seek indicator styles
    const style = document.createElement('style');
    style.textContent = `
        .seek-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
        }
        .seek-progress {
            width: 100%;
            padding: 8px 0;
        }
        .seek-track {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            position: relative;
            overflow: hidden;
        }
        .seek-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
            border-radius: 4px;
            transition: width 0.1s ease;
        }
        .seek-handle {
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 16px;
            height: 16px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4);
            transition: left 0.1s ease;
        }
        .seek-times {
            display: flex;
            justify-content: space-between;
            width: 100%;
            font-size: 12px;
            font-weight: 500;
            opacity: 0.9;
        }
        @media (max-width: 480px) {
            .seek-indicator {
                min-width: 160px !important;
                padding: 16px 20px !important;
            }
            .seek-header {
                font-size: 14px !important;
            }
            .seek-times {
                font-size: 11px !important;
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
    }, 1500);
}

function hideGestureIndicator() {
    const player = document.getElementById('videoPlayer');
    if (!player) return;
    
    const indicator = player.querySelector('.gesture-indicator');
    if (indicator) {
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
            // Remove brightness bar styles
            const styles = document.querySelectorAll('style');
            styles.forEach(style => {
                if (style.textContent.includes('.brightness-bar')) {
                    style.remove();
                }
            });
        }, 1000);
    }
}