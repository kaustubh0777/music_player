var {SongDb, ArtistDb, UserDb} = require('../model/model');
const fs = require("fs");
const path = require('path');
const res = require('express/lib/response');
const bcrypt = require("bcryptjs");

// create and save new song
exports.createSong = (req,res)=>{
    // validate request
    if(!req.body){
        res.status(400).send({ message : "Content can not be emtpy!"});
        return;
    }

    // new user
    console.log(req.body);
    var artistsIds = []
    if(!Array.isArray(req.body.artists)){
        artistsIds = req.body.artists.split(",").map(function(item) {
        return item.trim();
      });
    }else{
        artistsIds = req.body.artists
    }

    console.log(req.file.filename)
    console.log(req.file.path);

    if(!req.body.rating)
        req.body.rating = 0
    
    const song = new SongDb({
        img : fs.readFileSync(req.file.path),
        name : req.body.name,
        DOR : req.body.DOR,
        artists: artistsIds,
        rating : req.body.rating
    })

    // save user in the database
    song
        .save(song)
        .then(data => {
            artistsIds.forEach(artistId => {
                ArtistDb.findById(artistId)
                    .then(artistData =>{
                        if(!artistData){
                            res.status(404).send({ message : "Not found artist with id "+ id})
                        }else{
                            // console.log(data.rating);
                            // console.log(req.body.rating);
                            artistData.songs.push(data._id)
                            // artistData.rating = (parseFloat(artistData.rating) + parseFloat(data.rating))/2;
                            // artistData.rating = Math.round(artistData.rating * 100) / 100
        
                        }
        
                        ArtistDb.findByIdAndUpdate(artistId, artistData, { useFindAndModify: false})
                            .catch(err =>{
                                res.status(500).send({ message : "Error Update artist information"})
                            })
                    })
                    .catch(err =>{
                        res.status(500).send({ message: "Erro retrieving artist with id " + id})
                    })
            });
            // res.send(data)
            res.redirect('/add-song');
        })
        .catch(err =>{
            res.status(500).send({
                message : err.message || "Some error occurred while creating a create operation"
            });
        });

}

// retrieve and return all songs/ retrive and return a single song
exports.findSongs = (req, res)=>{

    if(req.query.id){
        const id = req.query.id;

        SongDb.findById(id)
            .populate("artists", "name")
            .then(data =>{
                if(!data){
                    res.status(404).send({ message : "Not found song with id "+ id})
                }else{
                    res.send(data)
                }
            })
            .catch(err =>{
                res.status(500).send({ message: "Erro retrieving song with id " + id})
            })

    }else{
        SongDb.find()
            .populate("artists", "name")
            .then(song => {
                res.send(song)
            })
            .catch(err => {
                res.status(500).send({ message : err.message || "Error Occurred while retriving song information" })
            })
    }

    
}


exports.updateSong = (req, res)=>{
    if(!req.body){
        return res
            .status(400)
            .send({ message : "Data to update can not be empty"})
    }

    const id = req.params.id;
    SongDb.findByIdAndUpdate(id, req.body, { useFindAndModify: false})
        .then(data => {
            if(!data){
                res.status(404).send({ message : `Cannot Update song with ${id}. Maybe song not found!`})
            }else{
                res.send(data)
            }
        })
        .catch(err =>{
            res.status(500).send({ message : "Error Update song information"})
        })
}

exports.deleteSong = (req, res)=>{
    const id = req.params.id;

    SongDb.findByIdAndDelete(id)
        .then(data => {
            if(!data){
                res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
            }else{
                res.send({
                    message : "Song was deleted successfully!"
                })
            }
        })
        .catch(err =>{
            res.status(500).send({
                message: "Could not delete Song with id=" + id
            });
        });
}

exports.findTop10Songs = (req, res)=>{
    SongDb.find().sort({"rating":-1}).limit(10)
    .populate("artists", "name")
            .then(songs => {
                for (let i = 0; i < songs.length; i++) {
                    songs[i].img.val = songs[i].img.toString('base64');
                  }
                
                res.send(songs)
            })
            .catch(err => {
                res.status(500).send({ message : err.message || "Error Occurred while retriving top 10 songs information" })
            })

}

exports.updateSongRating = (req, res)=>{
    if(!req.body){
        return res
            .status(400)
            .send({ message : "Data to update can not be empty"})
    }
    const id = req.body.id;
    const newSongRating = req.body.rating;
    
    SongDb.findById(id)
        .then(song =>{
            if(!song){
                res.status(404).send({ message : "Not found song with id "+ id})
            }else{
                const artistIds = song.artists;
                artistIds.forEach(artistId => {
                    ArtistDb.findById(artistId)
                        .then(artistData =>{
                            if(artistData){
                                artistData.rating = (parseFloat(artistData.rating) + parseFloat(newSongRating))/2;
                                artistData.rating = Math.round(artistData.rating * 100) / 100
                            }
                            ArtistDb.findByIdAndUpdate(artistId, artistData, { useFindAndModify: false})
                                .catch(err =>{
                                    res.status(500).send({ message : "Error Update artist information"})
                                })
                        })
                        .catch(err =>{
                            res.status(500).send({ message: "Erro retrieving artist with id " + id})
                        })
                });
                song.rating = (parseFloat(song.rating) + parseFloat(newSongRating))/2;
                song.rating = Math.round(song.rating * 100) / 100
                SongDb.findByIdAndUpdate(id, song, { useFindAndModify: false})
                    .then(data => {
                        if(!data){
                            res.status(404).send({ message : `Cannot Update song with ${id}. Maybe song not found!`})
                        }else{
                            res.send(song);
                        }
                    })
                    .catch(err =>{
                        res.status(500).send({ message : "Error Update song information"})
                    })
            }
        })
        .catch(err =>{
            res.status(500).send({ message: "Erro retrieving song with id " + id})
        })
}


exports.updateMutipleSongRating = (req, res)=>{
    if(!req.body){
        return res
            .status(400)
            .send({ message : "Data to update can not be empty"})
    }
    console.log(req.body);
    var ids = req.body.songs;
    const newSongRating = req.body.rating;
    if(!Array.isArray(ids)){
        ids = [ids]
    }
    ids.forEach((id)=>{
        SongDb.findById(id)
        .then(song =>{
            if(!song){
                res.status(404).send({ message : "Not found song with id "+ id})
            }else{
                const artistIds = song.artists;
                artistIds.forEach(artistId => {
                    ArtistDb.findById(artistId)
                        .then(artistData =>{
                            if(artistData){
                                artistData.rating = (parseFloat(artistData.rating) + parseFloat(newSongRating))/2;
                                artistData.rating = Math.round(artistData.rating * 100) / 100
                            }
            
                            ArtistDb.findByIdAndUpdate(artistId, artistData, { useFindAndModify: false})
                                .catch(err =>{
                                    res.status(500).send({ message : "Error Update artist information"})
                                })
                        })
                        .catch(err =>{
                            res.status(500).send({ message: "Erro retrieving artist with id " + id})
                        })
                });
                song.rating = (parseFloat(song.rating) + parseFloat(newSongRating))/2;
                song.rating = Math.round(song.rating * 100) / 100
                SongDb.findByIdAndUpdate(id, song, { useFindAndModify: false})
                    .then(data => {
                        if(!data){
                            res.status(404).send({ message : `Cannot Update song with ${id}. Maybe song not found!`})
                        }else{
                            res.redirect("/");
                        }
                    })
                    .catch(err =>{
                        res.status(500).send({ message : "Error Update song information"})
                    })
            }
        })
        .catch(err =>{
            res.status(500).send({ message: "Erro retrieving song with id " + id})
        })
    })
    
    
}




exports.getSongImage = (req, res)=>{
    const id = req.params.id;

    SongDb.findById(id)
            .then(data =>{
                if(!data){
                    res.status(404).send({ message : "Not found song with id "+ id})
                }else{
                    res.send(data.img)
                }
            })
            .catch(err =>{
                res.status(500).send({ message: "Erro retrieving song with id " + id})
            });
}

///////////////////////////////////////////////////////////////





exports.createArtists = (req,res)=>{
    // validate request
    if(!req.body){
        res.status(400).send({ message : "Content can not be emtpy!"});
        return;
    }

    if(!req.body.rating)
        req.body.rating = 0

    // new artist
    const artist = new ArtistDb({
        name : req.body.name,
        DOB : req.body.DOB,
        Desc: req.body.desc,
        rating : req.body.rating,
        songs : []
    })

    // save artist in the database
    artist
        .save(artist)
        .then(data => {
            res.send(data)
            // res.redirect('/add-user');
        })
        .catch(err =>{
            res.status(500).send({
                message : err.message || "Some error occurred while creating a create operation"
            });
        });

}

// retrieve and return all artists/ retrive and return a single artist
exports.findArtists = (req, res)=>{

    if(req.query.id){
        const id = req.query.id;

        ArtistDb.findById(id)
            .then(data =>{
                if(!data){
                    res.status(404).send({ message : "Not found artist with id "+ id})
                }else{
                    res.send(data)
                }
            })
            .catch(err =>{
                res.status(500).send({ message: "Erro retrieving artist with id " + id})
            })

    }else{
        ArtistDb.find()
            .then(song => {
                res.send(song)
            })
            .catch(err => {
                res.status(500).send({ message : err.message || "Error Occurred while retriving artist information" })
            })
    }

    
}


exports.updateArtist = (req, res)=>{
    if(!req.body){
        return res
            .status(400)
            .send({ message : "Data to update can not be empty"})
    }

    const id = req.params.id;
    ArtistDb.findByIdAndUpdate(id, req.body, { useFindAndModify: false})
        .then(data => {
            if(!data){
                res.status(404).send({ message : `Cannot Update artist with ${id}. Maybe artist not found!`})
            }else{
                res.send(data)
            }
        })
        .catch(err =>{
            res.status(500).send({ message : "Error Update artist information"})
        })
}

exports.deleteArtist = (req, res)=>{
    const id = req.params.id;

    ArtistDb.findByIdAndDelete(id)
        .then(data => {
            if(!data){
                res.status(404).send({ message : `Cannot Delete with id ${id}. Maybe id is wrong`})
            }else{
                res.send({
                    message : "Artist was deleted successfully!"
                })
            }
        })
        .catch(err =>{
            res.status(500).send({
                message: "Could not delete Artist with id=" + id
            });
        });
}

exports.findTop10Artists = (req, res)=>{
    ArtistDb.find().sort({"rating":-1}).limit(10)
    .populate("songs", "name")
        .then(artists => {
            res.send(artists)
        })
        .catch(err => {
            res.status(500).send({ message : err.message || "Error Occurred while retriving top 10 artists information" })
        })

}

///////////////////////////////////////////////////

  
  exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    const user = await UserDb.findOne({ email });
  
    if (!user) {
      req.session.error = "Invalid Credentials";
      return res.redirect("/login");
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      req.session.error = "Invalid Credentials";
      return res.redirect("/login");
    }
  
    req.session.isAuth = true;
    req.session.username = user.username;
    res.redirect("/");
  };
  
  
  exports.register = async (req, res) => {
    const { username, email, password } = req.body;
  
    let user = await UserDb.findOne({ email });
  
    if (user) {
      req.session.error = "User already exists";
      return res.redirect("/register");
    }
  
    const hasdPsw = await bcrypt.hash(password, 12);
  
    user = new UserDb({
      username,
      email,
      password: hasdPsw,
    });
  
    await user.save();
    res.redirect("/login");
  };