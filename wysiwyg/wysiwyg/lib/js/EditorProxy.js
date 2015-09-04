
var EditorProxy = EditorProxy || {
    isTestStub: function() {
        return true;
    },
	
	IsShowRuler: function() {
		return true;
	},


    mRulerUnitType: "px", //px | in | cm
	GetRulerUnitType: function() {
		return EditorProxy.mRulerUnitType;
	},
    SetRulerUnitType: function(newType) {
        EditorProxy.mRulerUnitType = newType;
    },

    mShowGrid: false,
	IsShowGrid: function() {
		return EditorProxy.mShowGrid;
	},
    ShowGrid: function(bShow) {
        EditorProxy.mShowGrid = bShow;
    },

    /**
     * 获取WYSIWYG路径。
     */
    GetWysiwygBasePath: function () {
        return "..";
    },

    /**
     * 获取HtmlResource的Html代码文本。
     */
    GetHtml: function () {
        /* for test search && replace
        return '<!DOCTYPE html>\n' +
            '<html>\n' +
            '<head>\n' +
            '  <title>Wysiwyg Title</title>\n' +
            '  <meta charset="utf-8">\n' +
            '</head>\n' +
            '<Body>\n' +
            '<span style="color:red">h</span>ello 1<br />'+
        '<br />'+
        'aasf<br />'+
        '<br />'+
        'asflasjk<br />'+
        '<br />'+
        'ljk;asfdsa<br />'+
        '<br />'+
        '<br />'+
        'asf<br />'+
        '<br />'+
        's<br />'+
        '<br />'+
        '<br />'+
        '<br />'+
        'hwll<br />'+
        '<br />'+
        '<br />'+
        '<br />'+
        'hello 2<br />'+
        '<br />'+
        '<br />'+
        'hello 3<br />'+
        '<div>hello 4 hell</div>o 5 hello 6'+
            '</BODY>\n' +
            '</html>';
        */
        return '<!DOCTYPE html>\n' +
            '<html>\n' +
            '<head>\n' +
            '  <title>Wysiwyg Title</title>\n' +
            '  <meta charset="utf-8">\n' +
            '</head>\n' +
            '<Body>\n' +
            //'<img class="ui-droppable" height="166" last-src="../wysiwyg/images/img1.JPG" src="../wysiwyg/images/img1.JPG" style="padding:0px;margin:0px;" width="169" /><img class="ui-droppable" height="158" last-src="../wysiwyg/images/img1.JPG" src="../wysiwyg/images/img1.JPG" style="padding:0px;margin:0px;left:460px;top:84.90625px;position:absolute;" width="186" />'+
            '</BODY>\n' +
            '</html>';
    },

    /**
     * 设置HtmlResource的Html代码文本。
     */
    SetHtml: function (strHtml, bFromEditor) {
    },

    GetReferenceLibraryPath: function (str) {
        return "./";
    },

    OnChangeHtml: function () {
        console.dir('html changed from editor');
    },

    /**
     * 获取描述当前书刊所有资源的JSON格式文本。
     *
     * Javascript中可以用以下方法得到描述当前书刊所有资源的JSON对象。
     * strResources = EditorProxy.GetResourcesJsonString();
     * var resource = eval('(' + strResources + ')');
     */
    //filter: "png|jpg|jpeg", no arguments means get all resources
    GetResourcesJsonString: function(filter) {
        return '['+
            '{ text: "Public", expanded: true, spriteCssClass: "rootfolder", items: ['+
                '{ text: "img1.jpg", spriteCssClass: "image", full_path: "./images/img1.jpg" },'+
                '{ text: "img2.jpg", spriteCssClass: "image", full_path: "./images/img2.jpg" },'+
                '{ text: "img3.jpg", spriteCssClass: "image", full_path: "./images/img3.jpg" }'+
            ']'+
            '},'+
            '{'+
                'text: "800x600", expanded: true, spriteCssClass: "folder", items: ['+
                '{ text: "img2.jpg", spriteCssClass: "image", full_path: "./images/img1.jpg" },'+
                '{ text: "img3.jpg", spriteCssClass: "image", full_path: "./images/img2.jpg" }'+
            ']'+
            '}'+
        ']';
    },

    /**
     * 获取给定路径相对于当前HTML的相对路径。
     */
    GetRelativePathToHtml: function(fullpath) {
        return fullpath;
    },

    loadResourceFromDisk: function(title, filter) {
        return "../wysiwyg/images/img1.JPG";
    }
};

var ClipboardData = ClipboardData || {
    mData: "",

    clearData: function() {
        this.mData = "";
    },

    //format only support "text" yet
    getData: function(fmt) {
        return this.mData;
    },

    setData: function(fmt, val) {
        this.mData = val;
    }
} ;
