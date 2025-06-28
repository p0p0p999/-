'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InputWidget = function (_createjs$Container) {
  _inherits(InputWidget, _createjs$Container);

  function InputWidget(opt) {
    _classCallCheck(this, InputWidget);

    var _this = _possibleConstructorReturn(this, (InputWidget.__proto__ || Object.getPrototypeOf(InputWidget)).call(this));

    var defaultOpt = {
      DOMContainer: document.getElementById('gameContainer'),
      width: 200,
      height: 40,
      placeHolder: '',
      placeHolderTextColor: '#999',
      cursorColor: '#000',
      textColor: '#000',
      bgColor: 'rgba(0,0,0,0)',
      fontFamily: 'Times New Roman',
      fontSize: 28,
      textAlign: 'center',
      text: ''
    };

    opt = opt || {};

    _this._extend(opt, defaultOpt);

    // Field Settings
    _this.width = defaultOpt.width;
    _this.height = defaultOpt.height;

    // Text Settings
    _this.placeHolder = defaultOpt.placeHolder;
    _this.placeHolderTextColor = defaultOpt.placeHolderTextColor;
    _this.textColor = defaultOpt.textColor;
    _this.bgColor = defaultOpt.bgColor;
    _this.fontSize = defaultOpt.fontSize;
    _this.fontFamily = defaultOpt.fontFamily;
    _this.cursorWidth = 2;
    _this.cursorColor = defaultOpt.textColor;
    _this.text = defaultOpt.text;
    _this.textAlign = defaultOpt.textAlign;
    _this.DOMContainer = defaultOpt.DOMContainer;

    // Private Settings
    _this._hiddenInput = null;
    _this._bg = null;
    _this._placeHolderText = null;
    _this._visibleText = null;
    _this._cursor = null;
    _this._padding = 0;
    _this._focused = false;
    _this._selectedDuration = 0;
    _this._isEnabled = true;

    window.__isSupportTouch = false;
    window.__isSupportMouse = false;

    _this._setupDomNode();
    _this._setupField();
    _this._setupListeners();
    return _this;
  }

  _createClass(InputWidget, [{
    key: 'enable',
    value: function enable() {
      this._isEnabled = true;
    }
  }, {
    key: 'disable',
    value: function disable() {
      this._isEnabled = false;

      this._deSelectInput();
      this._cursor.visible = false;
    }
  }, {
    key: 'setText',
    value: function setText(val) {
      this.text = val;
      this._hiddenInput.value = this.text;
      this.update();
    }
  }, {
    key: 'update',
    value: function update() {
      this._setupField();
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.text = '';
      this._hiddenInput.value = '';
      this._cursor.x = this.textAlign == 'left' ? 0 : this.width / 2;
      this.update();
    }
  }, {
    key: 'onInput',
    value: function onInput() {}
  }, {
    key: '_getFontStyle',
    value: function _getFontStyle() {
      return this.fontSize + 'px ' + this.fontFamily;
    }
  }, {
    key: '_setupDomNode',
    value: function _setupDomNode() {
      this._hiddenInput = document.createElement('input');
      this._hiddenInput.type = 'text';
      this._hiddenInput.style.display = 'none';
      this._hiddenInput.style.position = 'absolute';
      this._hiddenInput.style.zIndex = -100;
      this._hiddenInput.style.textIndent = '-999em';
      this._hiddenInput.style.marginLeft = '-100%';
      this._hiddenInput.value = this.text;
      this.DOMContainer.appendChild(this._hiddenInput);
    }
  }, {
    key: '_setupField',
    value: function _setupField() {
      // this._setupVariables();
      this._setupBg();
      this._setupPlaceHolderText();
      this._setupVisibleText();
      this._setupCursor();
    }
  }, {
    key: '_setupVariables',
    value: function _setupVariables() {
      this._padding = this.height - this.fontSize * 1.5;
    }
  }, {
    key: '_setupBg',
    value: function _setupBg() {
      if (this._bg === null) {
        this._bg = new createjs.Shape();
        this.addChild(this._bg);
      } else {
        this._bg.graphics.clear();
      }
      this._bg.graphics.beginFill(this.bgColor).drawRect(0, 0, this.width, this.height);
    }
  }, {
    key: '_setupPlaceHolderText',
    value: function _setupPlaceHolderText() {
      if (this._placeHolderText === null) {
        this._placeHolderText = new createjs.Text(this.placeHolder, this._getFontStyle(), this.placeHolderTextColor);
        this._placeHolderText.y = this._placeHolderText.x = this._padding;
        this.addChild(this._placeHolderText);
      } else {
        this._placeHolderText.text = this.placeHolder;
      }
      this._placeHolderText.visible = !this._focused && this._hiddenInput.value === "" && !this.text;
    }
  }, {
    key: '_setupVisibleText',
    value: function _setupVisibleText() {
      if (this._visibleText === null) {
        this._visibleText = new createjs.Text(this.text, this._getFontStyle(), this.textColor);
        this._visibleText.y = this._visibleText.x = this._padding;
        this.addChild(this._visibleText);
      } else {
        this._visibleText.text = this.text;
      }

      this._refreshTextAlignStatus();
    }
  }, {
    key: '_setupCursor',
    value: function _setupCursor() {
      if (this._cursor === null) {
        this._cursor = new createjs.Shape();
        this._cursor.graphics.beginFill(this.cursorColor)
        // .drawRect(this._padding, this.fontSize * .25, this.cursorWidth, this.fontSize * 1.5);
        .drawRect(this._padding, this.fontSize * 0, this.cursorWidth, this.fontSize * 1);

        this._cursor.visible = false;
        this.addChild(this._cursor);
      } else {}

      this._refreshTextAlignStatus();
    }
  }, {
    key: '_setupListeners',
    value: function _setupListeners() {
      var _this2 = this;

      var el = this.DOMContainer;
      el.addEventListener('touchstart', function(e) {
        // touch
        if (_this2.stage === null || !_this2._isEnabled) return;
        window.__isSupportTouch = true;
        var mx = _this2.stage.mouseX;
        var my = _this2.stage.mouseY;
        if(e.touches.length > 0 && _this2._isMultiPlatform()) {
          var px = e.touches[0].pageX;
          var py = e.touches[0].pageY;
          var cx = el.offsetLeft;
          var cy = el.offsetTop;
          mx = px - cx;
          my = py - cy;
        }
        
        var p = _this2.parent.globalToLocal(mx, my);
        _this2._click(p);
      }, false);
      el.addEventListener('click', function(e) {
        //mouse
        if (_this2.stage === null || !_this2._isEnabled) return;
        window.__isSupportMouse = true;
        var mx = _this2.stage.mouseX;
        var my = _this2.stage.mouseY;
        var p = _this2.parent.globalToLocal(mx, my);

        _this2._click(p);
      }, false);

      this._hiddenInput.addEventListener('input', function (e) {
        if (_this2._focused) {
          e.preventDefault();
          if (_this2._isMaxInputLength() && _this2._hiddenInput.value.length > _this2.text.length) {
            _this2._hiddenInput.value = _this2.text;
            return;
          }
          _this2.text = _this2._hiddenInput.value;
          _this2.update();
          _this2._refreshTextAlignStatus();
          if (_this2.onInput) {
            _this2.onInput(_this2);
          }
        }
      });

      this.on('tick', function () {
        return _this2._tick;
      });
    }
  }, {
    key: '_click',
    value: function _click(localXY) {
      localXY.x -= this.x;
      localXY.y -= this.y;
      this._focused = localXY.x > 0 && localXY.y > 0 && localXY.x < this.width && localXY.y < this.height;
      this._selectedDuration = 0;
      this._placeHolderText.visible = !this._focused && this._hiddenInput.value === "";
      if (this._focused) {
        this._selectInput();
      } else {
        this._deSelectInput();
        this._cursor.visible = false;
      }
    }
  }, {
    key: '_tick',
    value: function _tick() {
      if(!this._isEnabled) return;
      if (this._focused) {
        if (this._selectedDuration % 8 === 0) {
          this._cursor.visible = !this._cursor.visible;
        }
        this._selectedDuration++;
      }
    }
  }, {
    key: '_selectInput',
    value: function _selectInput() {
      var p = this.parent.localToGlobal(this.x, this.y);
      var ratio = this._getPixelRatio(this.stage.canvas.getContext('2d'));
      this._hiddenInput.style.display = 'block';
      this._hiddenInput.style.left = this.x * this.stage.scaleX / ratio + this._padding + 'px';
      // this._hiddenInput.style.top = this.y * this.stage.scaleY / ratio + this._padding + 'px';
      this._hiddenInput.style.top = p.y / ratio + 'px';
      this._hiddenInput.focus();
    }
  }, {
    key: '_deSelectInput',
    value: function _deSelectInput() {
      this._hiddenInput.style.display = 'none';
      this._hiddenInput.blur();
    }
  }, {
    key: '_refreshTextAlignStatus',
    value: function _refreshTextAlignStatus() {
      if (!this._visibleText) return;

      var w = this._visibleText.getMeasuredWidth();
      var h = this._visibleText.getMeasuredHeight();
      if (this.textAlign == 'left') {
        this._visibleText.x = this._padding;
        if (this._cursor) this._cursor.x = w; // this will signify pure text offset
      } else {
        this._visibleText.x = (this.width - w) * .5;
        if (this._cursor) this._cursor.x = this._visibleText.x + w;
      }
      this._visibleText.y = (this.height - h) * .5;

      if (this._cursor) {
        this._cursor.y = (this.height - this.fontSize) * .5;
      }
    }
  }, {
    key: '_isMaxInputLength',
    value: function _isMaxInputLength() {
      var w = this._visibleText.getMeasuredWidth();
      return w > this.width;
    }
  }, {
    key: '_isMobile',
    value: function _isMobile() {
      var ua = window.navigator.userAgent.toLowerCase();
      return ua.indexOf('mobile') != -1 || ua.indexOf('android') != -1;
    }
  }, {
    key: '_getStyleValue',
    value: function _getStyleValue(el, prop) {
      var style = window.getComputedStyle(el)[prop];
      return parseFloat(style.slice(0, style.length - 2));
    }
  }, {
    key: '_getPixelRatio',
    value: function _getPixelRatio(context) {
      var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;

      return (window.devicePixelRatio || 1) / backingStore;
    }
  }, {
    key: '_isMultiPlatform',//判断是否同时支持touch和mouse事件
    value: function _isMultiPlatform() {
      return window.__isSupportTouch && window.__isSupportMouse;
    }
  }, {
    key: '_extend',
    value: function _extend(source, target) {
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          target[key] = source[key];
        }
      }

      return target;
    }
  }]);

  return InputWidget;
}(createjs.Container);

InputWidget.version = '0.2.5';