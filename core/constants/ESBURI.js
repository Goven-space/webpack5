//esb-流程管理
export const CORE_ESB_CONFIG={
	list:host+"/rest/esb/process/list",
  save:host+"/rest/esb/process/save",
  saveProcessModel:host+"/rest/esb/process/model/save",
	checkerrorUrl:host+"/rest/esb/process/model/checkerror",
  delete:host+"/rest/esb/process/delete",
  getById:host+"/rest/esb/process/{id}",
  run:host+"/rest/esb/process/run",
  start:host+"/rest/esb/process/start",
  stop:host+"/rest/esb/process/stop",
  copy:host+"/rest/esb/process/copy",
  publish:host+"/rest/esb/process/publish",
  exportProcess:host+"/rest/esb/process/export",
  lockedProcess:host+"/rest/esb/process/locked",
	testParamsProcess:host+"/rest/esb/process/testparams/query",
	testParamsProcessSave:host+"/rest/esb/process/testparams/save",
}

//esb平台-自定义节点
export const CORE_ESB_NODETEMPLATE={
	list:host+"/rest/esb/process/node/template/list",
  delete:host+"/rest/esb/process/node/template/delete",
  save:host+"/rest/esb/process/node/template/save",
  getById:host+"/rest/esb/process/node/template/getById",
  listSelect:host+"/rest/esb/process/node/template/list/select",
  exportConfig:host+"/rest/esb/process/node/template/export",
}

//esb-调试日志
export const CORE_ESB_DEBUGLOG={
	list:host+"/rest/esb/debuglog/list",
  delete:host+"/rest/esb/debuglog/delete",
  clear:host+"/rest/esb/debuglog/clear",
  showProcessLog:host+"/rest/esb/debuglog/processlog/show",
  clearProcessLog:host+"/rest/esb/debuglog/processlog/clear",
}

//esb-规则管理
export const CORE_ESB_RULE={
  getById:host+"/rest/esb/rules/detail/{id}",
  getByRuleId:host+"/rest/esb/rules/detail/query/{ruleId}",
  list:host+"/rest/esb/rules/list/page",
  save:host+"/rest/esb/rules/save",
  delete:host+"/rest/esb/rules/delete",
  select:host+'/rest/esb/rules/select',
  export:host+'/rest/esb/rules/export',
  listProcess:host+'/rest/esb/rules/process'
}

//esb-节点参数管理
export const CORE_ESB_NODEPARAMS={
  importApiParams:host+"/rest/esb/apinode/import/params",
  selectExportParams:host+"/rest/esb/process/exportparams",
  parseExportParams:host+"/rest/esb/process/parseparams",
}

//esb-左则菜单
export const CORE_ESB_MENU={
  leftMenuUrl:host+"/rest/esb/menu/leftnav",
}

//esb-API管理
export const CORE_ESB_API={
  list:host+"/rest/esb/process/api/list",
	listJoinApis:host+"/rest/esb/process/api/joinapis",
  testRestfulAPI:host+"/rest/esb/apitest/execute",
	defaultHostUrl:host+"/rest/esb/application/defaulthost",
	selectAPI:host+"/rest/esb/process/api/select",
	selectApplication:host+"/rest/esb/process/api/applications/select",
}

//esb-流程节点管理
export const CORE_ESB_PROCESSNODE={
	save:host+"/rest/esb/process/node/save",
  props:host+"/rest/esb/process/node/props",
  delete:host+"/rest/esb/process/node/delete",
	copyUrl:host+"/rest/esb/process/node/copy",
  selectNode:host+"/rest/esb/process/node/select",
  selectProcess:host+"/rest/esb/process/select",
  listNodeJsonPath:host+"/rest/esb/process/node/params/jsonpath/parser",
  previewJsonPath:host+"/rest/esb/process/node/datamapnode/jsonpath/preview",
  listApplications:host+"/rest/esb/apinode/applications",
  listApplicationApis:host+"/rest/esb/apinode/applications/apis",
}

//esb平台-流程监控
export const CORE_ESB_MONITOR={
	listProcess:host+"/rest/esb/process/monitor/list/page",
  instanceinfo:host+"/rest/esb/process/monitor/instanceinfo",
  insnodeinfo:host+"/rest/esb/process/monitor/insnodeinfo",
  historyinfo:host+"/rest/esb/process/monitor/historyinfo",
  listSuccessLog:host+"/rest/esb/process/monitor/success/logs",
  listFailedLog:host+"/rest/esb/process/monitor/failed/logs",
  deleteLog:host+"/rest/esb/process/monitor/log/delete",
  deleteProcessInstance:host+"/rest/esb/process/monitor/instance/delete",
  endProcessInstance:host+"/rest/esb/process/monitor/instance/end",
  runProcessInstance:host+"/rest/esb/process/monitor/instance/run",
  runAsyncQueueProcessInstance:host+"/rest/esb/process/monitor/instance/asyncqueue/run",
  approveProcessInstance:host+"/rest/esb/process/monitor/instance/approve",
  listProcessRunReport:host+"/rest/esb/process/monitor/report/process",
  cancelProcessCompensate:host+"/rest/esb/process/monitor/compensate/cancel",
  runProcessCompensate:host+"/rest/esb/process/monitor/compensate/run",
  listProcessNodeInstances:host+"/rest/esb/process/monitor/node/instance/list",
  ListNodeLastRunTime:host+"/rest/esb/process/lastruntime/list",
  DeleteNodeLastRunTime:host+"/rest/esb/process/lastruntime/delete",
  UpdateNodeLastRunTime:host+"/rest/esb/process/lastruntime/update",
	ShowProcessModelCache:host+"/rest/esb/process/cache/show",
	deleteProcessModelCache:host+"/rest/esb/process/cache/delete",
	reRunNode:host+"/rest/esb/process/monitor/request/node",
	realtimedataUrl:host+'/rest/esb/process/monitor/instance/realtimedata',
	goToNextStep:host+"/rest/esb/process/monitor/instance/nextstep",
}

//esb平台-待补偿节点
export const CORE_ESB_CompensateNode={
  list:host+"/rest/esb/compensatenode/monitor/pages",
  delete:host+"/rest/esb/compensatenode/monitor/delete",
  run:host+"/rest/esb/compensatenode/monitor/run",
  cancel:host+"/rest/esb/compensatenode/monitor/cancel",
}

//esb平台-报表统计
export const CORE_ESB_REPORT={
  homeRunCount:host+"/rest/esb/process/report/home/count",
  dailyrunsCharts:host+"/rest/esb/process/report/home/dailyruns",
  avgTimeCharts:host+"/rest/esb/process/report/home/avgruntime",
  scheduleDistribution:host+"/rest/esb/process/report/schedule/distribution",
}

//esb平台-应用管理
export const APPLICATION={
  listByPage:host+"/rest/esb/apps/listByPage",
  listapps:host+"/rest/esb/apps/listapps",
	select:host+"/rest/esb/apps/select",
  menuCategorys:host+"/rest/esb/apps/menu/categorys",
  delete:host+"/rest/esb/apps/delete",
	getById:host+"/rest/esb/apps/getById",
	save:host+"/rest/esb/apps/save",
	download:host+"/rest/esb/apps/download",
	import:host+"/rest/esb/apps/import",
	info:host+"/rest/esb/apps/info",
}

//数据映射模板管理
export const DATAMAPPING_CATEGORY={
	page:host+"/rest/esb/datamapping/category/page",
	delete:host+"/rest/esb/datamapping/category/delete",
	getById:host+"/rest/esb/datamapping/category/{id}",
	save:host+"/rest/esb/datamapping/category/save",
  exportConfig:host+"/rest/esb/datamapping/category/export",
	parserUrl:host+"/rest/esb/datamapping/engine/parser",
	selectUrl:host+"/rest/esb/datamapping/category/select",
  copy:host+"/rest/esb/datamapping/category/copy",
}

//数据映射字段管理
export const DATAMAPPING_ITEM={
	page:host+"/rest/esb/datamapping/item/page",
	tree:host+"/rest/esb/datamapping/item/tree",
	delete:host+"/rest/esb/datamapping/item/delete",
	save:host+"/rest/esb/datamapping/item/save",
  getById:host+"/rest/esb/datamapping/item/details",
  validate:host+"/rest/esb/datamapping/item/validate",
	inputJsonPaths:host+"/rest/esb/datamapping/item/input/jsonpaths",
	outputparamsUrl:host+"/rest/esb/datamapping/item/output/importparams",
}

//已归档流程列表
export const PROCESS_HISTORY={
	page:host+"/rest/esb/process/history/list/page",
	movetohistory:host+"/rest/esb/process/history/movetohistory",
	delete:host+"/rest/esb/process/history/delete",
}

//esb-任务列表
export const TASK={
	list:host+"/rest/esb/task/list",
	delete:host+"/rest/esb/task/delete",
	clear:host+"/rest/esb/task/clear",
	changestatus:host+"/rest/esb/task/changestatus",
	save:host+"/rest/esb/task/save",
	getById:host+"/rest/esb/task/getById",
	serverCountCharts:host+"/rest/esb/task/report/server/counts",
}

//etl-版本管理
export const VERSION={
	list:host+"/rest/esb/process/version/list",
	delete:host+"/rest/esb/process/version/delete",
	restore:host+"/rest/esb/process/version/restore",
	save:host+"/rest/esb/process/version/save",
}

//数据库输出节点
export const DBTABLENODE={
	getTableFields:host+"/rest/esb/process/tablewritenode/table/fields",
	previewData:host+"/rest/esb/process/tablewritenode/preview"
}
//数据库输入节点
export const DBTABLE_READNODE={
	getTableFields:host+"/rest/esb/process/tablereadnode/table/fields",
	getSelectSql:host+"/rest/esb/process/tablereadnode/getSelectSql",
	previewSqlData:host+"/rest/esb/process/tablereadnode/previewdata",
	parsesqlColumns:host+"/rest/esb/process/tablereadnode/parsesql/columns"
}
