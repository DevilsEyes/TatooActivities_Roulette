juicer.set({
    'tag::operationOpen': '<!--',
    'tag::operationClose': '-->',
    'tag::interpolateOpen': '${',
    'tag::interpolateClose': '}',
    'tag::noneencodeOpen': '$${',
    'tag::noneencodeClose': '}',
    'tag::commentOpen': '<!--#',
    'tag::commentClose': '-->'
});

juicer.register('transSex', function (sex) {
    switch (+sex) {
        case 0:
            return '';
        case 1:
            return '男性';
        case 2:
            return '女性';
    }
});

var ex = {
    jsonp: function (obj, pageObj) {
        $.jsonp({
            url: obj.url,
            callbackParameter: "callback",
            data: obj.data ? obj.data : null,
            success: function (data) {
                if (typeof data == 'string')data = $.parseJSON(data);
                obj.success(data);
            },
            error: obj.error ? obj.error : function () {
                layer.msg('您的网络连接不太顺畅哦!');
                template.render('PTest','page',{
                    url:obj.url,
                    data:ex.params(obj.data,'html')
                })
            },
            beforeSend: obj.beforeSend ? obj.beforeSend : function () {
                layer.load(2);
                pageObj ? pageObj.Locked = true : null;
            },
            complete: obj.complete ? obj.complete : function () {
                layer.closeAll('loading');
                pageObj ? pageObj.Locked = false : null;
            }
        })
    },
    params: function (obj, type) {
        var ws, br;
        switch (type) {
            case 'html':
                ws = '&nbsp;';
                br = '<br>';
                break;
            case 'log':
                ws = ' ';
                br = '\n';
                break;
        }

        function space(i) {
            if (i == 1)return ws;
            else {
                return ws + space(i - 1);
            }
        }

        var str = '';
        if (typeof obj != 'object') {
            str += obj + space(3) + '[TYPE:' + typeof obj + ']';
        } else {
            for (var i in obj) {
                str += space(1) + i + ': ' + obj[i] + br;

                if (typeof obj[i] == 'object') {
                    for (var j in obj[i]) {
                        str += space(5) + '└─' + space(1) + j + ': ' + obj[i][j] + br;

                        if (typeof obj[i][j] == 'object') {
                            for (var k in obj[i][j]) {
                                str += space(10) + '└─' + space(1) + k + ': ' + obj[i][j][k] + br;
                            }
                            str += br;
                        }
                    }
                    str += br;
                }
            }
            str += br;
        }
        return str;
    }
};

var template = {
    $page: null,
    $window: null,
    page: {},
    window: {},
    render: function (key, type, data) {
        if (type == 'page') {
            this.$page.html(this.page[key].render(data));
            $('.bg').css('min-height', $(window).height());
        } else {
            this.$window.html(this.window[key].render(data));
        }
    }
};

$(document).ready(function () {
    $('[type="text/template"]').each(function () {
        template[$(this).attr('data-role')][$(this).attr('data-page')] = juicer($(this).html());
        $(this).remove();
    });
    template.$page = $('#page');
    template.$window = $('#window');
    $('#window').hide();
    PWelcome.init();
});

var Data = {};

var PWelcome = {
    Locked: false,
    sex: 0,
    init: function () {
        //todo 获取原有信息
        ex.jsonp({
            url:'http://activity.meizhanggui.cc/weixinAuth2/userInfo?_method=GET',
            data:{
                code:g$url.param.code
            },
            success:function(){
                if (obj.success){
                    Data.openid = obj.data.openid;
                    Data.sex = obj.data.sex;
                    Data.sector = obj.data.occupation;
                    Data.times = obj.data.overplusNum;
                    if(Data.sector.length>0){
                        PRoulette.init();
                    }else{
                        template.render('PWelcome', 'page', {
                            sex: Data.sex,
                            sector: Data.sector
                        });
                        $('.sex-male').click(this.E_SexMaleSelect);
                        $('.sex-famale').click(this.E_SexFamaleSelect);
                        $('button').click(this.E_SendInfo);
                        Scroller.init('.scroller');
                    }
                }
            }
        });
    },
    E_SexMaleSelect: function () {
        $('.sex-male').addClass('active');
        $('.sex-famale').removeClass('active');
        $('.sex-male img').attr('src', 'static/img/male_light.png');
        $('.sex-famale img').attr('src', 'static/img/famale_dark.png');
        this.sex = 2;
    },
    E_SexFamaleSelect: function () {
        $('.sex-famale').addClass('active');
        $('.sex-male').removeClass('active');
        $('.sex-famale img').attr('src', 'static/img/famale_light.png');
        $('.sex-male img').attr('src', 'static/img/male_dark.png');
        this.sex = 1;
    },
    E_SendInfo: function () {
        var sector = $('.form-sector input').val();
        if (!sector)return layer.msg('请输入您的职业!');
        if (this.sex)return layer.msg('请选择性别!');
        Data.sex = this.sex;
        Data.sector = sector;
        PRoulette.init();
    }
};

var PRoulette = {
    Locked: false,
    init: function () {
        WXShareObject.link = location.origin + location.pathname + '?id=' +Data.openid;
        wx.onMenuShareTimeline(WXShareObject);
        wx.onMenuShareAppMessage(WXShareObject);

        template.render('PRoulette', 'page', {
            times: Data.times
        });
        Scroller.init('.scroller');
        Roulette.init();
    },
    start: function () {
        if (times == 0)return layer.msg('您已经没有抽奖机会了哦~分享到朋友圈可以增加一次抽奖机会!');
        Roulette.spin('start');
        ex.jsonp({
            url: BASEURL + '?_method=POST',
            data: {
                openid: Data.openid,
                sex2: Data.sex,
                occupation: Data.sector
            },
            success: function (obj) {
                if(obj.status=='ok'){
                    var award = obj.num;//中奖信息码
                    Data.times--;
                    $('.times').text('你有' + Data.times + '次抽奖机会');
                    Roulette.spin(award, function () {
                        if (award == 0) {
                            Data.award = 0;
                            return Window.open('WNoAward');
                        }
                        else if (award >= 1) {
                            Data.award = award;
                            Window.open('WAward');
                        }
                    })
                }else{
                    //todo 剩余抽奖次数不足!去分享吧少年
                }
            }
        })
    }
};

var Window = {
    open: function (name, data, next) {
        template.render(name, 'window', {});
        $('#window').show();
        $('#window .dialog').css({scale: 0})
            .transit({scale: 1}, 300, 'cubic-bezier(.15,.6,.15,1.2)', typeof next == 'function' ? next : null);

        if (name == 'WAward') {
            $('.tel').click(function () {
                $(this).find('input').focus();
            });
            $('button').click(function () {
                var tel = $('#WAward input').val();
                if(tel.length<11)return layer.msg('请输入正确的手机号!');
                ex.jsonp({//提交手机号
                    url:BASEURL + 'phonenum?_method=PUT',
                    data:{
                        openid:Data.openid,
                        phonenum:Data.tel
                    },
                    success:function(obj){
                        if(obj.status=='ok')template.render('PLucky','page');
                    }
                })
            })
        }
    },
    close: function () {
        $('#window').hide();
    }
};

var ShareSuccess=function(){
    ex.jsonp({
        url:BASEURL + 'share?_method=POST',//分享成功
        data:{
            openid:Data.openid
        },
        success:function(obj){
            if(obj.status=='ok'){
                Data.times = obj.overplusNum;
                if($('#WAward').length==0){
                    Window.open('WShare',{times:Data.times});
                }
            }else{
                //todo 分享次数超出限制
            }
        }
    })
};

var WXShareObject = {
    title: '这是有纹身的人必挺的一件事', // 分享标题
    link: '', // 分享链接
    desc:'既然纹身，我们就要承受异样的目光，并去接受这样的质疑。',
    imgUrl: 'http://img.meizhanggui.cc/9ded08513faade03a9679e9f82a95653_W_700X700', // 分享图标
    success:ShareSuccess
};