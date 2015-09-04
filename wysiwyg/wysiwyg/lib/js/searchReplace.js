var WysiwygApp = (function (app) {
    app.initSearchReplace = function(gKendoEditor) {
        try {
            rangy.init();
        }
        catch(e) {
            console.dir(e.message);
        }

        $("head").append(
            '<style type="text/css">'+
                '*.search-highlight {'+
                'font-weight: bold;'+
                'background-color: yellow;'+
            '}'+
            '</style>');

        app.searchReplace = (function(my) {
            my.searchScopeRange = null;
            my.searchHighlightApplier = rangy.createClassApplier("search-highlight");

            my.findAll = function(searchTerm, replace, caseSensitive, wholeWordsOnly, targetNode) {
            	if(typeof caseSensitive !== "boolean") {
                    caseSensitive = true;
                }
                if(typeof wholeWordsOnly !== "boolean") {
                    wholeWordsOnly = true;
                }
            	$("#default-editor").find("b[rel='mark']").each(function() {
					var text = document.createTextNode($(this).text());	
					$(this).replaceWith($(text));
					
				});
                var regx = new RegExp(searchTerm,"g");
                var edit = $('#default-editor');
                var text = edit.html();
                var nText;
                console.dir(text);
                if(replace){
            		nText = text.replace(regx, replace);
            		edit.html(nText);	
                }else{
                	nText = text.replace(regx, '<b rel="mark" style="background:yellow;color: #900;">' + searchTerm + '</b>');
                	edit.html(nText);
                }
				
            	/*
                if(typeof caseSensitive !== "boolean") {
                    caseSensitive = true;
                }
                if(typeof wholeWordsOnly !== "boolean") {
                    wholeWordsOnly = true;
                }
                if(typeof targetNode == "undefined") {
                    targetNode = document.getElementById("default-editor");
                }

                var searchScopeRange = rangy.createRange();
                searchScopeRange.selectNodeContents(targetNode);
                my.searchScopeRange = searchScopeRange;

                var options = {
                    caseSensitive: caseSensitive,
                    wholeWordsOnly: wholeWordsOnly,
                    withinRange: searchScopeRange,
                    direction: "forward"
                };

                var range = rangy.createRange();
                range.selectNodeContents(targetNode);

                //cancel all search result first
                my.searchHighlightApplier.undoToRange(range);

                // Iterate over matches
                var count = 0;
                while (range.findText(searchTerm, options)) {
                    if(typeof replace === "string") {
                        app.kendoEditor.selectRange(range.nativeRange);
                        app.kendoEditor.paste(replace);
                        rangy.getSelection().move("character", 1);
                        range = rangy.getSelection().getRangeAt(0);

                        var searchScopeRange = rangy.createRange();
                        searchScopeRange.selectNodeContents(targetNode);
                        my.searchScopeRange = searchScopeRange;
                        options.withinRange = searchScopeRange;
                    }
                    else {
                        // range now is moidified to the searched term, highlight it
                        my.searchHighlightApplier.applyToRange(range);

                        // Collapse the range to the position immediately after the match
                        //range.collapse(false);

                        app.kendoEditor.selectRange(range.nativeRange);
                        rangy.getSelection().move("character", 1);
                        range = rangy.getSelection().getRangeAt(0);
                    }
                    ++count;
                }

                return count;
                */
            };

            my.session = { range: null, searchTerm:null, fromCaret:true, options:null, findResult:false, replace:false, targetNode:null };
            my.findStart = function(searchTerm, replace, caseSensitive, wholeWordsOnly, backwardDirection, targetNode, fromCaret) {
                if(typeof caseSensitive == "boolean") {
                    caseSensitive = true;
                }
                if(typeof wholeWordsOnly == "boolean") {
                    wholeWordsOnly = true;
                }
                if(typeof backwardDirection != "boolean") {
                    backwardDirection = false;
                }
                if(typeof targetNode == "undefined") {
                    targetNode = document.getElementById("default-editor");
                }
                if(typeof fromCaret !== "boolean") {
                    fromCaret = true;
                }

                my.findAll(searchTerm, false, caseSensitive, wholeWordsOnly, targetNode);

                var searchScopeRange = rangy.createRange();
                searchScopeRange.selectNodeContents(targetNode);

                var options = {
                    caseSensitive: caseSensitive,
                    wholeWordsOnly: wholeWordsOnly,
                    withinRange: searchScopeRange,
                    direction: backwardDirection ? "backward" : "forward"
                };
                my.session.options = options;
                my.session.fromCaret = fromCaret;
                my.session.replace = replace;
                my.session.targetNode = targetNode;

                var range = null;
                if(fromCaret) {
                    if(eval(targetNode.getAttribute("contenteditable")) == true) {
                        var isTestStub = typeof EditorProxy.isTestStub == "function" && EditorProxy.isTestStub();
                        if(isTestStub || document.activeElement === targetNode) {
                            var sel = rangy.getSelection();
                            if(sel.rangeCount > 0) {
                                range = sel.getRangeAt(0);
                            }
                        }
                    }
                }
                if(!range) {
                    range = rangy.createRange();
                    range.selectNodeContents(targetNode);
                }

                if (range.findText(searchTerm, options)) {
                    range.startContainer.parentNode.scrollIntoView();

                    // range now is moidified to the searched term, highlight it
                    my.searchHighlightApplier.applyToRange(range);

                    if(typeof my.session.replace === "string") {
                        app.kendoEditor.selectRange(range.nativeRange);
                        app.kendoEditor.paste(replace);

                        rangy.getSelection().move("character", backwardDirection ? replace.length-1 : 1);
                        range = rangy.getSelection().getRangeAt(0);

                        var searchScopeRange = rangy.createRange();
                        searchScopeRange.selectNodeContents(targetNode);
                        my.searchScopeRange = searchScopeRange;
                        options.withinRange = searchScopeRange;
                    }
                    else {
                        if(my.session.fromCaret) {
                            app.kendoEditor.selectRange(range.nativeRange);
                        }
                    }

                    my.session.findResult = true;
                }
                else {
                    my.session.findResult = false;
                }

                my.session.range = range;
                my.session.searchTerm = searchTerm;
            };

            my._findNext = function(backwardDirection) {
                if(my.session.range !== null) {
                    my.session.options.direction = backwardDirection ? "forward" : "backward";
                    var targetNode = my.session.targetNode;
                    var options = my.session.options;

                    var range = null;
                    if(my.session.fromCaret == true) {
                        var isTestStub = typeof EditorProxy.isTestStub == "function" && EditorProxy.isTestStub();
                        if(isTestStub || document.activeElement === targetNode) {
                            var sel = rangy.getSelection();
                            if(sel.rangeCount > 0) {
                                range = sel.getRangeAt(0);
                            }
                        }
                    }
                    if(!range) {
                        range = my.session.range;
                    }

                    var replace = my.session.replace;

                    for(var i = 0; i < 2; i++) {
                        var lastTimeStartContainer = range.startContainer;
                        var lastTimeStartContainerOffset = range.startOffset;
                        if (range.findText(my.session.searchTerm, my.session.options)) {
                            if(lastTimeStartContainer === range.startContainer
                                && lastTimeStartContainerOffset === range.startOffset) {
                                if(backwardDirection) {
                                    rangy.getSelection().move("character", 1);
                                    var sel = rangy.getSelection();
                                    if(sel.rangeCount > 0) {
                                        range = sel.getRangeAt(0);
                                    }
                                }
                                else {
                                    rangy.getSelection().move("character", -1);
                                    var sel = rangy.getSelection();
                                    if(sel.rangeCount > 0) {
                                        range = sel.getRangeAt(0);
                                    }
                                }
                                continue;
                            }

                            range.startContainer.parentNode.scrollIntoView();

                            if(typeof my.session.replace === "string") {
                                app.kendoEditor.selectRange(range.nativeRange);
                                app.kendoEditor.paste(replace);

                                rangy.getSelection().move("character", backwardDirection ? replace.length-1 : 1);
                                range = rangy.getSelection().getRangeAt(0);

                                var searchScopeRange = rangy.createRange();
                                searchScopeRange.selectNodeContents(targetNode);
                                my.searchScopeRange = searchScopeRange;
                                options.withinRange = searchScopeRange;
                            }
                            else {
                                if(my.session.fromCaret) {
                                    app.kendoEditor.selectRange(range.nativeRange);
                                }
                            }

                            // Collapse the range to the position immediately after the match
                            range.collapse(false);
                            my.session.findResult = true;
                        }
                        else {
                            my.session.findResult = false;
                        }

                        break;
                    }
                }
            };

            my.findNext = function() {
                my._findNext(true);
            }
            my.findPrev = function() {
                my._findNext(false);
            };

            my.closeFind = function() {
                my.searchHighlightApplier.undoToRange(my.searchScopeRange);
                my.session.range = null;
            };

            return my;
        }(app.SearchReplace || {}));
    };

    window.WysiwygApp = app;
    return app;
} (WysiwygApp || {}));
