(function(cjs) {
	cjs.utils = {};
	var _self = this;

	//createjs
	var canvas, stage, exportRoot;
	var gameContainer;
	var context;
	var loader = null;

	//stage update flag
	var update = false;
	var timerAdjust;

	//settings
	var defaultConfig = {
		container: 'gameContainer',
		canvas: 'gameCanvas',
		width: 1280,
		height: 720,
		autoRefresh: false
	};

	/*
	 * module instance & vars
	 */

	//loading
	var _loading = null;
	var isFixStage = false;

	/*
	 * main
	 */
	function _setup(config) {
		extend(config, defaultConfig);

		canvas = document.getElementById(defaultConfig["canvas"]);
		gameContainer = newElement('div');
		canvas.parentNode.appendChild(gameContainer);
		gameContainer.appendChild(canvas);

		gameContainer.setAttribute('id', defaultConfig["container"]);

		context = canvas.getContext('2d');

		var baseStyle = newElement("style");
		baseStyle.type = "text/css";
		document.body.appendChild(baseStyle);
		baseStyle.textContent =
			"body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;" +
			"-webkit-tap-highlight-color:rgba(0,0,0,0);}";

		var conStyle = gameContainer.style;
		conStyle.width = defaultConfig.width + 'px';
		conStyle.height = defaultConfig.height + 'px';
		conStyle.margin = "0 auto";
		conStyle.position = 'relative';
		conStyle.overflow = 'hidden';

		canvas.style.position = "relative";
		canvas.style.zIndex = "999";
	}
	
	function init() {
		//Animate
		if(typeof AdobeAn !== "undefined") {
			var an;
			for (var index in AdobeAn.compositions) {
				an = AdobeAn.compositions[index];
			}
			lib = an.getLibrary();
			images = an.getImages();
		}

		onWindowResize();
		window.onresize = onWindowResize;
		// window.onresize = adjustWindow;
		if (get_android_version() >= 6 || IsPC()) {
			document.body.style.background = '#000';
			showLoading();
		}

		if (lib.properties.manifest.length == 0) {
			handleComplete(null);
		} else {
			images = images || {};

			loader = new cjs.LoadQueue(false);
			loader.installPlugin(cjs.Sound);
			loader.addEventListener("complete", handleComplete);
			loader.addEventListener("fileload", handleFileLoad);
			loader.loadManifest(lib.properties.manifest);
		}
	}

	function IsPC() {
		var userAgentInfo = navigator.userAgent;
		var Agents = ["Android", "iPhone",
			"SymbianOS", "Windows Phone",
			"iPad", "iPod"
		];
		var flag = true;
		for (var v = 0; v < Agents.length; v++) {
			if (userAgentInfo.indexOf(Agents[v]) > 0) {
				flag = false;
				break;
			}
		}
		return flag;
	}

	function get_android_version() {
		var ua = navigator.userAgent.toLowerCase();
		var version = null;
		if (ua.indexOf("android") > 0) {
			var reg = /android [\d._]+/gi;
			var v_info = ua.match(reg);
			version = (v_info + "").replace(/[^0-9|_.]/ig, "").replace(/_/ig, "."); //得到版本号4.2.2
			version = parseInt(version.split('.')[0]); // 得到版本号第一位
		}
		return version;
	}

	function setImageHitArea(object) {
		if(object.image && !object.hitArea) {
			var hitArea = new createjs.Shape();
			var width, height, coordX, coordY;
			coordX = 0; coordY = 0;
			width = object.nominalBounds.width;
			height = object.nominalBounds.height;
			hitArea.graphics.beginFill("white").drawRect(coordX, coordY, width, height);
			hitArea.alpha = 0.01;
			object.hitArea = hitArea;
		}
		for (var key in object) {
			var classType = checkClassType(object, key);
			if(classType) {
				setImageHitArea(object[key]);
			}
		}
	}

	function checkClassType(object, key) {
		var keyList = ['parent', '_props', '_rectangle', 'timeline', '_managed'];
		var classList = [createjs.MovieClip, createjs.Bitmap];
		var className = ['MovieClip', 'Bitmap'];
		var result = false;
		if (object.hasOwnProperty(key) && typeof object[key] === 'object'
		&& !Array.isArray(object[key]) && object[key] != null
		&& keyList.indexOf(key) === -1) {
			for(var i = 0; i < classList.length; i++) {
				if(object[key] instanceof classList[i]){
					result = className[i];
					break;
				}
			}
		}
		return result;
	}

	function handleFileLoad(evt) {
		onWindowResize();
		if (evt.item.type == "image") {
			images[evt.item.id] = evt.result;
		}
		setLoadProgress(parseInt(loader.progress * 100));
	}

	function handleComplete(evt) {
		exportRoot = new lib[defaultConfig.lib_name]();

		stage = new cjs.Stage(canvas);
		stage.addChild(exportRoot);
		stage.update();

		setImageHitArea(exportRoot);

		// window.ontouchstart = null;
		cjs.Touch.enable(stage);

		stage.enableMouseOver(20);

		cjs.Ticker.framerate = lib.properties.fps;
		cjs.Ticker.addEventListener("tick", tick);

		onWindowResize();


		if (cjs.utils.onStart) {
			cjs.utils.onStart.call(_self, exportRoot, stage);
		}
		setTimeout(function() {
			hideLoading();
			isFixStage = true;
			document.body.style.background = '#000';
		}, 500)


		//添加安卓横竖屏切换
		window.addEventListener("orientationchange", function() {
			timerAdjust = setTimeout(onWindowResize, 200);
		});
	}

	function adjustWindow() {
		//如果是安卓设备
		if (/android/.test(navigator.userAgent.toLowerCase())) {
			return;
		}
		onWindowResize();
	}

	function onWindowResize() {
		var ow = defaultConfig.width;
		var oh = defaultConfig.height;
		var gw = window.innerWidth;
		var gh = window.innerHeight;
		var originalRatio = ow / oh;
		var currentRatio = gw / gh;
		var w, h;
		if (currentRatio > originalRatio) {
			w = ow / oh * gh;
			h = gh;

			gameContainer.style.margin = '0 ' + (gw - w) * .5 + 'px';
		} else {
			w = gw;
			h = oh / ow * gw;
			gameContainer.style.margin = (gh - h) * .5 + 'px 0';
		}
		gameContainer.style.width = w + 'px';
		gameContainer.style.height = h + 'px';

		var ratio = getPixelRatio(context);

		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
		canvas.width = w * ratio;
		canvas.height = h * ratio;

		if (window.resizeWebglCanvas) {
			window.resizeWebglCanvas(w, h);
		}

		if (stage) {
			stage.scaleX = w / ow * ratio;
			stage.scaleY = h / oh * ratio;
			stage.update();
			// console.log(document.getElementById('canvas').width);
			clearTimeout(timerAdjust);
			//
			if (get_android_version() >= 6 || IsPC()) {
				//
			} else {
				if (!isFixStage) showLoading();
			}
		}
	}

	function tick(event) {
		if (defaultConfig.autoRefresh) {
			stage.update(event);
		} else {
			if (update) {
				update = false;
				stage.update(event);
			}
		}
		if (window.render) {
			window.render();
		}
	}

	/*
	 * loading
	 */
	function Loading() {
		this.el = null;
		this.img = null;
		this.text = null;
	}

	Loading.prototype._init = function() {
		this.el = newElement('div');
		gameContainer.appendChild(this.el);
		this.el.setAttribute('id', 'loading');

		var loadStyle = this.el.style;
		loadStyle.position = 'absolute';
		loadStyle.width = '100%';
		loadStyle.height = '100%';
		loadStyle.top = 0;
		loadStyle.left = 0;
		loadStyle.zIndex = "1000";
		loadStyle.display = 'none';

		this.initLoadingStyle({
			img: defaultConfig['loading'].bg,
			progress: defaultConfig['loading'].progress
		});
	}

	Loading.prototype.initLoadingStyle = function(opt) {
		var img = newElement('img');
		this.el.appendChild(img);
		img.src = opt.img;
		img.style.height = "100%";
		img.style.width = "100%";

		this.img = img;

		var text = newElement('div');
		this.el.appendChild(text);

		text.style.position = 'absolute';
		text.style.top = 0;
		text.style.left = 0;
		text.style.width = '100%';
		text.style.height = '100%';
		text.style.margin = 'auto';
		// 
		var progressText = newElement('div');
		this.el.appendChild(progressText);
		progressText.style.color = '#333333';
		progressText.style.position = 'absolute';
		progressText.style.top = '74%';
		progressText.style.left = '48%';
		progressText.style.fontSize = '14px';
		this.progressTextShow = progressText;

		var imgProgress = newElement('img');
		text.appendChild(imgProgress);
		imgProgress.src = opt.progress;
		imgProgress.style.top = '0%';
		imgProgress.style.left ='0%';
		imgProgress.style.width = '100%';
        imgProgress.style.position = "relative";


		this.text = imgProgress;
		mypic = this.text;
	}

	Loading.prototype.show = function(isShowText) {
		this.el.style.display = 'block';

		isShowText = isShowText == undefined ? true : isShowText;
		if (isShowText) {
			this.text.style.display = "block";
		} else {
			this.text.style.display = "none";
		}
	}

	Loading.prototype.hide = function() {
		this.el.style.display = 'none';
	}

	Loading.prototype.setLoadProgress = function(percent) {
		this.text.style.width = '100%';
		this.progressTextShow.innerHTML = percent + '%';
	}

	Loading.getInstance = function() {
		if (!_loading) {
			_loading = new Loading();
			_loading._init();
		}

		return _loading;
	}

	function _initLoading() {
		_loading = Loading.getInstance();
	}

	function showLoading(isShowText) {
		var loading = Loading.getInstance();
		loading.show();
	}

	function hideLoading() {
		var loading = Loading.getInstance();
		loading.hide();
	}

	function setLoadProgress(percent) {
		var loading = Loading.getInstance();
		loading.setLoadProgress(percent);
	}

	function setLoadingStyle(styleObj) {
		var text = Loading.getInstance().text;
		for (var prop in styleObj) {
			if (styleObj.hasOwnProperty(prop)) {
				text.style[prop] = styleObj[prop];
			}
		}
	}


	/*
	 * frames
	 */
	function prevFrame(timeline) {
		timeline = timeline || exportRoot;
		var frame = timeline.currentFrame;
		frame--;
		if (frame < 0) {
			frame = 0;
			return;
		}
		viewFrame(frame, timeline);
	}

	function nextFrame(timeline) {
		timeline = timeline || exportRoot;
		var frame = timeline.currentFrame;
		frame++;
		if (frame > timeline.totalFrames - 1) {
			frame = timeline.totalFrames - 1;
			return;
		}
		viewFrame(frame, timeline);
	}

	function getCurrentFrame(timeline) {
		timeline = timeline || exportRoot;
		return timeline.currentFrame;
	}

	function viewFrame(idx, timeline) {
		timeline = timeline || exportRoot;
		timeline.gotoAndStop(idx);
		// stopAllSounds();
	}


	/*
	 * event handle
	 */
	var on = function(obj, eventType, handleFunc) {
		obj.addEventListener(eventType, handleFunc, false);
	}

	/*
	 * Utils
	 */
	var extend = function(source, target) {
		for (var key in source) {
			if (source.hasOwnProperty(key)) {
				target[key] = source[key];
			}
		}

		return target;
	}

	var isString = function(obj) {
		return typeof obj == 'string' && Object.prototype.toString.call(obj) == '[object String]';
	}

	var newElement = function(name) {
		name = name.toString().toLocaleLowerCase();
		var element;
		switch (name) {
			case 'div':
				element = document.createElement('div');
				break;
			case 'span':
				element = document.createElement('span');
				break;
			case 'style':
				element = document.createElement('style');
				break;
			case 'audio':
				element = document.createElement('audio');
				break;
			case 'video':
				element = document.createElement('video');
				break;
			case 'img':
				element = document.createElement('img');
				break;
			default:
				element = document.createElement('div');
		}

		return element;
	};

	var getPixelRatio = function(context) {
		var backingStore = context.backingStorePixelRatio ||
			context.webkitBackingStorePixelRatio ||
			context.mozBackingStorePixelRatio ||
			context.msBackingStorePixelRatio ||
			context.oBackingStorePixelRatio ||
			context.backingStorePixelRatio || 1;

		return (window.devicePixelRatio || 1) / backingStore;
	};

	var parseAudioToDict = function(manifest, data) {
		manifest = manifest || [];
		manifest.forEach(function(item) {
			if (item.src.indexOf('.mp3') > -1) {
				data[item.id] = {
					play: false,
					instance: null,
					time: 0,
					sprite: null,
					callback: null
				};
			}
		});
	}

	function loadJS(url, callback) {
		var _doc = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", url);
		_doc.appendChild(script);
		script.onload = script.onreadystatechange = function() {
			if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
				callback();
			}
			script.onload = script.onreadystatechange = null
		}
	}

	//output
	cjs.utils = {
		init: function(config) {
			_setup(config);
			_initLoading();
			init();
		},

		//frame
		prevFrame: prevFrame,
		nextFrame: nextFrame,
		getCurrentFrame: getCurrentFrame,
		viewFrame: viewFrame,

		//event
		on: on,
	};
})(createjs = createjs || {});
