function createScratchCard(nodeId, condition, callback, isOnce) {

	var target = document.getElementById(nodeId);

	if(target.nodeName.toUpperCase() == "IMG"){
		if (target.complete || target.readyState == 'loading' || target.readyState == 'complete') {
			generate();
		} else {
			target.onload = generate;
		}
	}else{
		generate();
	}

	function getComputedStyle(node){
		if (window.getComputedStyle) {
		    return window.getComputedStyle(node, null);// 非IE
		} else {
		    return node.currentStyle;// IE
		}
	}

	function generate() {
		var cvs = document.createElement('canvas');
		cvs.style.position = 'absolute';
		cvs.style.left = target.offsetLeft + 'px';
		cvs.style.top = target.offsetTop + 'px';
		cvs.width = getComputedStyle(target).width.split("px")[0];
		cvs.height = getComputedStyle(target).height.split("px")[0];
		target.parentNode.insertBefore(cvs, target);
		var context = cvs.getContext('2d');
		context.fillStyle = '#ddd';
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		//context.globalCompositeOperation = 'destination-out';
		context.strokeStyle = "fff";
		context.lineJoin = "round";
		context.lineWidth = 50;
		var offsetParent = cvs,
			offsetLeft = 0,
			offsetTop = 0;
		while (offsetParent) {
			offsetLeft += offsetParent.offsetLeft;
			offsetTop += offsetParent.offsetTop;
			offsetParent = offsetParent.offsetParent;
		}
		var pathPoints = [];
		var x, y;
		var start = 'mousedown',
			move = 'mousemove',
			end = 'mouseup';
			
		if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)){
			start = "touchstart";
			move = "touchmove";
			end = "touchend";
		}

		cvs.addEventListener(start, onTouchStart);

		function onTouchStart(e) {
			e.preventDefault();
			if (e.changedTouches) {
				e = e.changedTouches[e.changedTouches.length - 1];
			}
			//console.log(e.pageX,offsetLeft);
			x = e.pageX - offsetLeft;
			y = e.pageY - offsetTop;
			context.beginPath();
			context.globalCompositeOperation = 'destination-out';
			context.arc(x, y, 25, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();
			document.addEventListener(end, onTouchEnd);
			cvs.addEventListener(move, onTouch)

		}

		function onTouch(e) {
			if (e.changedTouches) {
				e = e.changedTouches[e.changedTouches.length - 1];
			}
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(e.pageX - offsetLeft, e.pageY - offsetTop);
			x = e.pageX - offsetLeft;
			y = e.pageY - offsetTop;
			context.closePath();
			context.stroke();
			var n = (Math.random() * 10000000) | 0;
			context.canvas.style.color = '#' + n.toString(16); //fix android 4.2 bug force repaint

		}

		function onTouchEnd() {
			cvs.removeEventListener(move, onTouch);
			pathPoints = [];
			check();
		}

		function check() {
			var st = +new Date();
			data = context.getImageData(0, 0, cvs.width, cvs.height).data;
			var length = data.length,
				k = 0;
			for (var i = 0; i < length - 3; i += 4) {
				if (data[i] == 0 && data[i + 1] == 0 && data[i + 2] == 0 && data[i + 3] == 0) {
					k++;
				}
			}
			var f = k * 100 / (cvs.width * cvs.height);
			if (f > (condition || 90)) {
				if (callback) {
					callback(f, t);
					if (isOnce) {
						callback = null;
					}

				}
			}
			var t = +new Date() - st;
			//console.log('刮开面积:'+f.toFixed(2)+'% 检测耗时'+ t+'ms ');
			data = null;
		}

	}
}
