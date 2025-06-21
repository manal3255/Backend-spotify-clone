document.addEventListener('DOMContentLoaded', () => {
    const songList = document.getElementById('songList');
    const songInfo = document.querySelector('.songinfo');
    const songTime = document.querySelector('.songtime');
    const playBtn = document.querySelector('.songbuttons img[src="play.svg"]');
    const pauseBtn = document.querySelector('.songbuttons img[src="pause.svg"]');
    const prevBtn = document.querySelector('.songbuttons img[src="prevsong.svg"]');
    const nextBtn = document.querySelector('.songbuttons img[src="nextsong.svg"]');
    const seekBar = document.querySelector('.seekbar');
    const seekCircle = document.querySelector('.circle');
    const hamburger = document.querySelector('.hamburger');
    const closeBtn = document.querySelector('.close');
    const leftSidebar = document.querySelector('.left');
    let currentSong = new Audio();
    let songs = [];
    let currentIndex = 0;

    // Load songs from the server
    async function loadSongs() {
        try {
            console.log('Fetching songs from /api/songs...');
            const response = await fetch('/api/songs');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            songs = await response.json();
            console.log('Songs received:', songs);
            if (songs.length === 0) {
                songList.innerHTML = '<li>No songs found</li>';
                songInfo.textContent = 'No songs available';
                return;
            }
            displaySongs();
        } catch (error) {
            console.error('Error loading songs:', error);
            songList.innerHTML = '<li>Error loading songs: ' + error.message + '</li>';
            songInfo.textContent = 'Error loading songs';
        }
    }

    // Display songs in the UI
    function displaySongs() {
        songList.innerHTML = '';
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="info">
                    <div>${song.title}</div>
                    <div class="playnow">
                        <span>Play Now</span>
                    </div>
                </div>`;
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => playSong(index));
            songList.appendChild(li);
        });
    }

    // Play a song by index
    function playSong(index) {
        currentIndex = index;
        const songSrc = songs[index].file;
        console.log('Playing song:', songSrc);
        currentSong.src = songSrc;
        currentSong.play().then(() => {
            songInfo.textContent = songs[index].title;
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline';
            updateSongTime();
        }).catch(error => {
            console.error('Error playing song:', error);
            songInfo.textContent = 'Error playing: ' + songs[index].title;
        });
    }

    // Update song time and seekbar
    function updateSongTime() {
        currentSong.addEventListener('timeupdate', () => {
            const currentTime = formatTime(currentSong.currentTime);
            const duration = formatTime(currentSong.duration || 0);
            songTime.textContent = `${currentTime} / ${duration}`;
            if (currentSong.duration) {
                const progress = (currentSong.currentTime / currentSong.duration) * 100;
                seekCircle.style.left = `${progress}%`;
            }
        });
        currentSong.addEventListener('ended', () => {
            console.log('Song ended');
            if (currentIndex < songs.length - 1) {
                playSong(currentIndex + 1);
            } else {
                playBtn.style.display = 'inline';
                pauseBtn.style.display = 'none';
                seekCircle.style.left = '0%';
                songTime.textContent = '0:00 / 0:00';
            }
        });
    }

    // Format time in MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Play button
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (songs.length > 0 && currentSong.src) {
                console.log('Play button clicked');
                currentSong.play();
                playBtn.style.display = 'none';
                pauseBtn.style.display = 'inline';
            }
        });
    } else {
        console.error('Play button not found');
    }

    // Pause button
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            console.log('Pause button clicked');
            currentSong.pause();
            playBtn.style.display = 'inline';
            pauseBtn.style.display = 'none';
        });
    } else {
        console.error('Pause button not found');
    }

    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                console.log('Previous button clicked');
                playSong(currentIndex - 1);
            }
        });
    } else {
        console.error('Previous button not found');
    }

    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < songs.length - 1) {
                console.log('Next button clicked');
                playSong(currentIndex + 1);
            }
        });
    } else {
        console.error('Next button not found');
    }

    // Seekbar click
    if (seekBar) {
        seekBar.addEventListener('click', (e) => {
            if (currentSong.duration) {
                const rect = seekBar.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const seekTo = (clickX / width) * currentSong.duration;
                console.log('Seeking to:', seekTo);
                currentSong.currentTime = seekTo;
            }
        });
    } else {
        console.error('Seekbar not found');
    }

    // Hamburger menu toggle
    if (hamburger && closeBtn && leftSidebar) {
        hamburger.addEventListener('click', () => {
            console.log('Hamburger menu opened');
            leftSidebar.classList.add('active');
        });
        closeBtn.addEventListener('click', () => {
            console.log('Hamburger menu closed');
            leftSidebar.classList.remove('active');
        });
    } else {
        console.error('Hamburger or close button not found');
    }

    // Initialize
    loadSongs();
});