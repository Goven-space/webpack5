/**
 * 初始化jsPlumb实例对象,同时还需要修入Ready.js中的common值才能修改线段的样式
 */
function initJsPlumbInstance() {
	INSTANCE_JSPLUMB = null;
	INSTANCE_JSPLUMB = jsPlumb.getInstance({
		PaintStyle: {
			strokeStyle: '#08495c',
			stroke: '#999',
			strokeWidth: 1.8,
			fill: 'white',
			fillStyle: '#08495c',
			radius: 5
		},
		HoverPaintStyle: {
			stroke: 'blue'
		}
	});

    /**
	 * 连接建立之前的检查。当出现自连接的情况后，要将链接断开，若正常连接，判断连接路径是否重复。将连线添加到图对象中
	 */
	INSTANCE_JSPLUMB.bind('beforeDrop', function(info) {
		if(info.sourceId !== info.targetId) {
			if (graph.hasEdge(info.sourceId, info.targetId)) {
				layer.tips(CONFIG.msg.repeatRouter, getJquerySelectorPrefix(info.sourceId), {
					tips: [2, '#23262e'],
					time: 1000
				});
				return false;
			}

			UNDO_ARR.push(getCurrentFlowDoc());
			//保存状态为未保存
			$("#saveStatus").css('display', '');
			var connId = getNextNodeId('R');
			//记录id到节点id对象
			recordNodeId(connId);
			var o = {};
			o.s = info.sourceId;
			o.t = info.targetId;
			o.c = connId;
			CONN_INFO_ARR.push(o);
			graph.setEdge(info.sourceId, info.targetId, {
				id: connId
			});

			return true;
		} else {
			return false;
		}
	});

  	/**
	 * 连接建立时给连接线添加id、右击菜单、连线双击打开属性编辑事件
	 */
	 INSTANCE_JSPLUMB.bind('connection', function(a, b) {
		 var routerObj = CONN_INFO_ARR.shift();
		 // console.log(routerObj);
		 if (routerObj != undefined) {
			 //给连接线添加id、右击菜单
			 a.connection.canvas.id = routerObj.c;
			 $('#' + routerObj.c).attr('sourceId', routerObj.s);
			 $('#' + routerObj.c).attr('targetId', routerObj.t);
			 window.ContextMenu.bind("#" + routerObj.c, connectionMenuJson);

			 //给连接线添加单击事件
			 $('#' + routerObj.c).click(function(event) {
				 editProperty(routerObj.c);
			 });

			 //创建路由线后保存流程
			 if(window.saveProcess!==undefined){
				 window.saveProcess(false);
			 }
		 };
		 //mouseTool(); //把链线状态取消
		 //一般来说拖动创建的链接，可以再次拖动，让链接断开。如果不想触发这种行为，可以设置如下
		 INSTANCE_JSPLUMB.importDefaults({
			 ConnectionsDetachable: CONFIG.conn.isDetachable
		 });
	 });
	 
}

/**
 * 重绘流程图
 */
function repaintAll() {
	INSTANCE_JSPLUMB.repaintEverything();
}

/**
 * 根据id获取类型添加端点,inAnchor为指定端点的位置，如果不指定则表示自动选择
 * @param {String} id
 */
function addEndPointById(id,inAnchor) {
	var nodeType = graph.node(id).nodeType;
	var endPointId = id + '-' + uuid();
	var anchors;
	if(inAnchor===undefined || inAnchor===''){
			anchors = chooseAnchorsByType(nodeType);
	}else{
		anchors=inAnchor.split(",");
		if(inAnchor!='Right' && inAnchor!='Top' && inAnchor!='Left' && inAnchor!='Bottom'){
			anchors=anchors.map(Number);
		}
	}
	var endPoint=INSTANCE_JSPLUMB.addEndpoint(id, {
		uuid: endPointId,
		anchors: anchors
	}, common);
  endPoint.setParameter("anchor",inAnchor); //保存端点位置的属性
	return endPointId;
}

//改变端点位置
function changeConnectionAnchor(connectionId,action,anchor){
	var sourceId=$(connectionId).attr('sourceId');
	var targetId=$(connectionId).attr('targetId');
	var sourceNodeType=graph.node(sourceId).nodeType;
	var targetNodeType=graph.node(targetId).nodeType;
	var anchorArray=anchor.split(","); //把端点分成数组
	if((action==="source" && sourceNodeType==='gateWay') || (action==='target' && targetNodeType==='gateWay')){
		if(anchor=='Bottom'){
			anchorArray=[0, 1, 0, 1];
		}else if(anchor=='Top'){
			anchorArray=[0, -0.4, 0, 0];
		}else if(anchor=='Right'){
			anchorArray=[0.7, 0.3, 1, 0];
		}else if(anchor=='Left'){
			anchorArray=[-0.6, 0.3, 0, 0];
		}
		anchor=anchorArray.join(","); //转成字符串在保存流程图时直接把数组保存到json对象中
	}
	// console.log(anchorArray);

	//改变线的端点
	var connLineObj=INSTANCE_JSPLUMB.getConnections({source: sourceId,target: targetId})[0];
	if(action==='target'){
		//目标端点
		connLineObj.endpoints[1].setAnchor(anchorArray);
		connLineObj.endpoints[1].setParameter("anchor",anchor);
		connLineObj.endpoints[1].setDragAllowedWhenFull(false);
	}else{
		//源端点
		connLineObj.endpoints[0].setAnchor(anchorArray);
		connLineObj.endpoints[0].setParameter("anchor",anchor);
		connLineObj.endpoints[0].setDragAllowedWhenFull(false);
	}
}

/**
 * 根据类型选择锚点
 * @param {String} type
 */
function chooseAnchorsByType(type) {
	var anchors;
	switch (type) {
		case 'gateWay':
			anchors = [
				[0, 1, 0, 1],
				[0.7, 0.3, 1, 0],
				[0, -0.4, 0, 0],
				[-0.6, 0.3, 0, 0]
			]
			break;
		case 'end':
				anchors = CONFIG.anchors.defaultAnchors; //["Bottom", "Right", "Top", "Left"]
				break;
		default:
			/**
			 * 锚点，可选值
			 * Top(TopCenter)、TopRight、Right(RightMiddle)、BottomRight、Bottom(BottomCenter)、BottomLeft、Left(LeftMiddle)、TopLeft、Center
			 */
			anchors = CONFIG.anchors.defaultAnchors; //["Bottom", "Right", "Top", "Left"]
			//anchors=["Right","Left"];
			break;
	}
	return anchors;
}

/**
 * 给连接线添加id、右击菜单，该方法在异步调用时不稳定，慎用！
 * @param {String} sourceId 源节点id
 * @param {String} targetId 目标节点id
 * @param {String} connId 连接线id
 */
function addConnectionId(sourceId, targetId, connId) {
	$.each($('svg.jtk-connector'), function() {
		if ($(this).attr('id') == undefined) {
			$(this).attr('id', connId);
			$(this).attr('sourceId', sourceId);
			$(this).attr('targetId', targetId);
			//window.ContextMenu.bind("#" + connId, connectionMenuJson);
		}
	});
}

/**
 * 获取路由文本信息
 * @param {String} sourceId 源节点id
 * @param {String} targetId 目标节点id
 */
function getRouterLabel(sourceId, targetId) {
	var routerObj = INSTANCE_JSPLUMB.getConnections({source: getRemovePrefixId(sourceId),target: getRemovePrefixId(targetId)})[0];
	if(routerObj===undefined){return '';}
	var routerLabel = routerObj.getLabel();
	if (routerLabel == null || routerLabel == undefined) return '';
	return routerLabel;
}

/**
 * 设置路由文本信息
 * @param {String} sourceId 源节点id
 * @param {String} targetId 目标节点id
 * @param {String} label 要设置的文本值
 */
function setRouterLabel(sourceId, targetId, label) {
	if (label == null || label == undefined || label == '') {
		label = '';
		INSTANCE_JSPLUMB.getConnections({
			source: getRemovePrefixId(sourceId),
			target: getRemovePrefixId(targetId)
		})[0].removeAllOverlays();

		return;
	}
	INSTANCE_JSPLUMB.getConnections({
		source: getRemovePrefixId(sourceId),
		target: getRemovePrefixId(targetId)
	})[0].setLabel({
		label: label,
		cssClass: 'labelClass'
	});
}

/**
 * 设置节点可拖拽
 * @param {String} nodeId 节点id
 */
function setNodeDraggable(nodeId) {
	INSTANCE_JSPLUMB.draggable(nodeId, {
		filter:".enableDraggable",
		containment: 'parent',
		//grid: [10, 10],
		//拖拽前记录当前的流程文档对象
		start: function() {
			UNDO_ARR.push(getCurrentFlowDoc());
		},
		//拖拽过程中实时更新节点位置
		drag: function(event) {
			if (!SELECTED_MULTIPLE_FLAG) {
				layer.tips('X: ' + parseInt($('#' + event.el.id).offset().left - 200) + '  Y: ' + parseInt($('#' + event.el.id).offset().top - 80), getJquerySelectorPrefix(event.el.id), {
					tips: [1, '#23262e'],
					time: 2000
				});
			}
		},
		//拖拽结束后更新图对象中存储的节点位置
		stop: function(event) {
			GoalStopDragFlag=true;
			updateGraphNode(event.el.id);
		}
	});
}

/**
 * 允许节点被拖拽
 * @param {String} nodeId 节点id
 */
function ableDraggable(nodeId) {
	var flag = INSTANCE_JSPLUMB.toggleDraggable(nodeId);
	if (!flag) {
		INSTANCE_JSPLUMB.toggleDraggable(nodeId);
	}
}

/**
 * 禁止节点被拖拽
 * @param {String} nodeId 节点id
 */
function unableDraggable(nodeId) {
	var flag = INSTANCE_JSPLUMB.toggleDraggable(nodeId);
	if (flag) {
		INSTANCE_JSPLUMB.toggleDraggable(nodeId);
	}
}

/**
 * 设置节点可缩放
 * @param {String} id
 */
function nodeResizable(id) {
	id = getJquerySelectorPrefix(id);
	//设置节点可缩放
	$(id).resizable({
		//设置允许元素调整的最小高度
		minHeight: 50,
		//设置允许元素调整的最小宽度
		minWidth: 100,
		//设置允许元素调整的最大高度
		//maxHeight: 300,
		//设置允许元素调整的最大宽度
		//maxWidth: 600,
		//缩放时保持纵横比
		//aspectRatio: 1/1,
		//缩放时的动画
		animate: true,
		//动画效果种类
		animateEasing: 'easeOutElastic',
		//动画效果持续时间
		animateDuration: 500,
		//缩放时的视觉反馈
		ghost: true,
		//默认隐藏掉可调整大小的手柄，除非鼠标移至元素上
		autoHide: true,
		//缩放结束后需要重新设置节点文字样式、重绘流程图，这个地方需要用到计时器，等动画结束之后重绘。更新图对象
		stop: function(event, ui) {
			var $this = $(this);
			setTimeout(function() {
				$this.css('line-height', $this.css('height'));
				repaintAll();
				//更新图对象
				updateGraphNode($this.attr('id'));
			}, 510);
		}
	});

	//设置节点可缩放后样式被改成了 relative，这里需要再次设置为 absolute
	$(id).css('position', 'absolute');
}

/**
 *
 * @param {String} id 泳道id
 */
function laneResizable(id) {
	id = getJquerySelectorPrefix(id);
	//设置节点可缩放
	$(id).resizable({
		//设置允许元素调整的最小高度
		minHeight: 250,
		//设置允许元素调整的最小宽度
		minWidth: 300,
		//设置允许元素调整的最大高度
		//maxHeight: 300,
		//设置允许元素调整的最大宽度
		//maxWidth: 600,
		//缩放时保持纵横比
		//aspectRatio: 1/1,
		//缩放时的动画
		animate: true,
		//动画效果种类
		animateEasing: 'easeOutElastic',
		//动画效果持续时间
		animateDuration: 300,
		//缩放时的视觉反馈
		ghost: true,
		//默认隐藏掉可调整大小的手柄，除非鼠标移至元素上
		autoHide: true,
		//缩放开始时设置两个值防止缩放过程中出现多选框
		start: function(event, ui) {
			px = '';
			py = '';
		},
		//缩放结束后需要重新设置节点文字样式、重绘流程图，这个地方需要用到计时器，等动画结束之后重绘。更新泳道对象
		stop: function(event, ui) {
			var $this = $(this);
			var thisChildId = $this.children(':first-child')[0].id;
			var thisGraphNode = LANEOBJS[$this.attr('id')];
			setTimeout(function() {
				if (thisGraphNode.nodeType == 'broadwiseLane') {
					$('#' + thisChildId).css('height', parseInt($this.css('height')) - 3);
					$('#' + thisChildId).css('line-height', getLaneLineHeight(thisGraphNode.text, $('#' + thisChildId).css('height')));
				}
				//更新图对象
				updateLaneObjs($this.attr('id'));
			}, 310);
		}
	});

	//设置节点可缩放后样式被改成了 relative，这里需要再次设置为 absolute
	$(id).css('position', 'absolute');
}

//初始化时给节点增加文字
function addTextToNode_old(nodeObj,text){
	var textLength=getLength(text);
	if(textLength>24){
		text=subCharStr(text,36);
		nodeObj.html('<span id="'+nodeObj[0].id+'_content" style="display:block;line-height:16px;margin-top:8px;margin-left:15px;margin-right:10px" >' + text + '</span>');
	}else if(textLength>16){
		text=subCharStr(text,36);
		nodeObj.html('<span id="'+nodeObj[0].id+'_content" style="display:block;line-height:16px;margin-top:10px;margin-left:15px;margin-right:10px" >' + text + '</span>');
	}else{
		nodeObj.html('<span id="'+nodeObj[0].id+'_content" style="line-height:'+nodeObj.height()+'px" >' + text + '</span>');
	}
}

//初始化时给节点增加文字
function addTextToNode(nodeObj,text){
		let title=text;
		let body='';
		let className=nodeObj[0].className;
		let nodeId=nodeObj[0].id;
		let spos=text.indexOf("#");
		if(className.indexOf("startNode")!=-1 || className.indexOf("endNode")!=-1 || className.indexOf("gateWay")!=-1 || className.indexOf("eventNode")!=-1 || className.indexOf("timeNode")!=-1 || className.indexOf("weixinNode")!=-1 || className.indexOf("dingNode")!=-1 || className.indexOf("msgNode")!=-1 || className.indexOf("textNode")!=-1){
			nodeObj.html('<div id="'+nodeId+'_content"  >'+title+'</div>');
		}else{
			if(className.indexOf('connectorNode')!=-1){
				title=nodeId;
				body = text;
			} else if(spos!=-1){
				title=text.split("#")[0];
				body=text.split("#")[1];
			} else {
				title='未定义';
				body=text;
			}
			nodeObj.html('<div id="'+nodeId+'_content" class="nodeTitle" >'+title+'</div><div class="nodeRemark">'+body+'</div>');
		}
}
