(function(obj){
    obj.win={
        /**
         * 环形进度条
         * @param el：DOM对象
         * @param val:数值
         * @param bg:背景颜色
         * @param color:环颜色
         * @param textColor：数字颜色
         * @param fontSize：数字字体大小
         * @param size:环宽度
         * @param r:环内半径
         * @param time:动画时间
         * @param easing:动画类型:
         *  'linear'
         *  '<' or 'easeIn' or 'ease-in'
         *  '>' or 'easeOut' or 'ease-out'
         *  '<>' or 'easeInOut' or 'ease-in-out'
         *  'backIn'or 'back-in'
         *  'backOut' or 'back-out'
         *  'elastic'
         *  'bounce'
         */
        loopFun:function(el,val,bg,color,textColor,fontSize,size,r,time,easing){
            var si =r+size/2;
            var xy=r+size;
            if(val<0||val>100){
                return alert('0-100')
            }
            var paper = Raphael(el,(r+size)*2,(r+size)*2);
            paper.circle(xy,xy,r).attr({
                'stroke-width': size,
                stroke:bg
            });
            paper.customAttributes.arc=function(val){
                var v = 360*val/100,
                    s = -180,
                    e = s+v,
                    x = xy,
                    y = xy,
                    rad = Math.PI/180,
                    x1 = x+r*Math.sin(-s*rad),
                    y1 = y+r*Math.cos(-s*rad),
                    x2 = x+r*Math.sin(-e*rad),
                    y2 = y+r*Math.cos(-e*rad),
                    path=[
                        ['M',x1,y1],
                        ['A',r,r,0,+(e-s>180),1,x2,y2]
                    ];
                return {
                    path:path
                };
            };
            var an = paper.path().attr({
                'stroke-width': size,
                stroke:color,
                arc: 0.01
            });
            an.animate({
                stroke:color,
                arc:val
            },time,easing);
            setTimeout(function(){
                if(val==100){
                    paper.circle(xy,xy,r).attr({
                        'stroke-width': size,
                        stroke:color
                    });
                }
            },time);
            paper.customAttributes.txt=function(val){
                return {
                    text:Math.floor(val*100)/100+'%'
                }
            };
            var l = paper.text(xy,xy).attr({
                txt:0,
                'fill':textColor,
                'font-size':fontSize,
                'font-weight':700
            });
            l.animate({
                txt:val
            },time);
        },
        /**
         *矩形进度条
         * @param el：DOM对象
         * @param val:数值
         * @param bg：背景颜色
         * @param color：进度条颜色
         * @param textColor：数字颜色
         * @param fontSize：数字字体大小
         * @param lenght：进度条总长度
         * @param size：进度条高度
         * @param time：进度动画时间
         * @param easing:动画类型:
         *  'linear'
         *  '<' or 'easeIn' or 'ease-in'
         *  '>' or 'easeOut' or 'ease-out'
         *  '<>' or 'easeInOut' or 'ease-in-out'
         *  'backOut' or 'back-out'
         *  'bounce'
         */
        stripFun:function(el,val,bg,color,textColor,fontSize,lenght,size,time,easing){
            var s= size/2;
            if(val<0||val>100){
                return alert('0-100')
            }
            var paper = Raphael(el,lenght,size);
            paper.path('M 0,'+s+' L'+lenght+','+s).attr({
                'stroke-width': size,
                stroke:bg
            });
            var strip=paper.path('M 0,'+s+' L0,'+s).attr({
                'stroke-width': size,
                stroke:color
            });
            strip.animate({
                path:'M 0,'+s+' L'+lenght/100*val+','+s
            },time,easing);
            paper.customAttributes.arc=function(val){
                return {
                    text:Math.floor(val*100)/100+'%'
                }
            };
            var l = paper.text(lenght/2,s).attr({
                arc:0,
                'fill':textColor,
                'font-size':fontSize
            });
            l.animate({
                arc:val
            },time);
        }
    };
})(window);
