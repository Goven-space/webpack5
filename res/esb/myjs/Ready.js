var common;
jsPlumb.ready(function() {
	init();
	//创建连接线时的默认值配置
	common = {
		/**
		 * 设置链接线的形状,curviness参数为bezier曲线的弯曲度,数字越小越直
		 * Bezier(贝塞尔曲线，默认)、Straight(直线)、Flowchart(流程图线)、StateMachine(状态线)
		 */
		connector: [CONFIG.conn.connectionType, { curviness: 70,gap: CONFIG.conn.connectionGap, cornerRadius: CONFIG.conn.connectionCornerRadius, alwaysRespectStubs: CONFIG.conn.connectionAlwaysRespectStubs }],
		/**
		 * 给连线添加箭头，写在配置中的名字为 connectorOverlays，写在连接中的名字为 overlays
		 * location 0.5 表示箭头位于中间，location 1 表示箭头设置在连线末端。 一根连线是可以添加多个箭头的。
		 */
		connectorOverlays: [
			['Arrow', { width: CONFIG.arrow.arrowWidth, length: CONFIG.arrow.arrowLength, location: CONFIG.arrow.arrowLocation }]
		],
		/**
		 * 流程图打开重新初始化时设定节点的端点的样式,动态添加节点时需要修改JsPlumbUtils.js中的initJsPlumbInstance()方法中的样式
		 */
		paintStyle: {
			strokeStyle: '#666',
			stroke: '#999',
			strokeWidth: 1.8,
			fill: 'white',
			fillStyle: '#666',
			radius: 3
		},
		/**
		 * 鼠标悬浮在连接线上端点的样式
		 */
		hoverPaintStyle: {
			stroke: CONFIG.endPonit.hoverEndPointStroke,
		},
		//用户在拖动时，自动创建链接。
		isSource: true,
		isTarget: true
	}
	window.ContextMenu.bind("#canvasId", canvasMenuJson);
	//使用jquery拖拽
	$(".controler").draggable({
		opacity: CONFIG.defaultStyle.dragOpacity,
		helper: 'clone',
		scope: 'node',
		cursorAt: {top: 28,left: 53},
		revert: 'invalid'
	});

	//当mouse放下停止拖动时，放置
	$("#Container").droppable({
		scope: 'node',
		drop: function(event, ui) {
		  if(ui.position.left>200){
			  if(GoalNewNodeType === "dataConnectorNode"){
				window.createLinker(GoalNewNodeType, ui.position);
			  } else {
				createNewNode(GoalNewNodeType, ui.position); //lch 2020-11-10 使用全局类型替代
			  }
		  }
		}
	});

	/**
	 * 为画布注册事件
	 */
	$('#Container').click(function() {
		clearAllTimer();
		if (isClear) {
			changeToNoSelected();
			//全选标识改为 false
			SELECTED_MULTIPLE_FLAG = false;
		}
	}).mousemove(function(event) {
		//未按下鼠标时结束方法,当mouse移动时画出一个方形用来选中方形中的所有节点
		if (px == '' || py == '') {return;} //px,py是全局变量，是在myfunction.js中的mouseTool()函数中初始化的
		//移动一次获取一次矩形宽高
		var pxx = event.pageX;
		var pyy = event.pageY;
		var h = pyy - py;
		var w = pxx - px;
		var scrollX = $('#canvasId').scrollLeft()-GoalLeftMenuWidth;
		var scrollY = $('#canvasId').scrollTop();
		h=h/GoalTransform;
		w=w/GoalTransform;

		//创建矩形div，只创建一次
		if ($('#multipleSelectedRectangle').attr('id') == undefined) {
			$('#Container').append('<div id="multipleSelectedRectangle" style="background-color:#31676f;"></div>');
		}

		//画出矩形
		var leftX=0,topY=0;
		if (h < 0 && w >= 0) {
			leftX=(px + scrollX - 0)/GoalTransform;
			topY=(pyy + scrollY - 0)/GoalTransform;
			h=-h;
    }else if (h >= 0 && w < 0) {
			leftX=(pxx + scrollX - 0)/GoalTransform;
			topY=(py + scrollY - 0)/GoalTransform;
			w=-w;
    }else if (h < 0 && w < 0) {
			leftX=(pxx-0 + scrollX-0)/GoalTransform;
			topY=(pyy-0 + scrollY - 0)/GoalTransform;
			h=-h;
			w=-w;
    }else {
			leftX=(px-0 + scrollX - 0)/GoalTransform;
			topY=(py-0 + scrollY - 0)/GoalTransform;
    }
		$("#multipleSelectedRectangle").css({ "height": h + "px", "width": w + "px", "position": "absolute", "left": leftX + "px", "top":  topY+ "px", "opacity": "0.2", "border": "1px dashed #000" });
    if (w < 0) {
        w = 0 - w;
    }
    if (h < 0) {
        h = 0 - h;
    }

    //获取矩形四个点的坐标
    var x1 = $("#multipleSelectedRectangle").offset().left;
    var y1 = $("#multipleSelectedRectangle").offset().top;
    var x2 = x1 + w;
    var y2 = y1;
    var x3 = x1 + w;
    var y3 = y1 + h;
    var x4 = x1;
    var y4 = y1 + h;

    //取出所有的节点，判断每一个节点是否在多选框中，若在多选框中将其状态改为选中
    var nodeArr = graph.nodes(), i;
    for (i = 0; i < nodeArr.length; i++) {
    	var coordinate = getNodeCoordinate(nodeArr[i]);
    	var flag = false;

    	if ((coordinate.x11 > x1 && coordinate.y11 > y1) && (coordinate.x11 < x2 && coordinate.y11 > y2) && (coordinate.x11 < x3 && coordinate.y11 < y3) && (coordinate.x11 > x4 && coordinate.y11 < y4)) {
            flag = true;
      }else if ((coordinate.x22 > x1 && coordinate.y22 > y1) && (coordinate.x22 < x2 && coordinate.y22 > y2) && (coordinate.x22 < x3 && coordinate.y22 < y3) && (coordinate.x22 > x4 && coordinate.y22 < y4)) {
            flag = true;
      }else if ((coordinate.x33 > x1 && coordinate.y33 > y1) && (coordinate.x33 < x2 && coordinate.y33 > y2) && (coordinate.x33 < x3 && coordinate.y33 < y3) && (coordinate.x33 > x4 && coordinate.y33 < y4)) {
            flag = true;
      }else if ((coordinate.x44 > x1 && coordinate.y44 > y1) && (coordinate.x44 < x2 && coordinate.y44 > y2) && (coordinate.x44 < x3 && coordinate.y44 < y3) && (coordinate.x44 > x4 && coordinate.y44 < y4)) {
            flag = true;
      }//反向
      else if ((x1 > coordinate.x11 && y1 > coordinate.y11) && (x1 < coordinate.x22 && y1 > coordinate.y22) && (x1 < coordinate.x33 && y1 < coordinate.y33) && (x1 > coordinate.x44 && y1 < coordinate.y44)) {
            flag = true;
        }
        else if ((x2 > coordinate.x11 && y2 > coordinate.y11) && (x2 < coordinate.x22 && y2 > coordinate.y22) && (x2 < coordinate.x33 && y2 < coordinate.y33) && (x2 > coordinate.x44 && y2 < coordinate.y44)) {
            flag = true;
        }
        else if ((x3 > coordinate.x11 && y3 > coordinate.y11) && (x3 < coordinate.x22 && y3 > coordinate.y22) && (x3 < coordinate.x33 && y3 < coordinate.y33) && (x3 > coordinate.x44 && y3 < coordinate.y44)) {
            flag = true;
        }
        else if ((x4 > coordinate.x11 && y4 > coordinate.y11) && (x4 < coordinate.x22 && y4 > coordinate.y22) && (x4 < coordinate.x33 && y4 < coordinate.y33) && (x4 > coordinate.x44 && y4 < coordinate.y44)) {
            flag = true;
        }
            //中间横
        else if ((x1 > coordinate.x11 && y1< coordinate.y11) && (x2 < coordinate.x22 && y2 < coordinate.y22) && (x3 < coordinate.x33 && y3 > coordinate.y33) && (x4 > coordinate.x44 && y4 > coordinate.y44)) {
            flag = true;
        }
            //中间竖
        else if ((coordinate.x11 > x1 && coordinate.y11 < y1) && (coordinate.x22 < x2 && coordinate.y22 < y2) && (coordinate.x33 < x3 && coordinate.y33 > y3) && (coordinate.x44 > x4 && coordinate.y44 > y4)) {
            flag = true;
        }

    	if (flag) {
    		isClear = false;
    		selectedNode(nodeArr[i]);
    	} else {
    		noSelectedNode(nodeArr[i]);
    	}
    }

	}).mouseup(function(event) {
		//松开鼠标初始化，移除多选框
		$.each($(".web-context-menu"), function() {
			$(this).css('display', 'none');
		});
		px = '';
		py = '';
		$("#multipleSelectedRectangle").remove();
	  if(event.button==2){
			GoalNewNodeType='';//lch清除新增节点状态
			mouseTool(); //lch点击右键取消链接变化移动状态
		}
	});

	/**
	 * 为导航注册事件
	 */
	$('.showItemTxt').mouseover(function(event) {
		layer.tips($(this).next().text(), $(this).parent(), {
			tips: [$(this).attr('type'), '#23262e'],
			time: 60000
		});
	}).mouseout(function(event) {
		layer.close(layer.tips());
	});

	/**
	 * 为dom对象注册键盘监听事件
	 */
	$(document).keydown(function(event) {
		if (event.ctrlKey == true) {
			if (event.which == CONFIG.keyboardParam.undoKey) {
				//撤销ctrl + Z
				undo();
			} else if (event.which == CONFIG.keyboardParam.redoKey) {
				//重做ctrl + Y
				redo();
			} else if (event.which == CONFIG.keyboardParam.selectedAllKey) {
				//全选ctrl + A
				event.preventDefault();//禁用浏览器的全选
				selectedAll();
			}
		}
	}).keyup(function(event) {
		switch (event.which) {
			case CONFIG.keyboardParam.multipleSelectedKey: //ctrl 键
				ALLOW_MULTIPLE_SELECTED_FLAG = false;
				break;
		}
	});
	jsPlumb.on($('#enableDraggableDiv'), 'click', function(e) {
		connectionTool();
	});
	jsPlumb.on($('#unableDraggableDiv'), 'click', function(e) {
		mouseTool();
	});
	mouseTool();

})
