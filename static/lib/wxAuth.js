var g$url = {
    param:{},
    getParam:function(){
        g$url.param = {};
        var str = '';
        var args = location.search.substr(1).split("&");

        for (var i = 0; i < args.length; i++) {
            str = args[i];
            var arg = str.split("=");
            if (arg.length <= 0) continue;
            if (arg.length == 1) g$url.param[arg[0]] = true;
            else g$url.param[arg[0]] = arg[1];
        }
        if(location.hash)g$url.param.hash = location.hash.substr(1);
        return g$url.param;
    },
    getWxAuth:function(){
        var REURI = encodeURIComponent(location.origin + location.pathname),
            STATE = g$url.param.hash||"false";
        return location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf72ed77c92113ec4&redirect_uri="+REURI+"&response_type=code&scope=snsapi_userinfo&state="+STATE+"#wechat_redirect"
    },
    checkUrl:function(){
        var state = g$url.param.state;
        if(state!="true"){
            document.cookie = "code="+ (g$url.param.code||null) +"&";
            location.href = location.origin + location.pathname +'?state=true'+(state=="false"?'#list':'#'+decodeURIComponent(state));
        }else{
            var code = document.cookie.match(/code=([^\b&]*)/);
            if(code&&code[1]){
                code = code[1];
                ROLE.code=code;
                ROLE.isAuth=true;
                document.cookie = "code=&";
            }else{
                g$url.getWxAuth();
            }
        }
    }
};

var Config = {
    isWX:navigator.userAgent.match(/MicroMessenger/i) != null,
    isMobile:navigator.userAgent.match(/Mobile/i) != null
};

if(Config.isWX){
    if(!g$url.getParam().state){
        g$url.getWxAuth();
    }else{
        g$url.checkUrl();
    }
}