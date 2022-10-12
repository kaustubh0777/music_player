const axios = require('axios');


exports.homeRoutes = (req, res) => {
    
    const one = 'http://localhost:3000/api/songs/top';
    const two = 'http://localhost:3000/api/artists/top';
    const top10Songs = axios.get(one);
    const top10Artists = axios.get(two);

    axios.all([top10Songs, top10Artists]).then(axios.spread((...responses) => {
        const responseTop10Songs = responses[0]
        const responseTop10Artists = responses[1]
       
        res.render('index', { songs : responseTop10Songs.data, artists : responseTop10Artists.data });
      })).catch(errors => {
      
        res.send(errors);
      })
}

exports.add_song = (req, res) =>{
  axios.get('http://localhost:3000/api/artists')
        .then(function(response){
          res.render('add_song', { artists : response.data });
        })
        .catch(err =>{
            res.send(err);
        })
}

exports.login = (req, res) =>{
  const error = req.session.error;
  delete req.session.error;
  res.render("login", { err: error });
}


exports.register = (req, res) =>{
  const error = req.session.error;
  delete req.session.error;
  res.render("register", { err: error });
}

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
};

