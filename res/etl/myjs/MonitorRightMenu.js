//节点右击菜单
var nodeMenuJson = [{
			name: "从本节点开始重跑",
			id: "compensateProcess",
			callback: function(tempId) {
				window.editNodeProps(tempId,'compensateProcess');
			}
	},{
				name: "仅重跑当前节点",
				id: "compensateProcess",
				callback: function(tempId) {
					window.editNodeProps(tempId,'compensateProcessSingleNode');
				}
		},{
			name: "查看运行数据",
			id: "nodeAttr",
			callback: function(tempId) {
				window.editNodeProps(tempId,'showinfo');
			}
	},
	{
		name: "显示节点前继路径",
		id: "connRouteFront",
		callback: function(tempId) {
			showConnectionRoute(tempId, 'front');
		}
	},
	{
		name: "显示节点后续路径",
		id: "connRouteBehind",
		callback: function(tempId) {
			showConnectionRoute(tempId, 'behind');
		}
	}
];

//连接线右击菜单
var connectionMenuJson = [
	{
		name: "查看运行数据",
		id: "showRouterInfo",
		callback: function(tempId) {
			//编辑路由属性
			var sourceId = $(tempId).attr('sourceId');
			var targetId = $(tempId).attr('targetId');
			var routerId=graph.edge(sourceId,targetId).id;
			var routerLabel=getRouterLabel(sourceId, targetId);
			var routerObj={sourceId:sourceId,targetId:targetId,nodeId:routerId,eleId:tempId,nodeType:'router',text:routerLabel};
			window.editRouterProps(routerObj,"showinfo");
		}
	}
];

//泳道右击菜单
var laneMenuJson = [
	{
		name: "属性编辑",
		id: "laneAttr",
		callback: function(tempId) {
			//编辑泳道属性
			laneAttr(tempId)
		}
	},
	{
		name: "删除泳道",
		id: "deleteLane",
		callback: function(tempId) {
			deleteLane(tempId);
		}
	}
];

//画布右击菜单
var canvasMenuJson = [
	{
		name: "流程属性",
		id: "processAttribute",
		callback: function(tempId) {
			//编辑过程属性
			window.editProcessProps();
			// editProperty('Process');
		}
	},
	{
		name: "粘贴",
		id: "pasteNode",
		callback: function(tempId) {
			pasteNode();
		}
	},
	{
		name: "全选",
		id: "selectAll",
		callback: function(tempId) {
			selectedAll();
		}
	},
	{
		name: "对齐方式",
		id: "alignWay"
	},
	{
		name: "运行流程",
		id: "runProcess",
		callback: function(tempId) {
			window.runProcess();
		}
	},
	{
		name: "保存流程",
		id: "saveFlowChart",
		callback: function(tempId) {
			window.saveProcess();
		}
	},



	//对齐方式子菜单
	{
		name: "左对齐",
		id: "leftAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				leftAlign(selectedNodeIdArr);
				setTimeout(function(){
					leftAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "右对齐",
		id: "rightAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				rightAlign(selectedNodeIdArr);
				setTimeout(function(){
					rightAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "上对齐",
		id: "upAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				upAlign(selectedNodeIdArr);
				setTimeout(function(){
					upAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	},
	{
		name: "下对齐",
		id: "downAlign",
		parent: "alignWay",
		callback: function(tempId) {
			var selectedNodeIdArr = alignWayCheck();
			if (selectedNodeIdArr != null) {
				downAlign(selectedNodeIdArr);
				setTimeout(function(){
					downAlign(selectedNodeIdArr);
					//更新所有图对象中保存的节点位置
					updateAllGraphNode();
				}, CONFIG.alignParam.alignDuration + 100);
			}
		}
	}
];

//查看流程图画布右击菜单
var showFlowMenuJson = [
	{
		name: "背景切换",
		id: "bgToggle",
		callback: function() {
			console.log('bgToggle...');
		}
	}
];
