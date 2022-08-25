//bpm-流程管理
export const CORE_BPM_CONFIG={
	list:host+"/bpm/process/list",
  save:host+"/bpm/process/save",
  saveProcessModel:host+"/bpm/process/model/save",
  delete:host+"/bpm/process/delete",
  getById:host+"/bpm/process/{id}",
  run:host+"/bpm/process/run",
  start:host+"/bpm/process/start",
  stop:host+"/bpm/process/stop",
  copy:host+"/bpm/process/copy",
  publish:host+"/bpm/process/publish",
  exportProcess:host+"/bpm/process/export",
  lockedProcess:host+"/bpm/process/locked",
}

//bpm-节点列表
export const CORE_BPM_NODETEMPLATE={
	list:host+"/bpm/process/node/template/list"
}

//bpm-调试日志
export const CORE_BPM_DEBUGLOG={
  showProcessLog:host+"/bpm/debuglog/processlog/show",
  clearProcessLog:host+"/bpm/debuglog/processlog/clear",
}

//bpm-规则管理
export const CORE_BPM_RULE={
  getById:host+"/bpm/rules/detail/{id}",
  getByRuleId:host+"/bpm/rules/detail/query/{ruleId}",
  list:host+"/bpm/rules/list/page",
  save:host+"/bpm/rules/save",
  delete:host+"/bpm/rules/delete",
  select:host+'/bpm/rules/select',
  export:host+'/bpm/rules/export',
  listProcess:host+'/bpm/rules/process'
}

//bpm-左则菜单
export const CORE_BPM_MENU={
  leftMenuUrl:host+"/bpm/menu/leftnav",
}

//bpm-API管理
export const CORE_BPM_API={
  list:host+"/bpm/process/api/list"
}

//bpm-流程节点管理
export const CORE_BPM_PROCESSNODE={
	save:host+"/bpm/process/node/save",
  props:host+"/bpm/process/node/props",
  delete:host+"/bpm/process/node/delete",
	copyUrl:host+"/bpm/process/node/copy",
  selectNode:host+"/bpm/process/node/select",
  selectProcess:host+"/bpm/process/select",
}

//bpm-流程监控
export const CORE_BPM_MONITOR={
  instanceinfo:host+"/bpm/process/monitor/instanceinfo",
  insnodeinfo:host+"/bpm/process/monitor/insnodeinfo",
	ShowProcessModelCache:host+"/bpm/process/cache/show",
	deleteProcessModelCache:host+"/bpm/process/cache/delete",
}

//bpm报表统计
export const CORE_BPM_REPORT={
  homeRunCount:host+"/bpm/process/report/home/count",
  dailyrunsCharts:host+"/bpm/process/report/home/dailyruns",
  avgTimeCharts:host+"/bpm/process/report/home/avgruntime",
  listProcessRunReport:host+"/bpm/process/report/process",
}

//bpm-应用管理
export const APPLICATION={
  listByPage:host+"/bpm/apps/listByPage",
  listapps:host+"/bpm/apps/listapps",
	select:host+"/bpm/apps/select",
  menuCategorys:host+"/bpm/apps/menu/categorys",
  delete:host+"/bpm/apps/delete",
	getById:host+"/bpm/apps/getById",
	save:host+"/bpm/apps/save",
	download:host+"/bpm/apps/download",
	import:host+"/bpm/apps/import",
	info:host+"/bpm/apps/info",
}

//已归档流程列表
export const PROCESS_HISTORY={
	page:host+"/bpm/process/history/list/page",
	movetohistory:host+"/bpm/process/history/movetohistory",
	delete:host+"/bpm/process/history/delete",
}

//待办,已办
export const TODO={
	todoList:host+"/bpm/process/todo/list",
	todoDoneList:host+"/bpm/process/todo/done",
	todoListEndDocs:host+"/bpm/process/todo/end",
	tododelete:host+"/bpm/process/todo/delete",
	allDocs:host+"/bpm/process/todo/all",
}

//审批记录
export const REMARKS={
	listByPage:host+"/bpm/process/remark/list",
	listByType:host+"/bpm/process/remark/listbytype",
	listDoing:host+"/bpm/process/remark/list/doing",
	update:host+"/bpm/process/remark/update",
	delete:host+"/bpm/process/remark/delete",
}

//引擎
export const ENGINE={
	openUrl:host+"/bpm/process/engine/open",
	readUrl:host+"/bpm/process/engine/read",
	runUrl:host+"/bpm/process/engine/run",
	cancelUrl:host+"/bpm/process/engine/cancel",
}
