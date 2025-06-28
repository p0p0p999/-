(function (global) {
    var audioPlayer = null;

    function AudioPlayer(){
        this.currentAudioUrl = null;
        this.volume = 1;
        this.player = null;
        this.callback = null;
        this.target = null;
        this._isPlaying = false;

        this._startPercent = 0;
    }

    AudioPlayer.prototype._init = function () {
        this.player = document.createElement('audio');
        this._handlePlayEvent();
    }

    AudioPlayer.prototype._handlePlayEvent = function () {
        this.player.addEventListener("ended",this._playEndHandler,false);
        this.player.addEventListener("error",this._playErrorHandler,false);
        this.player.addEventListener("durationchange",this._durationChangeHandler,false);
    }

    AudioPlayer.prototype._playEndHandler = function () {
        audioPlayer._isPlaying = false;
        if(audioPlayer.isRepeat){
            if(audioPlayer.player.paused){
                audioPlayer.player.currentTime = 0.1;
                audioPlayer.player.src = audioPlayer.currentAudioUrl;
                audioPlayer.player.play();
                audioPlayer._isPlaying = true;
            }
        }else{
            if(audioPlayer.callback && audioPlayer.target) {
                audioPlayer.callback.call(audioPlayer.target);
            }
        }
    }

    AudioPlayer.prototype._playErrorHandler = function (err) {
        alert("音频播放错误! " + ' code: ' + err.code + ' message: ' + err.message);
    }

    AudioPlayer.prototype._durationChangeHandler = function (e) {
        if(audioPlayer._startPercent) {
            audioPlayer.player.currentTime = audioPlayer.player.duration * audioPlayer._startPercent;
        }
    }

    AudioPlayer.prototype.playAudio = function (url, isRepeat, volume) {
        if(!url) return;
        if(!this.player) {
            this.init();
        }
        this.callback = null;
        this.target = null;
        this.player.src = url;
        this.currentAudioUrl = url;
        this.isRepeat = isRepeat == undefined ? false : isRepeat;
        this._isPlaying = true;

        this.player.play();
        
        if(volume && volume > 0) this.setVolume(volume);
    }

    AudioPlayer.prototype.playAudioCallback = function (url, callback, target) {
        this.callback = null;
        this.target = null;
        this.playAudio(url, false);
        this.isRepeat = false;
        this.callback = callback;
        this.target = target;
    }

    AudioPlayer.prototype.pauseAudio = function () {
        if(this.player && this._isPlaying) {
            this.player.pause();
            this._isPlaying = false;
        }
    }

    AudioPlayer.prototype.resumeAudio = function () {
        if(!this.currentAudioUrl) return;
        this.player.play();
        this._isPlaying = true;
    }

    AudioPlayer.prototype.stopAudio = function () {
        this._startPercent = 0;
        
        if(this.currentAudioUrl) {
            this.currentAudioUrl = null;

            if(this._isPlaying) {
                this._isPlaying = true;
                this.player.currentTime = 0;
                this.player.pause();
            }
        }
    }

    AudioPlayer.prototype.seekToPercent = function (percent) {
        if(this.player && this.currentAudioUrl) {
            var time = parseInt(this.player.duration * percent);
            this.player.currentTime = time;
        }else{
            this._startPercent = percent;
        }
    }

    AudioPlayer.prototype.setVolume = function (volume) {
        if(volume > 1) volume = 1;
        if(volume < 0) volume = 0;
        this.volume = volume;
        this.player.volume = volume;
    }

    AudioPlayer.prototype.getVolume = function () {
        return this.volume;
    }

    AudioPlayer.getInstance = function () {
        if(!audioPlayer) {
            audioPlayer = new AudioPlayer();
            audioPlayer._init();
        }
        return audioPlayer;
    }

    global.audioPlayer = AudioPlayer.getInstance();
})(window);

(function (global) {
    var multiAudioPlayer = null;

    function AudioChannel(){
        this.id = Math.random().toString(32).slice(2),
        this.audio = null;
        this.url = null;
        this.callback = null;
        this.target = null;
        this.isPlaying = false;
        this.isRepeat = false;
        this.isUsed = false;
        this.volume = 1;
    }

    AudioChannel.prototype._init = function () {
         var audio = document.createElement('audio');
         this.audio = audio;
         this.audio.id = this.id;
         this._handlePlayEvent();
    }

    AudioChannel.prototype._handlePlayEvent = function () {
        this.audio.addEventListener("ended", this._playEndHandler.bind(this), false);
        this.audio.addEventListener("error", this._playErrorHandler.bind(this), false);
    }

    AudioChannel.prototype._playEndHandler = function (e) {
        this.isPlaying = false;
        if(this.isRepeat){
            if(this.audio.paused){
                this.audio.currentTime = 0.1;
                this.audio.src = this.url;
                this.audio.play();
                this.isPlaying = true;
            }
        }else{
            if(this.callback && this.target) {
                this.callback.call(this.target);
            }else{
                this.stop();
            }
        }
    }

    AudioChannel.prototype._playErrorHandler = function (err) {
        alert("音频播放错误! " + ' code: ' + err.code + ' message: ' + err.message);
    }

    AudioChannel.prototype.play = function (url, isRepeat) {
        if(!url) return -1;
        this.callback = null;
        this.target = null;
        this.audio.src = url;
        this.audio.play();
        this.url = url;
        this.isRepeat = isRepeat == undefined ? false : isRepeat;
        this.isPlaying = true;
        this.isUsed = true;
        return this.id;
    }

    MultiAudioPlayer.prototype.playCallback = function (url, callback, target) {
        var channelId = this.play(url, false);
        this.callback = callback;
        this.target = target;
        return channelId;
    }

    AudioChannel.prototype.stop = function () {
        if(this.audio) {
            if(!this.audio.paused) {
                this.audio.pause();
            }
            this.isPlaying = false;
            this.isUsed = false;
        }
    }

    AudioChannel.prototype.pause = function () {
        if(this.audio && this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    AudioChannel.prototype.resume = function () {
        if(!this.url) return;
        this.audio.play();
        this.isPlaying = true;
    }



    AudioChannel.prototype.setVolume = function (volume) {
        if(volume > 1) volume = 1;
        if(volume < 0) volume = 0;
        this.volume = volume;
        this.audio.volume = volume;
    }

    AudioChannel.prototype.getVolume = function () {
        return this.volume;
    }



    /**
     * MultiAudioPlayer
     */

    function MultiAudioPlayer(){
        this.volume = 1;
        this.audioList = [];
        this.maxChannel = 5;
    }

    MultiAudioPlayer.prototype._init = function () {
        var len = this.maxChannel;
        for(var i=0;i<len;i++){
            var channel = new AudioChannel();
            channel._init();
            this.audioList.push(channel);
        }
    }

    MultiAudioPlayer.prototype.getAudioFromPool = function () {
        var audio = null;
        for(var i=0;i<this.audioList.length;i++){
            if(!this.audioList[i].isUsed) {
                audio = this.audioList[i];
                break;
            }
        }
        if(!audio) {
            audio = this.audioList[0];
        }
        return audio;
    }

    MultiAudioPlayer.prototype.getAudioFromPoolById = function (id) {
        var audio = null;
        for(var i=0;i<this.audioList.length;i++){
            if(this.audioList[i].id == id) {
                audio = this.audioList[i];
                break;
            }
        }
        return audio;
    }

    MultiAudioPlayer.prototype.playAudio = function (url, isRepeat) {
        if(!url) return;
        var channel = this.getAudioFromPool();
        channel.play(url, isRepeat);
        return channel.id;
    }

    MultiAudioPlayer.prototype.playAudioCallback = function (url, callback, target) {
        var channel = this.getAudioFromPool();
        channel.playCallback(url, callback, target);
        return channel.id;
    }

    MultiAudioPlayer.prototype.pauseAudio = function (id) {
        var channel = this.getAudioFromPoolById(id);
        channel.pause();
    }

    MultiAudioPlayer.prototype.resumeAudio = function (id) {
        var channel = this.getAudioFromPoolById(id);
        channel.resume();
    }

    MultiAudioPlayer.prototype.setVolume = function (volume) {
        if(volume > 1) volume = 1;
        if(volume < 0) volume = 0;
        this.volume = volume;
        for(var i=0;i<this.audioList.length;i++){
            this.audioList[i].setVolume(volume);
        }
    }

    MultiAudioPlayer.prototype.getVolume = function () {
        return this.volume;
    }

    MultiAudioPlayer.getInstance = function () {
        if(!multiAudioPlayer) {
            multiAudioPlayer = new MultiAudioPlayer();
            multiAudioPlayer._init();
        }
        return multiAudioPlayer;
    }

    global.multiAudioPlayer = MultiAudioPlayer.getInstance();
})(window);