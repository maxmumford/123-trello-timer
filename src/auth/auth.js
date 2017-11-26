module.exports = {checkToken: checkToken, storeToken: storeToken};

var remote = require('electron').remote
const request = require('request')
const querystring = require('querystring')
const storage = require('electron-json-storage');

const CONSUMER_KEY = 'b4946565adec1d8fe0fe0b8c803bf2bc'
const CONSUMER_SECRET = 'a9f54fb31e4293037a73734bc9f0262e2ed8e2905c2f57b8c923f9093a6ce29c'

const REQUEST_TOKEN_URL = 'https://trello.com/1/OAuthGetRequestToken?oauth_callback=timeyauth://storetoken'
const AUTHORIZE_TOKEN_URL = 'https://trello.com/1/OAuthAuthorizeToken?name=Timey&scope=read&expiration=never&oauth_token='
const ACCESS_TOKEN_URL = 'https://trello.com/1/OAuthGetAccessToken'

function checkToken() {

  storage.get('token', function(error, data) {
    if (error) throw error;

    if(data.token && data.token_secret){
      remote.getCurrentWindow().loadURL(`file://${__dirname}/../../index.html`)
      return
    }

    const oauth = {consumer_key: CONSUMER_KEY, consumer_secret: CONSUMER_SECRET};

    request.post({url: REQUEST_TOKEN_URL, oauth: oauth}, (e, r, body) => {

      const req_data = querystring.parse(body);
      const token = req_data.oauth_token
      const token_secret = req_data.oauth_token_secret

      storage.set('token', { token: token, token_secret: token_secret }, function(error) {
        if (error) throw error;
        document.getElementById('webview').setAttribute("src", AUTHORIZE_TOKEN_URL + token);
      });
    });
  })
}

function storeToken(urlQuery, targetWindow) {
  const verify_data = querystring.parse(urlQuery);

  storage.get('token', function(error, data) {
    if (error) throw error;
    
    let token_secret = data.token_secret
    
    const oauth = {
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET,
      token: verify_data.oauth_token,
      token_secret: token_secret, // missing in test
      verifier: verify_data.oauth_verifier,
    };
    
    request.post({url: ACCESS_TOKEN_URL, oauth: oauth}, (e, r, body) => {
      const token_data = querystring.parse(body);
      storage.set('token', { token: token_data.oauth_token, token_secret: token_data.oauth_token_secret }, function(error) {
        if (error) throw error;
        targetWindow.loadURL(`file://${__dirname}/index.html`);
      });
    });
  })
}
