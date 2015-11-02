window.addEventListener('load', function () {
    FastClick.attach(document.body);
    if(Config.isWX)WX.init();
}, false);

WX = {
    ready: false,
    timer: null,
    init: function () {
        var wxUrl = encodeURIComponent(location.href.split('#')[0]),
            config = function (appId, timestamp, nonceStr, signature) {
                wx.config({
                    debug: true,
                    appId: appId,
                    timestamp: timestamp,
                    nonceStr: nonceStr,
                    signature: signature,
                    jsApiList: [
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'chooseImage',
                        'uploadImage'
                    ]
                });
                wx.ready(function () {
                    WX.ready = true;
                });
            };
        $.ajax({
            url: "http://182.92.161.173:5588/weixinAuth2?url=" + wxUrl,
            dataType: "jsonp",
            jsonp: "callback", //传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
            jsonpCallback: "success_jsonpCallback", //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            type: "GET",
            async: false,
            beforeSend: function () {
            },
            success: function (obj) {
                var appId = obj.data.appId,
                    timestamp = obj.data.timestamp,
                    nonceStr = obj.data.nonceStr,
                    signature = obj.data.signature;
                config(appId, timestamp, nonceStr, signature);
            }
        });
    },
    set: function (obj) {
        var shareObj = {
            title: obj.title,
            desc: obj.desc,
            link: obj.link,
            imgUrl: obj.imgUrl
        };
        if (WX.ready) {
            wx.onMenuShareTimeline(shareObj);
            wx.onMenuShareAppMessage(shareObj);
            wx.onMenuShareQQ(shareObj);
            wx.onMenuShareWeibo(shareObj);
        }else{
            wx.ready(function(){
                WX.ready = true;
                WX.set(shareObj)
            });
        }
    }
};