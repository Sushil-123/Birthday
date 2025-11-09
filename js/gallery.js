// Gallery data objects
const galleryData = {
    photos: [
        {
            id: 1,
            src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
            title: "Birthday Cake Moment",
            description: "The perfect birthday cake with candles glowing bright!"
        },
        {
            id: 2,
            src: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400",
            title: "Party Decorations",
            description: "Beautiful balloons and decorations for the special day"
        },
        {
            id: 3,
            src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400",
            title: "Gift Opening",
            description: "The joy of unwrapping birthday surprises"
        },
        {
            id: 4,
            src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
            title: "Friends Together",
            description: "Celebrating with the best friends ever"
        },
        {
            id: 5,
            src: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400",
            title: "Party Fun",
            description: "Dancing and having the time of our lives"
        },
        {
            id: 6,
            src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
            title: "Sweet Memories",
            description: "Creating memories that will last forever"
        }
    ],
    videos: [
        {
            id: 1,
            src: "IW1hcRXK2yQ",
            type: "youtube",
            thumbnail: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
            title: "Birthday Song",
            description: "Everyone singing happy birthday together"
        },
        {
            id: 2,
            src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            type: "video",
            thumbnail: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400",
            title: "Cake Cutting Ceremony",
            description: "The special moment of cutting the birthday cake"
        },
        {
            id: 3,
            src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            type: "video",
            thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400",
            title: "Party Highlights",
            description: "Best moments from the birthday celebration"
        },
        {
            id: 4,
            src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            type: "video",
            thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
            title: "Dance Time",
            description: "Everyone dancing to their favorite songs"
        }
    ]
};

// Initialize gallery on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPhotos();
    loadVideos();
});

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).style.display = 'block';
    event.target.classList.add('active');
}

function loadPhotos() {
    const photoGrid = document.getElementById('photo-grid');
    photoGrid.innerHTML = '';
    
    galleryData.photos.forEach(photo => {
        const photoItem = createMediaItem(photo, 'photo');
        photoGrid.appendChild(photoItem);
    });
}

function loadVideos() {
    const videoGrid = document.getElementById('video-grid');
    videoGrid.innerHTML = '';
    
    galleryData.videos.forEach(video => {
        const videoItem = createMediaItem(video, 'video');
        videoGrid.appendChild(videoItem);
    });
}

let currentMediaIndex = 0;
let currentMediaType = '';
let currentMediaArray = [];

function createMediaItem(item, type) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    mediaItem.onclick = () => {
        const array = type === 'photo' ? galleryData.photos : galleryData.videos;
        const index = array.indexOf(item);
        openModal(item, type, index);
    };
    
    const thumbnail = type === 'video' ? item.thumbnail : item.src;
    const thumbnailClass = type === 'video' ? 'video-thumbnail' : '';
    
    mediaItem.innerHTML = `
        <div class="${thumbnailClass}">
            <img src="${thumbnail}" alt="${item.title}" class="media-thumbnail">
            ${type === 'video' ? `
                <div class="play-overlay">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </div>
            ` : ''}
        </div>
    `;
    
    return mediaItem;
}

function openModal(item, type, index = 0) {
    const modal = document.getElementById('modal');
    const modalMedia = document.getElementById('modal-media');
    
    currentMediaIndex = index;
    currentMediaType = type;
    currentMediaArray = type === 'photo' ? galleryData.photos : galleryData.videos;
    
    updateModalContent();
    updateIndicator();
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function updateModalContent() {
    const modalMedia = document.getElementById('modal-media');
    const item = currentMediaArray[currentMediaIndex];
    
    if (currentMediaType === 'photo') {
        modalMedia.innerHTML = `
            <img src="${item.src}" alt="${item.title}">
            <button class="nav-btn prev-btn" onclick="navigateMedia(-1)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
            </button>
            <button class="nav-btn next-btn" onclick="navigateMedia(1)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
            </button>
        `;
    } else {
        if (item.type === 'youtube') {
            modalMedia.innerHTML = createYouTubePlayer(item);
        } else {
            modalMedia.innerHTML = createCustomVideoPlayer(item);
            // Use longer timeout and ensure DOM is ready
            setTimeout(() => {
                initializeVideoPlayer();
                // Force show controls after initialization
                setTimeout(() => showControls(), 50);
            }, 200);
        }
    }
}

function navigateMedia(direction) {
    currentMediaIndex += direction;
    
    if (currentMediaIndex < 0) {
        currentMediaIndex = currentMediaArray.length - 1;
    } else if (currentMediaIndex >= currentMediaArray.length) {
        currentMediaIndex = 0;
    }
    
    updateModalContent();
    updateIndicator();
}

function updateIndicator() {
    const indicator = document.getElementById('modal-indicator');
    if (indicator) {
        indicator.textContent = `${currentMediaIndex + 1} / ${currentMediaArray.length}`;
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    const videos = modal.querySelectorAll('video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
    });
}

document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    } else if (e.key === 'ArrowLeft') {
        navigateMedia(-1);
    } else if (e.key === 'ArrowRight') {
        navigateMedia(1);
    }
});

function createCustomVideoPlayer(item) {
    return `
        <div class="video-player" id="videoPlayer">
            <video id="modalVideo">
                <source src="${item.src}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            
            
            <!-- Bottom Controls -->
            <div class="video-controls" id="videoControls">
                <!-- Progress Bar -->
                <div class="progress-container">
                    <div class="progress-bar" id="progressBar" onclick="setProgress(event)" onmousemove="showTimeTooltip(event)" onmouseleave="hideTimeTooltip()">
                        <div class="progress-fill" id="progressFill"></div>
                        <div class="progress-handle" id="progressHandle"></div>
                        <div class="time-tooltip" id="timeTooltip">0:00</div>
                    </div>
                    <span class="time-display" id="timeDisplay">0:00 / 0:00</span>
                </div>
                
                <!-- Control Buttons -->
                <div class="controls-row">
                    <div class="left-controls">
                        <button class="ctrl-btn" onclick="togglePlay()" id="playControl">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                        
                        <div class="volume-control">
                            <button class="ctrl-btn" onclick="toggleMute()" id="volumeBtn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                </svg>
                            </button>
                            <div class="volume-slider" onclick="setVolume(event)" id="volumeSlider">
                                <div class="volume-fill" id="volumeFill"></div>
                            </div>
                        </div>
                        

                    </div>
                    
                    <div class="right-controls">
                        <button class="ctrl-btn" onclick="toggleSpeed()" id="speedBtn">1x</button>
                        <button class="ctrl-btn" onclick="togglePiP()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                            </svg>
                        </button>
                        <button class="ctrl-btn" onclick="toggleRotation()" id="rotateBtn" style="display: none;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13h2.02c.17 1.39.72 2.73 1.62 3.89l-1.41 1.42c-.9-1.16-1.45-2.5-1.23-5.31zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z"/>
                            </svg>
                        </button>
                        <button class="ctrl-btn" onclick="toggleFullscreen()" id="fullscreenBtn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createYouTubePlayer(item) {
    return `
        <div class="youtube-player">
            <iframe src="https://www.youtube.com/embed/${item.src}?autoplay=0&controls=1&rel=0" allowfullscreen></iframe>
        </div>
    `;
}





















