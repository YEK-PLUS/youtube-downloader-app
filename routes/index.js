var express = require('express');
var router = express.Router();
var ytdl = require('youtube-dl');
var request = require('request');
var search = require('youtube-search');
var https = require("https");
const fs = require("fs");
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { nocenter:false, title: 'Youtube Downloader' });
});

// convert to human readable format
function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};
function urlChecker(string) {
  const pattern = new RegExp('^(https?:\\/\\/)?'+
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
    '((\\d{1,3}\\.){3}\\d{1,3}))'+
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
    '(\\?[;&a-z\\d%_.~+=-]*)?'+
    '(\\#[-a-z\\d_]*)?$','i');
  return !!pattern.test(string);
}

router.post('/video', function(req, res, next) {
    var url = req.body.url,
        formats ={
            audio : [],
            video:[]

        },

        pattern = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

    request.get(url, function (err, resp, body) {
        // check if it is valid url
        if(!err && pattern.test(req.body.url)) {
            ytdl.getInfo(url, ['--youtube-skip-dash-manifest'], function(err, info) {
                if(err) return res.render('listvideo', {error: 'The link you provided either not a valid url or it is not acceptable'});

                // push all video formats for download (skipping audio)
                console.log(info.formats[0].ext)
                info.formats.forEach(function(item) {
                    if(item.format_note !== 'DASH audio' && item.filesize) {
                        item.isAudio = item.ext == 'm4a';
                        item.isVideo = item.ext == 'mp4';
                        item.filesize = item.filesize ? bytesToSize(item.filesize): 'unknown';
                        if(item.isAudio){formats.audio.push(item);}
                        if(item.isVideo){formats.video.push(item);}
                    }
                });
                res.render('listvideo', {nocenter:false,title: 'Youtube Downloader',meta: {id: info.id, formats: formats}});
            })
        }
        else {
            if(urlChecker(req.body.url)){
                res.render('listvideo', {error: 'The link you provided either not a valid url or it is not acceptable'});
            }
            else{
                res.redirect('/search/?query=' + req.body.url)
            }
        }
    });



})

router.all('/search', function(req, res, next) {

    var url = req.query.query,
        formats = [],
        pattern = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\watch\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

    var opts = {
        maxResults: 10,
        key: 'AIzaSyAxDBxrIaU0uR2tD7M_yMiijX7AsnIVAxc'
    };

    search(url, opts, function(err, results) {
        urls = [];
        if(err) return console.log(err);
        results.forEach((result)=>{
            if(!err && pattern.test(result.link)&&result.link.split('/')[3].split('?')[0]==='watch') {
                urls.push(result.link);
            }
        });
        ytdl.getInfo(urls, ['--youtube-skip-dash-manifest'], function(err, infos) {
            if(err) return res.render('listvideo', {error: 'The link you provided either not a valid url or it is not acceptable'});
            infos.forEach((info)=>{
                let pushItem = {
                    name:info.title,
                    audio : [],
                    video:[],
                };
                info.formats.forEach(function(item) {
                    if(item.format_note !== 'DASH audio' && item.filesize) {
                        item.isAudio = item.ext == 'm4a';
                        item.isVideo = item.ext == 'mp4';
                        item.filesize = item.filesize ? bytesToSize(item.filesize): 'unknown';
                        if(item.isAudio){pushItem.audio.push(item);}
                        if(item.isVideo){pushItem.video.push(item);}
                    }
                });
                pushItem.info = info
                formats.push(pushItem)
            })
            res.render('list-video', {title: 'Youtube Downloader',formats:formats,nocenter:true});

        })
    });


});
router.all('/download', function(req, res, next) {

    let url =Buffer.from(req.query.url, 'base64').toString('ascii');
    let filename = 'convert/'+req.query.filename;
    const { exec } = require('child_process');
    const command = 'curl "'+url+'" >> '+filename;
    const command2 = 'curl -sI "'+url+'" | grep -i Content-Length > '+filename+'.txt';
    console.log(command2)
    exec(command2)
    exec(command)
    res.send('success')
})
router.all('/get', function(req, res, next) {
    let filename = 'convert/'+req.query.filename;
    fs.readFile(filename+'.txt', (err, data) => {
        let l = parseInt(data.toString('ascii').split(':')[1]);
        const stats = fs.statSync(filename);
        const fileSizeInBytes = stats.size;
        console.log(fileSizeInBytes,l)
        if(fileSizeInBytes === l){
            if(req.query.get === 'true'){
                res.download(filename)
            }
            else{
                res.send("success").end()
            }
        }
        else{
                res.send("wait").end()
            }
    });


})
module.exports = router;
