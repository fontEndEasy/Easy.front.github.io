(function (my, app) {
    app.designPanel = my;
    my.initialize = function() {
        (function _initEditor() {
            $("#default-editor").kendoEditor({
                tools: [
                    {
                        name: "customTemplate",
                        template: "<select id='templateTool' style='width:90px'>"+
                            "<option value='Flow'>Flow</option>"+
                            "<option value='Absolute'>Absolute</option>"+
                            "</select>"
                    },
                    "bold", "italic", "underline", "strikethrough", "justifyLeft",
                    "justifyCenter", "justifyRight", "justifyFull", "insertUnorderedList",
                    "insertOrderedList", "indent", "outdent", "createLink", "unlink",
                    "subscript", "superscript", "createTable", "addRowAbove", "addRowBelow",
                    "addColumnLeft", "addColumnRight", "deleteRow", "deleteColumn", "viewHtml",
                    "formatting", "fontName", "fontSize", "foreColor", "backColor",
                    {
                        name: "Special characters",
                        template: '<input id="specchar" type="button" value="Special characters ..." style="width:150px;height:28px;" />'
                        //template: '<span id="specchar" class="k-picker-wrap k-state-default" style="width:72px; height:28px;"><span>spec</span><span class="k-select" unselectable="on"><span class="k-icon k-i-arrow-s" unselectable="on"></span></span></span>'
                    }
                ],
                paste: function(e) {
                    app.objManager.handleEvent("paste", e.html, e);
                }
            }).unbind('focusout').click(function (event) {
                app.menuManager.hideAll();
                if(app.objManager.handleEvent("click", $(event.target), event)) {
                    app.switchProperties($("#default-editor"));
                }
                return false;
            }).dblclick(function (event) {
                app.menuManager.hideAll();
                if(app.objManager.handleEvent("dblclick", $(event.target), event)) {
                    app.switchProperties($("#default-editor"));
                }
                return false;
            }).bind("keydown", function(e) {
                if(app.objManager.getSelected().length > 0) {
                    app.objManager.handleEvent("keydown", $(event.target), e);
                }
                if(e.keyCode == 13) { //enter key
                    app.onDesignChange();
                }
            }).unbind('focusin').css({border: 0});
        }());
		
        (function _initEditorToolbar() {
            $('.k-window-content, .editorToolbarWindow').css({
                'border-radius': 0,
                '-webkit-border-radius': 0
            });
            $('.k-window-titleless').appendTo('#toolbar').css({
                display: 'block',
                position: 'absolute',
                left: '0px',
                top: '0px',
                width: '100%',
                '-webkit-box-shadow': 'none'
            });
            $('.k-window-titleless .k-editortoolbar-dragHandle').remove();
            $("#toolbar").find("#templateTool").kendoDropDownList();
            $("#toolbar").find("#specchar").kendoButton();
            $("#toolbar").find("#specchar").bind('click', function(e){
                $('body').find('.qualItems').remove();
                $('body').append('<div class="qualItems" style="position: absolute;">'+
                        '<table cellspacing="0" cellpadding="0" border="1" style="border-color: #DBDBDE;width: 100%;height: 100%;border-collapse: collapse;">'+
                        '<tr><td>&iexcl;</td><td>&cent;</td><td>&pound;</td><td>&curren;</td><td>&yen;</td><td>&brvbar;</td><td>&sect;</td><td>&copy;</td><td>&ordf;</td><td>&laquo;</td></tr>'+
                        '<tr><td>&not;</td><td>&reg;</td><td>&deg;</td><td>&plusmn;</td><td>&sup2;</td><td>&sup3;</td><td>&micro;</td><td>&para;</td><td>&ordm;</td><td>&raquo;</td></tr>'+
                        '<tr><td>&frac14;</td><td>&frac12;</td><td>&frac34;</td><td>&iquest;</td><td>&times;</td><td>&divide;</td><td>&Agrave;</td><td>&Aacute;</td><td>&ETH;</td><td>&Ntilde;</td></tr>'+
                        '<tr><td>&Acirc;</td><td>&Atilde;</td><td>&Auml;</td><td>&Aring;</td><td>&AElig;</td><td>&Ccedil;</td><td>&Egrave;</td><td>&Eacute;</td><td>&Ecirc;</td><td>&Euml;</td></tr>'+
                        '<tr><td>&Igrave;</td><td>&Iacute;</td><td>&Icirc;</td><td>&Iuml;</td><td>&Ograve;</td><td>&Oacute;</td><td>&Ocirc;</td><td>&Otilde;</td><td>&Ouml;</td><td>&Oslash;</td></tr>'+
                        '<tr><td>&Ugrave;</td><td>&Uacute;</td><td>&Ucirc;</td><td>&Uuml;</td><td>&Yacute;</td><td>&THORN;</td><td>&szlig;</td><td>&agrave;</td><td>&aacute;</td><td>&acirc;</td></tr>'+
                        '<tr><td>&atilde;</td><td>&auml;</td><td>&aring;</td><td>&aelig;</td><td>&ccedil;</td><td>&egrave;</td><td>&eacute;</td><td>&ecirc;</td><td>&euml;</td><td>&igrave;</td></tr>'+
                        '<tr><td>&iacute;</td><td>&icirc;</td><td>&iuml;</td><td>&eth;</td><td>&ntilde;</td><td>&ograve;</td><td>&oacute;</td><td>&ocirc;</td><td>&otilde;</td><td>&ouml;</td></tr>'+
                        '<tr><td>&oslash;</td><td>&ugrave;</td><td>&uacute;</td><td>&ucirc;</td><td>&uuml;</td><td>&yacute;</td><td>&thorn;</td><td>&yuml;</td><td>&forall;</td><td>&part;</td></tr>'+
                        '<tr><td>&radic;</td><td>&empty;</td><td>&nabla;</td><td>&isin;</td><td>&notin;</td><td>&ni;</td><td>&prod;</td><td>&sum;</td><td>&minus;</td><td>&lowast;</td></tr>'+
                        '<tr><td>&prop;</td><td>&infin;</td><td>&ang;</td><td>&and;</td><td>&or;</td><td>&cap;</td><td>&cup;</td><td>&int;</td><td>&there4;</td><td>&sim;</td></tr>'+
                        '<tr><td>&cong;</td><td>&asymp;</td><td>&ne;</td><td>&equiv;</td><td>&le;</td><td>&ge;</td><td>&sub;</td><td>&sup;</td><td>&nsub;</td><td>&sube;</td></tr>'+
                        '<tr><td>&supe;</td><td>&oplus;</td><td>&otimes;</td><td>&perp;</td><td>&OElig;</td><td>&oelig;</td><td>&Scaron;</td><td>&scaron;</td><td>&Yuml;</td><td>&fnof;</td></tr>'+
                        '</table></div>').show().end().find('.qualItems').css({
                    top: $("#specchar").offset().top + $("#specchar").height() + 8 + 'px',
                    left: $("#specchar").offset().left + 'px',
                    background: '#FFF',
                    'z-index': 99999,
                    'box-shadow': '0 0 10px rgba(0,0,0,0.2)'
                }).find('td').css({cursor: 'pointer', 'text-align': 'center', width: '26px', height: '26px', overflow: 'hidden','font-family': 'Microsoft yahei'}).hover(function(){
                    $(this).css({
                        '-webkit-transform': 'scale(1.6)',
                        '-webkit-transition': '-webkit-transform .2s ease'
                    });
                },function() {
                    $(this).css({
                        '-webkit-transform': 'scale(1)',
                        '-webkit-transition': '-webkit-transform .2s ease'
                    });
                }).bind('click', function() {
                    var _tdText = $(this).text();
                    //console.dir(_tdText);
                    var _kendoeditor = $("#default-editor").data("kendoEditor");
                    _kendoeditor.exec('insertHtml',{ value: _tdText });
                });
                $(document).on('click', function(e) {
                    var _tg = e.target;
                    if($(_tg).is(':not("#specchar")')) {
                        $('.qualItems').hide();
                    }
                });
            });

            $('#default-editor').on('click', function() {
                $('.qualItems').hide();
            })
        }());

        (function _initRuler() {
            if(EditorProxy.IsShowRuler()) {
                my.setRuler(EditorProxy.GetRulerUnitType());
            }else{
                my.showRuler(false);
            }
            $('#ruler-top, #ruler-left').bind('contextmenu', my._onRulerContextMenu);
            $("#design-panel").bind('mousemove', my._onMouseMove);
            $(document).on('keyup', function(e) {
                if(e.which == 82 && e.ctrlKey && e.altKey) {
                    my.showRuler(!my.isRulerShowing());
                }
            });
            $("#design-panel").bind("click", function() {
                $("#ruler-menu").hide();
            });
            $('#default-editor').on('click', function() {
                $("#ruler-menu").hide();
            });
            $('#default-editor').bind('contextmenu', function() {
                $("#ruler-menu").hide();
            });
            $('#default-editor').bind('scroll', my._onContentScroll);
        }());

        $('#default-editor').bind('input propertychange', app.onDesignChange); //能监控到回车、和系统的cut、paste，但右键菜单的cut、paste和ctrl+z、ctrl+y监控不到
        $('#code-panel').bind('input propertychange', app.onSourceChange);

        app.kendoEditor = $("#default-editor").data('kendoEditor');
        app.initObjManager(app.kendoEditor);

        app.resizeDesignPanel();
    };

    my.isRulerShowing = function() {
        return $("#ruler-origin").css("display") === "block";
    };

    my.showRuler = function(show) {
        if(show === true) {
            if(my.isRulerShowing() === false) {
                $("#ruler-origin, #ruler-left, #ruler-top").show();
                $('#design-panel').css({
                    marginTop: '18px',
                    marginLeft: '18px'
                });
                $('#default-editor').bind('mousemove', WysiwygApp.onMouseMoveForRuler); //temporary optimize performance
                WysiwygApp.resizeDesignPanel();
            }
        }
        else {
            if(my.isRulerShowing() === true) {
                $("#ruler-origin, #ruler-left, #ruler-top").hide();

                $('#design-panel').css({
                    marginTop:2,
                    marginLeft: 0
                });

                $('#default-editor').unbind('mousemove'); //temporary optimize performance
                WysiwygApp.resizeDesignPanel();
            }
        }
    };

    my.setRuler = function(unit) {
        EditorProxy.SetRulerUnitType(unit);
        function _fn(img1, img2, num) {
            $("#ruler-left, #ruler-top").empty();

            var img1 = EditorProxy.GetWysiwygBasePath()+"/wysiwyg/images/"+img1;
            var img2 = EditorProxy.GetWysiwygBasePath()+"/wysiwyg/images/"+img2;
            $( '#ruler-top' ).css({
                background: 'url('+img1+') repeat-x'
            });
            $( '#ruler-left' ).css({
                background: 'url('+img2+') repeat-y'
            });
            my._updateRulerText();
        }
        if(unit === "px") {
            _fn("ruler_h.png", "ruler_v.png", 50);
        }
        else if(unit === 'in') {
            _fn("inch_h.png", "inch_v.png", 100);
        }
        else{
            _fn("limi_h.png", "limi_v.png", 80);
        }
    };

    my._onRulerContextMenu = function(e) {
        e.stopPropagation();
        e.preventDefault();

        var _onMenuOfUnitType = function(e) {
            var _fn = function($obj, unit) {
                my.setRuler(unit);
                $("#ruler-menu li").find("input[type=checkbox]").hide();
                $obj.find("input[type=checkbox]").prop("checked", true).show();
                $obj.parent().hide();
            };

            var tg = $(this).find('span').text();
            if($(this).find('span').text() == '像素') {
                _fn($(this), "px");
            }else if($(this).find('span').text() == '英寸'){
                _fn($(this), "in");
            }else{
                _fn($(this), "cm");
            }
        };

        WysiwygApp.menuManager.hideAll();
        $("body").find("#ruler-menu").remove();

        var menuStr = ''+
            '<ul id="ruler-menu">' +
            '    <li><input type="checkbox" /><span>像素</span></li>' +
            '    <li><input type="checkbox" /><span>英寸</span></li>' +
            '    <li><input type="checkbox" /><span>厘米</span></li>' +
            '    <li style="text-align: center;"><span>隐藏标尺</span><i>(H)</i></li>' +
            '</ul>';

        //$('<ul class="gridMenu"><li><input type="checkbox" id="lia" />像素</li><li>英寸</li><li>厘米</li><li>隐藏标尺</li><li>隐藏网格</li><li>显示网格</li><li>设置网格</li><li>重置原点</li></ul>').appendTo('body').show().css({
        //$('<ul class="gridMenu"><li><input type="checkbox" /><span>像素</span></li><li><input type="checkbox" /><span>英寸</span></li><li><input type="checkbox" /><span>厘米</span></li><li style="text-align: center;"><span>隐藏标尺</span><i>(H)</i></li><li style="text-align: center;"><span>隐藏网格</span><i>(S)</i></li><li style="text-align: center;"><span>显示网格</span><i>(G)</i></li><li style="text-align: center;"><span>设置网格</span><i>(T)</i></li></ul>').appendTo('body').show().css({
        $(menuStr).appendTo('body').show().css({
            left: e.clientX + 'px',
            top: e.clientY + 'px'
        }).end().find('i').css({
            'font-style': 'normal'
        }).end().find('li:lt(3)').css({
            height: '25px',
            lineHeight: '25px',
            textAlign: 'left',
            fontFamily: 'Microsoft yahei',
            position: 'relative',
            'text-indent': '2.1em'
        }).end().find('input[type=checkbox]').css({
            'position': 'absolute',
            width: '18px',
            height: '18px',
            top: '1px',
            left: '1px',
            display: 'none'
        }).end().find('li:lt(3)').on('click', _onMenuOfUnitType).end().find('li:gt(2)').css({
            height: '25px',
            lineHeight: '25px',
            textAlign: 'center',
            fontFamily: 'Microsoft yahei',
            position: 'relative'
        }).end().find('li').hover(function() {
            $(this).css({
                'border-radius': '3px',
                border: '1px solid #C5C9C8',
                'box-shadow': '0 0 5px #C5C9C8'
            })
        }, function() {
            $(this).css({
                'border-radius': 0,
                border: '0px solid #C5C9C8',
                'box-shadow': '0 0 0px #C5C9C8'
            })
        }).end().find('li:gt(2)').on('click', function(e) {
            console.dir($(e.target));
            var tg = $(e.target).find('span').text() || $(e.target).parent().find('span').text();
            console.dir(tg);
            //console.dir(tg);
            if(tg == '设置网格') {
            }else if(tg == '隐藏网格') {
            }else if(tg == '显示网格'){
            }else if(tg == '重置原点') {
            }else {
                my.showRuler(false);
                $(this).parent().hide();
            }
        });

        if(EditorProxy.IsShowRuler()) {
            if(EditorProxy.GetRulerUnitType() == 'px') {
                $("#ruler-menu li").eq(0).find('input').attr('checked', true).show();
            }else if(EditorProxy.GetRulerUnitType() == 'in') {
                $("#ruler-menu li").eq(1).find('input').attr('checked', true).show();
            }else{
                $("#ruler-menu li").eq(2).find('input').attr('checked', true).show();
            }
        }else{
            $("#ruler-menu li").find('input').hide();
        }
    };

    my._onMouseMove = function(e) {
        var _line_left = /*e.clientX; //*/e.clientX + $("#default-editor").scrollLeft() - 18;
        var _line_top = /*e.clientY; //*/e.clientY + $("#default-editor").scrollTop() - $("#toolbar").height() - 18;
        $('.top-line,.left-line').remove();
        $('<span class="top-line"></span>').appendTo('#ruler-top').css({
            display: 'block',
            height: '18px',
            'border-right': '1px dashed #000',
            position: 'absolute',
            left: _line_left + 'px'
        });
        $('<span class="left-line"></span>').appendTo('#ruler-left').css({
            display: 'block',
            width: '18px',
            'border-top': '1px dashed #000',
            position: 'absolute',
            top: _line_top + 'px'
        });
    };

    my._onContentScroll = function(e) {
        (function offsetRuler(that) {
            var scrollLeft = that.scrollLeft();
            var scrollTop = that.scrollTop();
            $('#ruler-top').css({left: -scrollLeft + 'px'});
            $('#ruler-left').css({top: -scrollTop + 'px'});
            my._updateRulerText();
        }($(this)));
    };

    my.updateRuler = function() {
        var w = $("#default-editor").get(0).scrollWidth;
        var h = $("#default-editor").get(0).scrollHeight;
        if(w < $("#design-panel").width()) {
            w = $("#design-panel").width();
        }
        if(h < $("#design-panel").height()) {
            h = $("#design-panel").height();
        }

        //fix bug: after SetSolution(480, 320)'s issue
        w += $("#design-panel").width();
        h += $("#design-panel").width();
        //end

        if($("#ruler-top").width() != w
            || $("#ruler-left").height() != h) {
            console.dir("update ruler");
            $('#ruler-top').css("width", w+"px");
            $('#ruler-left').css("height", h+"px");
            my._updateRulerText();
        }
    };
   

    my._updateRulerText = function() {
        $("#ruler-top, #ruler-left").empty();

        var _a = EditorProxy.GetRulerUnitType();
        var _b = (_a === "px") ? 50 : ((_a === "in") ? 96 : 76);
        var _c = (_a === "px") ? 50 : ((_a === "in") ? 1 : 2);

        var w, h, n1, n2, fragment1 = document.createDocumentFragment(), fragment2 = document.createDocumentFragment();          
            w  = ( $('#default-editor').scrollLeft() + $('#design-panel').width() );
            h = ( $('#default-editor').scrollTop() + $('#design-panel').height() );
			n1 = Math.ceil( w / _b );
        	n2 = Math.ceil( h / _b );
        for(var i=0; i < n1; i++){
            var item = document.createElement( 'span' );
            fragment1.appendChild( item );
            item.id = 'stnum' + i;
            $(item).css({
                position: 'absolute',
                left: ( i * _b ) + 2 + 'px',
                'font-weight': 'normal',
                'font-family': 'arial'
            });
            item.appendChild(document.createTextNode( i * _c ));
        }
        $( '#ruler-top' ).append( fragment1 );

        for(var i=0; i < n2; i++) {
            var iteml = document.createElement( 'span' );
            fragment2.appendChild( iteml );
            iteml.id = 'slnum' + i;
            $(iteml).css({
                position: 'absolute',
                top: (i * _b) + 2 + 'px',
                'font-weight': 'normal',
                'font-family': 'arial',
                display: 'inline-block',
                width: '8px',
                right: '5px',
                lineHeight: '12px'
            });
            iteml.appendChild(document.createTextNode( i * _c ));
        }
        $('#ruler-left').append( fragment2 );
    };

} (WysiwygApp.designPanel || {}, WysiwygApp));