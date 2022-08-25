/**
 * 初始化
 */
function init() {
	//初始化配置
	NODE_RESIZABLE_FLAG = CONFIG.defaultConfig.resizableFlag;
	NODE_SELECTED_BOX_SHADOW = CONFIG.defaultStyle.selectedBoxShadow;
	NODE_NO_SELECTED_BOX_SHADOW = CONFIG.defaultStyle.noSelectedBoxShadow;

	//初始化节点id对象
	NODEIDOBJ_INIT();

	//初始化jsPlumb实例化对象
	initJsPlumbInstance();
}

function editProperty(nodeId){
	if(GoalStopDragFlag){
		//停止拖拽时禁止弹出修改属性的框
		GoalStopDragFlag=false;
		return;
	}

	var tempId="#"+nodeId;
	var startStr=nodeId.substring(0,1);
	if(startStr==='R'){
		//是路由线
		var sourceId = $(tempId).attr('sourceId');
		var targetId = $(tempId).attr('targetId');
		var routerId=graph.edge(sourceId,targetId).id;
		var routerLabel=getRouterLabel(sourceId, targetId);
		var routerObj={sourceId:sourceId,targetId:targetId,nodeId:routerId,eleId:tempId,nodeType:'router',text:routerLabel};
		window.editRouterProps(routerObj);
	}else{
		//是节点
		window.editNodeProps(tempId);
	}
}

/**
 * 创建新节点
 */
function createNewNode(nodeType, position) {
	var msg = checkCurrentGraph(nodeType);
	if (msg != '0') {layer.msg(msg, {icon: 5,time: 2000});return;} //节点类型不存在
	UNDO_ARR.push(getCurrentFlowDoc());
	var newNode = chooseNodeObjFromType(nodeType, position);
	//创建的节点类型是泳道时需要做特殊处理
	if(newNode.nodeType == 'broadwiseLane' || newNode.nodeType == 'directionLane') {
		createLane(newNode);
		return newNode.newId;
	}
	let nodeName=newNode.text;
	if(GoalNodeName!==''){nodeName=GoalNodeName;}//指定了节点名称直接使用GoalNodeName
	//添加到画板中
	$("#Container").append('<div id="' + newNode.newId + '" class="' + newNode.cla + '" onclick="editProperty(\'' + newNode.newId + '\')"></div>');
	addTextToNode($("#" + newNode.newId),nodeName);

	//设置节点位置
	var nodeTopPx=newNode.locTop;
	var nodeLeftPx=newNode.locLeft;
	nodeLeftPx=(nodeLeftPx-GoalLeftMenuWidth)/GoalTransform+GoalLeftMenuWidth; //根据缩小的比例减去左则菜单的宽度，再恢复到mouse的x坐标
	nodeTopPx=nodeTopPx/GoalTransform;   //根据缩小的比例恢复到mouse的y坐标
	$("#" + newNode.newId).offset({top:nodeTopPx, left:nodeLeftPx});

	//设置节点的属性
	$("#" + newNode.newId).attr('bgColor-gradient', newNode.bgColor);
	$("#" + newNode.newId).css('height', parseInt($("#" + newNode.newId).css('height')) + 'px');
	$("#" + newNode.newId).css('width', parseInt($("#" + newNode.newId).css('width')) + 'px');
	$("#" + newNode.newId).css('line-height', $("#" + newNode.newId).css('height'));
	//设置节点的右键菜单
	if(nodeType==='textNode'){
		window.ContextMenu.bind("#" + newNode.newId, textNodeMenuJson);
	}else{
		window.ContextMenu.bind("#" + newNode.newId, nodeMenuJson);
	}
	//设置节点可拖拽
	setNodeDraggable(newNode.newId);
	//根据标识设置节点是否可缩放
	if (NODE_RESIZABLE_FLAG) nodeResizable(newNode.newId);
	//记录节点id
	recordNodeId(newNode.newId);
	//为节点注册事件
	registerNodeEvent(newNode.newId,newNode);
	//将新节点添加到图对象中
	const opts = {
		text: nodeName,
		key: newNode.newId,
		nodeType: newNode.nodeType,
		locTop: newNode.locTop,
		locLeft: newNode.locLeft,
		templateId:GoalNodeTemplateId,
		nodeHeight: $('#' + newNode.newId).css('height'),
		nodeWidth: $('#' + newNode.newId).css('width'),
		bgColor: newNode.bgColor,
		isSelected: false
	}

	graph.setNode(newNode.newId, opts);
	//设置节点为源目标节点，当第一次使节点unmakeSource时线不会混乱
	INSTANCE_JSPLUMB.makeSource(newNode.newId);
	//拖拽、粘贴生成新元素时，工具切换为鼠标工具
	mouseTool();
	//重绘
	repaintAll();
	return newNode.newId;
}

/**
 * 根据节点类型获取节点对象
 * @param {String} type
 * @param {Object} p 位置信息
 */
function chooseNodeObjFromType(type, p) {
	var nodeObj = {};
	if (p != undefined) {
		nodeObj.locTop = p.top + 0;
		nodeObj.locLeft = p.left;
	}
	var apiNodeList="apiNode,webService,dubbo,javaBeanNode,kafkaNode,mqttNode,jmsWriteNode,uploadByteNode,downloadByteNode";
	if(apiNodeList.indexOf(type)==-1){
		GoalNodeClassName="defaultComputeNode"; //说明是运算节点
	}else{
		GoalNodeClassName="defaultNode"; //是api节点
	}

	//为不同类型的节点选择不同的样式,事件类型用E,节点用T，网关用G
	switch(type) {
		case 'start':
					GoalNodeName='开始';
					nodeObj.newId = getNextNodeId('E');
					nodeObj.cla = "startNode moveLight";
					nodeObj.nodeType = 'start';
					nodeObj.text = "开始";
					nodeObj.bgColor = '#2175c4';
					break;
		case 'end':
					GoalNodeName='结束';
					nodeObj.newId = getNextNodeId('E');
					nodeObj.cla = "endNode moveLight";
					nodeObj.nodeType = 'end';
					nodeObj.text = "结束";
					nodeObj.bgColor = '#ff6161';
					break;
		case 'timeNode':
					GoalNodeName='';
					nodeObj.newId = getNextNodeId('E');
					nodeObj.cla = "timeNode moveLight";
					nodeObj.nodeType = 'timeNode';
					nodeObj.text = "";
					nodeObj.bgColor = '#ccab26';
					break;
		case 'msgNode':
		      GoalNodeName='';
					nodeObj.newId = getNextNodeId('E');
					nodeObj.cla = "msgNode moveLight";
					nodeObj.nodeType = 'msgNode';
					nodeObj.text = "";
					break;
		case 'weixinNode':
				  GoalNodeName='';
					nodeObj.newId = getNextNodeId('E');
					nodeObj.cla = "weixinNode moveLight";
					nodeObj.nodeType = 'weixinNode';
					nodeObj.text = "";
					break;
		case 'dingNode':
				  GoalNodeName='';
					nodeObj.newId = getNextNodeId('E');
					nodeObj.cla = "dingNode moveLight";
					nodeObj.nodeType = 'dingNode';
					nodeObj.text = "";
					break;
		case 'gateWay':
		      GoalNodeName='网关';
					nodeObj.newId = getNextNodeId('G');
					nodeObj.cla = "gateWayNode moveLight";
					nodeObj.nodeType = 'gateWay';
					nodeObj.text = "网关";
					nodeObj.icon = '';
					break;
		case 'textNode':
					nodeObj.newId = getNextNodeId('E');
					nodeObj.cla = "textNode textLight";
					nodeObj.nodeType = 'textNode';
					nodeObj.text = "文字说明";
					nodeObj.bgColor = '#fff';
					break;
		default:
					nodeObj.newId = getNextNodeId('T');
					nodeObj.cla = GoalNodeClassName+" moveLight";
					nodeObj.nodeType = GoalNewNodeType;
					nodeObj.text = GoalNodeName;
					nodeObj.bgColor = '#ccab26';
	}
	return nodeObj;
}


// 初始化流程图
function initFlowCharts(flowConfigObj) {
	if(flowConfigObj.transform!=undefined){
		//放大，缩小的比例
		GoalTransform=flowConfigObj.transform;
		ChangeTransformScale(GoalTransform);
	}
	removeAll();
	var nodeArr = flowConfigObj.nodeDataArray;
	var linkArr = flowConfigObj.linkDataArray;

	//把旧版本的流程图统一往右移185
  var initLeftPx=0;
	for(var i = 0; i < nodeArr.length; i++) {
		if(nodeArr[i].locLeft<(GoalLeftMenuWidth-5)){
			initLeftPx=(GoalLeftMenuWidth-5);
			break;
		}
	}

	for(var i = 0; i < nodeArr.length; i++) {
		var nodeObj = chooseNodeObjFromType(nodeArr[i].nodeType);
		//设置节点
		$("#Container").append('<div id="' + nodeArr[i].key + '" class="' + nodeObj.cla + '" onclick="editProperty(\'' + nodeArr[i].key + '\')"></div>');
		//设置节点的位置
		var nodeLeftPx=nodeArr[i].locLeft+initLeftPx;
		var nodeTopPx=nodeArr[i].locTop;
		nodeLeftPx=(nodeLeftPx-GoalLeftMenuWidth)/GoalTransform+GoalLeftMenuWidth;
		nodeTopPx=nodeTopPx/GoalTransform;
		$("#" + nodeArr[i].key).offset({ top: nodeTopPx,left:nodeLeftPx});
		addTextToNode($("#" + nodeArr[i].key),nodeArr[i].text);
		//设置节点的右键菜单
		if(nodeArr[i].nodeType==='textNode'){
			window.ContextMenu.bind("#" + nodeArr[i].key, textNodeMenuJson); //文字节点
		}else{
			window.ContextMenu.bind("#" + nodeArr[i].key, nodeMenuJson);
		}
		//设置节点可以被拖拽，containment 限制元素拖动的范围，grid 使元素对齐网格
		setNodeDraggable(nodeArr[i].key);
		//根据标识设置节点是否可缩放
		var nt = nodeArr[i].nodeType;
		if (NODE_RESIZABLE_FLAG) nodeResizable(nodeArr[i].key);
		//将节点添加到图对象中
		graph.setNode(nodeArr[i].key, {
			text: nodeArr[i].text,
			key: nodeArr[i].key,
			nodeType: nodeArr[i].nodeType,
			locTop: nodeArr[i].locTop,
			locLeft: nodeArr[i].locLeft,
			nodeHeight: nodeArr[i].nodeHeight,
			nodeWidth: nodeArr[i].nodeWidth,
			bgColor: nodeArr[i].bgColor,
			isSelected: false
		});
		recordNodeId(nodeArr[i].key);//记录节点id
	}
	//为节点注册事件
	registerNodeEvent();
	//开始链接所有线段
	for(var i = 0; i < linkArr.length; i++) {
		//连线
		connectTwoNode(linkArr[i].from, linkArr[i].to, linkArr[i].routerId,linkArr[i].sourceAnchor,linkArr[i].targetAnchor,linkArr[i].lineType);
		//给路由添加id、右击菜单
		addConnectionId(linkArr[i].from, linkArr[i].to, linkArr[i].routerId);
		window.ContextMenu.bind("#" + linkArr[i].routerId, connectionMenuJson);
		//设置连接线单击打开属性编辑窗口事件
		$('#' + linkArr[i].routerId).click(function(event) {
			editProperty($(this).context.id);
		});
		//给路由添加文本信息
		if (linkArr[i].label != '') {
			var connLineObj=INSTANCE_JSPLUMB.getConnections({source: linkArr[i].from,target: linkArr[i].to})[0];
			connLineObj.setLabel({label: linkArr[i].label,cssClass: 'labelClass'});
		}
		//记录连接线id
		recordNodeId(linkArr[i].routerId);
	}
}

//改变图形的大小,所发缩放大小
//@param action  1=缩小,2=放大
function ChangeTransform(action){
	if(action==1){
		GoalTransform=(GoalTransform*0.9);
	}else if(action==2){
		GoalTransform=(GoalTransform/0.9);
		if(GoalTransform>1){
			window.showInfo("已达100%");
			GoalTransform=1;
		}
	}
	ChangeTransformScale(GoalTransform);
}

function ChangeTransformScale(scale){
	$('#Container').css('transform', 'scale('+scale+')');
	$('#Container').css('transform-origin', '0 0');
}

/**
 * 获取当前的流程文档对象
 */
function getCurrentFlowDoc() {
	flowDoc = {};
	var nodeDataArray = [];
	//当前滚动条位置
	var scrollX = $('#canvasId').scrollLeft();
	var scrollY = $('#canvasId').scrollTop();

	//节点
	$.each($('#Container').children('.moveLight'), function(index) {
		var tempObj = {};
		tempObj.text = graph.node($(this).attr('id')).text;
		tempObj.key = $(this).attr('id');
		tempObj.nodeType = graph.node($(this).attr('id')).nodeType;
		tempObj.locTop = $(this).offset().top + scrollY;
		tempObj.locLeft = $(this).offset().left + scrollX;
		tempObj.nodeHeight = $(this).css('height');
		tempObj.nodeWidth = $(this).css('width');
		tempObj.bgColor = $(this).attr('bgColor-gradient');
		nodeDataArray.push(tempObj);
	});

	//文字
	$.each($('#Container').children('.textLight'), function(index) {
		var tempObj = {};
		tempObj.text = graph.node($(this).attr('id')).text;
		tempObj.key = $(this).attr('id');
		tempObj.nodeType = graph.node($(this).attr('id')).nodeType;
		tempObj.locTop = $(this).offset().top + scrollY;
		tempObj.locLeft = $(this).offset().left + scrollX;
		tempObj.nodeHeight = $(this).css('height');
		tempObj.nodeWidth = $(this).css('width');
		tempObj.bgColor = $(this).attr('bgColor-gradient');
		nodeDataArray.push(tempObj);
	});
	//泳道
	$.each($('#Container').children('.laneNode'), function(index) {
		var tempObj = {};
		tempObj.text = LANEOBJS[$(this).attr('id')].text;
		tempObj.key = $(this).attr('id');
		tempObj.nodeType = LANEOBJS[$(this).attr('id')].nodeType;
		tempObj.locTop = $(this).offset().top + scrollY;
		tempObj.locLeft = $(this).offset().left + scrollX;
		tempObj.nodeHeight = $(this).css('height');
		tempObj.nodeWidth = $(this).css('width');
		tempObj.bgColor = $(this).attr('bgColor-gradient');
		nodeDataArray.push(tempObj);
	});
	flowDoc.nodeDataArray = nodeDataArray;

  //路由
	var linkDataArray = [];
	$.each(INSTANCE_JSPLUMB.getAllConnections(), function() {
		var tempObj = {};
		var connectionObj=$(this)[0];
		var sourceAnchor=connectionObj.endpoints[0].getParameter("anchor")||''; //源节点的端点位置
		var targetAnchor=connectionObj.endpoints[1].getParameter("anchor")||''; //目标节点的端点位置
		tempObj.from = $(this)[0].sourceId;
		tempObj.to = $(this)[0].targetId;
		tempObj.routerId = graph.edge(connectionObj.sourceId, connectionObj.targetId).id;
		tempObj.label = getRouterLabel(connectionObj.sourceId, connectionObj.targetId);
		tempObj.sourceAnchor=sourceAnchor;
		tempObj.targetAnchor=targetAnchor;
		tempObj.lineType=connectionObj.connector.type; //线条的类型流程线，直线，其他线
		// console.log(tempObj.lineType);
		linkDataArray.push(tempObj);
	});
	flowDoc.linkDataArray = linkDataArray;
  flowDoc.transform=GoalTransform; //放大，缩小比例的数值
	return flowDoc;
}

/**
 * 保存流程
 */
var flowDoc;
function getFlowDoc() {
	return this.flowDoc;
}

/**
 * 将流程图对象json数据持久化到数据库中
 */
function saveObj(obj) {
	var d = {};
	var p = parent.$('#mainDiv').attr('processid');
	var post_data = {
	    "Processid": p,
	    "WF_Action": "save",
	    "flowJSON": JSON.stringify(obj)
	}
	return d;
}


/**
 * 移除所有端点，清空画布，重置图对象
 */
function removeAll() {
	$.each($("#Container").children('.moveLight'), function() {
		INSTANCE_JSPLUMB.removeAllEndpoints($(this).attr('id'));
	});
	$("#Container").empty();
	NODEIDOBJ_INIT();
	initJsPlumbInstance();
	resetGraphObj();
}

/**
 * 撤销
 */
function undo() {
	if (UNDO_ARR.length > 0) {
		//撤销前的节点路由数组
		var oldNodeArr = graph.nodes();
		var oldRouterArr = getAllRouterId();
		REDO_ARR.push(getCurrentFlowDoc());
		initFlowCharts(UNDO_ARR.pop());
		//撤销后的节点路由数组
		var newNodeArr = graph.nodes();
		var newRouterArr = getAllRouterId();
		//删除撤销的数据库节点数据
		var deleteNodeArr = getDeleteNodeArr(oldNodeArr, newNodeArr, oldRouterArr, newRouterArr);
	}
}

/**
 * 重做
 */
function redo() {
	if (REDO_ARR.length > 0) {
		//重做前的节点路由数组
		var oldNodeArr = graph.nodes();
		var oldRouterArr = getAllRouterId();
		//将当前流程对象放入可撤销数组中
		UNDO_ARR.push(getCurrentFlowDoc());
		initFlowCharts(REDO_ARR.pop());
		//重做后的节点路由数组
		var newNodeArr = graph.nodes();
		var newRouterArr = getAllRouterId();
		//删除重做的数据库节点数据
		var deleteNodeArr = getDeleteNodeArr(oldNodeArr, newNodeArr, oldRouterArr, newRouterArr);
	}
}

/**
 * 删除节点
 * 1、在图对象中移除节点以及关于节点的连线
 * 2、移除节点的所有端点
 * 3、移除节点
 */
function deleteNode(tempId) {
	var selectedNodeIdArr=[];
	//将当前流程对象放入可撤销数组中
	UNDO_ARR.push(getCurrentFlowDoc());
	MYCLIPBOARD.length = 0;
	//待删除的节点和线id
	var deleteNodeAndRouterIdArr = [];
	if (tempId != undefined) {
		tempId = tempId.substring(1);
		if (graph.hasNode(tempId)) {
			var deleteRouterIdArr = removeNodeAndEdgesById(tempId);
			INSTANCE_JSPLUMB.removeAllEndpoints(tempId);
			//removeNodeId(tempId);
			$('#' + tempId).remove();
			//添加到待删除数组
			deleteNodeAndRouterIdArr.push(tempId)
			deleteNodeAndRouterIdArr = deleteNodeAndRouterIdArr.concat(deleteRouterIdArr);
		}
	}
	//删除数据库中的节点信息
  deleteNodeFromDB(deleteNodeAndRouterIdArr);
	window.showInfo(CONFIG.msg.deleteNode);
}

/**
 * 删除文字节点
 */
function deleteTextNode(tempId) {
	//将当前流程对象放入可撤销数组中
	UNDO_ARR.push(getCurrentFlowDoc());
	MYCLIPBOARD.length = 0;
	if (tempId != undefined) {
		tempId = tempId.substring(1);
		if (graph.hasNode(tempId)) {
			var deleteRouterIdArr = removeNodeAndEdgesById(tempId);
			INSTANCE_JSPLUMB.removeAllEndpoints(tempId);
			$('#' + tempId).remove();
		}
	}
	//删除数据库中的节点信息
  deleteNodeFromDB(tempId.split(","));
}

/**
 * 删除数据库中的节点信息
 */
function deleteNodeFromDB(idArr) {
	window.deleteProcessNode(idArr);
}

/**
 * 为节点注册事件
 */
function registerNodeEvent(tempId,nodeObj) {
	if(nodeObj!==undefined && nodeObj.nodeType==='textNode'){return;} //如果是文字节点不注册事件
	var selector;
	if (tempId == undefined) {
		selector = '.moveLight';
	} else {
		selector = '#' + tempId;
	}
	/**
	 * 当鼠标移动到节点上时将发光属性保存到临时的属性temp-box-shadow中
	 * 然后改变节点的发光样式，显示可拖拽区域
	 * 当鼠标移出节点时将节点的发光样式还原为临时保存的属性temp-box-shadow，隐藏可拖拽区域
	 */
	$(selector).mouseover(function() {
		// 当节点选中标识为false，也就是未被选中时
		if (!graph.node($(this).attr('id')).isSelected) {
			$(this).css('box-shadow', NODE_SELECTED_BOX_SHADOW);
		}
	}).mouseout(function() {
		// 当节点选中标识为false，也就是未被选中时
		if (!graph.node($(this).attr('id')).isSelected) {
			$(this).css('box-shadow', NODE_NO_SELECTED_BOX_SHADOW);
		}
		layer.close(layer.tips());
	});

	/**
	 * 单击选中事件
	 */
	$(selector).mousedown(function(event) {
		//兼容浏览器写法
		var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
		//当鼠标按钮不为左键时终止函数的执行，0是左键，1是滚轮键，2是右键
		$(this).css('box-shadow', '0 0 20px #f50');
		//当没有多选时将其他被选中的节点改为未选中
		if (!SELECTED_MULTIPLE_FLAG) {
			changeToNoSelected($(this).attr('id'));
		}
	}).mouseup(function(event) {
		//显示节点全名
		if (!SELECTED_MULTIPLE_FLAG && !ALLOW_MULTIPLE_SELECTED_FLAG) {
			layer.tips(graph.node($(this).attr('id')).text, getJquerySelectorPrefix($(this).attr('id')), {
				tips: [3, '#23262e'],
				time: 2000
			});
		}
		//兼容浏览器写法
		var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
		//当鼠标按钮不为左键时终止函数的执行，0是左键，1是滚轮键，2是右键
		$(this).css('box-shadow', NODE_SELECTED_BOX_SHADOW);
		clearAllTimer();
		//当允许多选时
		if (ALLOW_MULTIPLE_SELECTED_FLAG) {
			selectedNode($(this).attr('id'));
		}
		//当没有多选时
		if (!SELECTED_MULTIPLE_FLAG) {
			SELECTED_NODE_LIST[0] = $(this).attr('id');
			INSTANCE_JSPLUMB.addToDragSelection($(this).attr('id'));
			graph.node($(this).attr('id')).isSelected = true;
		}
	});
	/**
	 * 阻止事件的传播行为，防止点击节点时触发父节点绑定的click事件
	 */
	$(selector).click(function(event) {
		var event = document.all ? window.event : arguments[0] ? arguments[0] : event;
		event.stopPropagation();
	});
}

/**
 * 动画显示路由路径
 * @param {String} id 节点id
 * @param {String} type 显示路径类型
 */
function showConnectionRoute(id, type) {
	id = getRemovePrefixId(id);
	var noRouteFlag = true;
	var conns, message;
	switch (type) {
		case 'front':
			conns = INSTANCE_JSPLUMB.getConnections( { target: id } );
			message = CONFIG.msg.noFrontRoute;
			break;
		case 'behind':
			conns = INSTANCE_JSPLUMB.getConnections( { source: id } );
			message = CONFIG.msg.noBehindRoute;
			break;
	}
	$.each(conns, function() {
		noRouteFlag = false;
		var o = $(this)[0];
		var timerName = uuid();
		ALL_TIMER[timerName] = setTimeout(function() {
			connectionAnimateOne(o);
		}, 10);
	});
	//当无后继路径时用layer的tips层进行提示
	if (noRouteFlag) {
		layer.tips(message, '#' + id, {
			tips: [4, '#23262e']
		});
	}
}
function connectionAnimateOne(o) {
	o.addClass('connectionAnimateClass');
	var timerName = uuid();
	ALL_TIMER[timerName] = setTimeout(function() {
		connectionAnimateTwo(o);
	}, 200);
}

function connectionAnimateTwo(o) {
	o.removeClass('connectionAnimateClass');
	var timerName = uuid();
	ALL_TIMER[timerName] = setTimeout(function() {
		connectionAnimateOne(o);
	}, 500);
}

/**
 * 清除所有的定时器
 */
function clearAllTimer() {
	// 1、点击画布时清除所有的定时器
	for(timerName in ALL_TIMER) {
		clearTimeout(ALL_TIMER[timerName]);
	}

	ALL_TIMER = {};

	// 2、移除所有连接的 connectionAnimateClass 样式
	$.each(INSTANCE_JSPLUMB.getAllConnections('*'), function() {
		$(this)[0].removeClass('connectionAnimateClass');
	});
}

/**
 * 除了 id 之外的节点，将节点变为非选中状态，若不传参数则表示将所有的节点变为非选中状态
 * @param {String} id
 */
function changeToNoSelected(id) {
	var selector;

	//清除所有jsplumb中的拖拽列表
	INSTANCE_JSPLUMB.clearDragSelection();

	//清空被选中节点列表
	SELECTED_NODE_LIST = [];

	if (id == undefined) {
		selector = '.moveLight';
	} else {
		selector = '.moveLight:not(#' + id + ')';
	}

	// 将节点变为非选中状态
	$.each($(selector), function() {
		$(this).css('box-shadow', NODE_NO_SELECTED_BOX_SHADOW);
		graph.node($(this).attr('id')).isSelected = false;
	});
}

/**
 * 全选
 */
function selectedAll() {
	$.each($('.moveLight'), function(index) {
		//将所有节点的样式改为选中的样式
		$(this).css('box-shadow', NODE_SELECTED_BOX_SHADOW);
		//清除所有的定时器
		clearAllTimer();
		//将所有的节点选中状态改为选中
		graph.node($(this).attr('id')).isSelected = true;
		//添加到 INSTANCE_JSPLUMB 被选中列表中
		INSTANCE_JSPLUMB.addToDragSelection($(this).attr('id'));
		//多选标识改为true
		SELECTED_MULTIPLE_FLAG = true;
	});

	//添加到被选中节点列表中，全选采用的是图对象中的被选中的节点 id 列表
	var selectedNodeIdArr = getSelectedNodeIdArr();
	var i;
	for (i = 0; i < selectedNodeIdArr.length; i++) {
		SELECTED_NODE_LIST.push(selectedNodeIdArr[i]);
	}

}

/**
 * 选中节点
 * @param {String} id 节点id
 */
function selectedNode(id) {
	//清除所有的定时器
	clearAllTimer();

	if (SELECTED_NODE_LIST.indexOf(id) == -1) {
		//将节点的样式改为选中的样式
		var nodeObj=graph.node(id);
		if(nodeObj!==undefined && nodeObj.nodeType!=='textNode'){
			//文字节点不允许选中
			$(getJquerySelectorPrefix(id)).css('box-shadow', NODE_SELECTED_BOX_SHADOW);
			//$(getJquerySelectorPrefix(id)).css('border', "1px solid #f50");
		}
		//将节点选中状态改为选中
		graph.node(id).isSelected = true;
		//添加到 INSTANCE_JSPLUMB 被选中列表中
		INSTANCE_JSPLUMB.addToDragSelection(id);
		//添加到被选中节点列表中
		SELECTED_NODE_LIST.push(id);
	}

	//多选标识改为true
	SELECTED_MULTIPLE_FLAG = true;
}

/**
 * 不选中节点
 * @param {String} id 节点id
 */
function noSelectedNode(id) {
	if (SELECTED_NODE_LIST.indexOf(id) != -1) {
		//将节点的样式改为非选中的样式
		var nodeObj=graph.node(id);
		if(nodeObj!==undefined && nodeObj.nodeType!=='textNode'){
			//文字节点不用处理
			$(getJquerySelectorPrefix(id)).css('box-shadow', NODE_NO_SELECTED_BOX_SHADOW);
			//$(getJquerySelectorPrefix(id)).css('border', "1px solid #ccc");
		}
		//将节点选中状态改为选中
		graph.node(id).isSelected = false;
		//从INSTANCE_JSPLUMB被选中列表中移除
		INSTANCE_JSPLUMB.removeFromDragSelection(id);
		//从被选中节点列表中移除
		deleteDataFromArr(SELECTED_NODE_LIST, id);
	}
}

/**
 * 删除连接线
 * @param {String} connId
 */
function deleteConnection(connId) {
		//将当前流程对象放入可撤销数组中
		UNDO_ARR.push(getCurrentFlowDoc());

		//清除定时器，这里清除定时器的目的是防止显示后继路径动画时删除动画的连接会报错
		clearAllTimer();

		//移除端点以及线段
		var sourceId = $(connId).attr('sourceId');
		var targetId = $(connId).attr('targetId');
		var e = graph.edge(sourceId, targetId);
		if (e.sourceEndPointId != undefined) {
			INSTANCE_JSPLUMB.deleteEndpoint(e.sourceEndPointId);
			INSTANCE_JSPLUMB.deleteEndpoint(e.targetEndPointId);
		} else {
			//移除线段
			INSTANCE_JSPLUMB.deleteConnection(INSTANCE_JSPLUMB.getConnections({
				source: sourceId,
				target: targetId
			})[0]);
		}

		//删除数据库中路由线的数据
		var deleteRouter = [];
		deleteRouter.push(getRemovePrefixId(connId));
		deleteNodeFromDB(deleteRouter);

		//移除图对象中的线段
		graph.removeEdge(sourceId, targetId);

		//移除连接线id记录
		//removeNodeId(getRemovePrefixId(connId));

}

/**
 * 鼠标工具
 */
function mouseTool() {
	var nodeArr = graph.nodes();

	//切换显示
	// $('#connectionToolsBtn').css('color', 'white');
	// $('#mouseToolsBtn').css('color', 'blue');
	//修改鼠标样式
	$('#Container').css('cursor', 'default');
	//鼠标工具可以使用多选框
	var $events = $._data($('#Container')[0], 'events');
	if (!$events || !$events['mousedown']) {
		$('#Container').bind('mousedown', function() {
			//在画布中按下鼠标获取鼠标位置
			px = event.pageX;
			py = event.pageY;
			isClear = true;
		});
	}
	$.each(nodeArr, function(index) {
		ableDraggable(nodeArr[index]);
		//修改鼠标样式
		$('#' + nodeArr[index]).css('cursor', 'move');
		INSTANCE_JSPLUMB.unmakeSource(nodeArr[index]);
	});
}

/**
 * 连线工具
 @param lineType 线条的类型Bezier(贝塞尔曲线，默认)、Straight(直线)、Flowchart(流程图线)、StateMachine(状态线)
 */
function connectionTool(lineType) {
	INSTANCE_JSPLUMB.setZoom(GoalTransform);
	if(lineType!=undefined){common.connector[0]=lineType;} //创建线段的类型
	var nodeArr = graph.nodes();
	//切换显示
	// $('#mouseToolsBtn').css('color', 'white');
	// $('#connectionToolsBtn').css('color', 'blue');
	//修改鼠标样式
	$('#Container').css('cursor', 'crosshair');
	//连线工具无法使用多选框
	var $events = $._data($('#Container')[0], 'events');
	if ($events && $events['mousedown']) {
		$('#Container').unbind('mousedown');
	}
	$.each(nodeArr, function(index) {
		unableDraggable(nodeArr[index]);
		//修改鼠标样式
		$('#' + nodeArr[index]).css('cursor', 'crosshair');
		var n = graph.node(nodeArr[index]);
		var anchors = chooseAnchorsByType(n.nodeType);
		INSTANCE_JSPLUMB.makeSource(nodeArr[index], {
            filter: "a",
            filterExclude: true,
            maxConnections: -1,
            endpoint: [ "Dot", { radius: 7 } ],
            anchor: anchors
        }, common);
	});
}

/**
 * 微移
 * @param {String} moveType 移动类型
 */
function smallMove(moveType) {
	var t, l, movePX = CONFIG.defaultConfig.smallMovePX;
	switch (moveType) {
		case 'up':
			t = -movePX;
			l = 0;
			break;
		case 'down':
			t = movePX;
			l = 0;
			break;
		case 'left':
			t = 0;
			l = -movePX;
			break;
		case 'right':
			t = 0;
			l = movePX;
			break;
	}

	//获取被选中的节点id列表
	var selectedArr = getSelectedNodeIdArr(), i;
	//移动每一个被选中的元素
	for (i = 0; i < selectedArr.length; i++) {
		var newTop = $(getJquerySelectorPrefix(selectedArr[i])).offset().top + t;
		var newLeft = $(getJquerySelectorPrefix(selectedArr[i])).offset().left + l;
		$(getJquerySelectorPrefix(selectedArr[i])).offset({ top: newTop, left: newLeft });

		//重绘
		repaintAll();

		//更新图对象
		graph.node(selectedArr[i]).locTop = newTop;
		graph.node(selectedArr[i]).locLeft = newLeft;
	}
}

/**
 * 缺省保存
 */
function saveAllDefaultNode() {

}

/**
 * 更新画布中节点的值
 * @param {String} nodeId 要更新的节点id
 * @param {String} text 节点的文本信息
 */
function SetPropertyVal(nodeId, text) {
	//将当前流程对象放入可撤销数组中
	UNDO_ARR.push(getCurrentFlowDoc());

	text = text.trim();
	var prefix = nodeId.substring(0, 1);
	if (prefix != 'R') {
		//更新图对象
		graph.node(getRemovePrefixId(nodeId)).text = text;

		//更新节点属性，若文本信息过长，则显示为省略形式
		// if (text.length > 5) {
		// 	text = text.substring(0, 5) + '...';
		// }
		$(getJquerySelectorPrefix(nodeId)).children(':first-child').text(text);
	} else {
		//更新路由信息
		setRouterLabel($(getJquerySelectorPrefix(nodeId)).attr('sourceid'), $(getJquerySelectorPrefix(nodeId)).attr('targetid'), text);
	}
}
