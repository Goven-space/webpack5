//节点右击菜单
var nodeMenuJson = [
	{
		name: "节点属性",
		id: "nodeAttr",
		callback: function(tempId) {
			window.editNodeProps(tempId);
		}
	},{
		name: "复制属性",
		id: "copyAttr",
		callback: function(tempId) {
			copyNodeAttrById(tempId);
		}
	},{
		name: "粘贴属性",
		id: "copyAttr",
		callback: function(tempId) {
			pasteNodeAttrById(tempId);
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
	},{
		name: "删除节点",
		id: "deleteNode",
		callback: function(tempId) {
			deleteNode(tempId);
		}
	}
];

//连接线右击菜单
var connectionMenuJson = [
	{
		name: "路由属性",
		id: "connectionAttr",
		callback: function(tempId) {
			//编辑路由属性
			var sourceId = $(tempId).attr('sourceId');
			var targetId = $(tempId).attr('targetId');
			var routerId=graph.edge(sourceId,targetId).id;
			var routerLabel=getRouterLabel(sourceId, targetId);
			var routerObj={sourceId:sourceId,targetId:targetId,nodeId:routerId,eleId:tempId,nodeType:'router',text:routerLabel};
			window.editRouterProps(routerObj);
		}
	},{
		name: "删除连线",
		id: "deleteConnection",
		callback: function(tempId) {
			deleteConnection(tempId);
		}
	},{
			name: "固定源端点至顶部",
			id: "srcTopEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'source','Top');
			}
	},{
			name: "固定源端点至底部",
			id: "srcBottomEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'source','Bottom');
			}
	},{
			name: "固定源端点至左则",
			id: "srcLeftEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'source','Left');
			}
	},{
			name: "固定源端点至右则",
			id: "srcRightEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'source','Right');
			}
	},{
			name: "固定目标端点至顶部",
			id: "targetTopEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'target','Top');
			}
	},{
			name: "固定目标端点至底部",
			id: "targetBottomEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'target','Bottom');
			}
	},{
			name: "固定目标端点至左则",
			id: "targetLeftEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'target','Left');
			}
	},{
			name: "固定目标端点至右则",
			id: "targetRightEndPoint",
			callback: function(tempId) {
				changeConnectionAnchor(tempId,'target','Right');
			}
	}
];

//文字节点菜单
var textNodeMenuJson = [
	{
		name: "修改文字",
		id: "nodeAttr",
		callback: function(tempId) {
			window.editNodeProps(tempId);
		}
	},
	{
		name: "删除文字",
		id: "deleteNode",
		callback: function(tempId) {
			deleteTextNode(tempId);
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
	}
];
