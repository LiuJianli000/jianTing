#### 项目标题：
简听音乐电台

#### 功能：
这是一个简单的音乐播放器，首先可以满足音乐的播放、暂停；其次可以展示歌曲播放的进度和时间；可以展示歌曲的相关内容（作者，歌词，歌单名）；可以根据用户的音乐喜好切换歌单列表；实现歌曲背景随播放歌曲的切换而切换；最后，播放器整体感观很好，操作简单。

#### 项目技术细节介绍：
1. 绑定自定义的事件
定义一个事件中心 EventCenter，用的时候先去绑定一个自定义事件 Eve ntCenter.on( )，再去触发一个事件 EventCenter.fire( ... )

2. 获取数据
这里用到的是 getJSON，实现 $.getJSON( ... ).done( ... )

3. 动画插件的使用
引入一个动画插件，实现 $.fn.boomText = function(type){ ... }，然后$(element).boomText()

4. 数学函数的使用
Math.floor()
parse.Float()

5. 加锁机制
可以规定一段代码的是否开始执行，这里主要用在歌单的滚动翻页（判断是否滚动到最后 isToEnd，和 是否处于开始的位置 isToStart）

6. 音频API
拿到音乐数据后
new Audio() 声明一个音频
audio.autoplay = true 自动播放

#### 遇到的问题
问题一：歌单列表如何在最后一页展示出来后，右键按钮不会继续实现翻页
    这里我们给右键按钮加一个是否滚动到最后的条件，具体代码：
    if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width')))

问题二：进度条滚动不匀，一点点卡顿的感觉
    这里用到 setInterval 按指定周期（以毫秒计算）来调用函数或表达式，代码实现：
        clearInterval(_this.statusClock)  
        _this.statusClock = setInterval(function(){
            _this.updateStatus()
        },1000)

#### 收获：
首先，使我更加熟练的使用 jQuery ，在这个项目中 我充分利用到前面所学的内容。我发选理论的学习并不能满足对某种技术的掌握，必须要通过实践。然后，然我在解决问题的时候更有耐心，提升了自我解决问题的能力。

#### 技术栈关键词：
jQuery
CSS3
响应式
iconfont
