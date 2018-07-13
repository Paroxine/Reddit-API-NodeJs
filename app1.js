var http = require("http");
var https = require("https");
var fs = require("fs");
var url = require("url");
var opn = require("opn");

var secret = fs.readFileSync("secret.txt");
var bearer = false;

function oauth_login(secret) {
    var client_id = "Ao5XjKEegR_lhA";
    var state = "bdfxgkgy";
    var redirect = "http%3A%2F%2Flocalhost%3A8080%2Foauth";
    var requestUrl = "https://www.reddit.com/api/v1/authorize?client_id=" + client_id + "&response_type=code&state=bdfxgkgy&redirect_uri=" + redirect +  "&duration=permanent&scope=identity"
    opn(requestUrl);
}

http.createServer(function(req, res) {
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    
    if (path == "/oauth") {
        var code = parsedUrl.query.code;
        var redirect = "http%3A%2F%2Flocalhost%3A8080%2Foauth";
        requestUrl = "https://www.reddit.com/api/v1/access_token?code="+code+"&redirect_uri="+redirect+"grant_type=authorization_code"
        https.get(requestUrl, function(res) {
            data = "";
            res.on("data", function(chunk) { data+=chunk; });
            res.on("end", function() {
                data = JSON.parse(data);
                bearer = data.access_token;
            })
        })
        res.end("Authentification started");
    }
}).listen(8080);

oauth_login(secret);


/*
https.get("https://www.reddit.com/api/me.json", function(res) {
    data = "";
    res.on("data", function(chunk) { data += chunk; });
    res.on("end", function() {
        fs.writeFile("jsondata.json", data, function(err) {
            if(err) throw err;
        });
    });
})
*/