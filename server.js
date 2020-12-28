var express = require("express");
var app = express();
var path = require("path");
var hbs = require("express-handlebars");
var formidable = require("formidable");
const PORT = process.env.PORT || 3000;

var fileList = [];
var listIndex = 1;

app.use(express.static("static"));
app.set("views", path.join(__dirname, "views"));
app.engine("hbs", hbs({
    defaultLayout: "main.hbs",
    extname: ".hbs",
    partialsDir: "views/partials"
}));
app.set("view engine", "hbs");

app.get("/", function(req, res){
    res.redirect("/upload")
})

app.get("/upload", function(req, res){
    res.render("upload.hbs")
})

app.get("/upload2", function(req, res){
    res.render("upload.hbs")
})

app.post('/handleUpload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/static/upload/'       // folder do zapisu zdjęcia
    form.keepExtensions = true                           // zapis z rozszerzeniem pliku
    form.multiples = true                                // zapis wielu plików                          
    form.parse(req, function (err, fields, files) { 
        if(Array.isArray(files.uploadFiles)){
            for(let i = 0; i<files.uploadFiles.length; i++){
                addFileToList(files.uploadFiles[i])
            }
        } else {
            addFileToList(files.uploadFiles)
        }
        console.log(fileList)
        res.redirect("/filemanager")
    });
});

function addFileToList(data){
    let imgType = data.type.substr(data.type.indexOf("/") + 1)
    switch (imgType){
        case "jpeg":
            imgType = "jpg";
            break;
        case "png":
            break;
        case "plain":
            imgType = "txt";
            break;
        case "pdf":
            break;
        default:
            imgType = "file";
    }

    fileList.push({
        id: listIndex,
        name: data.name,
        size: data.size,
        type: data.type,
        // path: "/app/static/upload/" + data.path.substr(data.path.indexOf("upload") + 7),
        path: data.path,
        downloadPath: "upload/" + data.path.substr(data.path.indexOf("upload") + 7),
        savedate: Date.now(),
        img: imgType,
        build: true
    })
    listIndex++
}

app.get("/filemanager", function(req, res){
    let context = {files: fileList}
    res.render("filemanager.hbs", context)
})

app.get("/info", function(req, res){
    let context = {build: false}
    if(req.query.id != undefined){
        for(let i = 0; i<fileList.length; i++){
            if(fileList[i].id == req.query.id){
                context = fileList[i];
                break;
            }
        }
    }
    res.render("info.hbs", context)
})

app.get("/deleteAll", function(req, res){
    fileList = [];
    listIndex = 1;
    res.redirect("/filemanager")
})

app.get("/delete", function(req, res){
    for(let i = 0; i<fileList.length; i++){
        if(fileList[i].id == req.query.id){
            fileList.splice(i, 1);
            break;
        }
    }
    res.redirect("/filemanager")
})

app.listen(PORT, function(){
    console.log("Start serwera na porcie " + PORT)
})