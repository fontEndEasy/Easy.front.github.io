var WysiwygApp = (function (app) {
    app.initObjManager = function(gKendoEditor) {
        app.objManager = (function (my, gKendoEditor) {
            my.handleEvent = function(type, $target, event, arg1, arg2) {
                var ret;
                var onClick, onDblClick, onKeyDown, onPaste, onCopy,
                    onCut, onDelete, onMoveToFront, onMoveToBack,
                    onLeftAlign, onTopAlign, onRightAlign, onBottomAlign,
                    onCenterAlign, onVCenterAlign, onResize;

                var eventhandler = {
                    "click": onClick,
                    "dblclick": onDblClick,
                    "keydown": onKeyDown,
                    "paste": onPaste,
                    "copy": onCopy,
                    "cut": onCut,
                    "delete": onDelete,
                    "movetofront": onMoveToFront,
                    "movetoback": onMoveToBack,
                    "leftalign": onLeftAlign,
                    "rightalign": onRightAlign,
                    "topalign": onTopAlign,
                    "bottomalign": onBottomAlign,
                    "centeralign": onCenterAlign,
                    "vcenteralign": onVCenterAlign,
                    "resize": onResize
                };

                eventhandler["click"] = onClick = function($target, event) {
                    var $obj = $target;
                    var ctrltype = my.recognizeObjType($obj);
                    if(ctrltype === "BTNCTRL") {
                        if($obj.attr('id') === '__btn__overlap__') {
                            my.doSelect($obj.next('input'), event.ctrlKey);
                        }
                        else {
                            my.doSelect($obj, event.ctrlKey);
                        }
                        return false;
                    }
                    else if(ctrltype === "IMGCTRL" || ctrltype === "LABELCTRL" || ctrltype === "AUDIOCTRL" || ctrltype === "VIDEOCTRL"
                        || ctrltype === "QRCODECTRL" || ctrltype === "BARCODECTRL") {
                        my.doSelect($obj, event.ctrlKey);
                        return false;
                    }
                    else {
                        my.deselectAll();
                        my.deselectAllHotArea();
                        return true;
                    }
                };

                eventhandler["dblclick"] = onDblClick = function($target, event) {
                    var $obj = $target;
                    var ctrltype = my.recognizeObjType($obj);

                    if(ctrltype === "BTNCTRL") {
                        var $i = $obj.next('input');
                        my.deselectAll();
                        if($obj.attr('id') == '__btn__overlap__') {
                            $obj = $i;
                            my.doSelect($obj);
                        }
                        else {
                            my.doSelect($obj);
                        }
                    }
                    else if(ctrltype == "IMGCTRL" || ctrltype == "LABELCTRL"
                        || ctrltype == "AUDIOCTRL" || ctrltype == "VIDEOCTRL"
                        || ctrltype == "QRCODECTRL" || ctrltype == "BARCODECTRL") {
                        my.deselectAll();
                        my.doSelect($obj);
                    }
                    else {
                        my.deselectAll();
                    }

                    my.edittingObj = $obj;
                    if( ctrltype == "IMGCTRL" ) {
                        var res = eval('(' + EditorProxy.GetResourcesJsonString("png|jpg|jpeg") + ')'); //JSON.parse( EditorProxy.GetResourcesJsonString() );
                        var data = { data: res };
                        app._resourceSelectionWindow._treeView.setDataSource(new kendo.data.HierarchicalDataSource(data));
                        app._resourceSelectionWindow.$url.val($obj.attr("src"));
                        app._resourceSelectionWindow.open();
                    }else if( ctrltype == "AUDIOCTRL" ) {
                        var res = eval('(' + EditorProxy.GetResourcesJsonString("wav|mp3") + ')'); //JSON.parse( EditorProxy.GetResourcesJsonString() );
                        var data = { data: res };
                        app._resourceSelectionWindow._treeView.setDataSource(new kendo.data.HierarchicalDataSource(data));
                        app._resourceSelectionWindow.$url.val($obj.attr("_roleas_arg_src"));
                        app._resourceSelectionWindow.open();
                    }else if( ctrltype == "VIDEOCTRL" ){
                        var res = eval('(' + EditorProxy.GetResourcesJsonString("mp4") + ')'); //JSON.parse( EditorProxy.GetResourcesJsonString() );
                        var data = { data: res };
                        app._resourceSelectionWindow._treeView.setDataSource(new kendo.data.HierarchicalDataSource(data));
                        app._resourceSelectionWindow.$url.val($obj.attr("_roleas_arg_src"));
                        app._resourceSelectionWindow.open();
                    }else if( ctrltype == "BTNCTRL") {
                        app._commonEditorWindow.$val.val($obj.val());
                        app._commonEditorWindow.open();
                    }
                    else if( ctrltype == "LABELCTRL") {
                        app._commonEditorWindow.$val.val($obj.text());
                        app._commonEditorWindow.open();
                    }
                    else if( ctrltype == "QRCODECTRL" ) {
                        app._commonEditorWindow.$val.val($obj.attr("_roleas_arg_value"));
                        app._commonEditorWindow.open();
                    }else if( ctrltype == "BARCODECTRL" ) {
                        app._commonEditorWindow.$val.val($obj.attr("_roleas_arg_value"));
                        app._commonEditorWindow.open();
                    }

                    return false;
                };

                eventhandler["keydown"] = onKeyDown = function($target, event) {
                    if(event.ctrlKey) {
                        if(event.keyCode == 67) { //ctrl + c
                            ClipboardData.setData("text", my.getSelectedHtml());
                        }
                        else if(event.keyCode == 88) { //ctrl + x
                            ClipboardData.setData("text", my.getSelectedHtml());
                            my.deleteSelected();
                        }
                        else if(event.keyCode == 86) { //ctrl + v
                            var data = ClipboardData.getData("text");
                            if(data != "") {
                                my.kendoEditor.paste(data);
                            }
                        }
                    }
                    else if(event.keyCode == 46) { //delete
                        my.deleteSelected();
                    }
                    else if(event.keyCode == 37 //left
                        || event.keyCode == 39  //right
                        || event.keyCode == 38  //up
                        || event.keyCode == 40  //down
                        )
                    {
                        var asAbsolute = (my.selectedStatistic().abso > 0);
                        for(var i = 0; i < my.getSelected().length; i++) {
                            var $obj = my.getSelected()[i];
                            if($obj.css("position")  == "absolute") {
                                if(!asAbsolute) {
                                    continue;
                                }
                                var wrapper = $obj.parent(".obj-wrapper");
                                var left = parseInt(wrapper.css("left"));
                                var top = parseInt(wrapper.css("top"));
                                var w = parseInt(wrapper.css("width"));
                                var h = parseInt(wrapper.css("height"));
                                var limitw = parseInt($("#default-editor").css("width"));
                                var limith = parseInt($("#default-editor").css("height"));

                                if(event.keyCode == 37) {
                                    left -= 1;
                                    if(left < 0)
                                        left = 0;
                                }
                                else if(event.keyCode == 39) {
                                    left += 1;
                                    if((left + w) > limitw) {
                                        left = limitw - w;
                                    }
                                }
                                else if(event.keyCode == 38) {
                                    top -= 1;
                                    if(top < 0)
                                        top = 0;
                                }
                                else {
                                    top += 1;

                                    if((top + h) > limith) {
                                        top = limith - h;
                                    }
                                }
                                wrapper.css({left: left+"px", top:top+"px"});
                                my.adjustHotAreaPosWithOwner($obj);
                            }
                            else {
                                if(asAbsolute) {
                                    continue;
                                }
                                var range = app.kendoEditor.createRange();
                                range.selectNodeContents($obj.get(0));
                                app.kendoEditor.selectRange(range);
                                my.deselectAll();
                                if(event.keyCode == 37) {
                                    //rangy.getSelection().move("character", 1);
                                    //rangy.getSelection().move("character", -1);
                                }
                                else if(event.keyCode == 39) {
                                    //rangy.getSelection().move("character", 0);
                                }
                            }
                        }
                    }
                    return true;
                };

                eventhandler["paste"] = onPaste = function($target, event) {
                    var html = event;
                    var str = '<div>' + html + '</div>';
                    var absoluteCtrlLength = $(str).find("*[style *=absolute]").length;
                    for(var i = 0; i < absoluteCtrlLength; i++) {
                        var obj = $("#default-editor").find("*[style *=absolute]").eq(0);
                        obj.remove();
                        $("#default-editor").append(obj);
                    }

                    var imgLength = $(str).find("img[droppedforhotarea != true]").length;
                    if(imgLength > 0) {
                        my.setDropableForHotArea();
                    }
                    return true;
                };

                eventhandler["copy"] = onCopy = function($target, event) {
                    if(my.getSelected().length > 0) {
                        ClipboardData.setData("text", my.getSelectedHtml());
                        return false;
                    }
                    return true;
                };

                eventhandler["cut"] = onCut = function($target, event) {
                    if(my.getSelected().length > 0) {
                        ClipboardData.setData("text", my.getSelectedHtml());
                        my.deleteSelected();
                        return false;
                    }
                    return true;
                };

                eventhandler["delete"] = onDelete = function($target, event) {
                    if(my.getSelected().length > 0) {
                        my.deleteSelected();
                        return false;
                    }
                    return true;
                };

                eventhandler["movetofront"] = onMoveToFront = function($target, event) {
                    for(var i = 0; i < my.getSelected().length; i++) {
                        app.objManager.movezIndex(my.getSelected()[i], 1);
                    }
                    return false;
                };

                eventhandler["movetoback"] = onMoveToBack = function($target, event) {
                    for(var i = 0; i < my.getSelected().length; i++) {
                        app.objManager.movezIndex(my.getSelected()[i], -1);
                    }
                    return false;
                };

                function align(left, top, right, bottom, centerx, centery) {
                    for(var i = 0; i < my.getSelected().length; i++) {
                        var $obj = my.getSelected()[i].parent();
                        if(left !== undefined) {
                            $obj.css("left", left + "px");
                        }
                        else if(top !== undefined) {
                            $obj.css("top", top + "px");
                        }
                        else if(right !== undefined) {
                            var l = right - parseInt($obj.css("width"));
                            $obj.css("left", l + "px");
                        }
                        else if(bottom !== undefined) {
                            var t = bottom - parseInt($obj.css("height"));
                            $obj.css("top", t + "px");
                        }
                        else if(centerx !== undefined) {
                            var x = centerx - parseInt($obj.css("width"))/2;
                            $obj.css("left", x + "px");
                        }
                        else if(centery !== undefined) {
                            var y = centery - parseInt($obj.css("height"))/2;
                            $obj.css("top", y + "px");
                        }
                    }
                }

                eventhandler["leftalign"] = onLeftAlign = function($target, event) {
                    var minx = 999999;
                    for(var i = 0; i < my.getSelected().length; i++) {
                        var $obj = my.getSelected()[i].parent();
                        var x = parseInt($obj.css("left"));
                        if(x < minx) {
                            minx = x;
                        }
                    }
                    align(minx);
                    return false;
                };

                eventhandler["topalign"] = onTopAlign = function($target, event) {
                    var miny = 999999;
                    for(var i = 0; i < my.getSelected().length; i++) {
                        var $obj = my.getSelected()[i].parent();
                        var y = parseInt($obj.css("top"));
                        if(y < miny) {
                            miny = y;
                        }
                    }
                    align(undefined, miny);
                    return false;
                };

                eventhandler["rightalign"] = onRightAlign = function($target, event) {
                    var maxx = -999999;
                    for(var i = 0; i < my.getSelected().length; i++) {
                        var $obj = my.getSelected()[i].parent();
                        var x = parseInt($obj.css("left")) + parseInt($obj.css("width"));
                        if(x > maxx) {
                            maxx = x;
                        }
                    }
                    align(undefined, undefined, maxx);
                    return false;
                };

                eventhandler["bottomalign"] = onBottomAlign = function($target, event) {
                    var maxy = -999999;
                    for(var i = 0; i < my.getSelected().length; i++) {
                        var $obj = my.getSelected()[i].parent();
                        var y = parseInt($obj.css("top")) + parseInt($obj.css("height"));
                        if(y > maxy) {
                            maxy = y;
                        }
                    }
                    align(undefined, undefined, undefined, maxy);
                    return false;
                };

                eventhandler["centeralign"] = onCenterAlign = function($target, event) {
                    var minx = 999999, maxx = -999999;
                    for(var i = 0; i < my.getSelected().length; i++) {
                        var $obj = my.getSelected()[i].parent();
                        var l = parseInt($obj.css("left"));
                        var w = parseInt($obj.css("width"));
                        if(l < minx) {
                            minx = l;
                        }
                        if((l+w) > maxx) {
                            maxx = (l+w);
                        }
                    }
                    var centerx = minx + (maxx-minx)/2;
                    align(undefined, undefined, undefined, undefined, centerx);
                    return false;
                };

                eventhandler["vcenteralign"] = onVCenterAlign = function($target, event) {
                    var miny = 999999, maxy = -999999;
                    for(var i = 0; i < my.getSelected().length; i++) {
                        var $obj = my.getSelected()[i].parent();
                        var t = parseInt($obj.css("top"));
                        var h = parseInt($obj.css("height"));
                        if(t < miny) {
                            miny = t;
                        }
                        if((t+h) > maxy) {
                            maxy = (t+h);
                        }
                    }
                    var centery = miny + (maxy-miny)/2;
                    align(undefined, undefined, undefined, undefined, undefined, centery);
                    return false;
                };

                eventhandler["resize"] = onResize = function($target, event, ui, fromPropertyPanel) {
                    var $obj = $target;
                    var ctrltype = my.recognizeObjType($obj);
                    var a = (ctrltype == "QRCODECTRL");
                    var b = (ctrltype == "BARCODECTRL");
                    var c = (ctrltype == "AUDIOCTRL");
                    var d = (ctrltype == "VIDEOCTRL");

                    if(a) {
                        $obj.attr("_roleas_arg_size", ui.size.width);
                        app.ImgActAs.ActAsQRCode($obj);
                        if(fromPropertyPanel === undefined || fromPropertyPanel === false) {
                            $("#property-container").find("#size").data("kendoNumericTextBox").value(ui.size.width);
                        }
                    }
                    else if(b) {
                        $obj.css({ width: ui.size.width+"px", height: ui.size.height+"px"});
                        app.ImgActAs.ActAsBarcode($obj);
                    }
                    else if(c) {
                        $obj.css({ width: ui.size.width+"px", height: ui.size.height+"px"});
                        app.ImgActAs.ActAsAudio($obj);
                    }
                    else if(d) {
                        $obj.css({ width: ui.size.width+"px", height: ui.size.height+"px"});
                        app.ImgActAs.ActAsVideo($obj);
                    }
                };

                return eventhandler[type]($target, event, arg1, arg2);
            };

            my.generateContextMenusWithSelected = function() {
                var stat = my.selectedStatistic();
                if(stat.abso > 0) {
                    if(stat.total > 1) {
                        return app.menuManager.getMenuItem(["copy", "cut", "paste", "delete", "movetofront", "movetoback",
                            "movetofront", "movetoback", "leftalign", "topalign", "rightalign", "bottomalign", "centeralign", "vcenteralign"]);
                    }
                    else {
                        return app.menuManager.getMenuItem(["copy", "cut", "paste", "delete", "movetofront", "movetoback"]);
                    }
                }
                else {
                    return app.menuManager.getMenuItem(["copy", "cut", "paste", "delete"]);
                }
            };

            // for create obj
            my.createObj = function(objtype, objmode, left, top) {
                var templ;
                if(objtype == "label-obj") {
                    templ = '<label id="newobj" contenteditable=false style="width: 72px; height: 18px; display: inline-block;" >label</label>';
                }
                else if(objtype == "button-obj") {
                    templ = '<input id="newobj" type="button" value="Button" style="width: 72px; height: 48px;" />';
                }
                else if(objtype == "img-obj") {
                    templ = '<img id="newobj" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/img1.JPG" last-src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/img1.JPG" style="width:auto;height:auto;"></img>';
                }
                else if(objtype == "audio-obj") {
                    templ = '<img id="newobj" style="width:160px;height:30px;min-width:160px;min-height:30px;max-height:30px;"'+
                        '_roleas_="audio" _roleas_arg_src="" _roleas_arg_controls=true></img>';
                }
                else if(objtype == "video-obj") {
                    templ = '<img id="newobj" style="width:320px;height:240px;min-width:160px;min-height:100px;border:1px solid #e9f3f8;"'+
                        '_roleas_="video" _roleas_arg_src="" _roleas_arg_controls=true></img>';
                }
                else if(objtype == "qrcode-obj") {
                    templ = '<img id="newobj" style="width:72px;height:72px;"'+
                        '_roleas_="qrcode" _roleas_arg_value="http://www.okzine.com"'+
                        '_roleas_arg_errorCorrection="M" _roleas_arg_encoding="ISO_8859_1" _roleas_arg_size="72px"'+
                        '_roleas_arg_color="#67a814" _roleas_arg_bkg_color="#ffffff" _roleas_arg_border_color="#67a814"'+
                        '_roleas_arg_border_width=5></img>';
                }
                else if(objtype == "barcode-obj") {
                    templ = '<img id="newobj" style="width:100px;height:72px;"'+
                        '_roleas_="barcode" _roleas_arg_value="okzine"'+
                        '_roleas_arg_encoding="Code128" _roleas_arg_showtext=true></img>';
                }

                var newobj;
                //gKendoEditor.exec("inserthtml", { value: templ });
                if(objmode == "Absolute") {
                    //$("#design-panel>#abso-container").append(templ);
                    //newobj = $("#design-panel>#abso-container").find('#newobj');
                    $(gKendoEditor.element[0]).append(templ);
                    newobj = $(gKendoEditor.element[0]).find('#newobj');
                }
                else {
                    gKendoEditor.paste(templ);
                    newobj = $(gKendoEditor.element[0]).find('#newobj');
                }

                newobj.removeAttr('id');
                newobj.css({'padding': '0px', 'margin': '0px'});

                if(objtype == "qrcode-obj") {
                    app.ImgActAs.ActAsQRCode(newobj);
                }
                else if(objtype == "barcode-obj") {
                    app.ImgActAs.ActAsBarcode(newobj);
                }
                else if(objtype == "audio-obj") {
                    app.ImgActAs.ActAsAudio(newobj);
                }
                else if(objtype == "video-obj") {
                    app.ImgActAs.ActAsVideo(newobj);
                }

                if(objmode == "Absolute") {
                    newobj.css({'left':left, 'top':top, 'position': 'absolute'});
                }

                //newobj.bind('contextmenu', app.menuManager.popMenuMethod);
                if(objtype == "img-obj") {
                    my.setImgDropableForHotArea(newobj);
                }

                //temporary fix bug: after drag a new audio/video and popup the editing window, but audio/video is not selected state
                //delay sync code to close editting window
                //app.onDesignChange(true);
                app.designChanged = true;
                //end

                return newobj;
            };

            my.deleteSelected = function() {
                for (var i = 0; i < my.mSelected.length; i++) {
                    var $obj = my.mSelected[i];
                    my.onDeselectObj($obj);
                    $obj.remove();
                }
                app.switchProperties($("#default-editor"));
                app.onDesignChange();
            };

            my.deleteObj = function($obj) {
                for (var i = 0; i < my.mSelected.length; i++) {
                    if (my.mSelected[i] === $obj) {
                        my.onDeselectObj(my.mSelected[i]);
                        my.mSelected.splice(i, 1);
                        break;
                    }
                }
                $obj.remove();
                app.switchProperties($("#default-editor"));
                app.onDesignChange();
            };

            my.recognizeObjType = function($obj) {
                if($obj.is('img') && typeof $obj.attr('_roleas_') == 'undefined') {
                    return "IMGCTRL";
                }
                else if($obj.is('label')) {
                    return "LABELCTRL";
                }
                else if($obj.is('input') && $obj.attr('type') == 'button'
                    || $obj.is('span') && $obj.attr('id') == '__btn__overlap__') {
                    return "BTNCTRL";
                }
                else if($obj.attr('_roleas_') == 'audio') {
                    return "AUDIOCTRL";
                }
                else if($obj.attr('_roleas_') == 'video') {
                    return "VIDEOCTRL";
                }
                else if($obj.attr('_roleas_') == 'qrcode') {
                    return "QRCODECTRL";
                }
                else if($obj.attr('_roleas_') == 'barcode') {
                    return "BARCODECTRL";
                }
                else if($obj.hasClass("hotarea")) {
                    return "HOTAREA";
                }
                else {
                    return "EDITOR";
                }
            };


            my.movezIndex = function($obj, add) {
                var zIndex = document.defaultView.getComputedStyle($obj.get(0), false)['zIndex'];
                var zIndex = parseInt(zIndex);
                if(isNaN(zIndex)) {
                    zIndex = 0;
                }
                zIndex += add;
                $obj.css({
                    "z-index": zIndex
                });
            };

            my.onClick = function(e) {
                my.doSelect($(e.target));
                app.menuManager.hideAll();
                return false;
            };

            my.doSelect = function($obj, multiSelect) {
                my.deselectAllHotArea();

                if(multiSelect === true) {
                    var exist = false;
                    for(var i = 0; i < my.mSelected.length; i++) {
                        if($obj === my.mSelected[i]) {
                            exist = true;
                            break;
                        }
                    }
                    if(!exist) {
                        my.mSelected.push($obj);
                        my.onSelectObj($obj);
                    }
                }
                else {
                    my.deselectAll();
                    my.mSelected.push($obj);
                    my.onSelectObj($obj);
                }

                if(my.mSelected.length === 1) {
                    //always show the first selected object's properties, reference IBM's maqetta
                    app.switchProperties($obj);
                }
            };

            // for obj states
            my.mSelected = [];
            my.getSelected = function() {
                return my.mSelected;
            };

            my.getSelectedHtml = function() {
                var str = "";
                for(var i = 0; i < my.mSelected.length; i++) {
                    str += my.mSelected[i].prop('outerHTML');
                }
                return str;
            };

            my.selectedStatistic = function() {
                var abso = 0, flow = 0;
                for(var i = 0; i < my.getSelected().length; i++) {
                    var $obj = my.getSelected()[i];
                    if($obj.css("position")  == "absolute") {
                        abso++;
                    }
                    else {
                        flow++;
                    }
                }
                return {abso: abso, flow: flow, total: my.getSelected().length};
            };

            my.onSelectObj = function($obj) {
                var ctrltype = my.recognizeObjType($obj);

                var offsetx, offsety;
                if(ctrltype == "IMGCTRL" || ctrltype == "LABELCTRL" || ctrltype == "AUDIOCTRL"
                    || ctrltype == "VIDEOCTRL" || ctrltype == "QRCODECTRL" || ctrltype == "BARCODECTRL") {
                    offsetx = 0; offsety = 0;
                }
                else {
                    offsetx = 2; offsety = 4;
                }
                var w = parseInt($obj.css('width'))+ offsetx +'px';
                var h = parseInt($obj.css('height'))+ offsety +'px';
                $obj.wrap('<div class="obj-wrapper" contenteditable="false" style="width: ' + w + ';height: ' + h + ';margin:0px;padding:0px;display:inline-block;position: relative"></div>');
                var $objwrapper = $obj.parent('div');

                //draggable and resizable
                var isQRCode = (ctrltype == "QRCODECTRL");
                var isBarcode = (ctrltype == "BARCODECTRL");
                var isAudio = (ctrltype == "AUDIOCTRL");
                var isVideo = (ctrltype == "VIDEOCTRL");
                if(isQRCode || isBarcode || isAudio || isVideo) {
                    var onObjWrapperResize = function( event, ui ) {
                        var $obj = $(event.target).find('img');
                        my.handleEvent("resize", $obj, event, ui, false);
                    };

                    if(isQRCode) {
                        $objwrapper.resizable({ alsoResize:$obj, resize: onObjWrapperResize,
                            aspectRatio: 1 / 1, minHeight: 52, minWidth: 52 }); //can resize by: se
                    }
                    else if(isBarcode) {
                        $objwrapper.resizable({ alsoResize:$obj, resize: onObjWrapperResize}); //can resize by: se
                    }
                    else if(isAudio) {
                        var minw = parseInt($obj.css("min-width"));
                        var minh = parseInt($obj.css("min-height"));
                        var maxh = parseInt($obj.css("max-height"));
                        $objwrapper.resizable({ alsoResize:$obj, resize: onObjWrapperResize,
                            minHeight: minh, minWidth: minw, maxHeight: maxh });
                    }
                    else if(isVideo) {
                        var minw = parseInt($obj.css("min-width"));
                        var minh = parseInt($obj.css("min-height"));
                        $objwrapper.resizable({ alsoResize:$obj, resize: onObjWrapperResize,
                            minHeight: minh, minWidth: minw });
                    }

                    $objwrapper.append('<div class="ui-resizable-n"></div><div class="ui-resizable-w"></div><div class="ui-resizable-ne"></div><div class="ui-resizable-sw"></div><div class="ui-resizable-nw"></div><div class="ui-resizable-s"></div><div class="ui-resizable-e"></div>').find('.ui-resizable-n, .ui-resizable-w, .ui-resizable-ne, .ui-resizable-sw, .ui-resizable-nw, .ui-resizable-s, .ui-resizable-e').css({
                        backgroundColor: 'rgba(26, 70, 245, 1)',
                        cursor: 'default',
                        position: 'absolute'
                    });

                    $objwrapper.find('.ui-resizable-se').css({
                        backgroundColor: 'rgba(26, 70, 245, 1)'
                    });

                    if ($obj.css('position') == 'absolute') {
                        $objwrapper.css({'left': $obj.css('left'), 'top': $obj.css('top'), 'position': 'absolute'})
                        $obj.css({'left': 0, 'top': 0});
                        $objwrapper.draggable({containment: "#default-editor"});
                    }
                }
                else {
                    if ($obj.css('position') == 'absolute') {
                        $objwrapper.resizable({ handles: 'n, e, s, w, ne, se, sw, nw', alsoResize:$obj });
                        $objwrapper.find('.ui-resizable-e, .ui-resizable-n, .ui-resizable-s, .ui-resizable-w, .ui-resizable-ne, .ui-resizable-se, .ui-resizable-sw, .ui-resizable-nw').css({
                            backgroundColor: 'rgba(26, 70, 245, 1)'
                        });

                        $objwrapper.css({'left': $obj.css('left'), 'top': $obj.css('top'), 'position': 'absolute'})
                        $obj.css({'left': 0, 'top': 0});

                        $objwrapper.draggable({drag:function() {
                            my.adjustHotAreaPosWithOwner($obj);
                        }, stop:function() {
                            my.adjustHotAreaPosWithOwner($obj);
                        }/*,containment: "#default-editor"*/});
                    }
                    else {
                        /*
                        if(ctrltype === "LABELCTRL") {
                            var w = parseInt($obj.css("width"));
                            var h = parseInt($obj.css("height"));
                            $objwrapper.resizable({ alsoResize:$obj, resize: onObjWrapperResize,
                                minWidth: w, maxWidth: w, minHeight: h, maxHeight: h});
                        }
                        else {
                            $objwrapper.resizable({ alsoResize:$obj }); //can resize by: s、e、se
                        }
                        */
                        $objwrapper.resizable({ alsoResize:$obj }); //can resize by: s、e、se
                        $objwrapper.append('<div class="ui-resizable-n"></div><div class="ui-resizable-w"></div><div class="ui-resizable-ne"></div><div class="ui-resizable-sw"></div><div class="ui-resizable-nw"></div>').find('.ui-resizable-n, .ui-resizable-w, .ui-resizable-ne, .ui-resizable-sw, .ui-resizable-nw').css({
                            backgroundColor: 'rgba(26, 70, 245, 1)',
                            cursor: 'default',
                            position: 'absolute'
                        });

                        $objwrapper.find('.ui-resizable-e, .ui-resizable-s, .ui-resizable-se').css({
                            backgroundColor: 'rgba(26, 70, 245, 1)'
                        });
                    }
                }

                $objwrapper.css({
                    "margin-left": $obj.css("margin-left"),
                    "margin-top": $obj.css("margin-top"),
                    "margin-right": $obj.css("margin-right"),
                    "margin-bottom": $obj.css("margin-bottom")
                });
                $obj.css({
                    "margin-left": "0px",
                    "margin-top": "0px",
                    "margin-right": "0px",
                    "margin-bottom": "0px"
                });

                if(ctrltype == "BTNCTRL") {
                    //fix bug: button cannot trigger dblclick
                    //$obj.before('<span id="__btn__overlap__" contenteditable="false" style="position:absolute;display:inline-block;width:100%;height:100%;z-index:1000;"></span>');
                    if($("body>#__btn__overlap__").length === 1) {
                        $obj.before($("body>#__btn__overlap__"));
                    }
                    else {
                        $obj.before('<span id="__btn__overlap__" contenteditable="false" style="position:absolute;display:inline-block;width:100%;height:100%;z-index:1000;"></span>');
                    }
                    //end fix bug
                }

                //fix bug: select img will select right text at the same time
                var range = app.kendoEditor.createRange();
                //range.selectNode($obj.get(0));
                app.kendoEditor.selectRange(range);
            };

            my.onDeselectObj = function($obj) {
                var $objwrapper = $obj.parent('div');

                if ($objwrapper.css('position') == 'absolute') {
                    //var oldx = $obj.css('left');
                    //var oldy = $obj.css('top');
                    var newx = $objwrapper.css('left');
                    var newy = $objwrapper.css('top');
                    $obj.css({'left': newx, 'top': newy});
                    //if(newx != oldx || newy != oldy) {
                        //app.onDesignChange();
                    //}
                }

                $obj.css({
                    "margin-left": $objwrapper.css("margin-left"),
                    "margin-top": $objwrapper.css("margin-top"),
                    "margin-right": $objwrapper.css("margin-right"),
                    "margin-bottom": $objwrapper.css("margin-bottom")
                });

                $objwrapper.find('.ui-resizable-e, .ui-resizable-n, .ui-resizable-s, .ui-resizable-w, .ui-resizable-ne, .ui-resizable-se, .ui-resizable-sw, .ui-resizable-nw').remove();
                //fix bug: button cannot trigger dblclick
                //$objwrapper.("#__btn__overlap__").remove();
                $objwrapper.find("#__btn__overlap__").appendTo($("body"));
                //end fix bug
                $obj.unwrap();
            };

            my.deselectAll = function() {
                for(var i = 0; i < my.mSelected.length; i++) {
                    my.onDeselectObj(my.mSelected[i]);
                }
                //my.mSelected.splice(0, my.mSelected.length);
                my.mSelected = [];
            };

            my.setDropableForHotArea = function() {
                $("#default-editor").find("img[droppedforhotarea != true]").each(function(index) {
                    my.setImgDropableForHotArea($(this));
                });
            };

            my.setImgDropableForHotArea = function($img) {
                $img.droppable({
                    hoverClass: "ui-state-highlight",
                    accept: ".hotarea",
                    drop: function (event, ui) {
                        var objtype = ui.draggable.attr("id");
                        my.createHotArea($(this), objtype, ui.offset.left, ui.offset.top);
                    }
                });
            };
            my.hotAreaCount = 0;
            my.createHotArea = function($hostImg, objtype, left, top) {
                var templ;
                if(objtype == "recthotarea-obj") {
                    templ = '<div id="newobj" class="hotarea rect" href="" alt="" offsetx="" offsety="" style="position:absolute;background-color:green;opacity:0.4;width:48px;height:48px;"></div>';
                }
                else {
                    templ = '<div id="newobj" class="hotarea circle" href="" alt="" offsetx="" offsety="" style="position:absolute;background-color:green;opacity:0.4;width:48px;height:48px;border-radius:49px;"></div>';
                }
                $("#design-panel>#abso-container").append(templ);

                var hotarea = $("#design-panel>#abso-container").find('#newobj');
                hotarea.removeAttr('id');
                hotarea.css({'padding': '0px', 'margin': '0px'});

                var baseXY = $hostImg.offset();
                if(left < baseXY.left) {
                    left = baseXY.left;
                }
                if(top < baseXY.top) {
                    top = baseXY.top;
                }
                hotarea.offset({top:top, left:left});
                hotarea.attr("offsetX", left-baseXY.left);
                hotarea.attr("offsetY", top-baseXY.top);

                var uid = app.Utility.generateUID();
                var str = $hostImg.attr("hotareas");
                if(typeof str === "string") {
                    str += ";"+uid;
                }
                else {
                    str = uid;
                }
                $hostImg.attr("hotareas", str);
                hotarea.attr("id", uid);

                //hotarea.bind("click", function(e) {
                //    my.doSelectHotArea($(this));
                //});
                if(typeof my.bindClick === "undefined") {
                    my.bindClick = true;
                    $("#design-panel>#abso-container").bind("click", function(e) {
                        var $obj = $(event.target);
                        if($obj.hasClass("hotarea")) {
                            my.doSelectHotArea($obj);
                        }
                    }); $("body").bind("keydown", function(e) {
                        if(event.keyCode == 46) { //delete
                            if(my.getSelectedHotArea() !== null) {
                                my.deleteHotArea(my.getSelectedHotArea());
                            }
                        }
                    });
                }

                my.hotAreaCount++;
            };

            (function() {
                $("#design-panel>#abso-container").bind('dblclick', function(e) {
                    var $obj = $(e.target);
                    if($obj.hasClass("hotarea")) {
                        my.edittingObj = $obj;
                        app._commonEditorWindow.$val.val($obj.attr("href"));
                        app._commonEditorWindow.open();
                    }
                });
                $("body").bind("keydown", function(e) {
                    if(e.keyCode == 46) { //delete
                        if(my.getSelectedHotArea() !== null) {
                            my.deleteHotArea(my.getSelectedHotArea());
                        }
                    }
                });
            })();

            my.deleteHotArea = function($hotarea) {
                if($hotarea == my.mSelectedHotArea) {  //error: i don't know why "my.getSelected() == my.mSelected" is false
                    my.onDeselectHotArea(my.mSelectedHotArea);
                }

                var $owner = $("#default-editor").find("img[hotareas *="+$hotarea.attr("id")+"]");
                var hotareas = $owner.attr("hotareas").split(";");
                if(hotareas.length > 1) {
                    var id = $hotarea.attr("id");
                    var ret = "";
                    for(var i = 0; i < hotareas.length; i++) {
                        if(hotareas[i] === id) {
                            continue;
                        }

                        if(ret.length < 1) {
                            ret = hotareas[i];
                        }
                        else {
                            ret += ";" + hotareas[i];
                        }
                    }
                    $owner.attr("hotareas", ret);
                }
                else {
                    $owner.removeAttr("hotareas");
                }

                $hotarea.remove();
                app.switchProperties($("#default-editor"));
                app.onDesignChange();
            };
            my.adjustHotAreaPos = function() {
                $("#default-editor").find("*[hotareas]").each(function(index) {
                    my.adjustHotAreaPosWithOwner($(this));
                });
            };
            my.adjustHotAreaPosWithOwner = function($owner) {
                var baseXY = $owner.offset();
                var str = $owner.attr("hotareas");
                if(typeof str === "undefined") {
                    return;
                }
                var subs = str.split(";");
                for(var i = 0; i < subs.length; i++) {
                    var hotarea = $("#design-panel>#abso-container>#"+subs[i]);
                    if($owner.css("position") === "absolute") {
                        /*
                        var left = parseFloat($owner.css("left"));
                        var top = parseFloat($owner.css("top"));
                        var offsetX = parseFloat(hotarea.attr("offsetX"));
                        var offsetY = parseFloat(hotarea.attr("offsetY"));
                        hotarea.attr({left:left+offsetX, top:top+offsetY});
                        */
                        var offsetX = parseFloat(hotarea.attr("offsetX"));
                        var offsetY = parseFloat(hotarea.attr("offsetY"));
                        hotarea.offset({left: baseXY.left+offsetX, top: baseXY.top+offsetY});
                    }
                    else {
                        var offsetX = parseFloat(hotarea.attr("offsetX"));
                        var offsetY = parseFloat(hotarea.attr("offsetY"));
                        hotarea.offset({left: baseXY.left+offsetX, top: baseXY.top+offsetY});
                    }
                }
            };
            my.mSelectedHotArea = null;
            my.getSelectedHotArea = function() {
                return my.mSelectedHotArea;
            };
            my.doSelectHotArea = function($hotarea) {
                my.deselectAll();

                if(my.mSelectedHotArea) {
                    my.onDeselectHotArea(my.mSelectedHotArea);
                }
                my.mSelectedHotArea = $hotarea;
                my.onSelectHotArea($hotarea);
                app.switchProperties($hotarea);
            };
            my.onSelectHotArea = function($hotarea) {
                var w = parseFloat($hotarea.css('width')) + 'px';
                var h = parseFloat($hotarea.css('height'))+ 'px';
                $hotarea.wrap('<div class="hotarea-wrapper" style="width: ' + w + ';height: ' + h + ';margin:0px;padding:0px;position: absolute"></div>');
                var $wrapper = $hotarea.parent();

                //find hot area owner
                var $hostimg = $("#default-editor").find("img[hotareas *="+$hotarea.attr("id")+"]");

                var resizefn = function( event, ui ) {
                    var toolbarHeight = parseFloat($("#toolbar").css("height"));

                    var constrainLeft = (0 && $hostimg.css("position") === "absolute") ? parseFloat($hostimg.css("left")) : $hostimg.offset().left;
                    var constrainTop = (0 && $hostimg.css("position") === "absolute") ? (parseFloat($hostimg.css("top")) + toolbarHeight) : $hostimg.offset().top;
                    var constrainRight = constrainLeft + parseFloat($hostimg.css("width"));
                    var constrainBottom = constrainTop + parseFloat($hostimg.css("height"));

                    var left = $(this).offset().left; //parseFloat($(this).css("left"));
                    var top = $(this).offset().top; //parseFloat($(this).css("top"));
                    var width = parseFloat($(this).css("width"));
                    var height = parseFloat($(this).css("height"));

                    var adjust = false;
                    if(left < constrainLeft) {
                        left = constrainLeft;
                        adjust = true;
                        //console.dir("adjust left");
                    }
                    if(top < constrainTop) {
                        top = constrainTop;
                        adjust = true;
                        //console.dir("adjust top");
                    }
                    if((left + width) > constrainRight) {
                        width = constrainRight - left;
                        adjust = true;
                        //console.dir("adjust width");
                    }
                    if((top + height) > constrainBottom) {
                        height = constrainBottom - top;
                        adjust = true;
                        //console.dir("adjust height");
                    }

                    if(adjust === true){
                        var $hotarea = $(this).find(".hotarea");
                        if($hotarea.hasClass("circle")) {
                            if(width > height) {
                                width = height;
                            }
                            else {
                                height = width;
                            }
                        }
                        //$(this).css({left:left, top:top});
                        $(this).offset({left: left, top: top});
                        $(this).css({width: width, height: height});
                        //$(this).find("img").css({left:0, top:0, width: width, height: height});
                    }
                };
                var stopfn = function( event, ui ) {
                    var hotarea = $(this).find(".hotarea");
                    hotarea.css({left:0, top:0, width: $(this).css("width"), height: $(this).css("height")});

                    var left = hotarea.offset().left;
                    var top = hotarea.offset().top;
                    var baseXY = $hostimg.offset();
                    hotarea.attr("offsetX", left-baseXY.left);
                    hotarea.attr("offsetY", top-baseXY.top);
                };
                //draggable and resizable
                if($hotarea.hasClass("rect")) {
                    $wrapper.resizable({ handles: 'n, e, s, w, ne, se, sw, nw', /*alsoResize:$hotarea,*/ resize: resizefn, stop: stopfn});
                }
                else {
                    $wrapper.resizable({ handles: 'n, e, s, w, ne, se, sw, nw', aspectRatio: 1/1, resize: resizefn, stop: stopfn});
                }


                $wrapper.find('.ui-resizable-e, .ui-resizable-n, .ui-resizable-s, .ui-resizable-w, .ui-resizable-ne, .ui-resizable-se, .ui-resizable-sw, .ui-resizable-nw').css({
                    backgroundColor: 'rgba(26, 70, 245, 1)'
                });

                $wrapper.css({'left': $hotarea.css('left'), 'top': $hotarea.css('top'), 'position': 'absolute'})
                $hotarea.css({'left': 0, 'top': 0});

                if($hostimg.length > 0) {
                    $wrapper.draggable({containment: $hostimg, stop: function() {
                        var hotarea = $(this).find(".hotarea");
                        var left = hotarea.offset().left;
                        var top = hotarea.offset().top;
                        var baseXY = $hostimg.offset();
                        hotarea.attr("offsetX", left-baseXY.left);
                        hotarea.attr("offsetY", top-baseXY.top);
                    }});
                }
            };

            my.onDeselectHotArea = function($hotarea) {
                var $wrapper = $hotarea.parent();

                if ($wrapper.css('position') == 'absolute') {
                    var newx = $wrapper.css('left');
                    var newy = $wrapper.css('top');
                    $hotarea.css({'left': newx, 'top': newy});
                    //if(newx != oldx || newy != oldy) {
                    //app.onDesignChange();
                    //}
                }

                $wrapper.find('.ui-resizable-e, .ui-resizable-n, .ui-resizable-s, .ui-resizable-w, .ui-resizable-ne, .ui-resizable-se, .ui-resizable-sw, .ui-resizable-nw').remove();
                $hotarea.unwrap();
            };

            my.deselectAllHotArea = function() {
                if(my.mSelectedHotArea) {
                    my.onDeselectHotArea(my.mSelectedHotArea);
                }
                my.mSelectedHotArea = null;
            };

            return my;
        } (app.objManager || {}, gKendoEditor));
    };

    window.WysiwygApp = app;
    return app;
} (WysiwygApp || {}));
