
$(document).ready(function () {
    WysiwygApp.Initialize();
    WysiwygApp.importHtml(EditorProxy.GetHtml()); //get initial html from Editor
    WysiwygApp.kendoEditor.focus();
});

var WysiwygApp = (function (app) {
    app.originalHtml = null;    //html which get from Editor
    app.originalHtmlTempl = null; //html template
    app.originalHtmlModified = false; //originalHtml whether ever modified

    app.OnHtmlChangeFromOutside = function(htmlStr) {
        app.importHtml(htmlStr); //Editor modified html
    };

    app.importHtml = function(str) {
        console.dir("import html");
        app.originalHtml = str;

        if(typeof str != 'string' || str == null || str.length < 1) {
            console.dir('import html fail, argument invalid');
            return;
        }

        $("#code-panel").val(str);
        var changeFromEditor = true;
        app.onSourceChange(changeFromEditor);
    };

    app.parseHtml = function(html) {
        html = app.Utility.preprocessHtmlForjQuery(html, true);

        var flowContent, absoContent, templ;
        var doc = $(html);
        var flow = doc.find("#_real_body_>#flow-container");
        var abso = doc.find("#_real_body_>#abso-container");
        if(flow.length === 1 && abso.length === 1) {
            //this html is wysiwyg generate
            flowContent = flow.html();
            absoContent = abso.html();
            flow.html("%%_flow_content_%%");
            abso.html("%%_abso_content_%%");
            var title = doc.find("#_real_head_").find("title");
            if(title.length > 0) {
                title.html("%%_title_content_%%");
            }

            if(doc.find("#_real_head_").parent().parent().length === 0) {
                doc.wrap("<div></div>");
            }
            templ = app.Utility.preprocessHtmlForjQuery(doc.find("#_real_head_").parent().parent().html(), false);
        }
        else {
            //console.dir("this html is not wysiwyg generate.");
            var body = doc.find("#_real_body_");
            if(body.length !== 1) {
                console.dir("Error, invalid html.");
                return;
            }
            flowContent = body.html();
            absoContent = "";
            body.html('<div id="flow-container">%%_flow_content_%%</div><div id="abso-container">%%_abso_content_%%</div>');
            if(doc.find("#_real_head_").parent().parent().length === 0) {
                doc.wrap("<div></div>");
            }
            templ = app.Utility.preprocessHtmlForjQuery(doc.find("#_real_head_").parent().parent().html(), false);
        }
        return {flowContent:flowContent, absoContent:absoContent, templ:templ};
    };

    app.oniFrameLoadDone = function() {
        console.dir("iframe load complete");
        var $iframe = $("#iframe-for-parsehtml");
        var iframe = $iframe.get(0);

        var flowEl = iframe.contentDocument.getElementById("flow-container");
        var absoEl = iframe.contentDocument.getElementById("abso-container");
        if(flowEl && absoEl) {
            flowContent = flowEl.innerHTML;
            absoContent = absoEl.innerHTML;
            flowEl.innerHTML = "%%_flow_content_%%";
            absoEl.innerHTML = "%%_abso_content_%%";
        }
        else {
            flowContent = iframe.contentDocument.getElementsByTagName("body")[0].innerHTML;
            absoContent = "";
            iframe.contentDocument.getElementsByTagName("body")[0].innerHTML = '<div id="flow-container">%%_flow_content_%%</div><div id="abso-container">%%_abso_content_%%</div>';
        }
        if(flowContent.length < 1) {
            console.dir("parse html flow content is empty.")
        }
        var titles = iframe.contentDocument.getElementsByTagName("title");
        if(titles.length > 0) {
            titles[0].innerHTML = "%%_title_content_%%";
        }
        else {
            var heads = iframe.contentDocument.getElementsByTagName("head");
            if(heads.length < 1) {
                var head = iframe.contentDocument.createElement("head");
                head.innerHTML = "<title>%%_title_content_%%</title>";
                iframe.contentDocument.getElementsByTagName("html")[0].appendChild(head);
            }
            else {
                var title = iframe.contentDocument.createElement("title");
                title.innerHTML = "%%_title_content_%%";
                heads[0].appendChild(title);
            }
        }
        templ = iframe.contentDocument.getElementsByTagName("html")[0].outerHTML;
        $iframe.remove();

        WysiwygApp.onParseHtmlDone({flowContent:flowContent, absoContent:absoContent, templ:templ});
    };
    app.onParseHtmlDone = function(parseRet) {
        app.originalHtmlTempl = parseRet.templ;
        //sync to design
        app.kendoEditor.value(parseRet.flowContent);
        $("#design-panel>#abso-container").html(parseRet.absoContent);
        app.objManager.adjustHotAreaPos();
        app.convertRealObjsToAct();
        app.objManager.setDropableForHotArea();
        app.convertHyperlink(true);

        if(app.sourceChangeFromEditor === true) {
        }
        else {
            app.originalHtmlModified = true;
            EditorProxy.SetHtml(app.exportHtml(), false);
        }
    };
    app.parseHtml2 = function(html) {
        var flowContent = "", absoContent = "", templ;
        html = html.replace(new RegExp('"', 'g'), '&quot;');
        html = html.replace(new RegExp("'", 'g'), '&apos;');


        var str = '<iframe id="iframe-for-parsehtml" onload = "WysiwygApp.oniFrameLoadDone()" onreadystatechange = "WysiwygApp.oniFrameLoadDone()"  style="display:none" srcdoc="' + html + '"></iframe>';
        $("body").append(str);

        //var $iframe = $("#iframe-for-parsehtml");
        //var iframe = $iframe.get(0);
        //iframe.onload = iframe.onreadystatechange = iframeload;
    };

    app.onSourceChange = function(changeFromEditor) {
        console.dir("onSourceChange");

        clearTimeout(app.syncCode2DesignTimeoutID);
        app.syncCode2DesignTimeoutID = setTimeout(function() {
            var html = $("#code-panel").val();
            if(0) { //use parseHtml
                var parseRet = app.parseHtml(html);

                app.originalHtmlTempl = parseRet.templ;
                //sync to design
                app.kendoEditor.value(parseRet.flowContent);
                $("#design-panel>#abso-container").html(parseRet.absoContent);
                app.objManager.adjustHotAreaPos();
                app.convertRealObjsToAct();
                app.objManager.setDropableForHotArea();

                if(changeFromEditor === true) {
                }
                else {
                    app.originalHtmlModified = true;
                    EditorProxy.SetHtml(app.exportHtml(), false);
                }
            }
            else { //use parseHtml2
                app.sourceChangeFromEditor = changeFromEditor;
                app.parseHtml2(html);
            }
        }, 1200);
    };

    app.onDesignChange = function(immediatelySync) {
        console.dir("onDesignChange");

        app.designPanel.updateRuler();
        var fn = function() {
            app.objManager.adjustHotAreaPos();

            app.originalHtmlModified = true;

            //sync design to source
            var newHtml = app.exportHtml();
            $("#code-panel").val(newHtml);

            EditorProxy.SetHtml(newHtml, false);
        };

        if(immediatelySync === true) {
            clearTimeout(app.syncDesign2CodeTimeoutID);
            fn();
        }
        else {
            clearTimeout(app.syncDesign2CodeTimeoutID);
            app.syncDesign2CodeTimeoutID = setTimeout(function() {
                fn();
            }, 1200);
        }
    };

    app.exportHtml = function() {
        app.objManager.deselectAll();

        if(app.originalHtmlModified) {
            app.convertActObjsToReal();
            app.convertHotAreaToMap();
            app.convertHyperlink(false);
            var flowContent = app.kendoEditor.value();
            var absoContent = $("#design-panel>#abso-container").html();
            app.convertHyperlink(true);
            app.convertMapToHotArea();
            app.convertRealObjsToAct();

            if(app.originalHtmlTempl != null) {
                var str = app.originalHtmlTempl;
                str = str.replace('%%_flow_content_%%', '\n  '+flowContent+'\n');
                str = str.replace('%%_abso_content_%%', '\n  '+absoContent+'\n');
                str = str.replace('%%_title_content_%%', app.title);
                console.dir("export modified html");
                return str;
            }
            else {
                console.dir("export modified html, but no content");
                return '<!DOCTYPE html>\n' +
                    '<html>\n' +
                    '<head>\n' +
                    '  <title>Wysiwyg Title</title>\n' +
                    '  <meta charset="utf-8">\n' +
                    '</head>\n' +
                    '<body>\n' +
                    '</body>\n' +
                    '</html>';
            }
        }
        else {
            console.dir("export original html");
            return app.originalHtml;
        }
    };

    app.title = "";
    //called by Editor
    app.SetTitle = function(str) {
        app.title = str;
        app.onDesignChange();
    };

    //called by Editor
    app.Save = function() {
        var bFromEditor = true;
        EditorProxy.SetHtml(app.exportHtml(), bFromEditor);
    };

    app.zoomDesign = function(zoomstr) {
        $(app.kendoEditor.element[0]).css('zoom', zoomstr);
    };

    app.ImgActAs = (function (my) {
        my.Initialize = function() {
            var assistHtml = '<div id="_imgactas_div_" style="display: none">'+
                '<div id="qrcode"></div>'+
                '<div id="barcode"></div>'+
                '<svg id="audio-svg" xmlns="http://www.w3.org/2000/svg" width="160" height="30">'+
                '<foreignObject width="100%" height="100%">'+
                '<audio id="audio" controls="controls" style="padding: 0px; margin: 0px; width: 160px; height: 30px;"></audio>'+
                '</foreignObject>'+
                '</svg>'+
                '<svg id="video-svg" xmlns="http://www.w3.org/2000/svg" width="160" height="100">'+
                '<foreignObject width="100%" height="100%">'+
                '<video id="video" width="160" height="100" controls="controls" style="padding: 0px; margin: 0px;"></video>'+
                '</foreignObject>'+
                '</svg>'+
                '</div>';
            $("body").append(assistHtml);
        }
        my.ActAsQRCode = function($img) {
            var value = $img.attr("_roleas_arg_value");
            var errorCorrection = $img.attr("_roleas_arg_errorCorrection");
            var encoding = $img.attr("_roleas_arg_encoding");
            var size = $img.attr("_roleas_arg_size");
            var color = $img.attr("_roleas_arg_color");
            var bkgcolor = $img.attr("_roleas_arg_bkg_color");
            var border_color = $img.attr("_roleas_arg_border_color");
            var border_width = $img.attr("_roleas_arg_border_width");
            var imgData = my.QRCode2ImgData(value, errorCorrection, encoding, size, color, bkgcolor, border_color, border_width);
            $img.attr('src', imgData);
        };

        my.QRCode2ImgData = function(value, errorCorrection, encoding, size, color, bkgcolor, border_color, border_width) {
            var $qrcode = $("#_imgactas_div_>#qrcode");
            if(!$qrcode.data("kendoQRCode")) {
                $qrcode.kendoQRCode({
                    value: value,
                    errorCorrection: errorCorrection,
                    encoding: encoding,
                    background: bkgcolor,
                    size: parseInt(size),
                    color: color,
                    border: {
                        color: border_color,
                        width: parseInt(border_width)
                    }
                });
            }
            else {
                $qrcode.data("kendoQRCode").setOptions({
                    value: value,
                    errorCorrection: errorCorrection,
                    encoding: encoding,
                    background: bkgcolor,
                    size: parseInt(size),
                    color: color,
                    border: {
                        color: border_color,
                        width: parseInt(border_width)
                    }
                });
            }
            var imgData = $qrcode.find("canvas").get(0).toDataURL("image/png");
            return imgData;
        };

        my.ActAsBarcode = function($img) {
            var value = $img.attr("_roleas_arg_value");
            var encoding = $img.attr("_roleas_arg_encoding");
            var showtext = $img.attr("_roleas_arg_showtext");
            var width = $img.css('width');
            var height = $img.css('height');
            var imgData = my.BarCode2ImgData(value, encoding, showtext, width, height);
            $img.attr('src', imgData);
        };

        my.BarCode2ImgData = function(value, encoding, showtext, width, height) {
            var $barcode = $("#_imgactas_div_>#barcode");
            if(!$barcode.data("kendoBarcode")) {
                $barcode.css({width:width, height:height});
                $barcode.kendoBarcode({
                    value: value,
                    type: encoding,
                    text: {
                        visible: eval(showtext)
                    }
                });
            }
            else {
                $barcode.data("kendoBarcode").setOptions({
                    value: value,
                    type: encoding,
                    width: parseInt(width),
                    height: parseInt(height),
                    text: {
                        visible: eval(showtext)
                    }
                });
                //$barcode.css({width:width, height:height});
                //$barcode.data("kendoBarcode").resize();
            }
            var imgData = $barcode.find("canvas").get(0).toDataURL("image/png");
            return imgData;
        };

        my.ActAsAudio = function($img) {
            $("#_imgactas_div_>#audio-svg").css("width", $img.css("width"));
            $("#_imgactas_div_>#audio-svg").css("height", $img.css("height"));
            $("#_imgactas_div_>#audio-svg").find("#audio").css("width", $img.css("width"));
            $("#_imgactas_div_>#audio-svg").find("#audio").css("height", $img.css("height"));
            $img.attr('src', $("#_imgactas_div_>#audio-svg").get(0).toDataURL());
        };

        my.ConvertActAsAudio2Real = function($img) {
            var templ = '<audio (%%controls%%) style="padding: 0px; margin: 0px; width: (%%width%%); height: (%%height%%);(%%position%%)" src=(%%src%%)></audio>';
            var str = templ;
            if(typeof($img.attr("_roleas_arg_controls")) != "undefined") {
                str = templ.replace("(%%controls%%)", 'controls="controls"');
            }
            else {
                str = templ.replace("(%%controls%%)", "");
            }
            str = str.replace("(%%src%%)", $img.attr("_roleas_arg_src"));
            str = str.replace("(%%width%%)", $img.css("width"));
            str = str.replace("(%%height%%)", $img.css("height"));
            if($img.css("position").toLowerCase() == "absolute") {
                str = str.replace("(%%position%%)", "position:absolute; left:"+$img.css("left")+";top:"+$img.css("top"));
            }
            else {
                str = str.replace("(%%position%%)", "");
            }
            return str;
        };
        my.ConvertRealAudio2ActAs = function($audio) {
            var templ = '<img style="width:(%%width%%);height:(%%height%%);min-width:160px;min-height:30px;max-height:30px;(%%position%%)"'+
                '_roleas_="audio" _roleas_arg_src="(%%src%%)" (%%controls%%)></img>';
            var str = templ;
            if(typeof($audio.attr("controls")) != "undefined") {
                str = str.replace("(%%controls%%)", '_roleas_arg_controls="controls"');
            }
            else {
                str = str.replace("(%%controls%%)", "");
            }
            str = str.replace("(%%src%%)", $audio.attr("src"));
            str = str.replace("(%%width%%)", $audio.css("width"));
            str = str.replace("(%%height%%)", $audio.css("height"));
            if($audio.css("position").toLowerCase() == "absolute") {
                str = str.replace("(%%position%%)", "position:absolute; left:"+$audio.css("left")+";top:"+$audio.css("top"));
            }
            else {
                str = str.replace("(%%position%%)", "");
            }
            return str;
        };

        my.ActAsVideo = function($img) {
            $("#_imgactas_div_>#video-svg").css("width", $img.css("width"));
            $("#_imgactas_div_>#video-svg").css("height", $img.css("height"));
            $("#_imgactas_div_>#video-svg").find("#video").attr("width", parseInt($img.css("width")));
            $("#_imgactas_div_>#video-svg").find("#video").attr("height", parseInt($img.css("height")));
            $img.attr('src', $("#_imgactas_div_>#video-svg").get(0).toDataURL());
        };

        my.ConvertActAsVideo2Real = function($img) {
            var templ = '<video (%%controls%%) width="(%%width%%)" height="(%%height%%)" style="padding: 0px; margin: 0px;(%%position%%);border:1px solid #e9f3f8;" src=(%%src%%)></video>';
            var str = templ;
            if(typeof($img.attr("_roleas_arg_controls")) != "undefined") {
                str = templ.replace("(%%controls%%)", 'controls="controls"');
            }
            else {
                str = templ.replace("(%%controls%%)", "");
            }
            str = str.replace("(%%src%%)", $img.attr("_roleas_arg_src"));
            str = str.replace("(%%width%%)", parseInt($img.css("width")));
            str = str.replace("(%%height%%)", parseInt($img.css("height")));
            if($img.css("position").toLowerCase() == "absolute") {
                str = str.replace("(%%position%%)", "position:absolute; left:"+$img.css("left")+";top:"+$img.css("top"));
            }
            else {
                str = str.replace("(%%position%%)", "");
            }
            return str;
        };
        my.ConvertRealVideo2ActAs = function($video) {
            var templ = '<img style="width:(%%width%%);height:(%%height%%);min-width:160px;min-height:100px;(%%position%%);border:1px solid #e9f3f8;"'+
                '_roleas_="video" _roleas_arg_src="(%%src%%)" (%%controls%%)></img>';
            var str = templ;
            if(typeof($video.attr("controls")) != "undefined") {
                str = str.replace("(%%controls%%)", '_roleas_arg_controls="controls"');
            }
            else {
                str = str.replace("(%%controls%%)", "");
            }
            str = str.replace("(%%src%%)", $video.attr("src"));
            str = str.replace("(%%width%%)", $video.css("width"));
            str = str.replace("(%%height%%)", $video.css("height"));
            if($video.css("position").toLowerCase() == "absolute") {
                str = str.replace("(%%position%%)", "position:absolute; left:"+$video.css("left")+";top:"+$video.css("top"));
            }
            else {
                str = str.replace("(%%position%%)", "");
            }
            return str;
        };

        return my;
    } (app.ImgActAs || {}));

    app.convertActObjsToReal = function() {
        $("#default-editor").find("img[_roleas_=audio]").each( function(index){
            var str = app.ImgActAs.ConvertActAsAudio2Real($(this));
            $(this).before(str);
            $(this).remove();
        });
        $("#default-editor").find("img[_roleas_=video]").each( function(index){
            var str = app.ImgActAs.ConvertActAsVideo2Real($(this));
            $(this).before(str);
            $(this).remove();
        });
    };

    app.convertRealObjsToAct = function() {
        $("#default-editor").find("audio").each( function(index){
            var str = app.ImgActAs.ConvertRealAudio2ActAs($(this));
            $(this).before(str);
            app.ImgActAs.ActAsAudio($(this).prev());
            $(this).remove();
        });
        $("#default-editor").find("video").each( function(index){
            var str = app.ImgActAs.ConvertRealVideo2ActAs($(this));
            $(this).before(str);
            app.ImgActAs.ActAsVideo($(this).prev());
            $(this).remove();
        });
    };

    app.convertHotAreaToMap = function() {
        var hotarea2map = function($hotarea) {
            //find hot area owner
            var $owner = $("#default-editor").find("img[hotareas *="+$hotarea.attr("id")+"]");
            var name = $owner.attr("usemap");
            if(typeof name === "undefined") {
                name = app.Utility.generateUID(true);
                $owner.attr("usemap", "#"+name);

                $("#design-panel>#abso-container").append('<map name="'+ name + '"></map>');
            }
            else {
                name = name.substring(1, name.length);
            }

            var $map = $("#design-panel>#abso-container").find("map[name=" + name + "]");
            var shape, coords, href, alt;
            if($hotarea.hasClass("rect")) {
                shape = "rect";
                var x1 = parseFloat($hotarea.attr("offsetx"));
                var y1 = parseFloat($hotarea.attr("offsety"));
                var x2 = x1 + parseFloat($hotarea.css("width"));
                var y2 = y1 + parseFloat($hotarea.css("height"));
                coords = x1 + "," + y1 + "," + x2 + "," + y2;
                href = $hotarea.attr("href");
                alt = $hotarea.attr("alt");
            }
            else {
                shape = "circle";
                var w = parseFloat($hotarea.css("width"));
                var h = parseFloat($hotarea.css("height"));
                var centerx = parseFloat($hotarea.attr("offsetx")) + w/2;
                var centery = parseFloat($hotarea.attr("offsety")) + h/2;
                var radius = w/2;
                coords = centerx + "," + centery + "," + radius;
                href = $hotarea.attr("href");
                alt = $hotarea.attr("alt");
            }
            $map.append('<area shape="' + shape + '" coords="' + coords + '" href="' + href + '" alt="' + alt + '" id="' + $hotarea.attr("id") + '" />');
        };

        console.dir("convertHotAreaToMap ...");
        $("#design-panel>#abso-container").find(".hotarea").each(function(index) {
            console.dir("img: "+this.outerHTML);
            hotarea2map($(this));
            $(this).remove();
        });
        console.dir("result: " + $("#design-panel>#abso-container").html());
    };

    app.convertMapToHotArea = function() {
        var map2hotarea = function($map) {
            //find map owner
            var $owner = $("#default-editor").find("img[usemap *=#"+$map.attr("name")+"]");
            if($owner.length !== 1) {
                console.dir("cannot find owner with map: " + $map.get(0).outerHTML); //maybe owner object have been delete
                return;
            }

            var hotareas = null;
            $map.find("area").each(function(index) {
                var shape, coords, href, alt;
                shape = $(this).attr("shape");
                coords = $(this).attr("coords");
                href = $(this).attr("href");
                alt = $(this).attr("alt");

                var adjustForBorder = 1; //consider editor border

                var offsetx, offsety, left=-1000, top=-1000, width, height, cls, borderradius;
                if(shape === "rect") {
                    cls = "rect";
                    borderradius = "";

                    var items = coords.split(",");
                    offsetx = parseFloat(items[0]);
                    offsety = parseFloat(items[1]);
                    width = parseFloat(items[2]) - offsetx;
                    height = parseFloat(items[3]) - offsety;
                    /*
                    if($owner.css("position") === "absolute") {
                        //left = offsetx + parseFloat($owner.css("left"));
                        //top = offsety + parseFloat($owner.css("top")) + parseFloat($("#top-pane>#toolbar").css("height"));
                        left = offsetx + $owner.offset().left - adjustForBorder;
                        top = offsety + $owner.offset().top - adjustForBorder;
                    }
                    else {
                        left = offsetx + $owner.offset().left - adjustForBorder;
                        top = offsety + $owner.offset().top - adjustForBorder;
                    }
                    */
                }
                else {
                    cls = "circle";
                    borderradius = 'border-radius:59px;'
                    var items = coords.split(",");
                    var centerx = parseFloat(items[0]);
                    var centery = parseFloat(items[1]);
                    var radius = parseFloat(items[2]);

                    offsetx = centerx - radius;
                    offsety = centery - radius;
                    /*
                    if($owner.css("position") === "absolute") {
                        //left = offsetx + parseFloat($owner.css("left"));
                        //top = offsety + parseFloat($owner.css("top")) + parseFloat($("#top-pane>#toolbar").css("height"));
                        left = offsetx + $owner.offset().left - adjustForBorder;
                        top = offsety + $owner.offset().top - adjustForBorder;
                        width = radius * 2;
                        height = radius * 2;
                    }
                    else {
                        left = offsetx + $owner.offset().left - adjustForBorder;
                        top = offsety + $owner.offset().top - adjustForBorder;
                        width = radius * 2;
                        height = radius * 2;
                    }*/
                    width = radius * 2;
                    height = radius * 2;
                }

                var uid = $(this).attr("id");
                if(typeof uid === "undefined") {
                    uid = app.Utility.generateUID(true);
                }
                if(!hotareas) {
                    hotareas = uid;
                }
                else {
                    hotareas += ";" + uid;
                }
                $("#design-panel>#abso-container").append(
                    '<div id="' + uid + '" class="hotarea '+cls + '" href="'+href + '" alt="'+alt
                        + '" offsetx='+offsetx + ' offsety='+offsety
                        + ' style="position:absolute;background-color:green;opacity:0.4;left:'
                        +left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px;'+borderradius+'"></div>');
            });
            $owner.attr("hotareas", hotareas);
            $owner.removeAttr("usemap");

            app.objManager.adjustHotAreaPosWithOwner($owner);
        };

        console.dir("convertMapToHotArea ...");
        $("#design-panel>#abso-container").find("map").each(function(index) {
            console.dir("map: "+this.outerHTML);
            map2hotarea($(this));
            $(this).remove();
        });
        console.dir("result: " + $("#design-panel>#abso-container").html());
    };

    app.convertHyperlink = function(isImportHtml) {
        if(isImportHtml) {
            var fn = function($obj, openInNewWindow) {
                if($obj.is("label") || $obj.is("input") || $obj.is("img")) {
                    var t = $obj.attr("onclick");
                    $obj.removeAttr("onclick");
                    if(openInNewWindow) {
                        $obj.attr("target", "_blank");
                        var p1 = t.indexOf("(");
                        var p2 = t.lastIndexOf(")");
                        t = t.substring(p1+1, p2);
                        t = "location.href=" + t;
                    }
                    else {
                        $obj.removeAttr("target");
                    }
                    $obj.attr("__onclick__", t);
                }
            };
            $("#default-editor").find("*[onclick*='location.href']").each( function(){
                fn($(this), false);
            });
            $("#default-editor").find("*[onclick*='window.open']").each( function(){
                fn($(this), true);
            });
        }
        else { //export html
            var fn = function($obj) {
                if($obj.is("label") || $obj.is("input") || $obj.is("img")) {
                    var t = $obj.attr("__onclick__");
                    $obj.removeAttr("__onclick__");
                    if($obj.attr("target") === "_blank") {
                        if(t.indexOf("window.open") < 0) {
                            t = t.replace("location.href", "window.open(");
                            t += ")";
                            t = t.replace("=", "");
                        }
                    }
                    $obj.attr("onclick", t);
                }
            };
            $("#default-editor").find("*[__onclick__]").each( function(){
                fn($(this), false);
            });
        }
    };


    app.Utility = (function (my) {
        my.generateUID = function(guid) {
            if(guid === true) {
                var guid = ""; //"{";
                for   (var   i   =   1;   i   <=   32;   i++)
                {
                    var   n   =   Math.floor(Math.random() * 16.0).toString(16);
                    guid   +=   n;
                    if   ((i   ==   8)   ||   (i   ==   12)   ||   (i   ==   16)   ||   (i   ==   20))
                        guid   +=   "-";
                }
                //guid   +=   "}";
                return guid;
            }
            else {
                var d = new Date();
                var uid = d.getYear() + "_" + d.getMonth() + "_" + d.getDay() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds();
                return uid;
            }
        };

        //html -> htmlx, head -> headx, body -> bodyx
        my.preprocessHtmlForjQuery = function(html, isTojQuery) {
            var html = html;
            if(isTojQuery) {
                html = html.replace(new RegExp("<[hH][tT][mM][lL][]*"), '<htmlx id="_real_html_"');
                html = html.replace(new RegExp("</[hH][tT][mM][lL][]*>"), "</htmlx>");

                html = html.replace(new RegExp("<[hH][eE][aA][dD][]*"), '<headx id="_real_head_"');
                html = html.replace(new RegExp("</[hH][eE][aA][dD][]*>"), "</headx>");

                html = html.replace(new RegExp("<[bB][oO][dD][yY][]*"), '<bodyx id="_real_body_"');
                html = html.replace(new RegExp("</[bB][oO][dD][yY][]*>"), "</bodyx>");
            }
            else {
                html = html.replace(new RegExp("<[hH][tT][mM][lL][xX][]*"), "<html");
                html = html.replace(new RegExp("</[hH][tT][mM][lL][xX][]*>"), "</html>");

                html = html.replace(new RegExp("<[hH][eE][aA][dD][xX][]*"), "<head");
                html = html.replace(new RegExp("</[hH][eE][aA][dD][xX][]*>"), "</head>");

                html = html.replace(new RegExp("<[bB][oO][dD][yY][xX][]*"), "<body");
                html = html.replace(new RegExp("</[bB][oO][dD][yY][xX][]*>"), "</body>");

                html = html.replace(' id="_real_html_"', "");
                html = html.replace(' id="_real_head_"', "");
                html = html.replace(' id="_real_body_"', "");
            }
            return html;
            /*
            var results = "";
            HTMLParser(html, {
                start: function( tag, attrs, unary ) {
                    if(isTojQuery) {
                        if(tag.toLowerCase() === "html") {
                            results += '<htmlx id="_real_html_"' + tag;
                        }
                        else if(tag.toLowerCase() === "head") {
                            results += '<headx id="_real_head_"' + tag;
                        }
                        else if(tag.toLowerCase() === "body") {
                            results += '<bodyx id="_real_body_"' + tag;
                        }
                        else {
                            results += "<" + tag;
                        }
                    }
                    else {
                        if(tag.toLowerCase() === "htmlx") {
                            tag = "html";
                        }
                        else if(tag.toLowerCase() === "headx") {
                            tag = "head";
                        }
                        else if(tag.toLowerCase() === "bodyx") {
                            tag = "head";
                        }
                        results += "<" + tag;
                    }

                    for ( var i = 0; i < attrs.length; i++ )
                        results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';

                    results += (unary ? "/" : "") + ">";
                },
                end: function( tag ) {
                    if(isTojQuery) {
                        if(tag.toLowerCase() === "html") {
                            tag = "htmlx";
                        }
                        else if(tag.toLowerCase() === "head") {
                            tag = "headx";
                        }
                        else if(tag.toLowerCase() === "body") {
                            tag = "bodyx";
                        }
                    }
                    else {
                        if(tag.toLowerCase() === "htmlx") {
                            tag = "html";
                        }
                        else if(tag.toLowerCase() === "headx") {
                            tag = "head";
                        }
                        else if(tag.toLowerCase() === "bodyx") {
                            tag = "body";
                        }
                    }

                    results += "</" + tag + ">";
                },
                chars: function( text ) {
                    results += text;
                },
                comment: function( text ) {
                    results += "<!--" + text + "-->";
                }
            });

            return results;
            */
        };

        my.expreplace = function(str, regBegin, regEnd, replacewith) {
            var replace;

            var p1 = str.match(regBegin);
            var p2 = str.match(regEnd);
            if(p1 && p1.length > 0 && p1.index != -1 && p2 && p2.length > 0 && p2.index != -1) {
                var b = p1.index + p1[0].length;
                replace = str.substr(b, p2.index-b);
                var left = str.substring(0, b);
                var right = str.substring(p2.index);
                str = left + replacewith + right;
            }
            return {replace: replace, ret: str};
        };

        my.kendoInput = function($obj) {
            $obj.css({outline:0, color:'#515967', 'border-radius':'4px', 'border-color':'#dbdbde',
                'border-style':'solid', 'border-width':'1px', height:'2.13em', 'text-indent':'.33em',
                padding:'2px .3em', 'line-height':'1.6em', 'vertical-align':'middle'});
            $obj.bind('focusin', function(e) {
                $(this).css('border-color', '#ababae');
            }).bind('focusout', function(e) {
                $(this).css('border-color', '#dbdbde');
            }).bind('mouseover', function(e) {
                $(this).css('border-color', '#ababae');
            }).bind('mouseleave', function(e) {
                if(false == $(this).is(":focus")) {
                    $(this).css('border-color', '#dbdbde');
                }
            });
        };
        return my;
    } (app.Utility || {}));
    
    window.WysiwygApp = app;
    return app;
} (WysiwygApp || {}));