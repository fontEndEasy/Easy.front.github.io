define(function(require, exports, module){

        function bDirect() {
            var uAgent = navigator.userAgent.toLowerCase(),
                ipad = uAgent.match(/ipad/i) == "ipad",
                iphone = uAgent.match(/iphone os/i) == "iphone os",
                midp = uAgent.match(/midp/i) == "midp",
                uc7 = uAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
                uc = uAgent.match(/ucweb/i) == "ucweb",
                android = uAgent.match(/android/i) == "android",
                ce = uAgent.match(/windows ce/i) == "windows ce",
                wm = uAgent.match(/windows mobile/i) == "windows mobile";
            if (ipad || iphone || midp || uc7 || uc || android || ce || wm) {
                return false;
            } else {
                return true;
            }
        }

        var isBoolean = bDirect();
            console.dir(isBoolean);
        exports.bDirect = bDirect;
});
