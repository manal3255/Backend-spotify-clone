const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/songs', express.static(path.join(__dirname, 'songs')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to render the main page
app.get('/', async (req, res) => {
    try {
        console.log('Serving index page');
        res.render('index');
    } catch (error) {
        console.error('Error rendering index:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get the list of songs
app.get('/api/songs', async (req, res) => {
    try {
        const songsDir = path.join(__dirname, 'songs');
        console.log('Reading songs directory:', songsDir);
        const files = await fs.readdir(songsDir);
        const songs = files
            .filter(file => file.endsWith('.mp3'))
            .map(file => ({
                title: path.basename(file, '.mp3'),
                file: `/songs/${file}`
            }));
        console.log('Songs found:', songs);
        if (songs.length === 0) {
            console.log('No MP3 files found in songs directory');
        }
        res.json(songs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ error: 'Failed to fetch songs' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});