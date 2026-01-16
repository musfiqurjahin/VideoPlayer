        // Application State
        const appState = {
            currentVideo: null,
            playlist: [],
            currentPlaylistIndex: -1,
            isPlaying: false,
            isMuted: false,
            lastVolume: 80,
            playbackSpeed: 1,
            repeatMode: 'none', // 'none', 'one', 'all'
            isFullscreen: false,
            isPiP: false,
            showSubtitles: false,
            currentPanel: 'player'
        };
        
        // DOM Elements
        const videoPlayer = document.getElementById('videoPlayer');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const rewindBtn = document.getElementById('rewindBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const progressBar = document.getElementById('progressBar');
        const progressContainer = document.getElementById('progressContainer');
        const currentTimeDisplay = document.getElementById('currentTime');
        const durationDisplay = document.getElementById('duration');
        const muteBtn = document.getElementById('muteBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const subtitleBtn = document.getElementById('subtitleBtn');
        const repeatBtn = document.getElementById('repeatBtn');
        const playbackSpeedBtn = document.getElementById('playbackSpeedBtn');
        const playbackSpeedText = document.getElementById('playbackSpeedText');
        const pictureInPictureBtn = document.getElementById('pictureInPictureBtn');
        const fileInput = document.getElementById('fileInput');
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        const videoInfoOverlay = document.getElementById('videoInfoOverlay');
        const videoTitle = document.getElementById('videoTitle');
        const videoResolution = document.getElementById('videoResolution');
        const videoDuration = document.getElementById('videoDuration');
        const videoSize = document.getElementById('videoSize');
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notificationMessage');
        
        // Panel Elements
        const playerContainer = document.getElementById('playerContainer');
        const explorerPanel = document.getElementById('explorerPanel');
        const playlistPanel = document.getElementById('playlistPanel');
        const settingsPanel = document.getElementById('settingsPanel');
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        const playlistItems = document.getElementById('playlistItems');
        const fileGrid = document.getElementById('fileGrid');
        const addToPlaylistBtn = document.getElementById('addToPlaylistBtn');
        const clearPlaylistBtn = document.getElementById('clearPlaylistBtn');
        const savePlaylistBtn = document.getElementById('savePlaylistBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        
        // Sample video files for the explorer
        const sampleVideos = [
            { name: 'Nature Documentary.mp4', size: '145 MB', duration: '12:45', thumbnail: 'nature' },
            { name: 'Music Video - Pop Song.mp4', size: '89 MB', duration: '04:32', thumbnail: 'music' },
            { name: 'Tutorial - JavaScript Basics.mp4', size: '256 MB', duration: '45:18', thumbnail: 'tutorial' },
            { name: 'Movie Trailer - Action Film.mp4', size: '112 MB', duration: '02:15', thumbnail: 'movie' },
            { name: 'Conference Recording.mp4', size: '520 MB', duration: '01:22:45', thumbnail: 'conference' },
            { name: 'Sports Highlights.mp4', size: '78 MB', duration: '08:12', thumbnail: 'sports' }
        ];
        
        // Sample playlist
        const samplePlaylist = [
            { name: 'Big Buck Bunny', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: '09:56' },
            { name: 'Elephants Dream', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: '10:53' },
            { name: 'For Bigger Blazes', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: '00:15' }
        ];
        
        // Initialize the application
        function initApp() {
            setupEventListeners();
            initializeSampleData();
            showPanel('player');
            showNotification('Welcome to NeoPlayer! Load a video to get started.', 'info');
        }
        
        // Setup all event listeners
        function setupEventListeners() {
            // Player controls
            playPauseBtn.addEventListener('click', togglePlayPause);
            stopBtn.addEventListener('click', stopVideo);
            rewindBtn.addEventListener('click', () => seekVideo(-10));
            forwardBtn.addEventListener('click', () => seekVideo(10));
            muteBtn.addEventListener('click', toggleMute);
            volumeSlider.addEventListener('input', updateVolume);
            fullscreenBtn.addEventListener('click', toggleFullscreen);
            subtitleBtn.addEventListener('click', toggleSubtitles);
            repeatBtn.addEventListener('click', toggleRepeatMode);
            playbackSpeedBtn.addEventListener('click', changePlaybackSpeed);
            pictureInPictureBtn.addEventListener('click', togglePictureInPicture);
            
            // Video events
            videoPlayer.addEventListener('loadedmetadata', updateVideoInfo);
            videoPlayer.addEventListener('timeupdate', updateProgress);
            videoPlayer.addEventListener('play', updatePlayPauseButton);
            videoPlayer.addEventListener('pause', updatePlayPauseButton);
            videoPlayer.addEventListener('waiting', () => showLoading('Buffering...'));
            videoPlayer.addEventListener('canplay', hideLoading);
            videoPlayer.addEventListener('ended', handleVideoEnded);
            videoPlayer.addEventListener('volumechange', updateVolumeUI);
            
            // Progress bar
            progressContainer.addEventListener('click', seekToPosition);
            
            // Sidebar navigation
            sidebarItems.forEach(item => {
                item.addEventListener('click', () => {
                    const panel = item.getAttribute('data-panel');
                    if (panel) {
                        showPanel(panel);
                        
                        // Update active state
                        sidebarItems.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                    }
                });
            });
            
            // File input
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', handleFileSelect);
            
            // Playlist buttons
            addToPlaylistBtn.addEventListener('click', openFilePickerForPlaylist);
            clearPlaylistBtn.addEventListener('click', clearPlaylist);
            savePlaylistBtn.addEventListener('click', savePlaylist);
            
            // Keyboard shortcuts
            document.addEventListener('keydown', handleKeyPress);
            
            // Window controls (mock functions for demo)
            document.querySelector('.window-control.close').addEventListener('click', closeApp);
            document.querySelector('.window-control.minimize').addEventListener('click', minimizeApp);
            document.querySelector('.window-control.maximize').addEventListener('click', toggleFullscreen);
        }
        
        // Initialize sample data
        function initializeSampleData() {
            // Add sample videos to explorer
            renderFileExplorer();
            
            // Add sample playlist
            samplePlaylist.forEach(video => {
                addToPlaylist(video.name, video.url, video.duration);
            });
            
            // Load first video from playlist
            if (samplePlaylist.length > 0) {
                loadVideo(samplePlaylist[0].url, samplePlaylist[0].name);
                appState.currentPlaylistIndex = 0;
                updatePlaylistUI();
            }
        }
        
        // Show a specific panel
        function showPanel(panel) {
            // Hide all panels
            playerContainer.style.display = 'none';
            explorerPanel.style.display = 'none';
            playlistPanel.style.display = 'none';
            settingsPanel.style.display = 'none';
            
            // Show the selected panel
            switch(panel) {
                case 'player':
                    playerContainer.style.display = 'flex';
                    break;
                case 'explorer':
                    explorerPanel.style.display = 'block';
                    break;
                case 'playlist':
                    playlistPanel.style.display = 'flex';
                    break;
                case 'settings':
                    settingsPanel.style.display = 'block';
                    break;
            }
            
            appState.currentPanel = panel;
        }
        
        // Handle file selection
        function handleFileSelect(event) {
            const files = event.target.files;
            if (!files.length) return;
            
            // For simplicity, only use the first file
            const file = files[0];
            
            // Create a URL for the selected file
            const fileURL = URL.createObjectURL(file);
            loadVideo(fileURL, file.name);
            
            // Add to playlist
            addToPlaylist(file.name, fileURL, '--:--');
            
            showNotification(`Loaded: ${file.name}`, 'success');
            
            // Clear the input so the same file can be selected again
            event.target.value = '';
        }
        
        // Load a video
        function loadVideo(url, title) {
            showLoading('Loading video...');
            
            videoPlayer.src = url;
            videoPlayer.load();
            
            appState.currentVideo = {
                url: url,
                title: title
            };
            
            videoTitle.textContent = title;
            updatePlayPauseButton();
        }
        
        // Toggle play/pause
        function togglePlayPause() {
            if (videoPlayer.paused || videoPlayer.ended) {
                videoPlayer.play();
                appState.isPlaying = true;
                showVideoInfoOverlay();
            } else {
                videoPlayer.pause();
                appState.isPlaying = false;
            }
        }
        
        // Stop video
        function stopVideo() {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            appState.isPlaying = false;
            updatePlayPauseButton();
        }
        
        // Seek video by seconds
        function seekVideo(seconds) {
            videoPlayer.currentTime += seconds;
        }
        
        // Seek to position on progress bar click
        function seekToPosition(event) {
            const rect = progressContainer.getBoundingClientRect();
            const pos = (event.clientX - rect.left) / rect.width;
            videoPlayer.currentTime = pos * videoPlayer.duration;
        }
        
        // Update progress bar and time display
        function updateProgress() {
            if (!videoPlayer.duration) return;
            
            // Update progress bar
            const progressPercent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            
            // Update time display
            currentTimeDisplay.textContent = formatTime(videoPlayer.currentTime);
        }
        
        // Update video information when metadata is loaded
        function updateVideoInfo() {
            durationDisplay.textContent = formatTime(videoPlayer.duration);
            videoDuration.textContent = formatTime(videoPlayer.duration);
            
            // Get video dimensions
            const width = videoPlayer.videoWidth;
            const height = videoPlayer.videoHeight;
            videoResolution.textContent = `${width}×${height}`;
            
            hideLoading();
        }
        
        // Format time in MM:SS or HH:MM:SS
        function formatTime(seconds) {
            if (isNaN(seconds)) return "00:00";
            
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            
            if (hours > 0) {
                return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            } else {
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }
        
        // Update play/pause button
        function updatePlayPauseButton() {
            const icon = playPauseBtn.querySelector('i');
            if (videoPlayer.paused || videoPlayer.ended) {
                icon.className = 'fas fa-play';
                playPauseBtn.title = 'Play (Space)';
            } else {
                icon.className = 'fas fa-pause';
                playPauseBtn.title = 'Pause (Space)';
            }
        }
        
        // Toggle mute
        function toggleMute() {
            if (videoPlayer.volume > 0) {
                appState.lastVolume = videoPlayer.volume * 100;
                videoPlayer.volume = 0;
                volumeSlider.value = 0;
                updateMuteButton(true);
                appState.isMuted = true;
            } else {
                videoPlayer.volume = appState.lastVolume / 100;
                volumeSlider.value = appState.lastVolume;
                updateMuteButton(false);
                appState.isMuted = false;
            }
        }
        
        // Update volume
        function updateVolume() {
            const volume = volumeSlider.value / 100;
            videoPlayer.volume = volume;
            
            if (volume > 0 && appState.isMuted) {
                updateMuteButton(false);
                appState.isMuted = false;
            } else if (volume === 0 && !appState.isMuted) {
                updateMuteButton(true);
                appState.isMuted = true;
            }
        }
        
        // Update volume UI based on video volume
        function updateVolumeUI() {
            const volume = videoPlayer.volume * 100;
            volumeSlider.value = volume;
            
            if (volume === 0 && !appState.isMuted) {
                updateMuteButton(true);
                appState.isMuted = true;
            } else if (volume > 0 && appState.isMuted) {
                updateMuteButton(false);
                appState.isMuted = false;
            }
        }
        
        // Update mute button icon
        function updateMuteButton(isMuted) {
            const icon = muteBtn.querySelector('i');
            if (isMuted) {
                icon.className = 'fas fa-volume-mute';
                muteBtn.title = 'Unmute (M)';
            } else {
                const volume = videoPlayer.volume;
                if (volume === 0) {
                    icon.className = 'fas fa-volume-mute';
                } else if (volume < 0.5) {
                    icon.className = 'fas fa-volume-down';
                } else {
                    icon.className = 'fas fa-volume-up';
                }
                muteBtn.title = 'Mute (M)';
            }
        }
        
        // Toggle fullscreen
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                fullscreenBtn.title = 'Exit Fullscreen (F)';
                document.body.classList.add('fullscreen');
                appState.isFullscreen = true;
            } else {
                document.exitFullscreen();
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fullscreenBtn.title = 'Fullscreen (F)';
                document.body.classList.remove('fullscreen');
                appState.isFullscreen = false;
            }
        }
        
        // Toggle subtitles (mock function)
        function toggleSubtitles() {
            appState.showSubtitles = !appState.showSubtitles;
            subtitleBtn.classList.toggle('active', appState.showSubtitles);
            
            if (appState.showSubtitles) {
                subtitleBtn.title = 'Disable subtitles (C)';
                showNotification('Subtitles enabled', 'info');
            } else {
                subtitleBtn.title = 'Enable subtitles (C)';
                showNotification('Subtitles disabled', 'info');
            }
        }
        
        // Toggle repeat mode
        function toggleRepeatMode() {
            const modes = ['none', 'one', 'all'];
            const currentIndex = modes.indexOf(appState.repeatMode);
            appState.repeatMode = modes[(currentIndex + 1) % modes.length];
            
            // Update button
            const icon = repeatBtn.querySelector('i');
            switch(appState.repeatMode) {
                case 'none':
                    icon.className = 'fas fa-redo';
                    repeatBtn.title = 'Repeat: Off (R)';
                    repeatBtn.classList.remove('active');
                    break;
                case 'one':
                    icon.className = 'fas fa-redo';
                    repeatBtn.title = 'Repeat: One (R)';
                    repeatBtn.classList.add('active');
                    break;
                case 'all':
                    icon.className = 'fas fa-infinity';
                    repeatBtn.title = 'Repeat: All (R)';
                    repeatBtn.classList.add('active');
                    break;
            }
            
            showNotification(`Repeat mode: ${appState.repeatMode}`, 'info');
        }
        
        // Change playback speed
        function changePlaybackSpeed() {
            const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
            const currentIndex = speeds.indexOf(appState.playbackSpeed);
            appState.playbackSpeed = speeds[(currentIndex + 1) % speeds.length];
            
            videoPlayer.playbackRate = appState.playbackSpeed;
            playbackSpeedText.textContent = `${appState.playbackSpeed}x`;
            
            showNotification(`Playback speed: ${appState.playbackSpeed}x`, 'info');
        }
        
        // Toggle picture-in-picture
        function togglePictureInPicture() {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
                appState.isPiP = false;
                pictureInPictureBtn.title = 'Picture-in-Picture (P)';
                showNotification('Exited picture-in-picture', 'info');
            } else if (document.pictureInPictureEnabled) {
                videoPlayer.requestPictureInPicture();
                appState.isPiP = true;
                pictureInPictureBtn.title = 'Exit Picture-in-Picture (P)';
                showNotification('Entered picture-in-picture', 'info');
            }
        }
        
        // Handle video ended
        function handleVideoEnded() {
            appState.isPlaying = false;
            updatePlayPauseButton();
            
            // Handle repeat modes
            if (appState.repeatMode === 'one') {
                videoPlayer.currentTime = 0;
                videoPlayer.play();
            } else if (appState.repeatMode === 'all' && appState.playlist.length > 0) {
                playNextInPlaylist();
            }
        }
        
        // Show loading overlay
        function showLoading(message) {
            loadingText.textContent = message;
            loadingOverlay.style.display = 'flex';
        }
        
        // Hide loading overlay
        function hideLoading() {
            loadingOverlay.style.display = 'none';
        }
        
        // Show video info overlay
        function showVideoInfoOverlay() {
            videoInfoOverlay.style.display = 'block';
            setTimeout(() => {
                videoInfoOverlay.style.display = 'none';
            }, 3000);
        }
        
        // Show notification
        function showNotification(message, type = 'info') {
            notificationMessage.textContent = message;
            notification.className = `notification ${type}`;
            notification.querySelector('.notification-icon').className = `fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' :
                'fa-info-circle'
            } notification-icon`;
            
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Add video to playlist
        function addToPlaylist(name, url, duration) {
            const video = { name, url, duration };
            appState.playlist.push(video);
            updatePlaylistUI();
        }
        
        // Update playlist UI
        function updatePlaylistUI() {
            playlistItems.innerHTML = '';
            
            appState.playlist.forEach((video, index) => {
                const item = document.createElement('div');
                item.className = `playlist-item ${index === appState.currentPlaylistIndex ? 'active' : ''}`;
                item.innerHTML = `
                    <div class="playlist-thumbnail">
                        <i class="fas fa-film"></i>
                    </div>
                    <div class="playlist-info">
                        <div class="playlist-name">${video.name}</div>
                        <div class="playlist-duration">${video.duration}</div>
                    </div>
                `;
                
                item.addEventListener('click', () => {
                    loadVideo(video.url, video.name);
                    appState.currentPlaylistIndex = index;
                    updatePlaylistUI();
                });
                
                playlistItems.appendChild(item);
            });
        }
        
        // Play next video in playlist
        function playNextInPlaylist() {
            if (appState.playlist.length === 0) return;
            
            appState.currentPlaylistIndex = (appState.currentPlaylistIndex + 1) % appState.playlist.length;
            const video = appState.playlist[appState.currentPlaylistIndex];
            loadVideo(video.url, video.name);
            updatePlaylistUI();
        }
        
        // Clear playlist
        function clearPlaylist() {
            if (appState.playlist.length === 0) return;
            
            if (confirm('Are you sure you want to clear the playlist?')) {
                appState.playlist = [];
                appState.currentPlaylistIndex = -1;
                updatePlaylistUI();
                showNotification('Playlist cleared', 'info');
            }
        }
        
        // Save playlist (mock function)
        function savePlaylist() {
            showNotification('Playlist saved successfully', 'success');
        }
        
        // Open file picker for playlist
        function openFilePickerForPlaylist() {
            fileInput.click();
        }
        
        // Render file explorer
        function renderFileExplorer() {
            fileGrid.innerHTML = '';
            
            sampleVideos.forEach(video => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <i class="fas fa-file-video file-icon"></i>
                    <div class="file-name">${video.name}</div>
                    <div class="file-size">${video.size}</div>
                `;
                
                fileItem.addEventListener('click', () => {
                    // In a real app, this would load the actual file
                    // For demo, we'll use a sample video
                    const sampleUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                    loadVideo(sampleUrl, video.name);
                    addToPlaylist(video.name, sampleUrl, video.duration);
                    showPanel('player');
                    showNotification(`Loaded: ${video.name}`, 'success');
                });
                
                fileGrid.appendChild(fileItem);
            });
        }
        
        // Handle keyboard shortcuts
        function handleKeyPress(event) {
            // Don't trigger if user is typing in an input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
            
            switch(event.key.toLowerCase()) {
                case ' ':
                    event.preventDefault();
                    togglePlayPause();
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'm':
                    toggleMute();
                    break;
                case 'arrowleft':
                case 'j':
                    seekVideo(-10);
                    break;
                case 'arrowright':
                case 'l':
                    seekVideo(10);
                    break;
                case 'arrowup':
                    volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
                    updateVolume();
                    break;
                case 'arrowdown':
                    volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
                    updateVolume();
                    break;
                case 's':
                    stopVideo();
                    break;
                case 'c':
                    toggleSubtitles();
                    break;
                case 'r':
                    toggleRepeatMode();
                    break;
                case '>':
                case '.':
                    changePlaybackSpeed();
                    break;
                case 'p':
                    togglePictureInPicture();
                    break;
                case '1':
                    showPanel('player');
                    break;
                case '2':
                    showPanel('explorer');
                    break;
                case '3':
                    showPanel('playlist');
                    break;
                case '4':
                    showPanel('settings');
                    break;
            }
        }
        
        // Mock app control functions
        function closeApp() {
            showNotification('Application close requested', 'warning');
        }
        
        function minimizeApp() {
            showNotification('Application minimize requested', 'info');
        }
        
        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', initApp);