/**
 * 重置全局图对象
 * @param {Graph} graph
 */
function resetGraphObj() {
	graph = null;
	graph = new graphlib.Graph();
}

/**
 * 连接两个节点
 * @param {String} id1 源节点id
 * @param {String} id2 目标节点id
 * @param {String} routerId 连接线id
*  @param {String} sourceAnchor 源端点的位置
*  @param {String} targetAnchor 目标节点端点的位置
*  @param {String} lineType 线条的类型Bezier(贝塞尔曲线，默认)、Straight(直线)、Flowchart(流程图线)、StateMachine(状态线)
 */
function connectTwoNode(id1, id2, routerId,sourceAnchor,targetAnchor,lineType) {
	//新增端点，一条连接线两个端点
	var sourceEndPointId = addEndPointById(id1,sourceAnchor);
	var targetEndPointId = addEndPointById(id2,targetAnchor);
	if(common==undefined){
		window.showInfo("流程初始化数据出错,请关闭后重新打开本流程!");
		return;
	}
	if(lineType!=undefined){
			common.connector[0]=lineType; //改变线的类型,默认是流程线
	}
	//连接线段,通过编码连接endPoint，连线不会混乱
	INSTANCE_JSPLUMB.connect({uuids: [sourceEndPointId, targetEndPointId]}, common)
	//将线段添加到图对象中
	var connId = routerId;
	graph.setEdge(id1, id2, {
		id: connId,
		sourceEndPointId: sourceEndPointId,
		targetEndPointId: targetEndPointId
	});
}

/**
 * 根据id移除节点以及关于节点的所有连线，返回删除的路由线id数组
 * @param {String} id
 */
function removeNodeAndEdgesById(id) {
	var deleteRouterIdArr = [];
	$.each(graph.nodeEdges(id), function() {
		var v = $(this)[0].v;
		var w = $(this)[0].w;
		var e = graph.edge(v, w);
		deleteRouterIdArr.push(e.id);
		if (e.sourceEndPointId != undefined) {
			INSTANCE_JSPLUMB.deleteEndpoint(e.sourceEndPointId);
			INSTANCE_JSPLUMB.deleteEndpoint(e.targetEndPointId);
		}
		graph.removeEdge($(this)[0].v, $(this)[0].w);
	});
	graph.removeNode(id);
	return deleteRouterIdArr;
}

/**
 * 检查图像是否合法
 */
function checkGraph() {
	//克隆graph对象
	var copyGraph = $.extend(true, {}, graph);
	var msg = '0';
	var componentLen = graphlib.alg.components(copyGraph).length;
	if (componentLen == 0) {
		msg = CONFIG.msg.noNode;
	} else if (componentLen > 1) {
		msg = CONFIG.msg.noConn;
	} else if (!graphlib.alg.isAcyclic(copyGraph)) {
		msg = CONFIG.msg.hasAcyclic;
	}
	return msg;
}

/**
 * 放置、粘贴新节点时检查图对象
 * @param nodeType 节点类型
 */
function checkCurrentGraph(nodeType) {
	var msg = '0';
	if (nodeType == 'start') {
		var nodes = graph.nodes(), i;
		for (i = 0; i < nodes.length; i++) {
			if (graph.node(nodes[i]).nodeType == 'start') {
				msg = CONFIG.msg.repeatStartNode;
				return msg;
			}
		}
	}
	return msg;
}

/**
 * 在图对象中获取被选中的节点 id 列表
 */
function getSelectedNodeIdArr() {
	var selectedNodeIdArr = [];
	var nodeIds = graph.nodes();
	$.each(graph.nodes(), function(index) {
		if (graph.node(nodeIds[index]).isSelected) {
			selectedNodeIdArr.push(nodeIds[index]);
		}
	});
	return selectedNodeIdArr;
}

/**
 * 对齐方式检查
 */
function alignWayCheck() {
	//获取所有被选中的节点 id
	var selectedNodeIdArr = SELECTED_NODE_LIST;
	if (selectedNodeIdArr.length < 2) {
		layer.msg(CONFIG.msg.alignWayCheck, { icon: 5 });
		return null;
	}
	return selectedNodeIdArr;
}

/**
 * 更新图对象中的node
 */
function updateGraphNode(id) {
	var $this = $(getJquerySelectorPrefix(id));
	var graphNode = graph.node(getRemovePrefixId(id));
	graphNode.locTop = $this.offset().top;
	graphNode.locLeft = $this.offset().left;
	graphNode.nodeHeight = $this.css('height');
	graphNode.nodeWidth = $this.css('width');
	graphNode.bgColor = $this.attr('bgColor-gradient');
}

/**
 * 更新所有图对象中的node
 */
function updateAllGraphNode() {
	var nodeArr = graph.nodes();
	var index;
	for (index = 0; index < nodeArr.length; index++) {
		updateGraphNode(nodeArr[index]);
	}
}

/**
 * 更新泳道对象
 * @param {String} id 泳道id
 */
function updateLaneObjs(id) {
	var $this = $(getJquerySelectorPrefix(id));
	var laneObj = LANEOBJS[getRemovePrefixId(id)];

	laneObj.locTop = $this.offset().top;
	laneObj.locLeft = $this.offset().left;
	laneObj.nodeHeight = $this.css('height');
	laneObj.nodeWidth = $this.css('width');
	laneObj.bgColor = $this.attr('bgColor-gradient');
}

//lch
function copyNodeAttrById(tempId) {
	tempId=tempId.replace("#","");
	GoalCopyAttrSourceNodeId=tempId;
	window.showInfo("节点("+GoalCopyAttrSourceNodeId+")属性复制成功!");
}

//lch
function pasteNodeAttrById(targetNodeId) {
	if(GoalCopyAttrSourceNodeId==''){
		window.showInfo("请先复制一个节点的属性再粘贴!");
		return;
	}
	targetNodeId=targetNodeId.replace("#","");
	if(targetNodeId===GoalCopyAttrSourceNodeId){
		window.showInfo("不能粘贴给自已!");
		return;
	}
	window.copyProcessNode(GoalCopyAttrSourceNodeId,targetNodeId);
	GoalCopyAttrSourceNodeId=""; //清空属性
}

/**
 * 根据画布中的节点获取canvas的尺寸
 */
function getCanvasSizeByNode() {
	var nodeArr = graph.nodes();
	var firstNodeTop = graph.node(nodeArr[0]).locTop;
	var firstNodeLeft = graph.node(nodeArr[0]).locLeft;
	var maxTop = firstNodeTop;
	var minTop = firstNodeTop;
	var maxLeft = firstNodeLeft;
	var minLeft = firstNodeLeft;
	var i;

	for (i = 0; i < nodeArr.length; i++) {
		var t = graph.node(nodeArr[i]).locTop;
		var l = graph.node(nodeArr[i]).locLeft;
		if (t > maxTop) {
			maxTop = t;
		}
		if (t < minTop) {
			minTop = t;
		}
		if (l > maxLeft) {
			maxLeft = l;
		}
		if (l < minLeft) {
			minLeft = l;
		}
	}

	return {
		canvasTop: maxTop + minTop,
		canvasLeft: maxLeft + minLeft,
	};
}

/**
 * 获取节点的四个点坐标
 * @param {String} nodeId 节点id
 */
function getNodeCoordinate(nodeId) {
	nodeId = getJquerySelectorPrefix(nodeId);
	var x11 = $(nodeId).offset().left;
	var y11 = $(nodeId).offset().top;
	var x22 = x11 + parseInt($(nodeId).css('width'));
	var y22 = y11;
	var x33 = x11 + parseInt($(nodeId).css('width'));
	var y33 = y11 + parseInt($(nodeId).css('height'));
	var x44 = x11;
	var y44 = y11 + parseInt($(nodeId).css('height'));

	return {
		x11: x11,
		y11: y11,
		x22: x22,
		y22: y22,
		x33: x33,
		y33: y33,
		x44: x44,
		y44: y44
	};
}

/**
 * 获取所有路由id
 */
function getAllRouterId() {
	var res = [];
	var edges = graph.edges(), i;
	for (i = 0; i < edges.length; i++) {
		var routerId = graph.edge(edges[i].v, edges[i].w).id;
		if (routerId != undefined) {
			res.push(routerId);
		}
	}
	return res;
}
