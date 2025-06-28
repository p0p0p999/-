/*! npm.im/iphone-inline-video */
/*MIT © Federico Brigante*/
var makeVideoPlayableInline=function(){"use strict";/*! npm.im/intervalometer */
function e(e,r,n,i){function t(n){d=r(t,i),e(n-(a||n)),a=n}var d,a;return{start:function(){d||t(0)},stop:function(){n(d),d=null,a=0}}}function r(r){return e(r,requestAnimationFrame,cancelAnimationFrame)}function n(e,r,n,i){function t(r){Boolean(e[n])===Boolean(i)&&r.stopImmediatePropagation(),delete e[n]}return e.addEventListener(r,t,!1),t}function i(e,r,n,i){function t(){return n[r]}function d(e){n[r]=e}i&&d(e[r]),Object.defineProperty(e,r,{get:t,set:d})}function t(e,r,n){n.addEventListener(r,function(){return e.dispatchEvent(new Event(r))})}function d(e,r){Promise.resolve().then(function(){e.dispatchEvent(new Event(r))})}function a(e){var r=new Audio;return t(e,"play",r),t(e,"playing",r),t(e,"pause",r),r.crossOrigin=e.crossOrigin,r.src=e.src||e.currentSrc||"data:",r}function o(e,r,n){(m||0)+200<Date.now()&&(e[b]=!0,m=Date.now()),n||(e.currentTime=r),A[++k%3]=100*r|0}function u(e){return e.driver.currentTime>=e.video.duration}function s(e){var r=this;r.video.readyState>=r.video.HAVE_FUTURE_DATA?(r.hasAudio||(r.driver.currentTime=r.video.currentTime+e*r.video.playbackRate/1e3,r.video.loop&&u(r)&&(r.driver.currentTime=0)),o(r.video,r.driver.currentTime)):r.video.networkState!==r.video.NETWORK_IDLE||r.video.buffered.length||r.video.load(),r.video.ended&&(delete r.video[b],r.video.pause(!0))}function c(){var e=this,r=e[h];return e.webkitDisplayingFullscreen?void e[E]():("data:"!==r.driver.src&&r.driver.src!==e.src&&(o(e,0,!0),r.driver.src=e.src),void(e.paused&&(r.paused=!1,e.buffered.length||e.load(),r.driver.play(),r.updater.start(),r.hasAudio||(d(e,"play"),r.video.readyState>=r.video.HAVE_ENOUGH_DATA&&d(e,"playing")))))}function v(e){var r=this,n=r[h];n.driver.pause(),n.updater.stop(),r.webkitDisplayingFullscreen&&r[T](),n.paused&&!e||(n.paused=!0,n.hasAudio||d(r,"pause"),r.ended&&(r[b]=!0,d(r,"ended")))}function p(e,n){var i=e[h]={};i.paused=!0,i.hasAudio=n,i.video=e,i.updater=r(s.bind(i)),n?i.driver=a(e):(e.addEventListener("canplay",function(){e.paused||d(e,"playing")}),i.driver={src:e.src||e.currentSrc||"data:",muted:!0,paused:!0,pause:function(){i.driver.paused=!0},play:function(){i.driver.paused=!1,u(i)&&o(e,0)},get ended(){return u(i)}}),e.addEventListener("emptied",function(){var r=!i.driver.src||"data:"===i.driver.src;i.driver.src&&i.driver.src!==e.src&&(o(e,0,!0),i.driver.src=e.src,r?i.driver.play():i.updater.stop())},!1),e.addEventListener("webkitbeginfullscreen",function(){e.paused?n&&!i.driver.buffered.length&&i.driver.load():(e.pause(),e[E]())}),n&&(e.addEventListener("webkitendfullscreen",function(){i.driver.currentTime=e.currentTime}),e.addEventListener("seeking",function(){A.indexOf(100*e.currentTime|0)<0&&(i.driver.currentTime=e.currentTime)}))}function l(e){var r=e[h];e[E]=e.play,e[T]=e.pause,e.play=c,e.pause=v,i(e,"paused",r.driver),i(e,"muted",r.driver,!0),i(e,"playbackRate",r.driver,!0),i(e,"ended",r.driver),i(e,"loop",r.driver,!0),n(e,"seeking"),n(e,"seeked"),n(e,"timeupdate",b,!1),n(e,"ended",b,!1)}function f(e,r,n){void 0===r&&(r=!0),void 0===n&&(n=!0),n&&!g||e[h]||(p(e,r),l(e),e.classList.add("IIV"),!r&&e.autoplay&&e.play(),/iPhone|iPod|iPad/.test(navigator.platform)||console.warn("iphone-inline-video is not guaranteed to work in emulated environments"))}var m,y="undefined"==typeof Symbol?function(e){return"@"+(e||"@")+Math.random()}:Symbol,g=/iPhone|iPod/i.test(navigator.userAgent)&&!matchMedia("(-webkit-video-playable-inline)").matches,h=y(),b=y(),E=y("nativeplay"),T=y("nativepause"),A=[],k=0;return f.isWhitelisted=g,f}();


/**
 * By Hz
 * 201705250948
 */
(function(){
	var videoPlayer = null;

	function VideoPlayer () {
		this.url = null;
		this.isPlaying = false;
		this.volume = 1;

		this.container = null;
		this.player = null;

		//callbacks
		this.onUpdate = null;
		this.onEnded = null;
	}

	VideoPlayer.prototype.init = function (opt) {
		this.container = opt.container || document.body;

		this.player = document.createElement('video');
		this.container.appendChild(this.player);
		var style = this.player.style;
		style.position = 'absolute';
		style.top = opt.top || 0;
		style.left = opt.left || 0;
		style.width = opt.width || '1px';
		style.height = opt.height || '1px';
		style.zIndex = opt.zIndex || '998';

		this.player.setAttribute('webkit-playsinline', true);
		this.player.setAttribute('playsinline', true);

		makeVideoPlayableInline(this.player);		
		var videoStyle = document.createElement("style");
        videoStyle.type = "text/css";
        videoStyle.textContent = '.IIV::-webkit-media-controls-play-button,.IIV::-webkit-media-controls-start-playback-button {opacity: 0;pointer-events: none;width: 5px;}';
        document.body.appendChild(videoStyle);

        var canvas = document.getElementsByTagName('canvas')[0];
        if(canvas) canvas.style.background = 'transparent';

		if(opt.poster) {
			if(this.isAndroid()) {
				this.setPoster(opt.poster);
			}else{
				this.player.setAttribute('poster', opt.poster);
			}
		}

		// this.player.setAttribute('controls', true);

		if(opt.url){
			this.setUrl(opt.url);
		}

		this._handleEvents();
	}

	VideoPlayer.prototype.isAndroid = function() {
		var ua = navigator.userAgent.toLowerCase();
		return ua.indexOf("android") > -1;
	}

	VideoPlayer.prototype.setPoster = function(url){
		var canvas = document.getElementsByTagName('canvas')[0];
		var img = document.createElement('img');
		// this.container.appendChild(img);
		this.container.insertBefore(img, canvas);
		img.src = url;

		var style = img.style;
		style.position = 'absolute';
		style.top = 0;
		style.left = 0;
		style.width = '100%';
		style.height = '100%';
		style.zIndex = 999;

		this.poster = img;
	}

	VideoPlayer.prototype.setPosterVisible = function(bool){
		this.poster.style.display = bool ? 'block' : 'none';
	}

	VideoPlayer.prototype._handleEvents = function () {
		this.player.addEventListener("ended",this._playEndHandler.bind(this),false);
        this.player.addEventListener("error",this._playErrorHandler.bind(this),false);
        this.player.addEventListener("durationchange",this._durationChangeHandler.bind(this),false);
        this.player.addEventListener("timeupdate",this._timeUpdateHandler.bind(this),false);
	}

	VideoPlayer.prototype._playEndHandler = function (e) {
		this.isPlaying = false;
		if(this.onEnded) {
			this.onEnded();
		}
	}

	VideoPlayer.prototype._durationChangeHandler = function (e) {
		if(this.onDurationChange) {
			var duration = this.player.duration;
			var current = this.player.currentTime || 0;
			this.onDurationChange(current, duration || 0.001);
		}
	}

	VideoPlayer.prototype._timeUpdateHandler = function (e) {
		if(this.onUpdate && this.isPlaying) {
			var duration = this.player.duration;
			var current = this.player.currentTime;
			this.onUpdate(current, duration || 0.001);

			if(this.poster && this.player && this.player.currentTime > 0) {
				this.setPosterVisible(false);
			}
		}
	}

	VideoPlayer.prototype._playErrorHandler = function (err) {
		alert("播放错误! " + ' code: ' + err.code + ' message: ' + err.message);
	}

	VideoPlayer.prototype.setUrl = function (url) {
		this.url = url;
		if(this.player) {
			this.player.src = url;
		}
	}
	
	VideoPlayer.prototype.setCover = function (url) {
		this.url = url;
		if(this.player) {
			this.player.poster = url;
		}
	}

	VideoPlayer.prototype.play = function () {
		this.isPlaying = true;
		this.player.play();
	}

	VideoPlayer.prototype.stop = function () {
		this.pause();
		this.player.currentTime = 0;
	}

	VideoPlayer.prototype.resume = function () {
		this.play();
	}

	VideoPlayer.prototype.pause = function () {
		this.isPlaying = false;
		this.player.pause();
	}

	VideoPlayer.prototype.seekTo = function (time) {
		this.player.currentTime = time;
	}

	VideoPlayer.prototype.seekToPercent = function (percent) {
		this.player.currentTime = this.player.duration * percent;
	}

	VideoPlayer.prototype.setVolume = function (val) {
		if(this.player) {
			this.player.volume = val;
			this.volume = val;
		}
	}

	VideoPlayer.getInstance = function () {
        if(!videoPlayer) {
            videoPlayer = new VideoPlayer();
        }
        return videoPlayer;
    }

    VideoPlayer.version = '0.1.5';

    videoPlayer = VideoPlayer.getInstance();
    window.videoPlayer = videoPlayer;
})();

(function(){
	var mediaPlayer = null;

	function MediaPlayer () {
		this.url = null;
		this.isPlaying = false;
		this.volume = 1;

		this.container = null;
		this.player = null;

		//callbacks
		this.onUpdate = null;
		this.onEnded = null;
	}

	MediaPlayer.prototype.init = function (opt) {
		this.container = opt.container || document.body;

		this.player = document.createElement('audio');
		this.container.appendChild(this.player);
		var style = this.player.style;
		style.position = 'absolute';
		style.top = opt.top || 0;
		style.left = opt.left || 0;
		style.width = opt.width || '1px';
		style.height = opt.height || '1px';
		style.zIndex = opt.zIndex || '998';

		// this.player.setAttribute('controls', true);

		if(opt.url){
			this.setUrl(opt.url);
		}

		this._handleEvents();
	}

	MediaPlayer.prototype._handleEvents = function () {
		this.player.addEventListener("ended",this._playEndHandler.bind(this),false);
        this.player.addEventListener("error",this._playErrorHandler.bind(this),false);
        this.player.addEventListener("durationchange",this._durationChangeHandler.bind(this),false);
        this.player.addEventListener("timeupdate",this._timeUpdateHandler.bind(this),false);
	}

	MediaPlayer.prototype._playEndHandler = function (e) {
		this.isPlaying = false;
		if(this.onEnded) {
			this.onEnded();
		}
	}

	MediaPlayer.prototype._durationChangeHandler = function (e) {
		if(this.onDurationChange) {
			var duration = this.player.duration;
			var current = this.player.currentTime || 0;
			this.onDurationChange(current, duration || 0.001);
		}
	}

	MediaPlayer.prototype._timeUpdateHandler = function (e) {
		if(this.onUpdate && this.isPlaying) {
			var duration = this.player.duration;
			var current = this.player.currentTime;
			this.onUpdate(current, duration || 0.001);
		}
	}

	MediaPlayer.prototype._playErrorHandler = function (err) {
		alert("播放错误! " + ' code: ' + err.code + ' message: ' + err.message);
	}

	MediaPlayer.prototype.setUrl = function (url) {
		this.url = url;
		if(this.player) {
			this.player.src = url;
		}
	}

	MediaPlayer.prototype.play = function () {
		this.isPlaying = true;
		this.player.play();
	}

	MediaPlayer.prototype.stop = function () {
		this.pause();
		this.player.currentTime = 0;
	}

	MediaPlayer.prototype.resume = function () {
		this.play();
	}

	MediaPlayer.prototype.pause = function () {
		this.isPlaying = false;
		this.player.pause();
	}

	MediaPlayer.prototype.seekTo = function (time) {
		this.player.currentTime = time;
	}

	MediaPlayer.prototype.seekToPercent = function (percent) {
		this.player.currentTime = this.player.duration * percent;
	}

	MediaPlayer.prototype.setVolume = function (val) {
		if(this.player) {
			this.player.volume = val;
		}
	}

	MediaPlayer.getInstance = function () {
        if(!mediaPlayer) {
            mediaPlayer = new MediaPlayer();
        }
        return mediaPlayer;
    }

    MediaPlayer.version = '0.1.0';

    mediaPlayer = MediaPlayer.getInstance();
    window.mediaPlayer = mediaPlayer;
})();

(function(cjs){
	var mcPlayer = null;

	function MCPlayer() {
		this.component = null;

		this.isPlaying = false;
		this.fps = 24;

		//callbacks
		this.onUpdate = null;
		this.onEnded = null;
		this.onDurationChange = null;
	}

	/**
	 * private
	 */

	MCPlayer.prototype._getDuration = function(){
		if(!this.component) return 0;
		return this.component.totalFrames / this.fps;
	}

	MCPlayer.prototype._getCurrentTime = function(){
		if(!this.component) return 0;
		return this.component.currentFrame / this.fps;
	}

	MCPlayer.prototype._convertTimeToFrame = function(time){
		return parseInt(time * this.fps);
	}

	MCPlayer.prototype._handleEvents =  function(){
		if(!this.component) return;

		this.component.on('tick', this._onUpdate.bind(this));
	}

	MCPlayer.prototype._onUpdate = function(){
		if(this.onUpdate) {
			var duration = this._getDuration();
			var current = this._getCurrentTime();
			this.onUpdate(current, duration || 0.001);
		}

		var current = this.component.currentFrame;
		var total = this.component.totalFrames;
		if(current == total) {
			this.pause();

			if(this.onEnded) {
				this.onEnded();
			}
		}
	}

	MCPlayer.prototype._durationChangeHandler = function(){
		if(this.onDurationChange) {
			var duration = this._getDuration();
			var current = this._getCurrentTime();
			this.onDurationChange(current, duration || 0.001);
		}
	}

	/**
	 * public
	 */
	MCPlayer.prototype.init = function(opt){
		if(!opt.component) {
			console.error("未指定播放的影片剪辑对象", opt);
			return;
		}
		
		this.setComponent(opt.component);

		opt.container.addChild(opt.component);

		this._handleEvents();
		this._durationChangeHandler();
	}

	MCPlayer.prototype.setComponent = function(mc){
		mc.gotoAndStop(0);

		this.component = mc;
	}

	MCPlayer.prototype.play = function(){
		this.isPlaying = true;
		if(this.component) {
			this.component.play();
			if(this.component.currentFrame == this.component.totalFrames) {
				this.component.gotoAndPlay(0);
			}
		}
	}

	MCPlayer.prototype.pause = function(){
		this.isPlaying = false;
		if(this.component) {
			this.component.stop();
		}
	}

	MCPlayer.prototype.resume = function(){
		this.play();
	}

	MCPlayer.prototype.stop = function(){
		this.pause();
		this.seekTo(0);
	}

	MCPlayer.prototype.seekTo = function(time){
		if(!this.component) return;
		var frame = this._convertTimeToFrame(time);
		if(this.isPlaying) {
			this.component.gotoAndPlay(frame);
		}else{
			this.component.gotoAndStop(frame);
		}
	}

	MCPlayer.prototype.seekToPercent = function(percent){
		var duration = this._getDuration();
		var time = duration * percent;
		this.seekTo(time);
	}

	MCPlayer.getInstance = function () {
		if(!mcPlayer) {
			mcPlayer = new MCPlayer();
		}
		return mcPlayer;
	}

	MCPlayer.version = '0.1.0';

	window.mcPlayer = MCPlayer.getInstance();
})(createjs || {});

(function(cjs){
	var mcAudioPlayer = null;

	function MCAudioPlayer() {
		this.component = null;
		this.audio = null;

		this.audioUrl = '';
		this.isPlaying = false;
		this.volume = 1;
		this.fps = 24;

		//callbacks
		this.onUpdate = null;
		this.onEnded = null;
		this.onDurationChange = null;

		this._setUpAudio();
	}

	/**
	 * private
	 */
	MCAudioPlayer.prototype._setUpAudio = function(){
		var audio = document.createElement('audio');
		audio.setAttribute('controls', true);
		audio.style.opacity = 0;
		audio.style.position = 'absolute';
		audio.style.left = '0';
		audio.style.top = '0';
		this.audio = audio;
	}

	/**
	 * private
	 */

	MCAudioPlayer.prototype._getDuration = function(){
		if(!this.component) return 0;
		return this.component.totalFrames / this.fps;
	}

	MCAudioPlayer.prototype._getCurrentTime = function(){
		if(!this.component) return 0;
		return this.component.currentFrame / this.fps;
	}

	MCAudioPlayer.prototype._convertTimeToFrame = function(time){
		return parseInt(time * this.fps);
	}

	MCAudioPlayer.prototype._handleEvents =  function(){
		if(!this.component) return;

		this.component.on('tick', this._onComponentUpdate.bind(this));

		this.audio.addEventListener("ended",this._playEndHandler.bind(this),false);
        this.audio.addEventListener("error",this._playErrorHandler.bind(this),false);
        this.audio.addEventListener("durationchange",this._durationChangeHandler.bind(this),false);
        this.audio.addEventListener("timeupdate",this._timeUpdateHandler.bind(this),false);
        this.audio.addEventListener("canplaythrough",this._canplayThrough.bind(this),false);
	}

	MCAudioPlayer.prototype._onComponentUpdate = function(){
		if(this.onUpdate) {
			var duration = this._getDuration();
			var current = this._getCurrentTime();
			this.onUpdate(current, duration || 0.001);
		}

		var current = this.component.currentFrame;
		var total = this.component.totalFrames;
		if(current == total) {
			this.pause();

			this.isPlaying = false;
			if(this.onEnded) {
				this.onEnded();
			}
		}
	}

	MCAudioPlayer.prototype._playEndHandler = function (e) {
		
	}

	MCAudioPlayer.prototype._durationChangeHandler = function(){
		if(this.onDurationChange) {
			/*var duration = this.audio.duration;
			var current = this.audio.currentTime || 0;*/
			var duration = this._getDuration();
			var current = this._getCurrentTime();
			this.onDurationChange(current, duration);
		}
	}


	MCAudioPlayer.prototype._timeUpdateHandler = function (e) {
		/*if(this.onUpdate) {
			var duration = this.audio.duration;
			var current = this.audio.currentTime;
			this.onUpdate(current, duration);
		}*/
	}

	MCAudioPlayer.prototype._canplayThrough = function(e){
	}

	MCAudioPlayer.prototype._playErrorHandler = function (err) {
		alert("播放错误! " + ' code: ' + err.code + ' message: ' + err.message);
	}

	/**
	 * public
	 */
	MCAudioPlayer.prototype.init = function(opt){
		if(!opt.component) {
			console.error("未指定播放的影片剪辑对象", opt);
			return;
		}
		
		this.setComponent(opt.component);

		// opt.container.addChild(opt.component);
		document.body.appendChild(this.audio);

		this.setAudioUrl(opt.audio);

		this._handleEvents();
	}

	MCAudioPlayer.prototype.setComponent = function(mc){
		mc.gotoAndStop(0);

		this.component = mc;
	}

	MCAudioPlayer.prototype.setAudioUrl = function(url){
		this.audioUrl = url;
		this.audio.src = url;
	}

	MCAudioPlayer.prototype.play = function(){
		this.isPlaying = true;
		if(this.component) {
			this.component.play();
			if(this.component.currentFrame == this.component.totalFrames) {
				this.component.gotoAndPlay(0);
				this.audio.currentTime = 0;
			}
		}
		this.audio.play();
		this.audio.volume = this.volume;
	}

	MCAudioPlayer.prototype.pause = function(){
		this.isPlaying = false;
		if(this.component) {
			this.component.stop();
		}
		this.audio.pause();
	}

	MCAudioPlayer.prototype.resume = function(){
		this.play();
	}

	MCAudioPlayer.prototype.stop = function(){
		this.pause();
		this.seekTo(0);
		this.audio.currentTime = 0;
	}

	MCAudioPlayer.prototype.seekTo = function(time){
		if(!this.component) return;
		var frame = this._convertTimeToFrame(time);
		if(this.isPlaying) {
			this.component.gotoAndPlay(frame);
		}else{
			this.component.gotoAndStop(frame);
		}

		if(time > this.audio.duration) {
			this.audio.pause();
			return;
		}
		this.audio.currentTime = time;
		if(this.isPlaying && this.audio.paused) {
			this.audio.play();
		}
	}

	MCAudioPlayer.prototype.seekToPercent = function(percent){
		if(!this.audio || !this.audio.duration) return;
		var duration = this._getDuration();
		var time = duration * percent;
		this.seekTo(time);
	}

	MCAudioPlayer.prototype.setVolume = function(val){
		if(this.audio) {
			this.audio.volume = val;
			this.volume = val;
		}
	}

	MCAudioPlayer.getInstance = function () {
		if(!mcAudioPlayer) {
			mcAudioPlayer = new MCAudioPlayer();
		}
		return mcAudioPlayer;
	}

	MCAudioPlayer.version = '0.1.2';

	window.mcAudioPlayer = MCAudioPlayer.getInstance();
})(createjs || {});