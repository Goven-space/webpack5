//普通节点右击菜单
var nodeMenuJson = [{
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
	},{
			name: "重新执行本节点",
			id: "nodeAttr",
			callback: function(tempId) {
				window.editNodeProps(tempId,'reRunNode');
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
