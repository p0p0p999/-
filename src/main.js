(function(global) {
	var cjs = createjs || {};
	var utils = cjs.utils;
	var exportRoot;
	var stage;
	var control;
    var startTime;
    var eventId = {
        submit: {module:'001', id:'h50010001', object:'提交按钮'},      //点击提交按钮时
        reset: {module:'001', id:'h50010002', object:'重置按钮'},       //点击重置按钮时
        help: {module:'001', id:'h50010003', object:'帮助按钮'},        //点击帮助按钮时
        answer: {module:'001', id:'h50010004', object:'参考答案按钮'},  //点击参考答案按钮时
        result: {module:'001', id:'h50010005', object:'结论按钮'},  	//点击结论按钮时
        input: {module:'002', id:'h50020001', object:'输入框'},         //输入框内输入内容时
        drag: {module:'003', id:'h50030001', object:'图片'},            //拖拽内容时
        line: {module:'003', id:'h50030002', object:'连线'},            //连线完成时
        pause: {module:'005', id:'h50050001', object:''},               //视频暂停时
        play: {module:'005', id:'h50050002', object:''},                //视频播放时
        forward: {module:'005', id:'h50050003', object:''},             //视频前进时
        backward: {module:'005', id:'h50050004', object:''},            //视频后退时
        speed: {module:'005', id:'h50050005', object:''},               //视频倍速时
        skip: {module:'001', id:'h50010006', object:''},                //点击页码页面调转时
        prev: {module:'001', id:'h50010007', object:''},                //上一页
        show: {module:'001', id:'h50010008', object:''},                //出现演示动画时
        text: {module:'001', id:'h50010009', object:''},                //弹出文本内容时
        explore: {module:'001', id:'h50010010', object:''},             //跳转探究内容时
        back: {module:'001', id:'h50010011', object:''},                //分支进去返回上一层页面时
        sound: {module:'001', id:'h50010012', object:''},               //点击声音开关时
        change: {module:'001', id:'h50010013', object:''},              //点击切换题目按钮时
        click: {module:'001', id:'h50010014', object:''}                //点击时
    };

    /**
     * 调用此方法进行埋点
     * @method onEvent
     * @param {string|array} data 
     * @param {object} inputData 
     */
    function onEvent(data, inputData) {
        var event, object;
        if(Array.isArray(data)) {
            event = data[0];
            object = data[1] === undefined ? eventId[event].object : data[1];
        }else {
            event = data;
            object = eventId[event].object;
        }
        var mid = JSON.stringify(userInfo);
        var info = JSON.parse(mid);
        if(inputData != 'undefined') {
            info.inputData = inputData;
        }
        IFlyCollector.onEvent(eventId[event].id, {}, eventId[event].module, object, JSON.stringify(info));
    }

    /**
     * 当前时间距传入的参数的时间过了多少秒
     * @method execDate
     * @param {date} date
     */
    function execDate(date) {
        return Number(((new Date().getTime() - date.getTime()) / 1000).toFixed(2));
    }

	global.onload = function() {
		utils.onStart = onGameStart;
		utils.init(config);
	};

	function onGameStart(res, st) {
		exportRoot = res;
		stage = st;
		init();
	}
	
	function init()  {
		control = new Content();
		control.init();
		control.reset(0);
		startTime = new Date();
	}

	function Content() {
		var content = this;
		content.init = function() {
			popup.init();
			button.init();
			popup.reset();
			button.reset();
		}
		content.reset = function(page) {
			exportRoot.gotoAndStop(page);
			if(page == 0) {
				canClick = true;
				stip.visible = false;
				axis.reset();
				inputBoard.reset();
				inputs.forEach(function(s) {s.reset()});
				points.forEach(function(s) {s.reset()});
				drags.forEach(function(s) {s.reset()});
				rects.forEach(function(s) {s.reset()});
				// points.forEach(function(s) {s.visible = true;
				// s.gotoAndStop(s.totalFrames - 1)});
				// points[points.length - 1].visible = false;
			}
		}
		content.submit = function() {
			var result = true;
			return result;
		}
		//popup
		var popup = {
			tip: exportRoot.tip,
			curtain: exportRoot.curtain,
			pageInfo: {
				tip: {drag: true, scroll: false, frame: 0},
				result: {drag: true, scroll: false, frame: 1}
			},
			getInfo: function(frame) {
				const {pageInfo} = popup;
				for(const key in pageInfo) {
					if(pageInfo.hasOwnProperty(key)) {
						const element = pageInfo[key];
						if(Array.isArray(element)) {
							element.forEach(function(et, index) {
								if(et.frame === frame) {
									return et;
								}
							});
						}else {
							if(element.frame === frame) {
								return element;
							}
						}
					}
				}
			},
			init: function() {
				const {tip, curtain, getInfo} = popup;
				tip.autoReset = false;
				tip.wd = tip.nominalBounds.width;
				tip.hg = tip.nominalBounds.height;
				tip.initX = tip.x;
				tip.initY = tip.y;
				curtain.cursor = null;
				utils.on(tip, 'mousedown', function(e) {
					if(getInfo(tip.currentFrame)) {
						if(getInfo(tip.currentFrame).drag === false) return;
					}
					var p = tip.parent.globalToLocal(e.stageX, e.stageY);
					tip.downX = p.x;
					tip.downY = p.y;
					tip.lastX = tip.x;
					tip.lastY = tip.y;
				});
				utils.on(tip, 'pressmove', function(e) {
					if(getInfo(tip.currentFrame)) {
						if(getInfo(tip.currentFrame).drag === false) return;
					}
					var width = 1280, height = 586;
					var borderX = 0, borderY = 53;
					var p = tip.parent.globalToLocal(e.stageX, e.stageY);
					var newX = tip.lastX + (p.x - tip.downX);
					var newY = tip.lastY + (p.y - tip.downY);
					if(newX <= borderX + tip.wd*.5) {
						newX = borderX + tip.wd*.5;
					}else if(newX >= borderX + width - tip.wd*.5) {
						newX = borderX + width - tip.wd*.5;
					}
					if(newY <= borderY + tip.hg*.5) {
						newY = borderY + tip.hg*.5
					}else if(newY >= borderY + height - tip.hg*.5) {
						newY = borderY + height - tip.hg*.5;
					}
					tip.x = newX;
					tip.y = newY;
				});
				const btnClose = tip.btnClose;
				btnClose.cursor = 'pointer';
				utils.on(btnClose, 'click', function() {
					popup.hide();
				});
				if(tip.scroll && tip.bar) {
					var scroll = tip.scroll;
					scroll.cursor = 'pointer';
					scroll.initY = scroll.y;
					scroll.hg = scroll.nominalBounds.height;
					var bar = tip.bar;
					bar.hg = bar.nominalBounds.height;
					var maskHeight = 272;
					var textStart = bar.y - bar.hg*.5 - scroll.hg + 10;
					utils.on(scroll, 'pressmove', function(e) {
						if(getInfo(tip.currentFrame)) {
							if(getInfo(tip.currentFrame).scroll === false) return;
						}
						var text = tip['mc' + tip.currentFrame];
						var p = scroll.parent.globalToLocal(e.stageX, e.stageY);
						if(p.y <= bar.y - bar.hg*.5 + scroll.hg*.5) {
							p.y = bar.y - bar.hg*.5 + scroll.hg*.5;
						}else if(p.y >= bar.y + bar.hg*.5 - scroll.hg*.5) {
							p.y = bar.y + bar.hg*.5 - scroll.hg*.5;
						}
						scroll.y = p.y;
						var percent = (scroll.y - (bar.y - bar.hg*.5 + scroll.hg*.5))  / (bar.hg - scroll.hg);
						text.y = textStart + text.nominalBounds.height*.5 - (text.nominalBounds.height - maskHeight) * percent;
					});
				}
			},
			reset: function() {
				popup.hide();
			},
			show: function(page, reset) {
				const {tip, curtain, pageInfo, getInfo} = popup;
				curtain.visible = true;
				tip.visible = true;
				exportRoot.setChildIndex(curtain, exportRoot.numChildren - 1);
				exportRoot.setChildIndex(tip, exportRoot.numChildren - 1);
				if(reset !== undefined && reset === true) {
					tip.x = tip.initX;
					tip.y = tip.initY;
				}
				var index;
				if(typeof page == 'string') {
					if(Array.isArray(pageInfo[page])) {
						index = pageInfo[page][exportRoot.currentFrame].frame;
					}else {
						index = pageInfo[page].frame;
					}
				}else {
					index = page;
				}
				tip.gotoAndStop(index);
				if(getInfo(tip.currentFrame).scroll === true) {
					var text = tip['mc' + tip.currentFrame];
					var textStart = tip.bar.y - tip.bar.hg*.5 - tip.scroll.hg + 10;
					tip.scroll.y = tip.scroll.initY;
					text.y = textStart + text.nominalBounds.height*.5;
				}
			},
			hide: function() {
				const {tip, curtain} = popup;
				tip.visible = false;
				curtain.visible = false;
			}
		}
		//button
		var button = {
			btnReset: exportRoot.btnReset,
			// btnSubmit: exportRoot.btnSubmit,
			// btnPrev: exportRoot.btnPrev,
			// btnNext: exportRoot.btnNext,
			btnTip: exportRoot.btnTip,
			// btnAns: exportRoot.btnAns,
			btnResult: exportRoot.btnResult,
			init: function() {
				const {btnReset, btnSubmit, btnPrev, btnNext, btnTip, btnAns, btnResult} = button;
				if(btnReset) {
					btnReset.autoReset = false;
					btnReset.cursor = 'pointer';
					utils.on(btnReset, 'click', function() {
						content.reset(exportRoot.currentFrame);
						onEvent('reset');
					});
				}
				if(btnSubmit) {
					btnSubmit.autoReset = false;
					btnSubmit.cursor = 'pointer'
					utils.on(btnSubmit, 'click', function() {
						if(btnSubmit.currentFrame === 0) return;
						btnSubmit.gotoAndStop(0);
						var rt = content.submit(exportRoot.currentFrame);
						onEvent('submit', {result: rt, duration: execDate(startTime)});
					});
				}
				if(btnPrev) {
					btnPrev.autoReset = false;
					btnPrev.cursor = 'pointer';
					utils.on(btnPrev, 'click', function() {
						content.reset(exportRoot.currentFrame - 1);
						onEvent('prev');
					});
				}
				if(btnNext) {
					btnNext.autoReset = false;
					btnNext.cursor = 'pointer';
					utils.on(btnNext, 'click', function() {
						content.reset(exportRoot.currentFrame + 1);
						onEvent('skip');
					});
				}
				if(btnTip) {
					btnTip.autoReset = false;
					btnTip.cursor = 'pointer';
					utils.on(btnTip, 'click', function() {
						popup.show('tip', true);
						onEvent('help');
					});
				}
				if(btnAns) {
					btnAns.autoReset = false;
					btnAns.cursor = 'pointer';
					utils.on(btnAns, 'click', function() {
						if(btnAns.currentFrame === 0) return;
						popup.show('ans', true);
						onEvent('answer');
					});
				}
				if(btnResult) {
					btnResult.autoReset = false;
					btnResult.cursor = 'pointer';
					utils.on(btnResult, 'click', function() {
						popup.show('result', true);
						onEvent('result');
					});
				}
			},
			reset: function() {
				const {btnReset, btnSubmit, btnPrev, btnNext, btnTip, btnAns, btnResult} = button;
				if(btnSubmit) btnSubmit.gotoAndStop(1);
				if(btnAns) btnAns.gotoAndStop(0);
			}
		}
		//object
		var canClick = true;

		var stip = exportRoot.stip;
		stip.autoReset = false;
		stip.visible = false;
		stip.close.cursor = 'pointer';
		utils.on(stip.close, 'click', function() {
			stip.visible = false;
		});

		var inputBoard = exportRoot.inputBoard;
		inputBoard.autoReset = false;
		inputBoard.currentInput = null;
		inputBoard.reset = function() {
			inputBoard.visible = false;
			inputBoard.currentInput = null;
			inputBoard.saveText = '';
		};
		inputBoard.changeInput = function(index) {
			inputBoard.currentInput = inputs[index];
			inputBoard.saveText = inputBoard.currentInput.text.text;
		};
		inputBoard.currentText = function() {
			return inputBoard.currentInput.text.text;
		};
		inputBoard.setText = function(text) {
			inputBoard.currentInput.text.text = text;
		};

		var numbers = getSortSymbols(inputBoard, 'n');
		var numKey = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '.', 'x'];
		numbers.forEach(function(et, index) {
			et.index = index;
			et.value = numKey[index];
			utils.on(et, 'click', function() {
				var suppose;
				suppose = inputBoard.currentText() + et.value;
				if(suppose.length > 5 && et.index != 11) return;
				if(et.index < 10) {
					suppose = inputBoard.currentText() + et.value;
					if(Number(suppose) <= 120) {
						inputBoard.setText(suppose);
					}
				}else if(et.index == 10) {
					if(inputBoard.currentText().indexOf('.') == -1 && inputBoard.currentText() != '') {
						suppose = inputBoard.currentText() + et.value;
						inputBoard.setText(suppose);
					}
				}else {
					var tx = inputBoard.currentText();
					suppose = tx.substring(0, tx.length - 1);
					inputBoard.setText(suppose);
				}
			});
		});

		var submit = inputBoard.submit;
		utils.on(submit, 'click', function() {
			var suppose = inputBoard.currentText();
			if(suppose[suppose.length - 1] == '.') {
				suppose = suppose.substring(0, suppose.length - 1);
			}
			// var prevInputText;
			// var result = true;
			// if(Number(suppose) < oneValue) {
			// 	result = false;
			// }
			// for (let index = inputBoard.currentInput.index - 1; index >= 0; index--) {
			// 	prevInputText = inputs[index].text.text;
			// 	if(prevInputText == '') continue;
			// 	if(Number(suppose) < Number(prevInputText)){
			// 		console.log('res');
			// 		result = false;
			// 	}
			// }
			inputBoard.currentInput.gotoAndStop(0);
			if(suppose == '') {
				inputBoard.setText(inputBoard.saveText);
				inputBoard.reset();
				return;
			}
			inputBoard.setText(String(Number(suppose)));
			var ux = inputBoard.currentInput.index;
			var uy = Number(suppose);
			inputBoard.reset();
			var coord = axis.getPoint(ux, uy);
			var point = points[ux];
			point.x = coord.x, point.y = coord.y;
			point.flicker();
		});

		var lineChart = exportRoot.lineChart;
		lineChart.autoReset = false;
		lineChart.cursor = 'pointer';
		utils.on(lineChart, 'click', function() {
			if(!canClick) return;
			if(points.every(function(s) {return s.visible})) {
				axis.drawLine(points);
				canClick = false;
			}
		});

		var inputs = getSortSymbols(exportRoot, 't');
		inputs.forEach(function(et, index) {
			et.autoReset = false;
			et.cursor = 'pointer';
			et.index = index;
			et.text = new createjs.Text('', "32px Times New Roman", "#000000");
			et.text.textAlign = 'center';
			et.text.x = et.x;
			et.text.y = et.y - 18;
			exportRoot.addChild(et.text);
			utils.on(et, 'click', function() {
				if(!canClick) return;
				if(inputBoard.visible) return;
				inputBoard.visible = true;
				inputBoard.changeInput(et.index);
				et.gotoAndStop(1);
			});
			et.reset = function() {
				et.text.text = '';
				et.gotoAndStop(0);
			};
		});

		var points = getSortSymbols(exportRoot, 'p');
		points.forEach(function(et, index) {
			et.autoReset = false;
			et.index = index;
			et.reset = function() {
				et.visible = false;
				et.gotoAndStop(0);
			};
			et.flicker = function(callback) {
				et.visible = true;
				playAnime(et, function() {
					et.gotoAndStop(et.totalFrames - 1);
					if(callback) callback();
				});
			};
		});

		var yuan = exportRoot.yuan;
		var axis = {
			container: exportRoot.lineSpace, //线段容器
			yuan: { x: yuan.x, y: yuan.y }, //坐标系原点位置
			scaleX: 43.8, //x轴上每一个单位的实际尺寸
			scaleY: 28.3, //y轴上每一个单位的实际尺寸
			unitX: 1,   //x轴每一个单位表示的值
			unitY: 10,   //y轴每一个单位表示的值
			pointList: [], //点位集合
			//清空所有线段和点位
			reset: function() {
				this.container.removeAllChildren();
				this.pointList = [];
			},
			getPoint: function(ux, uy) {
				var sx, sy;
				sx = yuan.x + ux / this.unitX * this.scaleX;
				sy = yuan.y - uy / this.unitY * this.scaleY;
				return {x: sx, y: sy};
			},
			drawLine: function(list) {
				this.pointList = list;
				var onePoint = list[0];
				var line = new createjs.Shape();
				var gps = line.graphics;
				gps.beginStroke('red');
				gps.setStrokeStyle(3);
				gps.moveTo(onePoint.x, onePoint.y);
				var point;
				for(var i = 1; i < list.length; i++) {
					point = list[i];
					gps.lineTo(point.x, point.y);
				}
				this.container.addChild(line);
			}
		}

		var drags = getSortSymbols(exportRoot, 'dg');
		drags.forEach(function(drag, index) {
			drag.autoReset = false;
			drag.index = index;
			drag.cursor = 'pointer';
			drag.pressX = 0;
			drag.pressY = 0;
			drag.initX = drag.x;
			drag.initY = drag.y;
			drag.wd = drag.nominalBounds.width;
			drag.hg = drag.nominalBounds.height;
			drag.reset = function() {
				drag.x = drag.initX;
				drag.y = drag.initY;
			}
			drag.mousedown = function() {
				exportRoot.setChildIndex(drag, exportRoot.numChildren - 1);
			};
			drag.pressmove = function(x, y) {
				drag.x = x;
				drag.y = y;
			};
			drag.pressup = function(correct) {
				if(correct) {
					drag.x = drag.initX;
					drag.y = drag.initY;
				}else {
					drag.x = drag.initX;
					drag.y = drag.initY;
				}
			};
		});
		var rects = getSortSymbols(exportRoot, 'rt');
		rects.forEach(function(rect, index) {
			rect.autoReset = false;
			rect.index = index;
			rect.initX = rect.x;
			rect.initY = rect.y;
			rect.value = 0;
			rect.reset = function() {
				rect.value = 0;
				rect.gotoAndStop(0);
			};
			rect.isWithin = function(object) {
				var result = false;
				var x1 = object.x, y1 = object.y;
				var y2, x2, width, height;
				width = rect.nominalBounds.width; height = rect.nominalBounds.height;
				x2 = rect.x; y2 = rect.y;
				if(Math.abs(x1 - x2) < width*.5 && Math.abs(y1 - y2) < height*.5) {
					result = true;
				}else {
					result = false;
				}
				return result;
			};
			rect.insert = function(object) {
				var result = true;
				rect.gotoAndStop(object.index + 1);
				audioPlayer.playAudio('sounds/drag.mp3');
				return result;
			};
		});
		drags.forEach(function(et) {
			dragControl(et, rects);
		});

		//tools
		function dragControl(drag, rects) {
			var borderX = 0, borderY = 0;
			var width = 1920, height = 1080;
			utils.on(drag, 'mousedown', function(e) {
				// if(!canClick) return;
				var p = drag.parent.globalToLocal(e.stageX, e.stageY);
				drag.pressX = p.x - drag.x;
				drag.pressY = p.y - drag.y;
				drag.mousedown();
			});
			utils.on(drag, 'pressmove', function(e) {
				// if(!canClick) return;
				var p = drag.parent.globalToLocal(e.stageX, e.stageY);
				var newX = p.x - drag.pressX;
				var newY = p.y - drag.pressY;
				if(newX <= borderX + drag.wd*.5) {
					newX = borderX + drag.wd*.5;
				}else if(newX >= borderX + width - drag.wd*.5) {
					newX = borderX + width - drag.wd*.5;
				}
				if(newY <= borderY + drag.hg*.5) {
					newY = borderY + drag.hg*.5;
				}else if(newY >= borderY + height - drag.hg*.5) {
					newY = borderY + height - drag.hg*.5;
				}
				drag.pressmove(newX, newY);
			});
			utils.on(drag, 'pressup', function(e) {
				// if(!canClick) return;
				var contain = false;
				var correct = false;
				for(let i = 0; i < rects.length; i++) {
					let rect = rects[i];
					if(rect.isWithin(drag)) {
						contain = true;
						if(rect.insert(drag)) {
							correct = true;
						}
					}
				}
				if(contain) {
					if(correct) {
						drag.pressup(true);
					}else {
						drag.pressup(false);
					}
				}else {
					drag.pressup(false);
				}
			});
		}

		function playAnime(data, callback) {
			var anime, startFrame, endFrame, callback;
			if(Array.isArray(data)) {
				anime = data[0];
				startFrame = data[1] === undefined ? 0 : (typeof data[1] === "string" ? anime.timeline.resolve(data[1]) : data[1]);
				endFrame = data[2] === undefined ? anime.totalFrames - 1 : (typeof data[2] === "string" ? anime.timeline.resolve(data[2]) : data[2]);
			}else {
				anime = data; startFrame = 0; endFrame = anime.totalFrames - 1;
			}
			callback = callback || function() {};

			anime.endAnime = endAnime;
			anime.gotoAndPlay(startFrame);
			anime.addEventListener('tick', endAnime);

			function endAnime(e) {
				var anime = e.target;
				if(anime.currentFrame >= endFrame) {
					anime.removeEventListener('tick', endAnime);
					anime.stop();
					callback();
				}
			}
		}
		
		function stopAnime(anime, frame) {
			var pauseFrame = 0;
			anime.removeEventListener('tick', anime.endAnime);
			pauseFrame = (frame !== undefined ? (typeof frame === 'string' ? anime.timeline.resolve(frame) : frame) : 0);
			anime.gotoAndStop(pauseFrame);
		}

		function getSortSymbols(object, str) {
			var array = [];
			var limit = 50;
			for (var i = 0; i < limit; i++) {
				if(object.hasOwnProperty(str + i)) {
					array.push(object[str + i]);
				}
			}
			console.log(str, array);
			return array;
		}

		function random(num1, num2, decimal) {
			var rand = num1 + Math.random() * ((num2 + 1) - num1);
			if(typeof decimal === 'undefined' || decimal === 0) {
				rand = Math.floor(rand);
			}else {
				rand = Number(rand.toFixed(decimal));
			}
			return rand;
		}
	}
})(window);