window.px = ""; //用来存全局当mouse点击时的x坐标
window.py = ""; //用来存全局当mouse点击时的y坐标
var GoalNewNodeType=''; //lch 点击新增节点时的类型
var GoalNodeTemplateId='';//新增节点时的节点模板Id
var GoalNodeName=""; //创建节点时指定节点上的文字内容
var GoalNodeStyle=""; //创建节点时指这下节点的css类
var GoalStopDragFlag=false; //是否可弹出节点属性
var GoalCopyAttrSourceNodeId="";//要复制属性的源nodeid
var GoalLeftMenuWidth=185; //左则菜单的宽度
var GoalTransform=1; //缩放比例

/**
 * 配置对象
 */
var CONFIG={
	"defaultConfig": {
		"resizableFlag": false,
		"smallMovePX": 1
	},
	"defaultStyle": {
		"selectedBoxShadow": "rgb(0, 0, 0) 0px 0px 10px 0px",
		"noSelectedBoxShadow": "rgb(78, 78, 78) 0px 0px 5px 0px",
		"dragOpacity": 0.8,
	},
	"conn": {
		"connectionType": "Flowchart",
		"connectionGap": 10,
		"connectionCornerRadius": 5,
		"connectionAlwaysRespectStubs": true,
		"isDetachable": false
	},
	"arrow": {
		"arrowWidth": 10,
		"arrowLength": 10,
		"arrowLocation": 1
	},
	"endPonit": {
		"endPointStrokeWidth": 2.5,
		"endPointRadius": 5,
		"hoverEndPointStroke": "blue"
	},
	"anchors": {
		"defaultAnchors": ["Bottom", "Right", "Top", "Left"]
	},
	"alignParam": {
		"levelDistance": 100,
		"verticalDistance": 100,
		"alignDuration": 500
	},
	"keyboardParam": {
		"multipleSelectedKey": 17,
		"deleteKey": 46,
		"upKey": 38,
		"downKey": 40,
		"leftKey": 37,
		"rightKey": 39,
		"undoKey": 90,
		"redoKey": 89,
		"selectedAllKey": 65,
		"saveKey": 83,
		"save2PhotoKey": 80,
		"clearKey": 68,
		"showGridKey": 81,
		"mouseToolKey": 81,
		"connectionToolKey": 82,
		"settingKey": 70
	},
	"msg": {
		"noNode": "保存失败，流程图不存在任何节点",
		"noConn": "保存失败，流程图存在未连接的节点",
		"hasAcyclic": "保存失败，流程图中存在循环路径",
		"noNodeBySave2Photo": "图中无节点，无法保存为图片",
		"deleteConn": "确定要删除连接吗？",
		"deleteLane": "删除成功",
		"deleteNode": "删除成功",
		"chooseNodeObjErr": "节点类型选择错误！",
		"saveSuccess": "流程保存成功",
		"saveObjErr": "发送未知错误，保存失败，请联系管理员",
		"clearConfirm": "确定要重新绘制吗？",
		"noFrontRoute": "无前继路径",
		"noBehindRoute": "无后续路径",
		"alignWayCheck": "请选择两个或两个以上的节点对齐",
		"repeatRouter": "重复路由",
		"closeFrame": "当前流程图还未保存，确认退出吗？",
		"repeatStartNode": "重复的开始节点",
		"currentProgress": "当前进度",
		"flowPublish": "流程已完成"
	}
};

function getConfig() {
	return this.CONFIG;
}

/**
 * jsPlumb实例对象
 */
var INSTANCE_JSPLUMB;

/**
 * 图对象
 */
var graph = new graphlib.Graph();
function getGraph() {
	return this.graph;
}

/**
 * 泳道对象
 */
var LANEOBJS = {};
function getLANEOBJS() {
	return this.LANEOBJS;
}

/**
 * 节点id对象
 */
var NODEIDOBJ;
function NODEIDOBJ_INIT() {
	this.NODEIDOBJ = {
		'T': [],
		'E': [],
		'G': [],
		'S': [],
		'R': [],
		'L': []
	};
}

/**
 * 所有的定时器对象
 * 目的是为了清除所有的定时器对象时比较方便
 */
var ALL_TIMER = {};

/**
 * 剪切板
 * 实质上是一个数组，存储的是被复制的节点id
 */
var MYCLIPBOARD = [];

/**
 * 节点是否允许缩放标志
 */
var NODE_RESIZABLE_FLAG;

/**
 * 被选中的节点列表
 */
var SELECTED_NODE_LIST = [];

/**
 * 允许多选标识
 * 目的是按住ctrl键时可以点击节点进行多选操作，当按住ctrl时改为true，此时单击节点可以进行多选，松开ctrl后改为false无法多选
 */
var ALLOW_MULTIPLE_SELECTED_FLAG = false;

/**
 * 多选标识
 * 目的的防止节点多选拖拽移动后会触发mouseup事件导致取消多选状态，这个标识在多选节点后会改为true
 */
var SELECTED_MULTIPLE_FLAG = false;

/**
 * 节点被选中的 box-shadow 样式
 */
var NODE_SELECTED_BOX_SHADOW;

/**
 * 节点未被选中的 box-shadow 样式
 */
var NODE_NO_SELECTED_BOX_SHADOW;

/**
 * 撤销数组
 */
var UNDO_ARR = [];
function getUNDO_ARR() {
	return this.UNDO_ARR;
}

/**
 * 重做数组
 */
var REDO_ARR = [];

/**
 * 连线信息数组
 */
var CONN_INFO_ARR = [];

var isClear;
