var static = require("../node-static.js");
var fs = require("fs"),
    path = require("path"),
    markdown = require('../markdown.js'),
    WEBPORT = 8002,
    WEBROOT = path.join(__dirname, 'webroot');

function mapIsDir(filepath,files,callback,done){
    if(files.length==0){
        callback(done);
    }else{
        done = done || [];
        fs.stat(path.join(filepath,files[0]),function(err,stat){
            if(!err){
                if(stat.isDirectory()){
                    fs.readFile(path.join(filepath,files[0],'index.md'), "utf-8",function(err,data){
                        if(!err){
                            done.push({
                                file:files[0],
                                md: markdown.toHTML(data),
                                dir:stat.isDirectory()
                            });
                        }else{
                            done.push({
                                file:files[0],
                                dir:stat.isDirectory()
                            });
                        }
                        mapIsDir(filepath,files.slice(1),callback,done);
                    });
                }else{
                    done.push({
                        file:files[0],
                        dir:stat.isDirectory()
                    });
                    mapIsDir(filepath,files.slice(1),callback,done);
                }
            }else{
                mapIsDir(filepath,files.slice(1),callback,done);
            }
        });
    }
};


exports.createWebServer = function (options) {

    options = options || {};
    options.webPort = options.webPort || WEBPORT;
    options.webRoot = options.webRoot || WEBROOT;

    function pathToFile(dirpath,filename,req){
        //this is unix centric
        if(dirpath==options.webRoot ){
            return filename;
        }else{
            var pa=dirpath.slice(options.webRoot.length);
            if(pa[pa.length-1]=="/"){
                return filename;
            }else{
                return pa+"/"+filename;
            }
        }
    }

    var fileServer = new static.Server(options.webRoot,{listDir:function(filename,req,res){
        // yes i know, god may forgive me, but i'm just ... lazy, yes, there is no better explanation
        // and i'm not quite happy with any of the template systems, have any suggestion?
        res.writeHead(200,{"Content-Type":"text/html"});
        res.write('<html><head>');
        res.write('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> <title>snowballJS</title><link rel="stylesheet" type="text/css" href="/snowballjs/dirlist.css" /></head><body><ul>');
        fs.readdir(filename,function(err,files){
                if(!err){
                    mapIsDir(filename,files,function(files){
                        for(i in files){
                            if(files[i].file.charAt(0)!="."){
                                if(files[i].dir){
                                    res.write("<li><a href='"+pathToFile(filename,files[i].file,req)+"/'><span class='head'>"+files[i].file+"</span></a></li>");
                                    if("md" in files[i]){
                                        res.write("<li><div class='md'>"+files[i].md)+"</div></li>";
                                    }
                                }else{
                                    res.write("<li><a href='"+pathToFile(filename,files[i].file,req)+"'>"+files[i].file+"</a></li>");
                                }
                            }
                        }
                        res.write('</ul></body></html>');
                        res.end();
                    });
                }else{
                    res.write('</ul></body></html>');
                    res.end();
                }
        })
        }
    });

    var privateServer = new static.Server( path.join(path.dirname(__filename), 'webroot'));

    var webServer= require('http').createServer(function (request, response) {
		//console.log(request.url.slice(0,12));
        if(request.url.slice(0,12)=="/snowballjs/"){
				
                privateServer.serveFile(request.url.slice(11), 200, {}, request, response);
        }else{
            fileServer.serve(request, response);
        }
    });
    webServer.listen(options.webPort);
    return webServer;
}