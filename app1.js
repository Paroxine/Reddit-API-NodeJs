var http = require("http");
var https = require("https");
var fs = require("fs");
var url = require("url");
var opn = require("opn");
var mkdirp = require("mkdirp");

var filePaths = {
    "/api/v1/me" : "C://Users/robin/documents/NodeJS/Reddit-API-NodeJS/api/me/"
}

function oauth_login() {
    var state = "bdfxgkgy";
    var redirect = "http%3A%2F%2Flocalhost%3A8080%2Foauth";
    var scopeString = "creddits,modcontributors,modconfig,subscribe,wikiread,wikiedit,vote,mysubreddits,submit,modlog,modposts,modflair,save,modothers,read,privatemessages,report,identity,livemanage,account,modtraffic,edit,modwiki,modself,history,flair"
    var requestUrl = "https://www.reddit.com/api/v1/authorize?client_id=" + client_id + "&response_type=code&state=bdfxgkgy&redirect_uri=" + redirect +  "&duration=permanent&scope=" + scopeString
    opn(requestUrl);
}

http.createServer(function(req, res) {
    var parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname == "/oauth") {
        var req = https.request({
            method : "POST",
            host : "www.reddit.com",
            path : "/api/v1/access_token?grant_type=authorization_code&code="+parsedUrl.query.code+"&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Foauth",
            headers : {
                "Authorization" : "Basic " + new Buffer(client_id + ":" + client_secret).toString("base64")
            }
        }, function(res) {
            data = "";
            res.on("data", function(chunk) { data+=chunk; });
            res.on("end", function() {
                data = JSON.parse(data);
                bearer = data.access_token;
                if (bearer) {
                    fs.writeFileSync("bearer.txt", bearer);
                    console.log("Bearer acquired");
                } else {
                    console.log("Authentification failed")
                }
            })
        })

        req.on("error", function(err) { throw err });

        req.end();
    
        fs.readFile("authentification.html", function(err, data) {
            if (err) throw err;

            res.end(data); 
        });
    } else if (parsedUrl.pathname.startsWith("/api")  || parsedUrl.pathname.startsWith("/r")) {
        var data = ""
        https.get({
            hostname : "oauth.reddit.com",
            path : parsedUrl.pathname,
            headers:{
                Authorization: "bearer " + bearer,
                "User-Agent" : "Script/0.1 by Paroxine"      
            }
        }, function(res) {
            res.on("data", function(chunk) { data+=chunk; });
            res.on("end", function() {
                mkdirp(__dirname + parsedUrl.pathname, function (err) {
                    fs.writeFileSync(__dirname + parsedUrl.pathname + "/data.json", data);
                });
            });
        });
        res.setHeader("Content-Type", "application/json")
        var content = fs.readFileSync(__dirname + parsedUrl.pathname + "/data.json");
        console.log(content);
        res.end(JSON.stringify(JSON.parse(content), null, 3));
    }
}).listen(8080);

var client_id = fs.readFileSync("client_id.txt");
var client_secret = fs.readFileSync("client_secret.txt");
var bearer = fs.readFileSync("bearer.txt");

if (bearer == "") {
    oauth_login();
} else {
    console.log(bearer.toString());
}