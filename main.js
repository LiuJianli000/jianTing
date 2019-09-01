var EventCenter = {
    on: function (type, handler) {
        $(document).on(type, handler)
    },
    fire: function (type, data) {
        $(document).trigger(type, data)
    }
}


var Footer = {
    init: function () {
        this.$footer = $('footer')
        this.$ul = this.$footer.find('ul')
        this.$box = this.$footer.find('.box')
        this.$leftBtn = this.$footer.find('.icon-left')
        this.$rightBtn = this.$footer.find('.icon-right')
        this.isToEnd = false  //定义 说明是否 rightBtn 到结束
        this.isToStart = true
        this.isAnimate = false
        this.bind()
        this.render()
    },

    bind: function () {
        var _this = this
        // $(window).resize(function () {
        //     _this.setStyle()
        // })

        this.$rightBtn.on('click', function () {
            if(_this.isAnimate) return

            var itemWidth = _this.$box.find('li').outerWidth(true)
            var rowCount = Math.floor(_this.$box.width() / itemWidth)  //一行能放下几个完整的 li

            if (!_this.isToEnd) {
                _this.isAnimate = true
                _this.$ul.animate({  //所以 ul 要绝对定位，left 默认为 0
                    left: '-=' + rowCount * itemWidth  //点击 rightBtn 向左移动的距离
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isToStart = false  // 点击 rightBtn 后，isToStart = false
                    _this.$leftBtn.removeClass('disabled')
                    if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))) {
                        //rightBtn 点击到结束 再去想满足这个条件的算法：box 的宽度 + 移动的宽度 >= ul 的宽度
                        _this.isToEnd = true
                        _this.$rightBtn.addClass('disabled')
                    }
                })
            }
        })

        this.$leftBtn.on('click', function () {
            if(_this.isAnimate) return

            var itemWidth = _this.$box.find('li').outerWidth(true)
            var rowCount = Math.floor(_this.$box.width() / itemWidth)  
            if (!_this.isToStart) {  //false 默认不执行，上面点击 rightBtn 后，这里条件变为 true，开始执行
                _this.isAnimate = true
                _this.$ul.animate({  
                    left: '+=' + rowCount * itemWidth  
                }, 400, function () {
                    _this.isAnimate = false
                    _this.isToEnd = false
                    if (parseFloat(_this.$ul.css('left')) >= 0 ) {
                        _this.isToStart = true
                        _this.$leftBtn.addClass('disabled')
                    }
                })
            }
        })

        this.$footer.on('click', 'li', function(){
            $(this).addClass('active')
                   .siblings().removeClass('active')

            EventCenter.fire('select-albumn', {
                channelId: $(this).attr('data-channel-id'),
                channelName: $(this).attr('data-channel-name')
            })
        })
    },

    render: function () {
        var _this = this
        $.getJSON('http://api.jirengu.com/fm/getChannels.php').done(function (ret) {
            console.log(ret)
            _this.renderFooter(ret.channels)
        }).fail(function () {
            console.log('error')
        })
    },

    renderFooter: function (channels) {
        console.log(channels)
        var html = ''
        channels.forEach(function (channels) {
            html += '<li data-channel-id='+channels.channel_id+' data-channel-name='+channels.name+ '>'
                + '<div class="cover" style="background-image:url(' + channels.cover_small + ')"></div>'
                + '<h3>' + channels.name + '</h3>'
                + '</li>'
        })
        this.$ul.html(html)
        this.setStyle()
    },

    setStyle: function () {
        var count = this.$footer.find('li').length  // 这里 不能进行缩写，因为 li 是在获取数据后才有的
        var width = this.$footer.find('li').outerWidth(true)
        console.log(count, width)
        this.$ul.css({  //设置 ul 的宽度，不然放不下的 li 跑到 下方去了
            width: count * width + 'px'
        })
    }
}


var Fm = {
    init: function(){
        this.$container = $('#page-music')
        this.audio = new Audio()
        this.audio.autoplay = true

        this.bind()
    },
    bind: function(){
        var _this = this
        EventCenter.on('select-albumn', function(e, channelObj){
            console.log('channelId:', channelObj.channelId)
            console.log('channelName:', channelObj.channelName)

            _this.channelId = channelObj.channelId
            _this.channelName = channelObj.channelName
            _this.loadMusic()
        })

        this.$container.find('.btn-collect').on('click', function(){
            if(_this.$container.find('.btn-collect').hasClass('active')){
                _this.$container.find('.btn-collect').removeClass('active')
            }else{
                _this.$container.find('.btn-collect').addClass('active')
            }
        })

        this.$container.find('.btn-play').on('click',function(){
            var $btn = $(this)
            if($btn.hasClass('icon-play')){
                $btn.removeClass('icon-play').addClass('icon-pause')
                _this.audio.play()
            }
            else{
                $btn.removeClass('icon-pause').addClass('icon-play')
                _this.audio.pause()
            }
            
        })
         

        this.$container.find('.btn-next').on('click', function(){
            _this.loadMusic()
        })

        this.audio.addEventListener('play', function(){
            _this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
            console.log('play')
            
            clearInterval(_this.statusClock)
            _this.statusClock = setInterval(function(){
                _this.updateStatus()
            },1000)
        })

        this.audio.addEventListener('pause', function(){
            _this.$container.find('.btn-play').removeClass('icon-pause').addClass('icon-play')
            console.log('pause')

            clearInterval(_this.statusClock)
            
        })
    },
    loadMusic(){
        var _this = this
        console.log('loadMusic...') 
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel: this.channelId}).done(function(ret){
            //console.log(ret.song[0])
            _this.song = ret.song[0]
            _this.setMusic()
            _this.loadLyric()
        })
    },

    loadLyric(){
        var _this = this
        
        $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php',{sid: this.song.sid}).done(function(ret){
            console.log(ret.lyric)  //获取到歌词的字符串
            
            var lyric = ret.lyric
            var lyricObj = {}
            lyric.split('\n').forEach(function(line){
                var times = line.match(/\d{2}:\d{2}/g)  //可能一行歌词有对应两个时间点
                var str = line.replace(/\[.+?\]/g,'')  //做处理，获取歌词内容
                if(Array.isArray(times)){
                    times.forEach(function(){
                        lyricObj[times] = str
                    })
                }
            })
            _this.lyricObj = lyricObj
        })
        
    },
    setMusic(){
        console.log('set music')
        console.log(this.song)
        this.audio.src = this.song.url
        $('.bg').css('background-image', 'url('+this.song.picture+')')
        this.$container.find('.aside figure').css('background-image', 'url('+this.song.picture+')')
        this.$container.find('.detail h1').text(this.song.title)
        this.$container.find('.detail .author').text(this.song.artist)
        this.$container.find('.tag').text(this.channelName)
    },
    updateStatus(){
        //console.log('running...')
        
        var min = Math.floor(this.audio.currentTime/60)
        var second = Math.floor(this.audio.currentTime%60) + ''
        second = second.length === 2? second:'0'+second
        this.$container.find('.current-time').text(min+':'+second)
        this.$container.find('.bar-progress').css('width',
        this.audio.currentTime/this.audio.duration*100+'%')

        //console.log(this.lyricObj['0'+min+':'+second])
        var line = this.lyricObj['0'+min+':'+second]
        if(line){
            this.$container.find('.lyric p').text(line)
            .boomText()  //字体的动画样式
        }

    }
}



$.fn.boomText = function(type){  //动画插件
    type = type || 'rollIn'  //样式
    this.html(function(){
      var arr = $(this).text()
      .split('').map(function(word){
          return '<span class="boomText"  style="display:inline-block">'+ word + '</span>'
      })
      return arr.join('')
    })
    
    var index = 0
    var $boomTexts = $(this).find('span')
    var clock = setInterval(function(){
      $boomTexts.eq(index).addClass('animated ' + type)
      index++
      if(index >= $boomTexts.length){
        clearInterval(clock)
      }
    }, 300)
  }

Footer.init()
Fm.init()


