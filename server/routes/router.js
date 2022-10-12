const express = require('express');
const route = express.Router()

const services = require('../services/render');
const controller = require('../controller/controller');
const isAuth = require("../middleware/is-auth");

var upload = require('../middleware/middleware');

route.get('/', isAuth, services.homeRoutes);


route.get('/add-song', isAuth, services.add_song)



route.get('/login', services.login);

route.get('/register', services.register);

route.post("/logout", services.logout);

// API
route.post('/api/songs',  upload.single('image'), controller.createSong);
route.post('/api/artists', controller.createArtists);
route.get('/api/songs',  controller.findSongs);
route.get('/api/artists',  controller.findArtists);
// route.put('/api/songs/:id', controller.updateSong);
// route.put('/api/artists/:id', controller.updateArtist);
route.delete('/api/songs/:id', controller.deleteSong);
route.delete('/api/artists/:id', controller.deleteArtist);
route.get('/api/songs/top', controller.findTop10Songs);
route.get('/api/artists/top', controller.findTop10Artists);
route.put('/api/songs/rating', controller.updateSongRating);
route.post('/api/songs/multiple/rating', controller.updateMutipleSongRating);
route.get('/api/songs/:id/image',  controller.getSongImage);


route.post('/login', controller.login);

route.post('/register', controller.register);

module.exports = route