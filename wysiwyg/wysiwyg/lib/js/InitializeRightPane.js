var WysiwygApp = (function (my) {
    my.InitializeRightPane = function() {
        var tabstrip = $("#tabstrip").kendoTabStrip({
            animation: false,
            dataTextField: "text",
            dataImageUrlField: "imageUrl",
            dataContentField: "content",
            dataSource: [
                {
                    text: "Controls",
                    content: '<div class="pane-content">'+
                                '<ul id="panelbar">'+
                                    '<li class="k-state-active">' +
                                        '<span class="k-link">Basic</span>' +
                                            '<div class="obj-mom" style="padding:10px;">'+
                                                '<img class="obj" id="label-obj" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/label.png" style="width:72px; height:72px; cursor: move; margin:10px;" title="Label">' +
                                                '<img class="obj" id="button-obj" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/button.png" style="width:72px; height:72px; cursor: move; margin:10px;" title="Button">' +
                                                '<img class="obj" id="img-obj" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/img.png" style="width:72px; height:72px; cursor: move; margin:10px;" title="Image">' +
                                                '<img class="obj" id="audio-obj" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/audio.png" style="width:72px; height:72px; cursor: move; margin:10px;" title="Audio">' +
                                                '<img class="obj" id="video-obj" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/video.png" style="width:72px; height:72px; cursor: move; margin:10px;" title="Video">' +
                                                '<img class="obj" id="qrcode-obj" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/QRcode.png" style="width:72px; height:72px; cursor: move; margin:10px;" title="QRcode">' +
                                                '<img class="obj" id="barcode-obj" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/Barcode.png" style="width:72px; height:72px; cursor: move; margin:10px;" title="Barcode">' +
                                                '<img class="hotarea" id="recthotarea-obj" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/recthotarea.png" style="width:72px; height:72px; cursor: move; margin:10px;" title="rectangle hot area">' +
                                                '<img class="hotarea" id="circlehotarea-obj" src="'+EditorProxy.GetWysiwygBasePath()+'/wysiwyg/images/circlehotarea.png" style="width:72px; height:72px; cursor: move; margin:10px;" title="circle hot area">' +
                                            '</div>'+
                                    '</li>'+
                                    '<li>Other'+
                                        '<div style="padding: 10px;">' +
                                        '</div>'+
                                    '</li>'+
                                '</ul>'+
                            '</div>'
                },/*
                {
                    text: "Themes",
                    content: ''
                },*/
                {
                    text: "Property",
                    content: '<div id="property-container"></div>'
                }
            ]
        }).data("kendoTabStrip");

        tabstrip.select(0);

        $("#tabstrip ul.k-tabstrip-items").kendoSortable({
            filter: "li.k-item",
            axis: "x",
            container: "ul.k-tabstrip-items",
            hint: function (element) {
                return $("<div id='hint' class='k-widget k-header k-tabstrip'><ul class='k-tabstrip-items k-reset'><li class='k-item k-state-active k-tab-on-top'>" + element.html() + "</li></ul></div>");
            },
            start: function (e) {
                tabstrip.activateTab(e.item);
            },
            change: function (e) {
                var tabstrip = $("#tabstrip").data("kendoTabStrip"),
                    reference = tabstrip.tabGroup.children().eq(e.newIndex);

                if (e.oldIndex < e.newIndex) {
                    tabstrip.insertAfter(e.item, reference);
                } else {
                    tabstrip.insertBefore(e.item, reference);
                }
            }
        });

        $("#panelbar").kendoPanelBar({
            expandMode: "multiple"
        });

        $(".obj-mom img").draggable({
            appendTo: "body",
            cursor: "move",
            helper: "clone"
            //drag: function(e, ui) {
                //console.dir(ui.offset.left + "," + ui.offset.top);
            //}
        });
    };

    my.switchProperties = function($targetObj) {
        var ctrltype = my.objManager.recognizeObjType($targetObj),
            layoutMode = $("#templateTool option:selected").text();

        var commonStyleStr = '<style scoped>'+
            '.group {border:1px dotted #dedede;border-radius:4px;padding-top:4px;}'+
            '.sub-group {clear:both;padding:8px;margin:8px;border:1px dashed #eeeeee;}'+
            '.l {width:35%;float:left;clear:both;margin-left:1%;text-align:right;color:#515967;}'+
            '.r {width:60%;float:right;clear:right;margin-right:1%;padding:0 0 .6em;text-align:left;color:#515967;}'+
            '.rc {width:96%;color:#515967;font-size:100%;}'+
            'h4 {color:#212927;clear:both; display:inline-block; width:99%; margin-bottom: 4px}'+
            '.clear {clear:right;width:100%;height:100%;}'+
            '</style>';

        var idClassStr = ''+
            '<h4>ID</h4>'+
            '<div class="group" id="id">'+
                '<div class="l"><label>ID:</label></div>'+
                '<div class="r"><input type="text" class="rc" /></div>'+
                '<div class="clear"></div>'+
            '</div>'+
            '<h4>Class</h4>'+
            '<div class="group" id="class">'+
                '<div class="l"><label>Class:</label></div>'+
                '<div class="r"><input type="text" class="rc" /></div>'+
                '<div class="clear"></div>'+
            '</div>';

        var imgSpecStr = "";
        if(ctrltype === "IMGCTRL") {
            imgSpecStr = '<div class="l"><label>actual size:</label></div>'+
                '<div class="r"><input id="actualsize" type="checkbox" /></div>';
        }
        var ltwhStr = "";
        if($targetObj.css("position") === "absolute") {
            ltwhStr = ''+
                '<h4>Margin</h4>'+
                '<div class="group" id="ltwh">'+
                    '<div class="l"><label>left:</label></div>'+
                    '<div class="r"><input id="left" type="text" class="rc" /></div>'+
                    '<div class="l"><label>top:</label></div>'+
                    '<div class="r"><input id="top" type="text" class="rc"/></div>'+
                    '<div class="l"><label>width:</label></div>'+
                    imgSpecStr+
                    '<div class="r"><input id="width" type="text" class="rc"/></div>'+
                    '<div class="l"><label>height:</label></div>'+
                    '<div class="r"><input id="height" type="text" class="rc"/></div>'+
                    '<div class="clear"></div>'+
                '</div>';
        }
        else {
            ltwhStr = ''+
                '<h4>Layout</h4>'+
                '<div class="group" id="ltwh">'+
                    imgSpecStr+
                    '<div class="l"><label>width:</label></div>'+
                    '<div class="r"><input id="width" type="text" class="rc"/></div>'+
                    '<div class="l"><label>height:</label></div>'+
                    '<div class="r"><input id="height" type="text" class="rc"/></div>'+
                    '<div class="clear"></div>'+
                '</div>';
        }

        var marginStr = ''+
            '<h4>Margin</h4>'+
            '<div class="group" id="margin">'+
                '<div class="l"><label>left:</label></div>'+
                '<div class="r"><input id="left" type="text" class="rc" /></div>'+
                '<div class="l"><label>top:</label></div>'+
                '<div class="r"><input id="top" type="text" class="rc"/></div>'+
                '<div class="l"><label>right:</label></div>'+
                '<div class="r"><input id="right" type="text" class="rc"/></div>'+
                '<div class="l"><label>bottom:</label></div>'+
                '<div class="r"><input id="bottom" type="text" class="rc"/></div>'+
                '<div class="clear"></div>'+
            '</div>';

        var commonCtrlPropStr = ''+
            '<li class="k-state-active">Basic'+
                '<div>'+
                    idClassStr + ltwhStr + marginStr+
                '</div>'+
            '</li>';

        function commonCtrlPropValueInit($obj, ctrltype) {
            //ID
            (function($obj) {
                var $i = $("#property-container").find("#id").find("input");
                my.Utility.kendoInput($i);
                $i.val($obj.attr("id"));
                $i.bind("change", function(e){
                    $obj.attr("id", $i.val());
                });
            }($obj));

            //class
            (function($obj) {
                var $i = $("#property-container").find("#class").find("input");
                my.Utility.kendoInput($i);
                $i.val($obj.attr("class"));
                $i.bind("change", function(e){
                    $obj.attr("class", $i.val());
                });
            }($obj));

            //left,top,width,height
            (function($obj, ctrltype) {
                $("#property-container").find("#ltwh").find("input[type$=text]").each(function(index) {
                    $(this).kendoNumericTextBox( { step:1 });
                });
                function _fn(a) {
                    var $i = $("#property-container").find("#ltwh").find("#"+a);
                    var num = $i.data("kendoNumericTextBox");
                    num.value(parseInt($obj.parent().css(a)));
                    function _createf(a) {
                        if(a === "left"
                            || a === "top") {
                            var str = 'function __f() { $obj.parent().css({"'+a+'": num.value()}); }';
                            eval(str);
                        }
                        else {
                            var str = 'function __f() { '+
                                'var w = $obj.width(), h = $obj.height();' +
                                'if("'+a+'" === "width") { w = num.value(); }' +
                                'else { h = num.value(); }' +
                                '$obj.parent().css({width: w, height: h});'+
                                '$obj.css({width: w, height: h});' +
                                'my.objManager.handleEvent("resize", $obj, event, {size:{width:w, height:h}}, false);'+
                            '}';
                            eval(str);
                        }
                        return __f;
                    }
                    var _f = _createf(a);
                    num.bind("change", _f);
                    num.bind("spin", _f);
                }
                if($obj.css("position") === "absolute") {
                    _fn("left"),_fn("top"),_fn("width"),_fn("height");
                }
                else {
                    _fn("width"),_fn("height");
                }

                if(ctrltype === "IMGCTRL") {
                    var _update_w_h = function(that, $obj) {
                        if(that.get(0).checked) {
                            $obj.css({width: "auto", height: "auto"});
                            var a = $("#property-container").find("#ltwh").find("#width").data("kendoNumericTextBox");
                            a.value($obj.width());
                            a.readonly();
                            var b = $("#property-container").find("#ltwh").find("#height").data("kendoNumericTextBox");
                            b.value($obj.height());
                            b.readonly();
                            $obj.parent().css({width: a.value(), height: b.value()});
                        }
                        else {
                            $("#property-container").find("#ltwh").find("#width").data("kendoNumericTextBox").enable();
                            $("#property-container").find("#ltwh").find("#height").data("kendoNumericTextBox").enable();
                        }
                    };
                    $("#property-container").find("#ltwh").find("input[type$=checkbox]").click(function() {
                        _update_w_h($(this), $obj);
                    });

                    if($obj.get(0).style.width === "auto") {
                        $("#property-container").find("#ltwh").find("#actualsize").prop("checked", true);
                    }
                    _update_w_h($("#property-container").find("#ltwh").find("#actualsize"), $obj);
                }
            }($obj, ctrltype));
            //margin
            (function($obj) {
                $("#property-container").find("#margin").find("input").each(function(index) {
                    $(this).kendoNumericTextBox( { step:1 });
                });
                function _fn(a) {
                    var b = "#"+a;
                    var c  = "margin-"+a;
                    var num = $("#property-container").find("#margin").find(b).data("kendoNumericTextBox");
                    num.value(parseInt($obj.parent().css(c)));
                    function _createf(a) {
                        var str = 'function __f() { $obj.parent().css({"margin-'+a+'": num.value()}); }';
                        eval(str);
                        return __f;
                    }
                    var _f = _createf(a);
                    num.bind("change", _f);
                    num.bind("spin", _f);
                }
                _fn("left"),_fn("top"),_fn("right"),_fn("bottom");
            }($obj));
        }

        if( ctrltype == "BTNCTRL"
            || ctrltype == "LABELCTRL") {
            var str = '' +
                '<div id="content" style="min-width:100px;">'+
					'<ul class="btnBar">'+
					'<li class="k-state-active">Frequently'+
					'<div>'+
                    '<h4>Value</h4>'+
                    '<div class="group">'+
                        '<div class="l"><label>value:</label></div>'+
                        '<div class="r"><input id="value" class="rc kinput" /></div>'+
                        '<div class="clear"></div>'+
                    '</div>'+
                    '<h4>Events</h4>'+
                    '<div class="group">'+
                        '<div class="l"><label>onclick:</label></div>'+
                        '<div class="r">'+
                            '<select id="onclick">'+
                            '<option value=""></option>'+
                            '<option value="Hyperlink">Hyperlink</option>'+
                            '</select>'+
                        '</div>'+
                        '<div class="sub-group" id="hyperlink" style="display:none">'+
                            '<div class="l"><label>Web Address:</label></div>'+
                            '<div class="r"><input id="hyperlink-url" class="rc kinput" value="http://" /></div>'+
                            '<div class="l"><label>Open link in new window:</label></div>'+
                            '<div class="r"><input id="hyperlink-opentype" type="checkbox" /></div>'+
                            '<div class="clear"></div>'+
                        '</div>'+
                        '<div class="clear"></div>'+
                    '</div>'+
					'</div>'+
					'</li>'+
                    commonCtrlPropStr+
					'</ul>'+
                '</div>'+commonStyleStr;

            $("#property-container").html(str);
            my.Utility.kendoInput($("#property-container").find(".kinput"));

            //value
            var val = (ctrltype === "BTNCTRL") ? $targetObj.val() : $targetObj.text();
            var valEditor = $("#property-container").find("#value");
            valEditor.val(val);
            valEditor.bind('change', function() {
                if(ctrltype === "BTNCTRL") {
                    $targetObj.val(valEditor.val())
                }
                else {
                    $targetObj.text(valEditor.val());
                }
            });
			var btnBar = $('.btnBar').kendoPanelBar({
				expandMode: "multiple"
			}).data("kendoPanelBar");
			btnBar.wrapper.find('.k-content').css({'padding-bottom': '10px'});
            //event: onclick
            var clksel = $("#property-container").find("#onclick");
            clksel.kendoDropDownList();
            //selection
            var clkddl = clksel.data("kendoDropDownList");
            clkddl.select(function(dataItem) {
                if(typeof($targetObj.attr('__onclick__')) != "undefined") {
                    return dataItem.text === "Hyperlink";
                }
                else {
                    return dataItem.text !== "Hyperlink";
                }
            });
            clkddl.bind("change", function(e) {
                if(this.value() === "Hyperlink") {
                    $("#property-container").find("#hyperlink").css('display', 'block');
                }
                else {
                    $("#property-container").find("#hyperlink").css('display', 'none');
                    $targetObj.removeAttr("__onclick__");
                    $targetObj.removeAttr("target");
                }
            });
			
			$("#property-container").find(".commom").css({
				width: '90%',
				height: '26px',
				border: '1px solid #dedede',
				'border-radius': '3px',
				outline: 'none'
			}).end().find('h4').css({margin: '5px 5%'}).end().find('.groupbg').css({'text-align': 'center'});
			
            if(typeof($targetObj.attr('__onclick__')) != "undefined") {
                $("#property-container").find("#hyperlink").css('display', 'block');
                var url = $targetObj.attr('__onclick__');
                $("#property-container").find("#hyperlink-url").val(url.substring(15, url.length-1));
            }
            else {
                $("#property-container").find("#hyperlink").css('display', 'none');
            }

            //url
            $("#property-container").find("#hyperlink-url").bind('change', function(e){
                $targetObj.attr("__onclick__", "location.href='"+$(this).val()+"'");
            });
            //url open mode
            if($targetObj.attr("target") === "_blank") {
                $("#property-container").find("#hyperlink-opentype").attr('checked', true);
            }
            else {
                $("#property-container").find("#hyperlink-opentype").attr('checked', false);
            }
            $("#property-container").find("#hyperlink-opentype").bind('change', function(e){
                if($("#property-container").find("#hyperlink-opentype").is(':checked')) {
                    $targetObj.attr("target", "_blank");
                }
                else {
                    $targetObj.removeAttr("target");
                }
            });

            commonCtrlPropValueInit($targetObj, ctrltype);
        }
        else if( ctrltype == "IMGCTRL") {
            var str = '' +
                '<div id="content" style="min-width:100px;">'+
				'<ul class="btnBar">'+
					'<li class="k-state-active">Frequently'+
					'<div>'+
                '<h4>Image</h4>'+
                '<div class="group">'+
                //'<div class="l"><label></label></div>'+
                '<div class="r" style="width:90%;"><input id="value" class="rc kinput" /></div>'+
                '<div class="clear"></div>'+
                '</div>'+
                '<h4>Events</h4>'+
                '<div class="group">'+
                '<div class="l"><label>onclick:</label></div>'+
                '<div class="r">'+
                '<select id="onclick">'+
                '<option value=""></option>'+
                '<option value="Hyperlink">Hyperlink</option>'+
                '</select>'+
                '</div>'+
                '<div class="sub-group" id="hyperlink" style="display:none">'+
                '<div class="l"><label>Web Address:</label></div>'+
                '<div class="r"><input id="hyperlink-url" class="rc kinput" value="http://" /></div>'+
                '<div class="l"><label>Open link in new window:</label></div>'+
                '<div class="r"><input id="hyperlink-opentype" type="checkbox" /></div>'+
                '<div class="clear"></div>'+
                '</div>'+
                '<div class="clear"></div>'+
                '</div>'+
				'</div></li>'+commonCtrlPropStr+'</ul>'+
                '</div>'+commonStyleStr;

            $("#property-container").html(str);
            my.Utility.kendoInput($("#property-container").find(".kinput"));

            //value
            var val = $targetObj.attr("src");
            var valEditor = $("#property-container").find("#value");
            valEditor.val(val);
            valEditor.bind('focusin', function() {
                var res = eval('(' + EditorProxy.GetResourcesJsonString("png|jpg|jpeg") + ')'); //JSON.parse( EditorProxy.GetResourcesJsonString() );
                var data = { data: res };
                my._resourceSelectionWindow.$url.val($targetObj.attr("src"));
                my._resourceSelectionWindow._treeView.setDataSource(new kendo.data.HierarchicalDataSource(data));
                my._resourceSelectionWindow.open();
            });
			var btnBar = $('.btnBar').kendoPanelBar({
				expandMode: "multiple"
			}).data("kendoPanelBar");
			btnBar.wrapper.find('.k-content').css({'padding-bottom': '10px'});
            //event: onclick
            var clksel = $("#property-container").find("#onclick");
            clksel.kendoDropDownList();
            //selection
            var clkddl = clksel.data("kendoDropDownList");
            clkddl.select(function(dataItem) {
                if(typeof($targetObj.attr('__onclick__')) != "undefined") {
                    return dataItem.text === "Hyperlink";
                }
                else {
                    return dataItem.text !== "Hyperlink";
                }
            });
            clkddl.bind("change", function(e) {
                if(this.value() === "Hyperlink") {
                    $("#property-container").find("#hyperlink").css('display', 'block');
                }
                else {
                    $("#property-container").find("#hyperlink").css('display', 'none');
                    $targetObj.removeAttr("__onclick__");
                    $targetObj.removeAttr("target");
                }
            });
			$("#property-container").find(".commom").css({
				width: '90%',
				height: '26px',
				border: '1px solid #dedede',
				'border-radius': '3px',
				outline: 'none'
			}).end().find('h4').css({margin: '5px 5%'}).end().find('.groupbg').css({'text-align': 'center'});
            if(typeof($targetObj.attr('__onclick__')) != "undefined") {
                $("#property-container").find("#hyperlink").css('display', 'block');
                var url = $targetObj.attr('__onclick__');
                $("#property-container").find("#hyperlink-url").val(url.substring(15, url.length-1));
            }
            else {
                $("#property-container").find("#hyperlink").css('display', 'none');
            }

            //url
            $("#property-container").find("#hyperlink-url").bind('change', function(e){
                $targetObj.attr("__onclick__", "location.href='"+$(this).val()+"'");
            });
            //url open mode
            if($targetObj.attr("target") === "_blank") {
                $("#property-container").find("#hyperlink-opentype").attr('checked', true);
            }
            else {
                $("#property-container").find("#hyperlink-opentype").attr('checked', false);
            }
            $("#property-container").find("#hyperlink-opentype").bind('change', function(e){
                if($("#property-container").find("#hyperlink-opentype").is(':checked')) {
                    $targetObj.attr("target", "_blank");
                }
                else {
                    $targetObj.removeAttr("target");
                }
            });

            commonCtrlPropValueInit($targetObj, ctrltype);
        }
        else if( ctrltype == "AUDIOCTRL") {
            var str = '' +
                '<div id="content" style="min-width:100px;">'+
				'<ul class="btnBar">'+
					'<li class="k-state-active">Frequently'+
					'<div>'+
                    '<h4>Src</h4>'+
                    '<div class="group">'+
                        //'<div class="l"><label></label></div>'+
                        '<div class="r" style="width:90%;"><input id="value" class="rc kinput" /></div>'+
                        '<div class="clear"></div>'+
                    '</div>'+
                    '<div class="clear"></div>'+
					'</div></li>'+

                    '<li class="k-state-active">Featers'+
					'<div>'+
					'<h4>Auto-Player</h4>'+
					'<div class="groupbg">'+
						'<div class="bgl" style="border-bottom: 1px dashed #ccc">'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="checkbox" name="audio" class="audio autoplayer" />autoplay</label>'+
						'</div>'+
					'</div>'+
					'<h4>Controls</h4>'+
					'<div class="groupbg">'+
						'<div class="bgl" style="border-bottom: 1px dashed #ccc">'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="checkbox" name="audio" class="audio controls" />controls</label>'+
						'</div>'+
					'</div>'+
					'<h4>Preload</h4>'+
					'<div class="groupbg">'+
						'<div class="bgl" style="border-bottom: 1px dashed #ccc">'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="radio" name="audioRadio" class="audio preload" />auto</label>'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="radio" name="audioRadio" class="audio preload" />meta</label>'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="radio" name="audioRadio" class="audio preload" />none</label>'+
						'</div>'+
					'</div>'+
					'<h4>Loop</h4>'+
					'<div class="groupbg">'+
						'<div class="bgl">'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="checkbox" name="audio" class="audio loop" />loop</label>'+
						'</div>'+
					'</div>'+
					'</div></li>'+commonCtrlPropStr+'</ul>'+
                '</div>'+commonStyleStr;

            $("#property-container").html(str);
            my.Utility.kendoInput($("#property-container").find(".kinput"));
			var btnBar = $('.btnBar').kendoPanelBar({
				expandMode: "multiple"
			}).data("kendoPanelBar");
			btnBar.wrapper.find('.k-content').css({'padding-bottom': '10px'});
            //value
            var valEl = $("#property-container").find("#value");
            valEl.val($targetObj.attr("_roleas_arg_src"));
            valEl.bind('focusin', function() {
                var ev = document.createEvent("HTMLEvents");
                ev.initEvent("dblclick", false, true);
                my.objManager.handleEvent("dblclick", $targetObj, ev);
                delete ev;
            });
			$("#property-container").find(".commom").css({
				width: '90%',
				height: '26px',
				border: '1px solid #dedede',
				'border-radius': '3px',
				outline: 'none'
			}).end().find('.audio').css({
				height: '26px',
				width: '26px',
				border: '1px solid #dedede',
				'border-radius': '3px',
				outline: 'none',
				'margin-left': '16px'
			}).end().find('h4').css({margin: '5px 5%'}).end().find('.groupbg').css({
				'text-align': 'center'
			});

			$('[name=audio]:checkbox').click(function() {
				if(this.checked && $(this).parent().text() == "autoplay") {
					$targetObj.attr("autoplay", "autoplay");
				}else if(!this.checked && $(this).parent().text() == "autoplay") {
					$targetObj.attr("autoplay", false);
				}else if(this.checked && $(this).parent().text() == "controls") {
					$targetObj.attr("controls", "controls");
				}else if(!this.checked && $(this).parent().text() == "controls") {
					$targetObj.attr("controls", false);
				}else if(this.checked && $(this).parent().text() == "loop") {
					$targetObj.attr("loop", "loop");
				}else if(!this.checked && $(this).parent().text() == "loop") {
					$targetObj.attr("loop", false);
				}else{
					return;
				}
				//$targetObj.attr($(this).parent().text(), this.checked ? $(this).parent().text() : $(this).parent().text()+"none");
			});
			$('[name=videoRadio]').click(function() {
				$targetObj.attr("reload", $(this).parent().text());
			});

            commonCtrlPropValueInit($targetObj, ctrltype);
        }
        else if( ctrltype == "VIDEOCTRL") {
            var str = '' +
                '<div id="content" style="min-width:100px;">'+
				'<ul class="btnBar">'+
					'<li class="k-state-active">Frequently'+
					'<div>'+
                '<h4>Src</h4>'+
                '<div class="group">'+
                //'<div class="l"><label></label></div>'+
                '<div class="r" style="width:90%;"><input id="value" class="rc kinput" /></div>'+
                '<div class="clear"></div>'+
                '</div>'+
                '<div class="clear"></div>'+
				'</div></li>' +

                '<li class="k-state-active">Featers'+
				'<div>'+
				'<h4>Auto-Player</h4>'+
					'<div class="groupbg">'+
						'<div class="bgl" style="border-bottom: 1px dashed #ccc">'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="checkbox" name="video" class="audio autoplayer" />autoplay</label>'+
						'</div>'+
					'</div>'+
				'<h4>Controls</h4>'+
					'<div class="groupbg">'+
						'<div class="bgl" style="border-bottom: 1px dashed #ccc">'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="checkbox" name="video" class="audio controls" />controls</label>'+
						'</div>'+
					'</div>'+
					'<h4>Preload</h4>'+
					'<div class="groupbg">'+
						'<div class="bgl" style="border-bottom: 1px dashed #ccc">'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="radio" name="videoRadio" class="audio preload" />auto</label>'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="radio" name="videoRadio" class="audio preload" />meta</label>'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="radio" name="videoRadio" class="audio preload" />none</label>'+
						'</div>'+
					'</div>'+
					'<h4>Loop</h4>'+
					'<div class="groupbg">'+
						'<div class="bgl">'+
						'<label style="display:block;text-align: center;'+
						'line-height: 26px;display: table-cell;text-align: center;line-height: 26px;'+
						'vertical-align: top;"><input type="checkbox" name="video" class="audio loop" />loop</label>'+
						'</div>'+
					'</div>'+
				'</div></li>'+commonCtrlPropStr+'</ul>'+
                '</div>'+commonStyleStr;

            $("#property-container").html(str);
            my.Utility.kendoInput($("#property-container").find(".kinput"));
			var btnBar = $('.btnBar').kendoPanelBar({
				expandMode: "multiple"
			}).data("kendoPanelBar");
			btnBar.wrapper.find('.k-content').css({'padding-bottom': '10px'});
            //value
            var valEl = $("#property-container").find("#value");
            valEl.val($targetObj.attr("_roleas_arg_src"));
            valEl.bind('focusin', function() {
                var ev = document.createEvent("HTMLEvents");
                ev.initEvent("dblclick", false, true);
                my.objManager.handleEvent("dblclick", $targetObj, ev);
                delete ev;
            });
			$("#property-container").find(".commom").css({
				width: '90%',
				height: '26px',
				border: '1px solid #dedede',
				'border-radius': '3px',
				outline: 'none'
			}).end().find('.audio').css({
				height: '26px',
				width: '26px',
				border: '1px solid #dedede',
				'border-radius': '3px',
				outline: 'none',
				'margin-left': '16px'
			}).end().find('h4').css({margin: '5px 5%'}).end().find('.groupbg').css({
				'text-align': 'center'
			});

			$('[name=video]:checkbox').click(function() {
				if(this.checked && $(this).parent().text() == "autoplay") {
					$targetObj.attr("autoplay", "autoplay");
				}else if(!this.checked && $(this).parent().text() == "autoplay") {
					$targetObj.attr("autoplay", false);
				}else if(this.checked && $(this).parent().text() == "controls") {
					$targetObj.attr("controls", "controls");
				}else if(!this.checked && $(this).parent().text() == "controls") {
					$targetObj.attr("controls", false);
				}else if(this.checked && $(this).parent().text() == "loop") {
					$targetObj.attr("loop", "loop");
				}else if(!this.checked && $(this).parent().text() == "loop") {
					$targetObj.attr("loop", false);
				}else{
					return;
				}
				//$targetObj.attr($(this).parent().text(), this.checked ? $(this).parent().text() : $(this).parent().text()+"none");
			});
			$('[name=videoRadio]').click(function() {
				$targetObj.attr("reload", $(this).parent().text());
			});

            commonCtrlPropValueInit($targetObj, ctrltype);
        }
        else if( ctrltype == "QRCODECTRL") {
            var str = '' +
                '<div id="content" style="min-width:100px;">'+
				'<ul class="btnBar">'+
					'<li class="k-state-active">Frequently'+
					'<div>'+
                    '<h4>Value</h4>'+
                    '<div class="group">'+
                        //'<div class="l"><label></label></div>'+
                        '<div class="r" style="width:90%"><textarea id="value" class="rc k-textbox" rows="3" cols="20"></textarea></div>'+
                        '<div class="clear"></div>'+
                    '</div>'+

                    '<h4>Options</h4>'+
                    '<div class="group">'+
                        '<div class="l"><label>Error correction level:</label></div>'+
                        '<div class="r">'+
                            '<select id="errorCorrection">'+
                                '<option value="L">L</option>'+
                                '<option value="M">M</option>'+
                                '<option value="Q">Q</option>'+
                                '<option value="H">H</option>'+
                            '</select>'+
                        '</div>'+
                        '<div class="l"><label>Encoding:</label></div>'+
                        '<div class="r">'+
                            '<select id="encoding">'+
                                '<option value="ISO_8859_1">ISO_8859_1</option>'+
                                '<option value="UTF_8">UTF_8</option>'+
                            '</select>'+
                        '</div>'+
                        '<div class="l"><label>Size:</label></div>'+
                        '<div class="r"><input id="size" type="text" class="rc" /></div>'+
                        '<div class="l"><label>Border width:</label></div>'+
                        '<div class="r"><input id="borderwidth" type="text" class="rc"/></div>'+
                        '<div class="clear"></div>'+
                    '</div>'+

                    '<h4>Colors</h4>'+
                    '<div class="group">'+
                        '<div class="l"><label>Border color:</label></div>'+
                        '<div class="r"><input id="bordercolor" class="rc"></div>'+
                        '<div class="l"><label>Background color:</label></div>'+
                        '<div class="r"><input id="bkgcolor" class="rc"></div>'+
                        '<div class="l"><label>Module color:</label></div>'+
                        '<div class="r"><input id="modcolor" class="rc"></div>'+
                        '<div class="clear"></div>'+
                    '</div>'+
					'</div></li>'+commonCtrlPropStr+'</ul>'+
                '</div>'+commonStyleStr;

            $("#property-container").html(str);
			var btnBar = $('.btnBar').kendoPanelBar({
				expandMode: "multiple"
			}).data("kendoPanelBar");
			btnBar.wrapper.find('.k-content').css({'padding-bottom': '10px'});
            //value
            var val = $targetObj.attr("_roleas_arg_value");
            var valEl = $("#property-container").find("#value");
            valEl.val(val);
            valEl.bind('change', function() {
                $targetObj.attr("_roleas_arg_value", $(this).val());
                my.ImgActAs.ActAsQRCode($targetObj);
            });
			$("#property-container").find(".commom").css({
				width: '90%',
				height: '26px',
				border: '1px solid #dedede',
				'border-radius': '3px',
				outline: 'none'
			}).end().find('h4').css({margin: '5px 5%'}).end().find('.groupbg').css({'text-align': 'center'});
            //errorCorrection
            var errEl = $("#property-container").find("#errorCorrection");
            errEl.kendoDropDownList();
            var errddl = errEl.data("kendoDropDownList");
            errddl.select(function(dataItem) {
                return dataItem.text === $targetObj.attr("_roleas_arg_errorCorrection");
            });
            errddl.bind("change", function(e) {
                $targetObj.attr("_roleas_arg_errorCorrection", this.value());
                my.ImgActAs.ActAsQRCode($targetObj);
            });

            //encoding
            var encEl = $("#property-container").find("#encoding");
            encEl.kendoDropDownList();
            var encddl = encEl.data("kendoDropDownList");
            encddl.select(function(dataItem) {
                return dataItem.text === $targetObj.attr("_roleas_arg_encoding");
            });
            encddl.bind("change", function(e) {
                $targetObj.attr("_roleas_arg_encoding", this.value());
                my.ImgActAs.ActAsQRCode($targetObj);
            });

            //size
            var szEl = $("#property-container").find("#size");
            szEl.kendoNumericTextBox( {min: 50, max:2000, step:1 });
            var sznum = szEl.data("kendoNumericTextBox");
            sznum.value(parseInt($targetObj.attr("_roleas_arg_size")));
            var onSzChange = function() {
                $targetObj.parent("div").css({width:this.value(), height:this.value()});
                $targetObj.css({width:this.value(), height:this.value()});
                $targetObj.attr("_roleas_arg_size", this.value());
                my.ImgActAs.ActAsQRCode($targetObj);
            };
            sznum.bind("change", onSzChange);
            sznum.bind("spin", onSzChange);

            //border width
            var bwEl = $("#property-container").find("#borderwidth");
            bwEl.kendoNumericTextBox( {min: 0, max:10, step:1 });
            var bwnum = bwEl.data("kendoNumericTextBox");
            bwnum.value(parseInt($targetObj.attr("_roleas_arg_border_width")));
            var onBwChange = function() {
                $targetObj.attr("_roleas_arg_border_width", this.value());
                my.ImgActAs.ActAsQRCode($targetObj);
            };
            bwnum.bind("change", onBwChange);
            bwnum.bind("spin", onBwChange);

            //border color
            var brEl = $("#property-container").find("#bordercolor");
            var bdclr = brEl.kendoColorPicker({
                toolIcon: "k-foreColor"
            }).data("kendoColorPicker");
            bdclr.value($targetObj.attr("_roleas_arg_border_color"));
            bdclr.bind("change", function() {
                $targetObj.attr("_roleas_arg_border_color", this.value());
                my.ImgActAs.ActAsQRCode($targetObj);
            });

            //background color
            var bkgEl = $("#property-container").find("#bkgcolor");
            var bkgclr = bkgEl.kendoColorPicker({
                toolIcon: "k-foreColor"
            }).data("kendoColorPicker");
            bkgclr.value($targetObj.attr("_roleas_arg_bkg_color"));
            bkgclr.bind("change", function() {
                $targetObj.attr("_roleas_arg_bkg_color", this.value());
                my.ImgActAs.ActAsQRCode($targetObj);
            });

            //module color
            var clrEl = $("#property-container").find("#modcolor");
            var modclr = clrEl.kendoColorPicker({
                toolIcon: "k-foreColor"
            }).data("kendoColorPicker");
            modclr.value($targetObj.attr("_roleas_arg_color"));
            modclr.bind("change", function() {
                $targetObj.attr("_roleas_arg_color", this.value());
                my.ImgActAs.ActAsQRCode($targetObj);
            });

            commonCtrlPropValueInit($targetObj, ctrltype);
        }
        else if( ctrltype == "BARCODECTRL") {
            var str = '' +
                '<div id="content" style="min-width:100px;">'+
				'<ul class="btnBar">'+
					'<li class="k-state-active">Frequently'+
					'<div>'+
                    '<h4>Value</h4>'+
                    '<div class="group">'+
                        //'<div class="l"><label></label></div>'+
                        '<div class="r" style="width:90%;"><input id="value" class="rc" /><span id="errmsg" style="color:#ff0000"></span></div>'+
                        '<div class="clear"></div>'+
                    '</div>'+
                    '<h4>Options</h4>'+
                    '<div class="group">'+
                        '<div class="l"><label>Encoding:</label></div>'+
                        '<div class="r"><input  id="encoding" /></div>'+
                        '<div class="l"><label>Show Text:</label></div>'+
                        '<div class="r"><input type="checkbox" id="text" checked="checked"/></div>'+
                        '<div class="clear"></div>'+
                    '</div>'+
					'</div></li>'+commonCtrlPropStr+'</ul>'+
                '</div>'+commonStyleStr;

            $("#property-container").html(str);
            $("#property-container").find('#encoding').kendoDropDownList({
                dataSource: [
                    { type: 'EAN8', value: "1234567" },
                    { type: 'EAN13', value: "123456789987" },
                    { type: 'UPCE', value: "123456" },
                    { type: 'UPCA', value: "12345678998" },
                    { type: 'Code11', value: "1234567" },
                    { type: 'Code39', value: "HELLO" },
                    { type: 'Code39Extended', value: "Hi!" },
                    { type: 'Code128', value: "Hello World!" },
                    { type: 'Code93', value: "HELLO" },
                    { type: 'Code93Extended', value: "Hello" },
                    { type: 'Code128A', value: "HELLO" },
                    { type: 'Code128B', value: "Hello" },
                    { type: 'Code128C', value: "123456" },
                    { type: 'MSImod10', value: "1234567" },
                    { type: 'MSImod11', value: "1234567" },
                    { type: 'MSImod1010', value: "1234567" },
                    { type: 'MSImod1110', value: "1234567" },
                    { type: 'GS1-128', value: "12123456" },
                    { type: 'POSTNET', value: "12345" }
                ],
                dataTextField: "type",
                dataValueField: "type"
            });

            //value
            var valEl = $("#property-container").find("#value");
            valEl.val($targetObj.attr("_roleas_arg_value"));
            valEl.bind('change', function() {
                try {
                    $targetObj.attr("_roleas_arg_value", $(this).val());
                    my.ImgActAs.ActAsBarcode($targetObj);
                } catch (e) {
                    $("#property-container").find("#errmsg").text(e.message);
                }
            });
			$("#property-container").find(".commom").css({
				width: '90%',
				height: '26px',
				border: '1px solid #dedede',
				'border-radius': '3px',
				outline: 'none'
			}).end().find('h4').css({margin: '5px 5%'}).end().find('.groupbg').css({'text-align': 'center'});
            //Encoding
            var encEl = $("#property-container").find("#encoding");
            var encddl = encEl.data("kendoDropDownList");
            encddl.select(function(dataItem) {
                return dataItem.type == $targetObj.attr("_roleas_arg_encoding");
            });
            encddl.bind("change", function(e) {
                //every encoding has a different value format
                valEl.val(this.dataItem().value);
                $targetObj.attr("_roleas_arg_value", this.dataItem().value);

                $targetObj.attr("_roleas_arg_encoding", this.dataItem().type);
                my.ImgActAs.ActAsBarcode($targetObj);
                $("#property-container").find("#errmsg").text('');
            });
			var btnBar = $('.btnBar').kendoPanelBar({
				expandMode: "multiple"
			}).data("kendoPanelBar");
			btnBar.wrapper.find('.k-content').css({'padding-bottom': '10px'});
            //Show Text
            var showtxtEl = $("#property-container").find("#text");
            var onoff = $targetObj.attr("_roleas_arg_showtext");
            if(eval(onoff)) {
                showtxtEl.attr('checked', 'checked');
            }
            else {
                showtxtEl.removeAttr('checked');
            }
            showtxtEl.bind("change", function(e) {
                $targetObj.attr("_roleas_arg_showtext", $("#property-container").find("#text").is(':checked'));
                my.ImgActAs.ActAsBarcode($targetObj);
            });
            commonCtrlPropValueInit($targetObj, ctrltype);
        }
        else if( ctrltype == "HOTAREA") {
            var str = '' +
                '<div id="content" style="min-width:100px;">'+
				'<ul class="btnBar">'+
					'<li class="k-state-active">Frequently'+
					'<div>'+
                '<h4>Href</h4>'+
                '<div class="group">'+
                //'<div class="l"><label></label></div>'+
                '<div class="r" style="width:90%;"><input id="value" class="rc kinput" /></div>'+
                '<div class="clear"></div>'+
                '</div>'+
                '<div class="clear"></div>'+
				'</div></li></ul>'+
                '</div>'+commonStyleStr;

            $("#property-container").html(str);
            my.Utility.kendoInput($("#property-container").find(".kinput"));
			var btnBar = $('.btnBar').kendoPanelBar({
				expandMode: "multiple"
			}).data("kendoPanelBar");
			btnBar.wrapper.find('.k-content').css({'padding-bottom': '10px'});
            //value
            var valEl = $("#property-container").find("#value");
            valEl.val($targetObj.attr("href"));
            /*valEl.bind('focusin', function() {
                var res = eval('(' + EditorProxy.GetResourcesJsonString("mp4") + ')'); //JSON.parse( EditorProxy.GetResourcesJsonString() );
                var data = { data: res };
                my.imgSelectionWng.treeView.setDataSource(new kendo.data.HierarchicalDataSource(data));
                my.imgSelectionWng.open();
            });*/
			$("#property-container").find(".commom").css({
				width: '90%',
				height: '26px',
				border: '1px solid #dedede',
				'border-radius': '3px',
				outline: 'none'
			}).end().find('h4').css({margin: '5px 5%'}).end().find('.groupbg').css({'text-align': 'center'});
            valEl.bind('change', function() {
                $targetObj.attr("href", valEl.val());
            });
        }
        else {
            var str = '' +
                '<div id="content" style="min-width:100px;">'+
                    '<h4>Background</h4>'+
                    '<div class="group" id="background">'+
                        '<div class="l"><label>color:</label></div>'+
                        '<div class="r"><input id="color" type="text" class="rc" /></div>'+
                        '<div class="l"><label>image:</label></div>'+
                        '<div class="r"><input id="image" type="text" class="rc kinput" /></div>'+
                        '<div class="clear"></div>'+
                    '</div>'+
                    '<h4>Font family</h4>'+
                    '<div class="group" id="font">'+
                        '<div class="l"><label>name:</label></div>'+
                        '<div class="r"><input id="name" type="text" class="rc kinput" /></div>'+
                        '<div class="l"><label>size:</label></div>'+
                        '<div class="r"><input id="size" type="text" class="rc kinput" /></div>'+
                        '<div class="clear"></div>'+
                    '</div>'+
                commonStyleStr;

            $("#property-container").html(str);
            my.Utility.kendoInput($("#property-container").find(".kinput"));

            //background
            (function() {
                //color
                var $i = $("#property-container").find("#background").find("#color");
                var bkgclr = $i.kendoColorPicker({
                    toolIcon: "k-foreColor"
                }).data("kendoColorPicker");
                bkgclr.value($("#default-editor").css("background-color"));
                bkgclr.bind("change", function() {
                    $("#default-editor").css("background-color", bkgclr.value());
                });

                //img
                var $i = $("#property-container").find("#image");
                $i.val($("#default-editor").css("background-image"));
                $i.bind('focusin', function() {
                    my.objManager.edittingObj = $("#default-editor");
                    var res = eval('(' + EditorProxy.GetResourcesJsonString("png|jpg|jpeg") + ')'); //JSON.parse( EditorProxy.GetResourcesJsonString() );
                    var data = { data: res };
                    my._resourceSelectionWindow.$url.val($("#default-editor").css("background-image"));
                    my._resourceSelectionWindow._treeView.setDataSource(new kendo.data.HierarchicalDataSource(data));
                    my._resourceSelectionWindow.open();
                });
                /*var btnBar = $('.btnBar').kendoPanelBar({
                    expandMode: "multiple"
                }).data("kendoPanelBar");
                btnBar.wrapper.find('.k-content').css({'padding-bottom': '10px'});*/
            }());
        }
    }

    window.WysiwygApp = my;
    return my;
} (WysiwygApp || {}));