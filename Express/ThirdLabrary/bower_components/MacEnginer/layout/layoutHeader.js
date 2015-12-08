define(function( require, exports, module ) {
    var layout = {
            init: function() {
                var _this = this,
                    colorArray = ['#FF0000', '#990000', '#654E90', '#EE69AB', '#DDDDDD', '#E88501'],
                    colorVal,
                    html = '<div class="contextmenu" id="contextmenu">' +
                           '<ul class="cmenu-ul" id="cmenu-ul">' +
                               '<li class="cmenu-li">' +
                                    '<span class="span"></span>' +
                                    '<label class="labelcontent"><span class="spancontent" id="watch">查看</span>(V)<span class="span spanRight spanDot"></span></label>' +
                                    '<ul class="cmenu-innerul">' +
                                        '<li class="cmenu-li">' + 
                                            '<span class="span"></span>' + 
                                            '<label class="labelcontent"><span class="spancontent" id="bigicon">大图标</span>(R)<span class="span spanRight spanDot"></span></label>' + 
                                        '</li>' +
                                        '<li class="cmenu-li">' + 
                                            '<span class="span"></span>' + 
                                            '<label class="labelcontent"><span class="spancontent" id="midicon">中等图标</span>(M)<span class="span spanRight spanDot"></span></label>' +
                                        '</li>' +
                                        '<li class="cmenu-li">' + 
                                            '<span class="span"></span>' + 
                                            '<label class="labelcontent diliverbtm"><span class="spancontent" id="smallicon">小图标</span>(N)<span class="span spanRight spanDot"></span></label>' +
                                        '</li>' +
                                        '<li class="cmenu-li">' + 
                                            '<span class="span"></span>' + 
                                            '<label class="labelcontent dilivertop"><span class="spancontent" id="smallicon">自动排列图标</span>(A)<span class="span spanRight spanDot"></span></label>' +
                                        '</li>' +
                                        '<li class="cmenu-li">' + 
                                            '<span class="span"></span>' + 
                                            '<label class="labelcontent diliverbtm"><span class="spancontent" id="smallicon">将图标与风格对齐</span>(I)><span class="span spanRight spanDot"></span></label' +
                                        '</li>' +
                                        '<li class="cmenu-li">' + 
                                            '<span class="span"></span>' + 
                                            '<label class="labelcontent dilivertop"><span class="spancontent" id="smallicon">显示桌面图标</span>(D)<span class="span spanRight spanDot"></span></label>' +
                                        '</li>' +
                                    '</ul>' +
                               '</li>' +
                               '<li class="cmenu-li">' +
                                    '<span class="span"></span>' +
                                    '<label class="labelcontent"><span class="spancontent" id="orderStyle">排序方式</span>(O)<span class="span spanRight spanDot"></span></label>' +
                               '</li>' +
                               '<li class="cmenu-li">' +
                                    '<span class="span"></span>' +
                                    '<label class="labelcontent diliverbtm"><span class="spancontent" id="refresh">刷新</span>(E)<span class="span spanRight spanDot"></span></label>' +
                               '</li>' +
                               '<li class="cmenu-li">' +
                                    '<span class="span"></span>' +
                                    '<label class="labelcontent dilivertop"><span class="spancontent" id="paste">粘贴</span>(P)<span class="span spanRight"></span></label>' +
                               '</li>' +
                               '<li class="cmenu-li">' +
                                    '<span class="span"></span>' +
                                    '<label class="labelcontent diliverbtm"><span class="spancontent" id="pasteQuick">粘贴快捷方式</span>(S)<span class="span spanRight"></span></label>' +
                               '</li>' +
                               '<li class="cmenu-li">' +
                                    '<span class="span"></span>' +
                                    '<label class="labelcontent dilivertop"><span id="back">撤消</span>&nbsp;<span id="delete">删除</span>(U)<span class="span spanRight spanDot"></span></label>' +
                               '</li>' +
                               '<li class="cmenu-li">' +
                                    '<span class="span"></span>' +
                                    '<label class="labelcontent diliverbtm"><span class="spancontent" id="news">新建</span>(W)<span class="span spanRight spanDot"></span></label>' +
                               '</li>' +
                               '<li class="cmenu-li">' +
                                    '<span class="span span-pixicon"></span>' +
                                    '<label class="labelcontent dilivertop"><span class="spancontent" id="pix">屏幕分辨率</span>(C)<span class="span spanRight"></span></label>' +
                               '</li>' +
                               '<li class="cmenu-li">' +
                                    '<span class="span span-toolicon"></span>' +
                                    '<label class="labelcontent"><span class="spancontent" id="tools">小工具</span>(G)<span class="span spanRight"></span></label>' +
                               '</li>' +
                               '<li class="cmenu-li">' +
                                    '<span class="span span-specicon"></span>' +
                                    '<label class="labelcontent"><span class="spancontent" id="tools">个性化</span>(R)<span class="span spanRight"></span></label>' +
                               '</li>' +
                           '</ul>' +
                           '</div>';
                            $(document).bind({
                                    'contextmenu': function(e) {
                                        var cDocX = e.clientX + $('body').scrollLeft(),
                                            cDocY = e.clientY + $('body').scrollTop();
                                        if($('body').find('#contextmenu').length) {
                                            $('#contextmenu').css({
                                                top: cDocY,
                                                left: cDocX
                                            }).show();
                                        }else{
                                            $('body').append(html);
                                            $('#contextmenu').css({
                                                top: cDocY,
                                                left: cDocX
                                            }).show();
                                        }

                                        return false;
                                    },
                                   'click': function(e) {
                                       _this.selectOptions(e);
                                       $('#contextmenu').hide();
                                   }
                            });
                            $('.contextmenu').on('click', function( e ) {
                                e.stopPropagation();
                                console.dir('no stopPropagation');
                            });
                            colorVal = Math.floor(Math.random() * colorArray.length);
                            $('body').css({ backgroundColor: colorArray[colorVal] });
                
                
            },
            selectOptions: function(e) {
                var idVal = $(e.target).find('span').attr('id');
                    switch( idVal ) {
                        case 'refresh':
                            location.reload();
                            break;
                        case 'bigicon':
                            $('.deskIcon-layout .deskIcon').css({ width: '12rem'});
                            break;
                        case 'midicon':
                            $('.deskIcon-layout .deskIcon').css({ width: '7rem'});
                            break;
                        case 'smallicon':
                            $('.deskIcon-layout .deskIcon').css({ width: '4rem'});
                            break;
                    }
            }
        } || layout;
    exports.layout = layout;
} );