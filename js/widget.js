/**
 * Created by DevilsEyes on 2015/11/3.
 */
var Roulette = (function () {

    var T = 300;
    var $o, $lw, $lo;
    var count = 0;

    var spin = {
        isSpin: false,
        isProtect: false,
        timer: null,
        ready: function () {
            count++;
            switch (count) {
                case 1:
                {
                    $lw.transit({opacity: 1}, T);
                    $lo.transit({opacity: 0}, T);
                    return
                }
                case 2:
                {
                    $lw.transit({opacity: 0}, T);
                    $lo.transit({opacity: 1}, T);
                    count = 0;
                    return
                }
            }
        },
        first: function () {
            if (spin.isProtect)return;
            clearInterval(spin.timer);
            spin.isSpin = true;
            spin.isProtect = true;
            $o.transit({
                scale: 0.7,
                rotate: '120deg'
            }, 50, 'linear').transit({
                scale: 1,
                rotate: '240deg'
            }, 100, 'linear', function () {
                $o.css({rotate: '0deg'});
                spin.normal();
                return spin.timer = setInterval(spin.normal, T);
            });
        },
        normal: function () {
            if (spin.isSpin) {
                $o.transit({rotate: '360deg'}, T, 'linear', function () {
                    $o.css({rotate: '0deg'});
                });
            }
            count++;
            switch (count) {
                case 1:
                {
                    $lw.transit({opacity: 1}, T);
                    $lo.transit({opacity: 0}, T);
                    return
                }
                case 2:
                {
                    $lw.transit({opacity: 0}, T);
                    $lo.transit({opacity: 1}, T);
                    count = 0;
                    return
                }
            }
        },
        finish: function () {
            count++;
            switch (count) {
                case 1:
                {
                    $lo.css({opacity: 0}, T);
                    $lw.css({opacity: 0}, T);
                    return
                }
                case 2:
                {
                    $lo.css({opacity: 1}, T);
                    $lw.css({opacity: 1}, T);
                    count = 0;
                    return
                }
            }
        },
        end: function (value,next) {
            spin.isSpin = false;
            var callback = function () {
                clearInterval(spin.timer);
                spin.timer = setInterval(spin.finish, T);
                spin.isProtect = false;
                next();
            };
            var time = 6500;
            var offset = 1800 + Math.random() * 50 - 25;
            var swing = 'cubic-bezier(.15,.6,.15,1.03)';

            switch (value) {
                case 0://谢谢
                    return $o.transit({rotate: offset - 235 + 'deg'}, time, swing, callback);
                case 1://手稿
                    return $o.transit({rotate: offset - 19 + 'deg'}, time, swing, callback);
                case 2://礼品
                    return $o.transit({rotate: offset - 163 + 'deg'}, time, swing, callback);
                case 3://T恤
                    return $o.transit({rotate: offset - 91 + 'deg'}, time, swing, callback);
                case 4://代金券
                    return $o.transit({rotate: offset - 288 + 'deg'}, time, swing, callback);
            }
        }
    };

    return {
        spin: function (mod,next) {
            switch (mod) {
                case 'start':
                    return spin.first();
                case '0':
                    return spin.end(0,next);
                case '1':
                    return spin.end(1,next);
                case '2':
                    return spin.end(2,next);
                case '3':
                    return spin.end(3,next);
                case '4':
                    return spin.end(4,next);
            }
        },
        init: function () {
            $o = $('#roulette-start');
            $lw = $('#roulette-light_white');
            $lo = $('#roulette-light_orange');
            spin.timer = setInterval(spin.ready, 3 * T);
        }
    };
})();

var Scroller = (function () {

    var $o;
    var time = 2000;
    var transTime = 1000;

    var creat = function (tel, award) {
        var weight;
        if (tel != undefined && award != undefined) {
            tel = tel + '';
            tel = tel.substr(0, 3) + 'XXXX' + tel.substr(7);
            weight = 999;
        } else {
            weight = Math.round(Math.random() * 100);
            var head = '1' + [3, 5, 8][Math.floor(Math.random() * 3)] + Math.floor(Math.random() * 10);
            var tail = Math.floor(Math.random() * 10000);
            tel = head + 'XXXX' + tail;
            award = 0;
        }
        if (weight<1||award==3) {
            award = '赢得了限量版T恤!';
        }else if(weight<40||award==2){
            award = '赢得了精美小礼品!';
        }else{
            award = '赢得了纹身手稿!';
        }
        return {
            tel: tel,
            award: award
        };
    };
    var next = creat();
    var timer = null;

    return {
        init: function (selector) {
            $o = $(selector);
            next = creat();
            $o.append('<div>'+next.tel+':'+next.award+'</div>');
            timer = setInterval(function () {
                $o.append('<div>'+next.tel+':'+next.award+'</div>');
                $o.find('div').transit({top:'-30px'},transTime,function(){
                    if($o.find('div').length==2){
                        $(this)[0].remove();
                        $(this).css({top:0});
                    }
                });
                next = creat();
            }, time);
        },
        award: function (tel, award) {
            next = creat(tel,award);
        }
    }

})();