var layout = {};

    layout.init = function() {
        this.domHandlerAction.call(this, null);
    };

    layout.domHandlerAction = function() {

        var txtVal = document.querySelector('.txtLayout');
            txtVal.addEventListener('input', function() {

                var hasInputNum = 50 - this.value.length;
                var span = document.createElement('span');
                    span.innerText = '';
                    span.id = 'span01';
                    hasInputNum = hasInputNum > 0 ? hasInputNum : 0;
                    span.innerText = '您最多还能输入' + hasInputNum + '个字';
                    if(document.querySelector('#span01')){
                        document.body.removeChild(document.querySelector('#span01'));
                        document.body.appendChild(span);
                    }else{
                        document.body.appendChild(span);
                    }
            }, false);

    }

    layout.init.call(layout, null);
