
var WysiwygApp = (function (app) {
    app.InitializePopups = function() {
        app.initializeMenu();
        app.initializeCommonEditorWindow();
        app.initializeResourceSelectionWindow();
        //app.initializeHyperlinkWng();
    };

    app.initializeMenu = function() {
        $('body').append(
            '<div id="editor-menu">'+
                '<ul>'+
                '</ul>'+
            '</div>'+
            '<style scoped>'+
                '#editor-menu {'+
                    'position: absolute;'+
                    'width: 162px;'+
                    'height: auto;'+
                    'border: 1px solid #999;'+
                    'display: none;'+
                    'z-index: 99999;'+
                    'box-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);'+
                    '-webkit-box-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);'+
                    'background: #FFF;'+
                    'overflow: hidden;'+
                '}'+
                '#editor-menu ul { margin: 0; padding: 0; }'+
                '#editor-menu ul li {'+
                    'font-family: Microsoft yahei;'+
                    'height: 26px;'+
                    'list-style: none;'+
                    'line-height: 26px;'+
                    'font-size: 13px;'+
					'position: relative;'+
                    'background: rgb(255,255,255);'+
                '}'+
                '#editor-menu ul li img{'+
                    'margin-top: 6px;width:16;height:16;'+
                '}'+
                '#editor-menu ul li span{'+
                    'position: absolute;left: 30px;top:1px;'+
                    'left: 30px;'+
                '}'+
				'#editor-menu ul li label{'+
                    'position: absolute;'+
                    'right: 6px;'+
                    'top: 1px;'+
				'}'+
                '#editor-menu ul li div{'+
                    'display: inline-block;background-color: #EFEFEF;padding-left: 4px;width:20px;border-right: solid 1px #DEDBDB;'+
                '}'+
                '.disabledmenu{'+
                    'color:lightgray;'+
                    '-webkit-filter: grayscale(100%);Alpha(opacity=10);'+
                '}'+
            '<\/style>'
        );
        $("#editor-menu").bind('contextmenu', function(e) {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        app.menuManager = (function (my) {
            my.getMenuItem = function(ary) {
                var undo = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/undo.png" /></div><span>Undo</span><label>Ctrl+Z</label></li>';
                var redo = '<li style="border-bottom: 1px solid #ccc"><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/redo.png" /></div><span>Redo</span><label>Ctrl+Y</label></li>';
                var copy = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/copy.png" /></div><span>Copy</span><label>Ctrl+C</label></li>';
                var cut = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/cut.png" /></div><span>Cut</span><label>Ctrl+X</label></li>';
                var paste;
                if(ClipboardData.getData("text").length > 0) {
                    paste = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/paste.png" /></div><span>Paste</span><label>Ctrl+V</label></li>';
                }
                else {
                    paste = '<li class="disabledmenu"><div><img class="disabledmenu" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/paste.png" /></div><span>Paste</span><label>Ctrl+V</label></li>';
                }
                var del = '<li style="border-bottom: 1px solid #ccc"><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/delete.png" /></div><span>Delete</span></li>';
                var movetofront = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/cut.png" /></div><span>Move to front</span></li>';
                var movetoback = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/paste.png" /></div><span>Move to back</span></li>';
                var leftalign = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/cut.png" /></div><span>Align by left</span></li>';
                var topalign = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/paste.png" /></div><span>Align by top</span></li>';
                var rightalign = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/cut.png" /></div><span>Align by right</span></li>';
                var bottomalign = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/paste.png" /></div><span>Align by bottom</span></li>';
                var centeralign = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/cut.png" /></div><span>Align by center</span></li>';
                var vcenteralign = '<li><div><img src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/paste.png" /></div><span>Align by vcenter</span></li>';

                var t = {
                    "undo": undo, "redo": redo, "copy": copy, "cut": cut, "paste": paste, "delete": del,
                    "movetofront": movetofront, "movetoback": movetoback,
                    "leftalign": leftalign, "topalign": topalign,
                    "rightalign": rightalign, "bottomalign": bottomalign,
                    "centeralign": centeralign, "vcenteralign": vcenteralign
                };
                var ret = "";
                for(var i = 0; i < ary.length; i++) {
                    ret += t[ary[i]];
                }
                return ret;
            };

            my.generateMenuItems = function(selectedhtml) {
                if(app.objManager.getSelected().length > 0) {
                    return app.objManager.generateContextMenusWithSelected();
                }
                else {
                    if(typeof selectedhtml === "string" && selectedhtml.length > 0) {
                        return my.getMenuItem(["undo", "redo", "copy", "cut", "paste", "delete"]);
                    }
                    else {
                        return my.getMenuItem(["undo", "redo", "paste"]);
                    }
                }
            };

            my.popMenuMethod = function (event) {
                event.stopPropagation();
                event.preventDefault();

                var selectedhtml = app.kendoEditor.selectedHtml();
                var menuItems = my.generateMenuItems(selectedhtml);
                if(menuItems.length < 1) {
                    return true;
                }

                $("#editor-menu ul").html(menuItems);

                var _x = event.clientX;
                var _y = event.clientY;
                var _right = 18 + $("#default-editor").width();
                var _bottom = $("#toolbar").height() + 18 + $("#default-editor").height();
                var _w = parseInt($("#editor-menu").css("width"));
                var _h = parseInt($("#editor-menu").css("height"));
                if((_x+_w) > _right) {
                    _x = _right - _w;
                }
                if((_y+_h) > _bottom) {
                    _y = _bottom - _h;
                }
                $("#editor-menu").css({
                    top: _y + 'px',
                    left: _x + 'px'
                });

                $("#editor-menu").show();

                $('#editor-menu ul li').bind('click', my.onClickMenu);
                $('#editor-menu ul li').hover(function () {
                    if(!$(this).hasClass("disable")) {
                        $(this).css({
                            "background": "#C1C7D2"
                        });
                        $(this).find("div").css({
                            "background": "#C1C7D2"
                        });
                    }
                }, function () {
                    if(!$(this).hasClass("disable")) {
                        $(this).css({
                            "background": "#FFF"
                        });
                        $(this).find("div").css({
                            "background": "#EFEFEF"
                        });
                    }
                });
                return false;
            };

            my.onClickMenu = function(e) {
                app.kendoEditor.focus();

                var $ctext = e.target.innerText;
                e.stopPropagation();
                e.preventDefault();
                switch ($ctext) {
                    case 'Undo': {
                        app.kendoEditor.exec("undo");
                        break;
                    }
                    case 'Redo': {
                        app.kendoEditor.exec("redo");
                        break;
                    }
                    case 'Copy': {
                        if(app.objManager.handleEvent("copy")) {
                            ClipboardData.setData("text", app.kendoEditor.selectedHtml());
                        }
                        break;
                    }
                    case 'Cut': {
                        if(app.objManager.handleEvent("cut")) {
                            ClipboardData.setData("text", app.kendoEditor.selectedHtml());
                            app.kendoEditor.paste("");
                        }
                        break;
                    }
                    case 'Paste': {
                        //$("#toolbar").find("#paste").trigger('click');
                        var str = ClipboardData.getData("text");
                        app.kendoEditor.paste(str);
                        app.objManager.handleEvent("paste", str);
                        break;
                    }
                    case 'Delete': {
                        if(app.objManager.handleEvent("delete")) {
                            app.kendoEditor.paste("");
                        }
                        break;
                    }
                    case 'Move to front': {
                        app.objManager.handleEvent("movetofront");
                        break;
                    }
                    case 'Move to back': {
                        app.objManager.handleEvent("movetoback");
                        break;
                    }
                    case 'Align by left': {
                        app.objManager.handleEvent("leftalign");
                        break;
                    }
                    case 'Align by top': {
                        app.objManager.handleEvent("topalign");
                        break;
                    }
                    case 'Align by right': {
                        app.objManager.handleEvent("rightalign");
                        break;
                    }
                    case 'Align by bottom': {
                        app.objManager.handleEvent("bottomalign");
                        break;
                    }
                    case 'Align by center': {
                        app.objManager.handleEvent("centeralign");
                        break;
                    }
                    case 'Align by vcenter': {
                        app.objManager.handleEvent("vcenteralign");
                        break;
                    }
                    default:
                        break;
                }
                $("#editor-menu").hide();
                return false;
            };

            my.hideAll = function() {
                $("#editor-menu").hide();
            }

            return my;
        } (app.menuManager || {}));

        $(app.kendoEditor.element[0]).bind('contextmenu', app.menuManager.popMenuMethod);
    };

    app.initializeCommonEditorWindow = function() {
        var _editor = $("#default-editor");
        $('body').append('<div id="common-editor-window">'+
            '<div id="value-group" style="margin-top:8px">'+
            '<label>Value: <input id="value" type="text" /></label>'+
            '</div>'+
            '<div id="close-group" style="border-top: 1px solid #ccc;margin-top:18px;padding-top:6px;">' +
            '<input type="button" id="ok" value="OK" style="float:right;" />'+
            '<input type="button" id="cancel" value="Cancle" style="float:right;margin-right:8px;" />' +
            '<div class="clearfix"></div>'+
            '</div>'+
            '<style scoped>'+
            '.clearfix{ clear: both; }'+
            '</style>'+
            '</div>');

        $("#common-editor-window").kendoWindow({
            visible: false,
            modal: true,
            width: "300px",
            title: "Set Value",
            actions: ["Close"],
            resizable: false,
            position: {
                top: ($(window).height()) / 3,
                left: ($(window).width()) / 3
            }
        });
        app._commonEditorWindow = $("#common-editor-window").data("kendoWindow");
        var $val = app._commonEditorWindow.$val = $("#common-editor-window").find("#value");
        WysiwygApp.Utility.kendoInput($val);
        $val.css({width:'230px', height:'20px'});

        $("#common-editor-window>#close-group>#cancel").kendoButton({
            click: function() {
                app._commonEditorWindow.close();
            }
        });
        $("#common-editor-window>#close-group>#ok").kendoButton({
            click: function() {
                $obj = app.objManager.edittingObj;
                var ctrltype = app.objManager.recognizeObjType($obj);
                if(ctrltype == "LABELCTRL") {
                    $obj.text($val.val());
                }
                else if(ctrltype == "BTNCTRL") {
                    $obj.val($val.val());
                }
                else if(ctrltype == "AUDIOCTRL") {
                    $obj.attr("_roleas_arg_src", $val.val());
                }
                else if(ctrltype == "QRCODECTRL") {
                    $obj.attr("_roleas_arg_value", $val.val());
                    app.ImgActAs.ActAsQRCode($obj);
                }
                else if(ctrltype == "BARCODECTRL") {
                    $obj.attr("_roleas_arg_value", $val.val());
                    app.ImgActAs.ActAsBarcode($obj);
                }
                else if(ctrltype == "HOTAREA") {
                    $obj.attr("href", $val.val());
                }
                app._commonEditorWindow.close();

                app.objManager.deselectAll();
                app.objManager.doSelect($obj);
            }
        });
    };

    app.initializeResourceSelectionWindow = function() {
        $('body').append(
            '<div id="resource-selection-window">'+
                '<div id="tree">'+
                '</div>'+
                '<div id="url-group" style="margin-top:8px;margin-bottom:8px;">'+
                '<label>URL: <input id="url" type="text" style="width:55%"/></label><input id="browse" type="button" value="Browse..." style="padding:0;margin-left:4px;width:80px;"/>' +
                '</div>'+
                //'<div id="close-group" style="border-top: 1px solid #ccc;position: absolute;bottom:0;margin-top:4px;margin-bottom:8px;padding-top:4px;width:97%;">' +
                '<div id="close-group" style="border-top: 1px solid #ccc;margin-top:18px;padding-top:6px;">' +
                '<input type="button" id="ok" value="OK" style="float:right;" />'+
                '<input type="button" id="cancel" value="Cancle" style="float:right;margin-right:8px;" />' +
                '<div class="clearfix"></div>'+
                '</div>'+
                '<style scoped>'+
                '#resource-selection-window #tree .k-sprite {'+
                    'background-image: url("'+EditorProxy.GetWysiwygBasePath()+'/3thlib/kendoui/examples/content/web/treeview/coloricons-sprite.png");'+
                '}'+
                '.rootfolder { background-position: 0 0;}'+
                '.folder { background-position: 0 -16px; }'+
                '.pdf { background-position: 0 -32px; }'+
                '.html { background-position: 0 -48px; }'+
                '.image { background-position: 0 -64px; }'+
                '.clearfix{ clear: both; }'+
                '<\/style>'+
                '<\/div>');

        $("#resource-selection-window").kendoWindow({
            visible: false, //default is hide
            modal: true,
            width: "300px",
            title: "Select Resource",
            actions: ["Close"],
            resizable: false,
            position: {
                top: ($(window).height()) / 3,
                left: ($(window).width()) / 3
            },
            close: function() {
                //temporary fix bug: after drag a new audio/video and popup the editing window, but audio/video is not selected state
                //delay sync code to close editting window
                //app.onDesignChange(true);
                if(app.designChanged === true) {
                    app.onDesignChange(true);
                    app.designChanged = false;
                }
                //end
            }
        });
        var $wng = app._resourceSelectionWindow = $("#resource-selection-window").data("kendoWindow");
        var $url = app._resourceSelectionWindow.$url = $('#resource-selection-window>#url-group').find('#url');
        //var imgSelection = $(".popup-quick-editor-img-window").data("kendoWindow");
        //imgSelection.center(); //Centers the window within the viewport.

        function onChangeResource(newValue) {
            $obj = app.objManager.edittingObj;
            var ctrltype = app.objManager.recognizeObjType($obj);
            if(ctrltype === "IMGCTRL") {
                var _src = EditorProxy.GetRelativePathToHtml(newValue);
                if(_src !== $obj.attr("src")) {
                    $obj.attr("src", _src);
                }
            }
            else if(ctrltype === "AUDIOCTRL"
                ||ctrltype === "VIDEOCTRL") {
                $obj.attr('_roleas_arg_src', EditorProxy.GetRelativePathToHtml(newValue));
            }
            else if(ctrltype === "EDITOR") {
                newValue = "url("+EditorProxy.GetRelativePathToHtml(newValue)+")";
                $obj.css("background-image", newValue);
            }
            $url.val(newValue);
        }

        WysiwygApp.Utility.kendoInput($url);
        $url.css({height:'20px'});

        $('#resource-selection-window>#url-group>#browse').kendoButton({
            click: function() {
                var filter = "Images(*.png *.jpg)";
                try {
                    var ctrltype = WysiwygApp.objManager.recognizeObjType(WysiwygApp.objManager.edittingObj);
                    if(ctrltype === "AUDIOCTRL") {
                        filter = "Audio(*.mp3 *.wav)";
                    }
                    else if(ctrltype === "VIDEOCTRL") {
                        filter = "Video(*.mp4)";
                    }
                }
                catch(e) {
                }

                var ret = EditorProxy.loadResourceFromDisk("Open file", "Images(*.png *.jpg)");
                if(ret.length > 0) {
                    onChangeResource(ret);
                    $wng.close();
                }
            }
        });
        $('#resource-selection-window>#url-group>#browse').css({height:'26px'});

        $('#resource-selection-window>#close-group>#ok').kendoButton({
            click: function() {
                onChangeResource($url.val());

                $obj = app.objManager.edittingObj;
                var ctrltype = app.objManager.recognizeObjType($obj);
                if(ctrltype === "IMGCTRL") {
                    $obj.attr('last-src', $obj.attr('src'));
                    //e.preventDefault();
                    //reselect for fresh property panel
                    app.objManager.deselectAll();
                    app.objManager.doSelect($obj);
                }
                else if(ctrltype === "AUDIOCTRL"
                    ||ctrltype === "VIDEOCTRL") {
                    $obj.attr('_roleas_arg_lastsrc', $obj.attr('_roleas_arg_src'));
                    //e.preventDefault();
                    //reselect for fresh property panel
                    app.objManager.deselectAll();
                    app.objManager.doSelect($obj);
                }
                else if(ctrltype === "EDITOR") {
                    $obj.css("last-background-image", $obj.css("background-image"));
                }
                $wng.close();
            }
        });
        $('#resource-selection-window>#close-group>#cancel').kendoButton({
            click: function() {
                $obj = app.objManager.edittingObj;
                var ctrltype = app.objManager.recognizeObjType($obj);
                if(ctrltype == "IMGCTRL") {
                    var lastSrc = $obj.attr('last-src');
                    if (typeof(lastSrc) != "undefined") {
                        if($obj.attr("src") !== lastSrc) {
                            $obj.attr("src", lastSrc);
                        }
                    }
                    else {
                        $obj.attr("src", "");
                    }
                }
                else if(ctrltype == "AUDIOCTRL"
                    ||ctrltype == "VIDEOCTRL") {
                    var lastSrc = $obj.attr('_roleas_arg_lastsrc');
                    if (typeof(lastSrc) != "undefined") {
                        $obj.attr('_roleas_arg_src', lastSrc);
                    }
                    else {
                        $obj.attr('_roleas_arg_src', '');
                    }
                }
                else if(ctrltype === "EDITOR") {
                    var lastImg = $obj.css("last-background-image");
                    if (typeof(lastImg) != "undefined") {
                        $obj.attr("background-image", lastImg);
                    }
                    else {
                        $obj.attr("background-image", "");
                    }
                }
                $wng.close();
            }
        });

        $("#resource-selection-window>#tree").kendoTreeView({
            dataSource: [
                {
                    id: 1, text: "Image Resources", expanded: true, spriteCssClass: "rootfolder", items: [
                    { id: 3, text: "img1.jpg", spriteCssClass: "image", full_path: "222" },
                    { id: 4, text: "img2.jpg", spriteCssClass: "image", path: "b" },
                    { id: 5, text: "img3.jpg", spriteCssClass: "image", path: "c" }
                ]
                }
            ],
            select: function (e) {
                var dataItem = this.dataItem(e.node);
                onChangeResource(dataItem.full_path);
            }
        });

        app._resourceSelectionWindow._treeView = $("#resource-selection-window>#tree").data("kendoTreeView");
    };

    app.initializeHyperlinkWng = function() {
        $('body').append(
            '<div class="popup-hyperlink-window" style="padding:10px 0 0">'+
                '<div class="Content">'+
                    '<div class="l"><label>Web Address:</label></div>'+
                    '<div class="r"><input  id="webaddr" class="rc" type="text" value="http://" /></div>'+
                    '<div class="l"><label>Open link in new window:</label></div>'+
                    '<div class="r"><input id="opnewwng" type="checkbox" /></div>'+
                    '<div class="clear"></div>'+
                '</div>'+
                '<div class="Bottom">'+
                    '<div class="r"><input id="OK" type="Button" value="OK" /><input id="Cancel" type="Button" value="Cancel" /></div>'+
                    '<div class="clear"></div>'+
                '</div>'+
                '<style scoped>'+
                '.Content {padding-top:4px;}'+
                '.Bottom {border-width: 1px 0 0; border-style:solid; border-color:#dbdbde; margin-top:20px; padding-top:4px;}'+
                '.l {width:35%;float:left;clear:both;margin-left:1%;text-align:right;color:#515967;}'+
                '.r {width:60%;float:right;clear:right;margin-right:1%;padding:0 0 .6em;text-align:left;color:#515967;}'+
                '.rc {width:96%;color:#515967;font-size:100%;}'+
                '.clear {clear:right; width:100%; height:100%;}'+
                '#OK,#Cancel {float:right}'+
                '</style>'+
                '<\/div>');

        $(".popup-hyperlink-window").kendoWindow({
            visible: false, //default is hide
            modal: true,
            width: "400px",
            title: "Hyperlink",
            resize: false,
            actions: ["Close"],
            close: function () {
            },
            position: {
                top: ($(window).height()) / 3,
                left: ($(window).width()) / 3
            }
        });

        app.imgHyperlinkWng = $(".popup-hyperlink-window").data("kendoWindow");
    };

    window.WysiwygApp = app;
    return app;
} (WysiwygApp || {}));
