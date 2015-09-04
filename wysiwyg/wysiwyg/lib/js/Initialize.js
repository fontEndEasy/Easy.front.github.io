var WysiwygApp = (function (my) {
    my.Initialize = function() {
        my.InitializeBase();
        my.designPanel.initialize();
        my.InitializeRightPane();
        my.InitializePopups();
        my.ImgActAs.Initialize();
        my.initSearchReplace();
        //my.SetViewMode('other');
        my.SetSolution(0, 0);
    };

    my.InitializeBase = function() {
        if (EditorProxy.HtmlModified && EditorProxy.HtmlModified.connect) {
            EditorProxy.HtmlModified.connect(my.OnHtmlChangeFromOutside);
        };

        $("#splitter").kendoSplitter({
            panes: [
                { collapsible: false, size: "75%"  },
                { collapsible: true, size: "20%" }
            ],
            resize: function (e) {
                my.onSplitterResize();
                //$("#property-container").css({height: e.height-45});
            }
        });

        $("#inner-splitter").kendoSplitter({
            orientation: "vertical",
            panes: [
                { collapsible: false, size: "100%" },
                { collapsible: false, size: "0%" }
            ],
            resize: function (e) {
                my.onSplitterResize();
            }
        });

        $("#design-panel").droppable({
            hoverClass: "ui-state-highlight",
            accept: ".obj",
            drop: function (event, ui) {
                WysiwygApp.objManager.deselectAll();
                WysiwygApp.objManager.deselectAllHotArea();

                var objtype = ui.draggable.attr("id"),
                    layoutMode = $("#templateTool option:selected").text(),
                    //leftPos = event.clientX - $("#design-panel").offset().left,
                    //topPos = event.clientY - $("#design-panel").offset().top;
                    leftPos = ui.offset.left - (-9.5), //temporary
                    topPos = ui.offset.top - 38.1875 - ($("#design-panel").offset().top - 46.90625); //temporary

                var $obj = WysiwygApp.objManager.createObj(objtype, layoutMode, leftPos, topPos);
                var _simulateDblClick = function($obj) {
                    var ev = document.createEvent("HTMLEvents");
                    ev.initEvent("dblclick", false, true);
                    WysiwygApp.objManager.handleEvent("dblclick", $obj, ev);
                    delete ev;
                }
                if(objtype == "img-obj") {
                    $obj.bind("load", function() {
                        _simulateDblClick($(this));
                        $obj.unbind("load");
                    });
                }
                else {
                    setTimeout(function() {
                        _simulateDblClick($obj);
                    }, 100);
                }
            }
        });
    }

    my.onSplitterResize = function() {
        my.resizeDesignPanel();
    }

    my.viewMode = "";
    my.GetViewMode = function() {
        return my.viewMode;
    };

    my.recreateInnerSplitter = function(orientation) {
        var parent = $("#inner-splitter").parent("div");
        parent.append('<div id="inner-splitter2" style="height: 100%;"><div id="top-pane"  style="overflow: hidden"></div><div id="bottom-pane" style="overflow: hidden;"></div></div>');
        $("#inner-splitter2>#top-pane").append($("#toolbar"));
        $("#inner-splitter2>#top-pane").append($("#design-panel"));
        $("#inner-splitter2>#bottom-pane").append($("#code-panel"));

        var insplitter = $("#inner-splitter").data("kendoSplitter");
        insplitter.destroy();
        $("#inner-splitter").remove();
        $("#inner-splitter2").attr("id", "inner-splitter");
        //*/
        /*
         $("#inner-splitter").remove();
        parent.append('<div id="inner-splitter" style="height: 100%;">'+
            '<div id="top-pane"  style="overflow: hidden">'+
            '<div id="toolbar" style="max-height: 100%;">'+
            '</div>'+
            '<div id="design-panel" style="overflow:auto;">'+
            '<div id="default-editor" contenteditable="true" style="position:relative;word-wrap: normal;overflow: auto;"></div>'+
            '</div>'+
            '</div>'+
        '<div id="bottom-pane" style="overflow: hidden;">'+
        '<textarea id="code-panel" style="width:100%;height:99.9%;resize: none;margin:0px;padding:0px;border:none;"></textarea>'+
        '</div>'+
        '</div>');
        */

        $("#inner-splitter").kendoSplitter({
            orientation: orientation,
            panes: [
                { collapsible: false, size: "60%" },
                { collapsible: false, size: "40%" }
            ],
            resize: function (e) {
                my.onSplitterResize();
            }
        });
        //my.InitializeEditor();
    };

    my.SetViewMode = function(m) {
        if(my.viewMode == m) {
            return;
        }
        my.viewMode = m;

        var insplitter = $("#inner-splitter").data("kendoSplitter");
        if(m == "design") {
            $("#inner-splitter").find(".k-splitbar-vertical").hide();
            $("#inner-splitter").find(".k-splitbar-horizontal").hide();
            insplitter.size(".k-pane:first", "100%");
        }
        else if(m == "source") {
            $("#inner-splitter").find(".k-splitbar-vertical").hide();
            $("#inner-splitter").find(".k-splitbar-horizontal").hide();
            insplitter.size(".k-pane:first", "0%");

            var newHtml = my.exportHtml();
            $("#code-panel").val(newHtml);
        }
        else if(m == "vert-splitter"){
            if(insplitter.options.orientation !== "vertical") {
                my.recreateInnerSplitter("vertical");
            }
            else {
                $("#inner-splitter").find(".k-splitbar-vertical").show();
                insplitter.size(".k-pane:first", "60%");
            }
            var newHtml = my.exportHtml();
            $("#code-panel").val(newHtml);
        }
        else {
            if(insplitter.options.orientation !== "horizontal") {
                my.recreateInnerSplitter("horizontal");
            }
            else {
                $("#inner-splitter").find(".k-splitbar-horizontal").show();
                insplitter.size(".k-pane:first", "60%");
            }

            var newHtml = my.exportHtml();
            $("#code-panel").val(newHtml);
        }
    };

    my.resizeDesignPanel = function() { //###
        //当前toolbar的position=static，而它下面的kendoWindow用的是absolute，所以这里需要显式设置toolbar的高度
        //而为什么toolbar下面的kendoWindow要用absolute呢？主要是hotarea和default-editor不在同一div，但hotarea又要和default-editor中的对象保持位置一致，
        //把toolbar下面的kendoWindow设为absolute能解决hotarea跑到toolbar上的问题。
        $("#toolbar").css("height", $("#toolbar>.k-editor-widget").css("height"));

        var h1 = parseInt($("#top-pane").css('height'));
        var h2 = parseInt($("#toolbar").css('height'));
        var h3 = (h1 - h2) + "px";
		var h4 = $("#design-panel").height();
		var hs = $("#design-panel").scrollLeft();
        if(my.solutionw < 1 || my.solutionh < 1) {
            $("#design-panel").css({height: h3, position: 'relative'});
            if(WysiwygApp.designPanel.isRulerShowing()){
                $("#default-editor").css({height: parseInt(h3) - 18 + 'px', "width": "100%"});
				$("#editor-panel").css({height: parseInt(h3) - 18 + 'px', "width": "100%"});
            }else{
                $("#default-editor").css({height: parseInt(h3) - 2 + 'px', "width": "100%"});
				$("#editor-panel").css({height: parseInt(h3) - 2 + 'px', "width": "100%"});
            }
            WysiwygApp.designPanel.updateRuler();
        }else if(my.solutionh < h4 && my.solutionh > 1) {
        	$("#design-panel").css({height: h3, position: 'relative'});
            console.dir(hs);
            if(WysiwygApp.designPanel.isRulerShowing()){
                $("#default-editor").css({
                    width: parseInt(my.solutionw) + 'px',
                    height: parseInt(my.solutionh) + 'px'
                });
				$("#editor-panel").css({width: parseInt(my.solutionw) + 'px', height: parseInt(h4) - 18 + 'px'});
            }else{
                $("#default-editor").css({width: '100%', "height": '100%'});
				$("#editor-panel").css({width: parseInt(my.solutionw) + 'px', height: parseInt(h4) - 18 + 'px'});
            }

            WysiwygApp.designPanel.updateRuler();
        }else {
            $("#design-panel").css({height: h3, position: 'relative'});
            console.dir(hs);
            if(WysiwygApp.designPanel.isRulerShowing()){
                $("#default-editor").css({
                	width: 'auto',
                    'min-width': parseInt(my.solutionw) + 'px',
                    height: parseInt(my.solutionh) + 'px'
                });
				$("#editor-panel").css({width: parseInt(my.solutionw) + 'px', height: parseInt(h4) - 18 + 'px'});
            }else{
                $("#default-editor").css({width: '100%', "height": '100%'});
				$("#editor-panel").css({width: parseInt(my.solutionw) + 'px', height: parseInt(h4) - 18 + 'px'});
            }

            WysiwygApp.designPanel.updateRuler();
        }
		if(my.solutionh < h4 || my.solutionh < 1) {
			console.dir("Smaller than H4!");
			$("#editor-panel").css({overflow: 'hidden'});
			//$("#default-editor").css({width: parseInt(my.solutionw) + 'px', height: parseInt(my.solutionh) + 'px'});
			$("#default-editor").css({overflow: 'auto', '-webkit-box-shadow': '0 1px 5px #999'});
		}else{
			$("#editor-panel").css({overflow: 'auto'});
			$("#default-editor").css({overflow: 'visible','-webkit-box-shadow': '0 1px 5px #999'});
		}
        var _h = $("#right-pane").height() - $("#right-pane").find(".k-tabstrip-items.k-reset").height()-12;
        $("#right-pane").find("#tabstrip-2").css({height:_h+"px", "overflow-y":"auto", "overflow-x":"hidden"});

        if(my.objManager) {
            my.objManager.adjustHotAreaPos();
        }
    };

    my.solutionw = -1;
    my.solutionh = -1;
    my.SetSolution = function(w, h) {
        if(my.solutionw === parseInt(w)
            && my.solutionh === parseInt(h)) {
            return;
        }

        var onContentScroll = function(e) {
            my.objManager.adjustHotAreaPos();
        };

        if(parseInt(w) < 1 || parseInt(h) < 1) {
            my.solutionw = 0;
            my.solutionh = 0;
            //$("#design-panel").attr("style", "");
            $("#design-panel").css({"background-color":"#ffffff"});
            //$("#default-editor").attr("style", "word-wrap: normal;overflow: auto;padding:0;border:0;");
            //$("#default-editor").css("word-wrap", "normal");

            $("#design-panel").unbind("scroll");
            $("#default-editor").bind("scroll", onContentScroll);
        }
        else {
            my.solutionw = parseInt(w);
            my.solutionh = parseInt(h);
            //$("#design-panel").attr("style", "overflow:auto;background-color:#999999");
            $("#default-editor").css({"background-color":"#ffffff"});
            $("#design-panel").css({"background-color":"#999999"});
            //$("#default-editor").attr("style", "position:relative;word-wrap: break-word; -webkit-line-break: after-white-space; padding:0;border:0;background-color:#ffffff;");
            //$("#default-editor").css("word-wrap", "break-word");

            //$("#default-editor").unbind("scroll");
            //$("#design-panel").bind("scroll", onContentScroll);
            $("#design-panel").unbind("scroll");
            $("#default-editor").bind("scroll", onContentScroll);
        }

        my.resizeDesignPanel();
    };

    window.WysiwygApp = my;
    return my;
} (WysiwygApp || {}));