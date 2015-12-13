Core.prototype.Load = function() {
    $('p').addClass(config.css.active).html(config.version);
    $('h1').attr({title:config.build}).attr({class:'icon-fire'});
    var fn=this,l7=[], l8={}, f0={
        reading:function(bID){
            if(config.bible.ready && fO.query.bible){
                if(config.bible.ready==1){return fO.query.bible;}
                else if(config.bible.ready==2){return bID;}
                else{ return true;}
            }else{
                return true;
            }
        },
        start:function(){
            var bID=l7.shift(); fO[bID]={};
            if(fO.lang[bID].info){
                $("p").html(fO.lang[bID].info.name).promise().done(function(){
                    if(f0.reading(bID) == bID){
                        // TODO: ???
                        f0.next();
                        /*
                        new Content({bible:bID,reading:bID}).XML(function(response){
                            f0.next();
                        }).read();
                        */
                    }else{
                        f0.next();
                    }
                });
            }else{
                this.json(bID,this.next);
            }
        },
        json:function(bID,callback,x){
            console.log('json');
            var o=fn.url(config.id,[bID],config.file.lang);
            var request=$.ajax({url:(x)?x+o.url:o.url,dataType:o.data,contentType:o.content,cache:false});
            request.done(function(j){
                var lID=j.info.lang=j.info.lang || config.language.info.lang;
                fO.msg.info.html(j.info.name);
                var prepare=function(lC,lN){
                    var l9={};
                    return {
                        is:{
                            index:function(n){
                                l9[n]=fO.lang[bID].index;
                            },
                            name:function(n){
                                l9[n]={};
                                for(var i in lC[n]){
                                    var jB=(typeof lN.b === "undefined" || typeof lN.b[i] === "undefined")?[]:[lN.b[i]];
                                    var jN=(typeof lN.name === "undefined" || typeof lN.name[i] === "undefined")?[]:lN.name[i];
                                    $.merge(jB,jN);
                                    l9[n][i]=$.unique(fn.array(lC[n][i]).merge(jB).data);
                                }
                            }
                        },
                        merge:function(){
                            for(var f in lC){
                                if(this.is[f]){
                                    this.is[f](f);
                                }else{
                                    l9[f]=(lN[f])?$.extend({},lC[f],lN[f]):lC[f];
                                }
                            }
                            return l9;
                        },
                        next:function(){
                            $.extend(fO.lang[bID],this.merge());
                            $("p").html(lID).attr({class:'icon-database'}).promise().done(function(){
                                callback();
                                // TODO: ???
                                // new fn.Content({bible:bID,reading:f0.reading(bID)}).XML(function(response){
                                //     callback();
                                // }).read();
                            });
                        }
                    };
                };
                if(l8[lID]){
                    prepare(l8[lID],j).next();
                }else{
                    var o=fn.url('lang',[lID],config.file.lang), get=$.ajax({url:o.url,dataType:o.data,contentType:o.content,cache:false});
                    get.done(function(langauge){
                        l8[lID]=prepare(config.language,langauge).merge();
                        prepare(l8[lID],j).next();
                    });
                    get.fail(function(jqXHR, textStatus){
                        prepare(config.language,j).next();
                    });
                }
            });
            request.fail(function(jqXHR, textStatus){
                if(api){
                    if(x){
                        db.RemoveLang(bID,function(){
                            l7.splice(l7.indexOf(bID), 1); callback();
                        });
                    }else{
                        f0.json(bID,callback,api);
                    }
                }else{
                    db.RemoveLang(bID,function(){
                        l7.splice(l7.indexOf(bID), 1); callback();
                    });
                }
            });
        },
        next:function(){
            if(l7.length){
                f0.start();
            }else{
                $(window).bind(fO.Hash,function(){
                    f().init();
                });
                function fSN(){
                    db.get({table:config.store.note}).then(function(storeNote){
                        if(storeNote){
                            fO.note=storeNote; f0.done();
                        }else{
                            db.add({table:config.store.note,data:config.store.noteData}).then(function(storeNote){
                                fO.note=storeNote; f0.done();
                            });
                        }
                    });
                };
                function fSL(){
                    db.get({table:config.store.lookup}).then(function(storeLookup){
                        if(storeLookup){
                            fO.lookup=storeLookup; fSN();
                        }else{
                            db.add({table:config.store.lookup,data:{setting:fO.lookup.setting,book:fO.lookup.book}}).then(function(storeLookup){
                                fO.lookup=storeLookup; fSN();
                            });
                        }
                    });
                };
                db.update.lang().then(fSL);
            }
        },
        available:function(j){
            if(j){
                fO.lang=fn.array(config.bible.available,Object.keys(j)).merge().unique().reduce(function(o,v,i){
                    if($.isPlainObject(j[v])){
                        o[v]={index:(j[v].index||j[v].index==0)||i};
                    }else{
                        o[v]={index:i};
                    }
                    return o;
                }, {});
            }else{
                fO.lang=config.bible.available.reduce(function(o,v,i){
                    o[v]={index:i};
                    return o;
                }, {});
            }
        },
        done:function(){
            // TODO: a faster way, body id has to change
            if(fO.todo.Design){
                $(document.body).load("Desktop.design.html header, main, footer",function(){
                    fn.init();
                });
                // $(document.body).load("Desktop.design.html header, main, footer",function(){
                //     fn.init();
                // }).promise().done(function(){
                //     this.attr('id',fO.App);
                // });
            }else{
                fn.init();
            }
            $(document.body).keydown(function(e){
                // TODO: shortcut keys
                if(e.which == 27)fO.todo.pause=true;
                else if(e.which == 13)fO.todo.enter=true;
            });
        }
    };
    fO.msg.info.html('getting Database ready').attr({class:'icon-database'});
    db=new this.Database(function(){
        fO.msg.info.html('getting Configuration ready').attr({class:'icon-config'});
        db.get({table:config.store.info}).then(function(storeInfo){
            fO.msg.info.html('getting Language ready').attr({class:'icon-language'});
            $('p').attr({class:'ClickTest fO icon-language'}).html('One more moment please');
            db.get({table:config.store.lang}).then(function(storeLang){
                fO.msg.info.attr({class:'icon-flag'});
                if(storeLang){
                    if(storeInfo && storeInfo.build == config.build){
                        // NOTE: ONLOAD
                        fO.Ready=3; fO.lang=storeLang; process_query();
                    }else{
                        // NOTE: ONUPDATE
                        fO.Ready=2; f0.available(storeLang); process_query();
                    }
                }else{
                    // NOTE: ONINSTALL
                    fO.Ready=1; f0.available(); process_query();
                }
            });
            function process_query(){
                db.get({table:config.store.query}).then(function(storeQuery){
                    if(storeQuery){fO.query=storeQuery; process_trigger();}else{process_trigger();}
                });
            };
            function process_trigger(){
                fn.index(); l7=config.bible.available.concat();
                // NOTE: got ready 'available' bible
                if(fO.Ready==3){f0.start();}else{db.add({table:config.store.info,data:{build:config.build,version:config.version}}).then(f0.start());}
            };
        });
    });
};