
//etl-流程管理
export const CONFIG={
	list:host+"/rest/etl/process/list",
  save:host+"/rest/etl/process/save",
  saveProcessModel:host+"/rest/etl/process/model/save",
	checkerrorUrl:host+"/rest/etl/process/model/checkerror",
  delete:host+"/rest/etl/process/delete",
  getById:host+"/rest/etl/process/{id}",
  run:host+"/rest/etl/process/run",
	compensate:host+"/rest/etl/process/compensate",
  start:host+"/rest/etl/process/start",
  stop:host+"/rest/etl/process/stop",
  copy:host+"/rest/etl/process/copy",
  publish:host+"/rest/etl/process/publish",
  exportProcess:host+"/rest/etl/process/export",
	selectProcess:host+"/rest/etl/process/select",
	lockedProcess:host+"/rest/etl/process/locked",
	testParamsProcess:host+"/rest/etl/process/testparams/query",
	testParamsProcessSave:host+"/rest/etl/process/testparams/save",
	getNewTransactionId:host+"/rest/etl/process/transactionId/create",
}

//etl平台-自定义节点
export const NODETEMPLATE={
	list:host+"/rest/etl/process/node/template/list",
  delete:host+"/rest/etl/process/node/template/delete",
  save:host+"/rest/etl/process/node/template/save",
  getById:host+"/rest/etl/process/node/template/getById",
  listSelect:host+"/rest/etl/process/node/template/list/select",
  exportConfig:host+"/rest/etl/process/node/template/export",
}

//etl-调试日志
export const DEBUGLOG={
	logfiles:host+"/rest/etl/debuglog/logfiles/list",
	download:host+"/rest/etl/debuglog/logfiles/download",
  clear:host+"/rest/etl/debuglog/clear",
	showProcessLog:host+"/rest/etl/debuglog/processlog/show",
	clearProcessLog:host+"/rest/etl/debuglog/processlog/clear",
}

//etl-规则管理
export const RULE={
  getById:host+"/rest/etl/rules/detail/{id}",
  getByRuleId:host+"/rest/etl/rules/detail/query/{ruleId}",
  importApiParams:host+"/rest/etl/apinode/import/params",
  list:host+"/rest/etl/rules/list/page",
  save:host+"/rest/etl/rules/save",
  delete:host+"/rest/etl/rules/delete",
  select:host+'/rest/etl/rules/select',
  export:host+'/rest/etl/rules/export',
  listProcess:host+'/rest/etl/rules/process',
}

//etl-API管理
export const API={
  list:host+"/rest/etl/process/api/list",
  testRestfulAPI:host+"/rest/etl/apitest/execute",
	parseExportParams:host+"/rest/etl/process/parseparams",
}

//etl-流程节点管理
export const PROCESSNODE={
	save:host+"/rest/etl/process/node/save",
  props:host+"/rest/etl/process/node/props",
  delete:host+"/rest/etl/process/node/delete",
	copy:host+"/rest/etl/process/node/copy",
  selectNode:host+"/rest/etl/process/node/select",
  listNodeJsonPath:host+"/rest/etl/process/node/params/jsonpath/parser",
  previewJsonPath:host+"/rest/etl/process/node/datamapnode/jsonpath/preview",
	prevnodeColumnsConfig:host+"/rest/etl/process/node/columns/config",
	prevnodeColumnsSelect:host+"/rest/etl/process/node/columns/select",
}

//etl平台-流程监控
export const MONITOR={
	listProcess:host+"/rest/etl/process/monitor/list/page",
  instanceinfo:host+"/rest/etl/process/monitor/instanceinfo",
  insnodeinfo:host+"/rest/etl/process/monitor/insnodeinfo",
  historyinfo:host+"/rest/etl/process/monitor/historyinfo",
  deleteProcessInstance:host+"/rest/etl/process/monitor/instance/delete",
  endProcessInstance:host+"/rest/etl/process/monitor/instance/end",
	stopProcessInstanceThread:host+"/rest/etl/process/monitor/instance/stopthread",
  runProcessInstance:host+"/rest/etl/process/monitor/instance/run",
	approveProcessInstance:host+"/rest/etl/process/monitor/instance/approve",
  listProcessRunReport:host+"/rest/etl/process/monitor/report/process",
  ListProcessNodeInstanceLog:host+"/rest/etl/process/monitor/node/instance/list",
	ListProcessApproveData:host+"/rest/etl/process/monitor/node/instance/approvedata/list",
	DeleteProcessApproveData:host+"/rest/etl/process/monitor/node/instance/approvedata/delete",
	SaveProcessApproveData:host+"/rest/etl/process/monitor/node/instance/approvedata/save",
	ListNodeLastRunTime:host+"/rest/etl/process/lastruntime/list",
	DeleteNodeLastRunTime:host+"/rest/etl/process/lastruntime/delete",
	UpdateNodeLastRunTime:host+"/rest/etl/process/lastruntime/update",
	UpdateInsNodeData:host+"/rest/etl/process/monitor/node/instance/update",
	compensateProcessUrl:host+'/rest/etl/process/compensate/list',
	deleteCompensateProcessUrl:host+'/rest/etl/process/compensate/delete',
	realtimedataUrl:host+'/rest/etl/process/monitor/instance/realtimedata',
	goToNextStep:host+"/rest/etl/process/monitor/instance/nextstep",
	ListEngineMemroyIndocs:host+"/rest/etl/monitor/memroy/query",
	deleteEngineMemroyIndocs:host+"/rest/etl/monitor/memroy/delete",
	listTopEngineMemroyDataDocs:host+"/rest/etl/monitor/memroy/listdatadocs",
	listETLLogDbName:host+"/rest/etl/log/dbname/select",
}

//数据质量-节点传输日志
export const DATAQUALITY_DATALOG={
	listDataTransLog:host+"/rest/etl/process/dataquality/datalog/listbypage",
	listAllDataTransLog:host+"/rest/etl/process/dataquality/datalog/listbypage/all",
	deleteDataTransLog:host+"/rest/etl/process/dataquality/datalog/delete",
	processErrorDataReport:host+"/rest/etl/dataquality/datalog/process",
}



//etl平台-报表统计
export const REPORT={
  homeRunCount:host+"/rest/etl/process/report/home/count",
  dailyrunsCharts:host+"/rest/etl/process/report/home/dailyruns",
  avgTimeCharts:host+"/rest/etl/process/report/home/avgruntime",
	scheduleDistribution:host+"/rest/etl/process/report/schedule/distribution",
	datatransmissionUrl:host+"/rest/etl/process/report/datatransmission/all",
	datatransmissionByProcessId:host+"/rest/etl/process/report/datatransmission/processid",
}

export const SQLREADNODE={
  getSelectSql:host+"/rest/etl/process/sqlreadnode/getSelectSql",
  parsesqlColumns:host+"/rest/etl/process/sqlreadnode/parsesql/columns",
  getFieldsByTableName:host+"/rest/etl/process/sqlreadnode/table/fields",
  previewSqlData:host+"/rest/etl/process/sqlreadnode/previewdata",
}

export const MONGODB_NODE={
  getTableColumns:host+"/rest/etl/process/mongodbreadnode/table/fields",
	previewData:host+"/rest/etl/process/mongodbreadnode/previewdata",
}

export const METADATAREADNODE={
  getSelectSql:host+"/rest/etl/process/metadatareadnode/getSelectSql",
  parsesqlColumns:host+"/rest/etl/process/metadatareadnode/parsesql/columns",
  getFieldsByTableName:host+"/rest/etl/process/metadatareadnode/table/fields",
  previewSqlData:host+"/rest/etl/process/metadatareadnode/previewdata",
}

export const METADATA_WRITE_NODE={
  previewData:host+"/rest/etl/tabledata/metadata/preview",
}

export const METADATAMGR={
  select:host+"/rest/etl/metadata/select",
	selectAll:host+"/rest/etl/metadata/select/all",
	listByPage:host+"/rest/etl/metadata/listByPage",
	processList:host+"/rest/etl/metadata/process"
}

export const FIELDMAPPING_NODE={
  getFieldMaps:host+"/rest/etl/process/fieldmappingnode/fieldmaps",
}

export const COMMONURL={
  priviewTableName:host+"/rest/etl/tabledata/preview",
}

export const EXCEL_READ_NODE={
  getExcelHead:host+"/rest/etl/process/excelreadnode/head",
}
export const DBF_READ_NODE={
  getDBFFileHead:host+"/rest/etl/process/dbffilereadnode/head",
}

export const ElasticsearchNode={
	listIndexs:host+"/rest/etl/process/elasticsearch/indexs",
	listTypes:host+"/rest/etl/process/elasticsearch/types",
	getIndexsType:host+"/rest/etl/process/elasticsearch/types/type",
	previewdata:host+"/rest/etl/process/elasticsearch/previewdata"
}

export const FileManager={
  list:host+"/rest/etl/datafile/list",
	save:host+"/rest/etl/datafile/save",
	delete:host+"/rest/etl/datafile/delete",
	getById:host+"/rest/etl/datafile/getById",
	listFiles:host+"/rest/etl/datafile/list/files",
	deleteFiles:host+"/rest/etl/datafile/delete/file",
	uploadFile:host+"/rest/etl/datafile/upload",
	downloadFile:host+"/rest/etl/datafile/download",
	startMonitor:host+"/rest/etl/datafile/monitor/start",
	stopMonitor:host+"/rest/etl/datafile/monitor/stop",
}

export const TableBatchReadNode={
  listTables:host+"/rest/etl/process/tablebatchreadnode/tables"
}

export const CreateTableSQLNode={
  getCreateSql:host+"/rest/etl/process/createtable/sql"
}

//血缘关系分析
export const RELATIONSHIP={
  tablesOut:host+"/rest/etl/relationship/tables/out",
	tablesIn:host+"/rest/etl/relationship/tables/in",
	processParent:host+"/rest/etl/processdependent/parent",
	processSub:host+"/rest/etl/processdependent/sub",
	datasourceShip:host+"/rest/etl/relationship/datasource",
	metaLink:host+"/rest/etl/relationship/metatable/link",
}

//etl平台-应用管理
export const APPLICATION={
  listByPage:host+"/rest/etl/apps/listByPage",
  listapps:host+"/rest/etl/apps/listapps",
	select:host+"/rest/etl/apps/select",
  menuCategorys:host+"/rest/etl/apps/menu/categorys",
  delete:host+"/rest/etl/apps/delete",
	getById:host+"/rest/etl/apps/getById",
	save:host+"/rest/etl/apps/save",
	download:host+"/rest/etl/apps/download",
	import:host+"/rest/etl/apps/import",
	info:host+"/rest/etl/apps/info",
}

//数据质量-数据量对比分析规则
export const DATAQUALITY_DATACOUNT={
	list:host+"/rest/etl/dataquality/datacount/rule/list",
	delete:host+"/rest/etl/dataquality/datacount/rule/delete",
	getById:host+"/rest/etl/dataquality/datacount/rule/getById",
	save:host+"/rest/etl/dataquality/datacount/rule/save",
	run:host+"/rest/etl/dataquality/datacount/rule/run",
	start:host+"/rest/etl/dataquality/datacount/rule/start",
	stop:host+"/rest/etl/dataquality/datacount/rule/stop",
}

//数据质量-对比传输日志
export const DATAQUALITY_DATACOUNT_HISTORYLOG={
	list:host+"/rest/etl/dataquality/datacount/log/list",
	delete:host+"/rest/etl/dataquality/datacount/log/delete",
}

//数据质量-数据异动监测
export const DATAQUALITY_DATACHANGE={
	list:host+"/rest/etl/dataquality/datachange/rule/list",
	delete:host+"/rest/etl/dataquality/datachange/rule/delete",
	getById:host+"/rest/etl/dataquality/datachange/rule/getById",
	save:host+"/rest/etl/dataquality/datachange/rule/save",
	run:host+"/rest/etl/dataquality/datachange/rule/run",
	start:host+"/rest/etl/dataquality/datachange/rule/start",
	stop:host+"/rest/etl/dataquality/datachange/rule/stop",
}

//数据质量-数据异动监测
export const DATAQUALITY_DATACHANGE_HISTORYLOG={
	list:host+"/rest/etl/dataquality/datachange/log/list",
	delete:host+"/rest/etl/dataquality/datachange/log/delete",
}

//数据质量-数据内容分析
export const DATAQUALITY_DATACONTENT={
	list:host+"/rest/etl/dataquality/datacontent/rule/list",
	delete:host+"/rest/etl/dataquality/datacontent/rule/delete",
	getById:host+"/rest/etl/dataquality/datacontent/rule/getById",
	save:host+"/rest/etl/dataquality/datacontent/rule/save",
	run:host+"/rest/etl/dataquality/datacontent/rule/run",
	start:host+"/rest/etl/dataquality/datacontent/rule/start",
	stop:host+"/rest/etl/dataquality/datacontent/rule/stop",
}

//数据质量-数据内容分析
export const DATAQUALITY_DATACONTENT_HISTORYLOG={
	list:host+"/rest/etl/dataquality/datacontent/log/list",
	delete:host+"/rest/etl/dataquality/datacontent/log/delete",
}

//数据质量-数据内容分析
export const DATAQUALITY_DATACONTENT_ERRORDATA={
	list:host+"/rest/etl/dataquality/datacontent/errordata/list",
	delete:host+"/rest/etl/dataquality/datacontent/errordata/delete",
	excel:host+"/rest/etl/dataquality/datacontent/errordata/excel",
}

//数据质量-元数据监测
export const DATAQUALITY_METACHANGE={
	list:host+"/rest/etl/dataquality/metachange/rule/list",
	delete:host+"/rest/etl/dataquality/metachange/rule/delete",
	getById:host+"/rest/etl/dataquality/metachange/rule/getById",
	save:host+"/rest/etl/dataquality/metachange/rule/save",
	run:host+"/rest/etl/dataquality/metachange/rule/run",
	start:host+"/rest/etl/dataquality/metachange/rule/start",
	stop:host+"/rest/etl/dataquality/metachange/rule/stop",
}

//数据质量-元数据变更监测
export const DATAQUALITY_METACHANGE_HISTORYLOG={
	list:host+"/rest/etl/dataquality/metachange/log/list",
	delete:host+"/rest/etl/dataquality/metachange/log/delete",
}

//数据质量-流程状态监控
export const DATAQUALITY_PROCESSSTATUS={
	list:host+"/rest/etl/dataquality/process/status/rule/list",
	delete:host+"/rest/etl/dataquality/process/status/rule/delete",
	getById:host+"/rest/etl/dataquality/process/status/rule/getById",
	save:host+"/rest/etl/dataquality/process/status/rule/save",
	run:host+"/rest/etl/dataquality/process/status/rule/run",
	start:host+"/rest/etl/dataquality/process/status/rule/start",
	stop:host+"/rest/etl/dataquality/process/status/rule/stop",
}

//数据质量-流程状态监控
export const DATAQUALITY_PROCESSSTATUS_HISTORYLOG={
	list:host+"/rest/etl/dataquality/process/status/log/list",
	delete:host+"/rest/etl/dataquality/process/status/log/delete",
}

//etl-任务列表
export const TASK={
	list:host+"/rest/etl/task/list",
	delete:host+"/rest/etl/task/delete",
	clear:host+"/rest/etl/task/clear",
	changestatus:host+"/rest/etl/task/changestatus",
	save:host+"/rest/etl/task/save",
	getById:host+"/rest/etl/task/getById",
	serverCountCharts:host+"/rest/etl/task/report/server/counts",
}

//etl-版本管理
export const VERSION={
	list:host+"/rest/etl/process/version/list",
	delete:host+"/rest/etl/process/version/delete",
	restore:host+"/rest/etl/process/version/restore",
	save:host+"/rest/etl/process/version/save",
}
