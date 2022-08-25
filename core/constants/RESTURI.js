export * as ETL from './ETLURI';
export * as ESB from './ESBURI';
export * as BPM from './BPMURI';
export * as CONNECT from './CONNECT';
export * as MARKET from './MARKET';
export * as MQBUS from './MQBUS';

export const cookieId="identitytoken";
export const baseResRootUrl=resHost+"/res"; //服务器附件资源上传的路径
export const baseResUrl=resHost+"/res/app"; //服务器附件资源上传的路径
export const baseImageUrl=resHost+"/res/images/"; //服务器端的图片所在基础路径
export const adminIndexUrl=appPath+"/admin"; //客户端首页地址
export const loginUrl=appPath+"/admin/login"; //客户端登录地址
export const rootPath=appPath+"/admin"; //客户端访问或链接的基础路径
export const currentServerHost=localStorage.getItem("currentServerHost");
export const userAvatarUrl=webappsProjectName+"/res/iconres/images/avatar.png";//用户头像地址URL
export const showOpenProduct="";
let ApiPortalThemeList=false; //控制API管理门户中的样式
let goalApiDefaultAuthType=1; //控制注册API时的默认认证方式
let leftLayoutBackground='#001529';
let topLayoutBackground='#001529';
try{leftLayoutBackground=LeftLayoutBackground;}catch(e){}
try{topLayoutBackground=TopLayoutBackground;}catch(e){}
try{goalApiDefaultAuthType=ApiDefaultAuthType;}catch(e){}
try{ApiPortalThemeList=GotalApiPortalThemeList;}catch(e){}

//API注册或新增时的默认，认证选项值
export const apiDefaultAuthType=goalApiDefaultAuthType;
export const gotalApiPortalThemeList=ApiPortalThemeList;

//计算当前url的路径
export function getCurrentPath() {
    let url=window.location.href;
    let host=window.location.host;
    let spos=url.indexOf(host);
    let currentUrl=url.substring(spos+host.length,url.length);
    return currentUrl;
}

export const ThemeLight={
  leftMenu:'light',
  logoClass:'monitorlogo',
  topHeaderButton:'topHeaderButton-b',
  monitorTrigger:'monitorTrigger',
  topLine:'1px solid #ebedee',
  userInfoColor:'#000',
  leftLayoutBackground:'#fff',
  topLayoutBackground:'#fff',
}

export const BlackLight={
  leftMenu:'dark',
  logoClass:'monitorlogo-w',
  topHeaderButton:'topHeaderButton-b',
  monitorTrigger:'monitorTrigger',
  topLine:'1px solid #ebedee',
  userInfoColor:'#000',
  leftLayoutBackground:leftLayoutBackground,
  topLayoutBackground:'#fff',
}

export const ThemeBlue={
  leftMenu:'blue',
  logoClass:'monitorlogo-w',
  topHeaderButton:'topHeaderButton-blue',
  monitorTrigger:'monitorTrigger-w',
  topLine:'1px solid #ebedee',
  userInfoColor:'#fff',
  leftLayoutBackground:'#108ee9',
  topLayoutBackground:'#108ee9',
}

export const ThemeOther={
  leftMenu:'other',
  logoClass:'monitorlogo-w',
  topHeaderButton:'topHeaderButton-blue',
  monitorTrigger:'monitorTrigger-w',
  topLine:'1px solid #ebedee',
  userInfoColor:'#fff',
  leftLayoutBackground:leftLayoutBackground,
  topLayoutBackground:topLayoutBackground,
}

export const Theme={
  leftMenu:'dark',
  logoClass:'monitorlogo-w',
  topHeaderButton:'topHeaderButton',
  monitorTrigger:'monitorTrigger-w',
  topLine:'1px solid #666',
  userInfoColor:'#ccc',
  leftLayoutBackground:leftLayoutBackground,
  topLayoutBackground:topLayoutBackground,
}

//平台公共服务api
export const CONTEXT={
	contextUrl:host+"/rest/base/users/context",
	loginUrl:host+"/rest/core/auth/login",
  loginApi:"/rest/core/auth/login",
}

//apidoc文档说明
export const CORE_APIDOC={
	listAllService:host+'/rest/core/apidocs/services',
	serviceDetailsMore:host+"/rest/core/apidocs/services/details/more",
	serviceDetails:host+"/rest/core/apidocs/services/details",
	getAttachApiDocById:host+'/rest/core/apidocs/{id}',
	saveAttachApiDoc:host+'/rest/core/apidocs/save',
	listSiderMenuUrl:host+'/rest/core/apidocs/menu',
  listAllApps:host+'/rest/core/apidocs/homepage/apps',
  getApiTotalNum:host+'/rest/core/apidocs/homepage/total',
  addFollow:host+'/rest/core/followapi/add',
  cancelFollow:host+'/rest/core/followapi/cancel',
  listFollowApi:host+'/rest/core/followapi/list/page'
}

//rest服务管理api
export const LIST_CORE_SERVICES={
	list:host+"/rest/core/services",
  listSelfApi:host+"/rest/core/services/self",
	listRestByAppId:host+"/rest/core/services/select/{appId}",
	listByPermissionSelect:host+"/rest/core/services/permissions/select",
	listServiceLog:host+"/rest/core/monitor/logs/",
	listServiceApmLog:host+"/rest/core/api/apm/listlogs",
	delete:host+"/rest/core/services/delete",
	copy:host+"/rest/core/services/copy",
	listSiderMenuUrl:host+"/rest/core/service/getServicesSiderMenu",
	scanServiceBean:host+"/rest/core/services/scan",
	listAllStopServices:host+'/rest/core/service/listAllStopServices',
	clearAllStopServices:host+'/rest/core/service/clearAllStopServices',
	deleteStopServices:host+'/rest/core/service/deleteStopServices',
	listServiceByTagName:host+"/rest/core/services/tagname",
  exportServices:host+"/rest/core/services/export",
}

export const NEW_SERVICE={
	save:host+"/rest/core/services/save",
	load:host+"/rest/core/services/{id}",
	loadResponseSample:host+'/rest/core/services/getResponseSampleConfig/{id}',
	listBeans:host+"/rest/core/beans/listBeansByTypes?beanTypes=Controller",
	listFiltersBeans:host+"/rest/core/beans/listBeansByTypes?beanTypes=Filters",
	listMethods:host+'/rest/core/beans/methods/{beanid}',
	updateResponse:host+'/rest/core/services/update/response',
	headerOptList:host+'/rest/standard/headercode/list/input',
  createWsdl:host+'/rest/core/webservice/wsdl/create',
}

export const SERVICE_PARAMS_CONFIG={
	validateBeans:host+"/rest/core/beans/listBeansByTypes?beanTypes=Validate",
	getAnnotation:host+'/rest/core/services/inparams/annotation',
}
export const SERVICE_ERRORCODE_CONFIG={
	save:host+'/rest/core/services/responsecode/save',
	list:host+'/rest/core/services/responsecode/listConfigs',
	code_list:host+'/rest/standard/errorcode/list/input',
	listForSelect:host+'/rest/core/services/responsecode/listConfigs/select',
}
export const SERVICE_HEADER_CONFIG={
	save:host+'	/rest/core/services/headercode/save',
	list:host+'/rest/core/services/headercode/listConfigs',
}
export const SERVICE_CORE_EXCEPTION={
	list:host+"/rest/core/exceptions",
	delete:host+"/rest/core/exceptions/delete",
	clear:host+"/rest/core/exceptions/clear",
}
export const SERVICE_OUTPARAMS_CONFIG={
	save:host+'/rest/core/services/outparams/save',
	list:host+'/rest/core/services/outparams/list',
  parser:host+'/rest/core/services/outparams/parser',
  outputparams_list:host+'/rest/standard/masterdata/outparams/import',
}
export const SERVICE_INPARAMS_CONFIG={
	save:host+'/rest/core/services/inparams/save',
	list:host+'/rest/core/services/inparams/list',
  parser:host+'/rest/core/services/inparams/parser',
  inparams_list:host+'/rest/standard/masterdata/inparams/import',
}

//wsdl导入
export const SERVICE_CORE_WSDL={
  importWsdl:host+"/rest/core/wsdl/import",
  parseWsdl:host+"/rest/core/wsdl/parse",
}

export const NEW_FILTER={
	load:host+"/rest/core/filters/{id}",
	save:host+"/rest/core/filters/save",
	listBeans:host+"/rest/core/beans/listBeansByTypes?beanTypes=Service",
	listMethods:host+'/rest/core/beans/methods/{beanId}',
}

//Bean管理服务
export const LIST_CORE_BEANS={
	list:host+"/rest/core/beans",
	ListErrorBeans:host+"/rest/core/beans/error",
  ListBeansByInterface:host+"/rest/core/beans/interface",
	delete:host+"/rest/core/beans/delete",
	copy:host+"/rest/core/beans/copy",
	listSiderMenuUrl:host+"/rest/core/beans/getSiderMenu",
	clearBeanObjCacheUrl:host+"/rest/core/container/clearCache/{beanId}",
	clearAllCache:host+"/rest/core/container/clearAllCache",
	clearServiceCacheUrl:host+"/rest/core/container/clearUrlServiceCache",
	listAllCacheBeans:host+"/rest/core/container/beans",
	listAllCacheBeansConfig:host+"/rest/core/container/beanconfigs",
	listServiceConfigCache:host+"/rest/core/container/serviceConfigCache",
	listAllMethods:host+'/rest/core/beans/allMethods/{beanid}',
	scanJavaBeanUrl:host+'/rest/core/beans/scan',
	listAllCaches:host+'/rest/core/container/listAllCaches',
	clearCacheByConfigName:host+'/rest/core/container/clear/{configname}',
	listCacheItemsUrl:host+'/rest/core/container/cacheitems/{cacheConfigId}',
	listControllerBeans:host+"/rest/core/listControllorBeans",
	getByBeanId:host+"/rest/core/beans/beanid",
	GetSiderMenu:host+"/rest/core/beans/sidermenu",
  listSpringBeans:host+"/rest/core/monitor/springbean",
  listLoadJarFiles:host+"/rest/core/monitor/loadjars",
  uploadJarFile:host+"/rest/core/monitor/upload",
  exportBeanConfig:host+"/rest/core/beans/export",
  listBeansByCategoryId:host+"/rest/core/beans/listBeansByCategoryId",
  listMethosByClassPath:host+"/rest/core/beans/class/methods",
}

export const NEW_BEAN={
	load:host+"/rest/core/beans/{id}",
	validate:host+"/rest/core/beans/validate",
	save:host+"/rest/core/beans/save",
	listClassesUrl:host+"/rest/core/beans/package/classes",
}

//APP应用管理
export const LIST_APP={
	list:host+"/rest/core/apps",
	delete:host+"/rest/core/apps/delete",
	appres:host+"/rest/core/apps/resources/{appid}",
	listByPage:host+"/rest/core/apps/listByPage",
	sysInfo:host+'/rest/base/platformConfig/system/info',
	listCategorys:host+'/rest/core/apps/categorys',
  checkAppAcl:host+'/rest/core/apps/checkacl',
}

export const NEW_APP={
	load:host+"/rest/core/apps/{id}",
	save:host+"/rest/core/apps/save",
	validate:host+"/rest/core/apps/validate",
	getAppCategorys:host+"/rest/core/apps/categorys",
}

//数据模型管理modelId是指数据模型的_id而不是modelId要注意分别
export const CORE_DATAMODELS={
	list:host+"/rest/core/modelconfigs",
	selectDataModels:host+"/rest/core/modelconfigs/select",
	delete:host+"/rest/core/modelconfigs/delete",
	copy:host+"/rest/core/modelconfigs/copy",
	load:host+"/rest/core/modelconfigs/{id}",
  loadByModelId:host+"/rest/core/modelconfigs/detail/byModelId",
	validate:host+"/rest/core/modelconfigs/validate",
	save:host+"/rest/core/modelconfigs/save",
  batchSave:host+"/rest/core/modelconfigs/batchsave",
	columnList:host+"/rest/core/modelconfigs/columns/{parentId}",
  columnListByModelId:host+"/rest/core/modelconfigs/columns/listByModelId",
	selectColumnList:host+"/rest/core/modelconfigs/columns/select/{modelId}",
	columnSave:host+"/rest/core/modelconfigs/columns/save/{parentId}",
  columnSaveById:host+"/rest/core/modelconfigs/columns/save",
  columnGetById:host+"/rest/core/modelconfigs/columns/ids/{id}",
	mongodbs:host+'/rest/core/modelconfigs/mongodbs',
	listBeans:host+"/rest/core/beans/listBeansByTypes?beanTypes=Event",
	listMethods:host+'/rest/core/beans/methods/{beanid}',
	listAllMethods:host+'/rest/core/beans/allMethods/{beanid}',
	getTableColumns:host+'/rest/core/modelconfigs/columns/getTableColumns',
  getTableColumnsFromSQL:host+'/rest/core/modelconfigs/columns/parsesql',
	getColumnsByTableName:host+'/rest/core/modelconfigs/columns/getColumnsByTableName',
	loadFromEntryModel:host+'/rest/core/modelconfigs/columns/loadFromEntryModel',
	generateService:host+'/rest/core/modelconfigs/generateService',
  generateSqlService:host+'/rest/core/modelconfigs/generateService/sqlConfig',
  generateViewService:host+'/rest/core/modelconfigs/generateService/view',
	listAllTables:host+'/rest/core/modelconfigs/listAllTables',
	generateJavaCode:host+'/rest/core/modelconfigs/generateJavaCode',
	projectSrcPath:host+'/rest/core/modelconfigs/projectSrcPath',
	getModelTableSql:host+'/rest/core/modelconfigs/getModelTableSql',
	saveModelSql:host+'/rest/core/modelconfigs/saveModelSql',
	exportdatasUrl:host+'/rest/core/modelconfigs/exportdatas',
	importdatasUrl:host+'/rest/core/modelconfigs/importdatas',
	ListModelDatasColumns:host+'/rest/core/datamodel/data/columns',
	ListAllModelDatas:host+'/rest/core/datamodel/data/all',
	DeleteModelDatasById:host+'/rest/core/datamodel/data/delete',
	SaveEditModelData:host+'/rest/core/datamodel/data/save',
	CopyEditModelData:host+'/rest/core/datamodel/data/copy',
	ExportModelDataToExcel:host+'/rest/core/datamodel/data/export/excel',
	ImportModelDataFromExcel:host+'/rest/core/datamodel/data/import/excel',
  ExportModelConfig:host+'/rest/core/modelconfigs/export',
  ListModesForSqlMgr:host+'/rest/core/modelconfigs/sqlmgr',
  exportDataModelDic:host+'/rest/core/modelconfigs/exportdic/excel',
}

//测试服务API地址
export const CORE_TESTSERVICES={
	GetConfigById:host+"/rest/apitest/testService/getConfig?id={id}&serviceId={serviceId}",
	SubmitUrl:host+"/rest/apitest/testService/save",
	ExecuteTestUrl:host+"/rest/apitest/testService/execute",
	listByPage:host+'/rest/apitest/testService/listByPage',
	delete:host+'/rest/apitest/testService/delete',
	copy:host+'/rest/apitest/testService/copy',
	GetTestCaseById:host+"/rest/apitest/testService/cases/{id}",
	ListTestCase:host+"/rest/apitest/testService/cases",
  exportConfig:host+"/rest/apitest/testService/export",
}

//测试记录服务
export const CORE_TEST_LOG={
	listByPage:host+"/rest/apitest/testService/log/list",
	delete:host+"/rest/apitest/testService/log/delete",
	details:host+'/rest/apitest/testService/log/details',
  clear:host+'/rest/apitest/testService/log/clear',
}

//压力测试配置管理
export const CORE_PTS_TESTCONFIG={
	list:host+"/rest/apitest/performancetest/listByPage",
	delete:host+"/rest/apitest/performancetest/delete",
	details:host+"/rest/apitest/performancetest/getById",
	save:host+"/rest/apitest/performancetest/save",
  copy:host+"/rest/apitest/performancetest/copy",
  exportConfig:host+"/rest/apitest/performancetest/export",
  run:host+"/rest/apitest/performancetest/run",
}
//压力测试结果管理
export const CORE_PTS_TESTRESULT={
	list:host+"/rest/apitest/performancetest/result/listByPage",
	delete:host+"/rest/apitest/performancetest/result/delete",
	details:host+"/rest/apitest/performancetest/result/getById",
}
//压力测试变量管理
export const CORE_PTS_TESTPARAMA={
	list:host+"/rest/apitest/performanceparams/listByPage",
	delete:host+"/rest/apitest/performanceparams/delete",
	details:host+"/rest/apitest/performanceparams/getById",
  save:host+"/rest/apitest/performanceparams/save",
}

//权限管理的API地址
export const CORE_PERMISSIONS={
	GetConfigById:host+"/rest/core/permissions/{id}",
	SubmitUrl:host+"/rest/core/permissions/save",
	listByPage:host+'/rest/core/permissions/listByPage',
	delete:host+'/rest/core/permissions/delete',
	ListAllByPermissionId:host+"/rest/core/permissions/resources/{permissionId}",
	ListPageByPermissionId:host+"/rest/core/permissions/resources/listByPage/{permissionId}",
	listAllPermissionsSelect:host+"/rest/core/permission/select",
	DeleteResourceById:host+"/rest/core/permissions/resources/delete",
	saveServiceMap:host+"/rest/core/permissions/resources/saveServiceMap",
	listAllOrgResByPermissionId:host+"/rest/core/permissions/listAllOrgRes/{permissionId}",
	listAllPermissionsByResCode:host+"/rest/core/permissions/listAllPermissionsByResCode",
	savePermissionMapOrg:host+"/rest/core/permissions/permissionMapOrg/save",
	deletePermissionMapOrg:host+"/rest/core/permissions/permissionMapOrg/delete",
	validatePermissionId:host+"/rest/core/permissions/validatePermissionId",
	getByServiceId:host+"/rest/core/permissions/getByServiceId",
	addOrgMapPermissions:host+"/rest/core/permissions/permissionMapOrg/addmap",
  permissionsAndRolesSelectUrl:host+'/rest/base/org/permission_roles/select',
}

//公司管理
export const CORE_ORG_COMPANY={
	list:host+"/rest/core/org/company/list",
	getById:host+"/rest/core/org/company/{id}",
	delete:host+"/rest/core/org/company/delete",
	save:host+"/rest/core/org/company/save",
	validate:host+"/rest/core/org/company/validate",
}
//部门管理
export const CORE_ORG_DEPT={
	list:host+"/rest/core/org/dept/listAllDeptJson",
	getById:host+"/rest/core/org/dept/{id}",
	delete:host+"/rest/core/org/dept/delete",
	save:host+"/rest/core/org/dept/save",
	validate:host+"/rest/core/org/dept/validate",
	treeJsonByDeptId:host+"/rest/core/org/dept/getDeptTreeJsonByDeptCode",
	allDeptTreeJson:host+"/rest/core/org/dept/getAllDeptTreeJson",
	getPersonJsonByDeptId:host+"/rest/base/org/dept/getPersonJsonByDeptId",
  exporConfigUrl:host+"/rest/core/org/dept/exports",
}
//人员管理
export const CORE_USER_PERSON={
  listModules:host+"/rest/core/org/user/modules",
	list:host+"/rest/core/org/user/list",
	listByDept:host+"/rest/core/org/user/list/{deptCode}",
	getById:host+"/rest/core/org/user/{id}",
	delete:host+"/rest/core/org/user/delete",
	save:host+"/rest/core/org/user/save",
	validate:host+"/rest/core/org/user/validate",
  getUserInfo:host+"/rest/base/userinfo",
  updateUserInfo:host+"/rest/base/userinfo/update",
  exporConfigUrl:host+"/rest/core/org/user/exports",
}
//人员与部门关系表
export const CORE_USERMAP_PERSON={
	list:host+"/rest/core/org/usermap/listByPartTime",
	getById:host+"/rest/core/org/usermap/{id}",
	delete:host+"/rest/core/org/usermap/delete",
	save:host+"/rest/core/org/usermap/save",
}
//角色管理
export const CORE_USER_ROLE={
	list:host+"/rest/core/org/roles/list",
	listAllRoles:host+"/rest/core/org/roles",
	getById:host+"/rest/core/org/roles/{id}",
	delete:host+"/rest/core/org/roles/delete",
	save:host+"/rest/core/org/roles/save",
	validate:host+"/rest/core/org/roles/validate",
  exporConfigUrl:host+"/rest/core/org/roles/exports",
}
//角色成员管理
export const CORE_USER_ROLEMEMBER={
	listByPage:host+"/rest/core/org/roles/members/listByPage",
	listAll:host+"/rest/core/org/roles/members/listAll",
	listAllRolesMapMember:host+"/rest/core/org/roles/members/listAllRolesMapMember",
	getById:host+"/rest/core/org/roles/members/{id}",
	delete:host+"/rest/core/org/roles/members/delete",
	save:host+"/rest/core/org/roles/members/save",
}
//模拟数据管理
export const CORE_MOCK_MGR={
	list:host+"/rest/core/mockConfig/list",
	listAllSelect:host+"/rest/core/mockConfig/listAll/select",
	getById:host+"/rest/core/mockConfig/{id}",
	delete:host+"/rest/core/mockConfig/delete",
	save:host+"/rest/core/mockConfig/save",
	generateMockDataUrl:host+"/rest/core/mockConfig/generateMockData",
	deleteMockDataUrl:host+"/rest/core/mockConfig/deleteMockData",
	copy:host+"/rest/core/mockConfig/copy",
}
//模拟数据生成规则
export const CORE_MOCK_RULE={
	list:host+"/rest/core/mockConfig/fieldrule/list",
	listAllSelect:host+"/rest/core/mockConfig/fieldrule/listAll/select",
	getById:host+"/rest/core/mockConfig/fieldrule/",
	delete:host+"/rest/core/mockConfig/fieldrule/delete",
	save:host+"/rest/core/mockConfig/fieldrule/save",
	listBeans:host+"/rest/core/beans/listBeansByTypes?beanTypes=Service",
	listMethods:host+'/rest/core/beans/allMethods/{beanid}',
	export:host+'/rest/core/mockConfig/fieldrule/export',
}
//模拟响应管理
export const CORE_MOCK_RESPONSE={
	list:host+"/rest/core/mockResponse/list",
	getById:host+"/rest/core/mockResponse/{id}",
	delete:host+"/rest/core/mockResponse/delete",
	save:host+"/rest/core/mockResponse/save",
  copy:host+"/rest/core/mockResponse/copy",
	listAllSelect:host+"/rest/core/mockResponse/listAll/select",
	listViewBeans:host+"/rest/core/beans/listBeansByTypes?beanTypes=View",
}

//附件及图片上传服务
export const CORE_FILE={
	uploadFile:host+"/rest/base/files/attachment/upload",
	uploadResource:host+"/rest/base/files/resource/upload",
	download:host+"/rest/base/files/download/{id}",
	deleteFile:host+"/rest/base/files/delete",
	listFiles:host+"/rest/base/files/list/{id}",
  uploadResource_mgdb:host+"/rest/base/files/mgdb/upload",
  download_mgdb:host+"/rest/base/files/mgdb/download/{id}",
}

//系统公告管理
export const CORE_NOTICE={
	list:host+"/rest/base/notice/list",
	getById:host+"/rest/base/notice/{id}",
	delete:host+"/rest/base/notice/delete",
	save:host+"/rest/base/notice/save",
	listTop:host+"/rest/base/notice/top/{num}",
	close:host+"/rest/base/notice/close",
}

//预警消息管理
export const CORE_WARNINGMESSAGE={
	list:host+"/rest/core/message/list",
	delete:host+"/rest/core/message/delete",
	clear:host+"/rest/core/message/clear",
}

//admin统计数据服务
export const CORE_STATIS={
	homeStatis:host+'/rest/core/homepage/getHomePageStatistics',
  homepageMyApps:host+'/rest/core/homepage/myapps',
  homepageServiceTypeCount:host+'/rest/core/homepage/serviceTypeCount',
	serviceManagerStatis:host+'/rest/core/services/getServiceMgrPageStatistics',
	getServiceLastWeekStatis:host+'/rest/core/services/getServiceLastWeekStatis',
	getServiceCoutByAppClass:host+'/rest/core/services/getServiceCountByAppClass',
	getServiceCoutByState:host+'/rest/core/services/getServiceCountByState',
}

//开发日记管理
export const CORE_DEVLOG={
	list:host+"/rest/base/devlog/list",
	getById:host+"/rest/base/devlog/{id}",
	delete:host+"/rest/base/devlog/delete",
	save:host+"/rest/base/devlog/save",
	listByMonth:host+"/rest/base/devlog/month/{month}",
	listByYear:host+"/rest/base/devlog/year/{year}",
}

//开发任务管理
export const CORE_TASK={
	list:host+"/rest/base/task/list",
	getById:host+"/rest/base/task/{id}",
	delete:host+"/rest/base/task/delete",
	save:host+"/rest/base/task/save",
	listByState:host+"/rest/base/task/listByState/{state}",
	listAllTasks:host+"/rest/base/task/listAllTasks",
	changeState:host+"/rest/base/task/changeState",
  toExcel:host+"/rest/base/task/excel",
}

//定时任务管理
export const CORE_SCHEDULER={
	list:host+"/rest/core/scheduler/list",
	getById:host+"/rest/core/scheduler/{id}",
	delete:host+"/rest/core/scheduler/delete",
	save:host+"/rest/core/scheduler/save",
	listBeans:host+"/rest/core/beans/listBeansByTypes?beanTypes=Scheduler",
	startTaskJob:host+"/rest/core/scheduler/startTaskJob",
	stopTaskJob:host+"/rest/core/scheduler/stopTaskJob",
  runJob:host+"/rest/core/scheduler/runjob",
  exportConfig:host+"/rest/core/scheduler/export",
  schedulerLogList:host+"/rest/core/scheduler/log/list",
  schedulerLogClear:host+"/rest/core/scheduler/log/clear",
  shutdownUrl:host+"/rest/core/scheduler/shutdown",
  pauseAllUrl:host+"/rest/core/scheduler/pauseAll",
  reStartAllUrl:host+"/rest/core/scheduler/reStartAll",
}

//定时任务策略管理
export const CORE_SCHEDULER_STRATEGY={
	list:host+"/rest/core/scheduler/strategy/list/page",
	getById:host+"/rest/core/scheduler/strategy/detail/{id}",
	delete:host+"/rest/core/scheduler/strategy/delete",
	save:host+"/rest/core/scheduler/strategy/save",
  select:host+"/rest/core/scheduler/strategy/select",
  export:host+"/rest/core/scheduler/strategy/export",
}

//系统设置
export const CORE_APPSETTING={
	list:host+"/rest/core/platformConfig/list",
	getById:host+"/rest/core/platformConfig/{id}",
	delete:host+"/rest/core/platformConfig/delete",
	save:host+"/rest/core/platformConfig/save",
	saveSN:host+"/rest/core/sn/save",
	getSN:host+"/rest/core/sn",
	getConfigValue:host+'/rest/core/platformConfig/value',
	platforminfo:host+'/rest/base/platformConfig/platforminfo',
  getSystemPermissions:host+'/rest/base/platformConfig/system/permissions',
  exportConfig:host+'/rest/core/platformConfig/export',
}

//应用设置
export const CORE_APPPROPERTIES={
	list:host+"/rest/core/appProperties/list",
  listAll:host+"/rest/core/appProperties/list/all",
	getById:host+"/rest/core/appProperties/{id}",
	delete:host+"/rest/core/appProperties/delete",
	save:host+"/rest/core/appProperties/save",
	getConfigValue:host+'/rest/core/appProperties/value',
	getJsonValue:host+'/rest/core/appProperties/jsonvalue',
  exportConfig:host+'/rest/core/appProperties/export',
}

//平台模板设置
export const CORE_PLATFORMTEMLATE={
	list:host+"/rest/core/platform/temlateconfigs/list",
	getById:host+"/rest/core/platform/temlateconfigs/{id}",
	delete:host+"/rest/core/platform/temlateconfigs/delete",
	save:host+"/rest/core/platform/temlateconfigs/save",
	getConfigValue:host+'/rest/core/platform/temlateconfigs/value',
  exportConfig:host+'/rest/core/platform/temlateconfigs/export',
}

//多语言设置
export const CORE_LANG={
	list:host+"/rest/core/langs/list",
	getById:host+"/rest/core/langs/{id}",
	delete:host+"/rest/core/langs/delete",
	save:host+"/rest/core/langs/save",
  exportConfig:host+'/rest/core/langs/export',
}
//集群服务器管理
export const CORE_APPSERVERMGR={
	list:host+"/rest/core/appServers/list",
	getById:host+"/rest/core/appServers/{id}",
	delete:host+"/rest/core/appServers/delete",
	save:host+"/rest/core/appServers/save"
}

//应用资源管理
export const CORE_APPRESOURCES={
	list:host+"/rest/core/appResources/list",
	getById:host+"/rest/core/appResources/{id}",
	delete:host+"/rest/core/appResources/delete",
	save:host+"/rest/core/appResources/save",
}

//应用版本管理
export const CORE_APPVERSIONS={
	list:host+"/rest/core/appVersions/list",
	getById:host+"/rest/core/appVersions/{id}",
	delete:host+"/rest/core/appVersions/delete",
	save:host+"/rest/core/appVersions/import",
	newVersion:host+"/rest/core/appVersions/newVersion",
	install:host+"/rest/core/appVersions/install",
	installFile:host+"/rest/core/appVersions/install/file",
	import:host+"/rest/core/appVersions/import",
	download:host+"/rest/core/appVersions/download",
	publish:host+"/rest/core/appVersions/sender",
	outInitData:host+'/rest/core/appVersions/outinitdata',
  importData:host+'/rest/core/import/bson',
}

//应用视图模板管理
export const CORE_VIEWTEMPLATE={
	list:host+"/rest/core/viewtemplates/listByPage",
	listTemplateForSelect:host+"/rest/core/viewtemplates/listTemplateForSelect",
	getById:host+"/rest/core/viewtemplates/ids/{id}",
	getByTemplateId:host+"/rest/core/viewtemplates/templateid/{templateId}",
	delete:host+"/rest/core/viewtemplates/delete",
	save:host+"/rest/core/viewtemplates/save",
	copy:host+"/rest/core/viewtemplates/copy",
	validate:host+"/rest/core/viewtemplates/validate",
	previewUrl:host+"/rest/core/viewtemplates/preview/",
  exportConfig:host+"/rest/core/viewtemplates/export",
}

//异步队列管理
export const CORE_ASYNCQUEUE={
	list:host+"/rest/core/async/queues",
	delete:host+"/rest/core/async/delete",
	runQueue:host+"/rest/core/async/run",
	runSelectedQueue:host+"/rest/core/async/run/selected",
	recovery:host+"/rest/core/async/recovery",
}

//事务队列管理
export const CORE_TRANSACTION_QUEUE={
	list:host+"/rest/core/distributed/transaction/list/page",
	delete:host+"/rest/core/distributed/transaction/delete",
	runQueue:host+"/rest/core/distributed/transaction/run",
	runSelectedQueue:host+"/rest/core/distributed/transaction/run/selected",
  recovery:host+"/rest/core/distributed/transaction/recovery",
}

//系统回收站
export const CORE_RECYCLEDOC={
	list:host+"/rest/core/recycle/list/page",
	restore:host+"/rest/core/recycle/restore",
	getById:host+"/rest/core/recycle/getbyid",
	delete:host+"/rest/core/recycle/delete",
  clear:host+"/rest/core/recycle/clear",
}

//知识管理
export const CORE_KNOWLEDGE_DOC={
	list:host+"/rest/core/knowledge/docs/list",
	delete:host+"/rest/core/knowledge/docs/delete",
	getById:host+"/rest/core/knowledge/docs/{id}",
	save:host+"/rest/core/knowledge/docs/save",
}

//知识管理树
export const CORE_KNOWLEDGE_TREE={
	getAllNodeTreeJson:host+"/rest/core/knowledge/tree/getAllNodeTreeJson",
	listAllNodeJson:host+"/rest/core/knowledge/tree/listAllNodeJson",
	getTreeJsonByNodeId:host+"/rest/core/knowledge/tree/getTreeJsonByNodeId",
	validate:host+"/rest/core/knowledge/tree/validate",
	listByPage:host+"/rest/core/knowledge/tree/listByPage",
	delete:host+"/rest/core/knowledge/tree/delete",
	getById:host+"/rest/core/knowledge/tree/{id}",
	save:host+"/rest/core/knowledge/tree/save",
}

//服务控制策略相关服务
export const CORE_SERVICECONTROLPLUGS={
	listByPage:host+"/rest/core/service/controlstrategy/listByPage",
	getById:host+"/rest/core/service/controlstrategy/{id}",
	save:host+"/rest/core/service/controlstrategy/save",
	delete:host+"/rest/core/service/controlstrategy/delete",
	listAll:host+"/rest/core/service/controlstrategy/listAll",
	listBeans:host+"/rest/core/beans/listBeansByTypes?beanTypes=ControlStrategy",
	getCategorys:host+"/rest/core/platformConfig/jsonvalue",
  exportConfig:host+"/rest/core/service/controlstrategy/export",
}

//API网关路负载均衡策略服务
export const CORE_GATEWATROUTER={
	listByPage:host+"/rest/core/loadbalance/list",
	delete:host+"/rest/core/loadbalance/delete",
	getById:host+"/rest/core/loadbalance/{id}",
	save:host+"/rest/core/loadbalance/save",
	getCategorys:host+"/rest/core/platformConfig/jsonvalue",
	listBeans:host+"/rest/core/beans/listBeansByTypes?beanTypes=LoadBalance",
}

//业务系统管理服务类
export const CORE_BUSINESSSYSTEM={
	listByPage:host+"/rest/core/businesssystem/list",
	delete:host+"/rest/core/businesssystem/delete",
	getById:host+"/rest/core/businesssystem/{id}",
	save:host+"/rest/core/businesssystem/save",
}

//分类管理服务
export const CORE_CATEGORYTYPE={
	list:host+"/rest/core/category/type/list",
	delete:host+"/rest/core/category/type/delete",
	getById:host+"/rest/core/category/type/{id}",
	save:host+"/rest/core/category/type/save",
}
//分类节点管理服务
export const CORE_CATEGORYNODE={
	asynGetSelectControlJson:host+"/rest/core/category/node/syncGetSelectControlJson",
	syncListAllNodeJson:host+"/rest/core/category/node/syncListAllNodeTreeJson",
	listByPage:host+"/rest/core/category/node/listByPage",
	delete:host+"/rest/core/category/node/delete",
	getById:host+"/rest/core/category/node/{id}",
	save:host+"/rest/core/category/node/save",
	validate:host+"/rest/core/category/node/validate",
	listAllNodes:host+"/rest/core/category/node/listAllNodes",
}

//应用基础数据分类管理服务
export const CORE_APPBASEDATACATEGORY={
	list:host+"/rest/core/appbasedata/category/list",
	delete:host+"/rest/core/appbasedata/category/delete",
	getById:host+"/rest/core/appbasedata/category/{id}",
	save:host+"/rest/core/appbasedata/category/save",
	getByCategoryId:host+"/rest/core/appbasedata/category/bycategoryid",
  exportConfig:host+"/rest/core/appbasedata/category/export",
  sysInfo:host+'/rest/base/system/info',
}
//应用菜单分类管理
export const CORE_APPMENU_CATEGORY={
	page:host+"/rest/core/appmenu/category/page",
	delete:host+"/rest/core/appmenu/category/delete",
	getById:host+"/rest/core/appmenu/category/{id}",
	save:host+"/rest/core/appmenu/category/save",
  exportConfig:host+"/rest/core/appmenu/category/export",
}
//应用菜单管理
export const CORE_APPMENU_ITEM={
	page:host+"/rest/core/appmenu/item/page",
	tree:host+"/rest/core/appmenu/item/tree",
	delete:host+"/rest/core/appmenu/item/delete",
	save:host+"/rest/core/appmenu/item/save",
  getById:host+"/rest/core/appmenu/item/details/{id}",
  validate:host+"/rest/core/appmenu/item/validate",
  menuUrl:host+"/rest/base/menu/tree",
  designerIndexLeftMenu:host+'/rest/core/apps/designer/menus',
}
//应用基础数据管理服务
export const CORE_APPBASEDATA={
	listAll:host+"/rest/core/appbasedata/records/listAll",
	listJson:host+"/rest/core/appbasedata/records/listJson",
	listByPage:host+"/rest/core/appbasedata/records/listByPage",
	delete:host+"/rest/core/appbasedata/records/delete",
	getById:host+"/rest/core/appbasedata/records/{id}",
	save:host+"/rest/core/appbasedata/records/save",
	validate:host+"/rest/core/appbasedata/records/validate"
}

//代码仓库
export const CORE_CODEREPOSITORY={
	compile:host+"/rest/core/coderepository/compile",
  compileCheck:host+"/rest/core/coderepository/compile/check",
	getById:host+"/rest/core/coderepository/detail/id",
	getByBeanId:host+"/rest/core/coderepository/detail/beanid",
	save:host+"/rest/core/coderepository/save",
	readCode:host+"/rest/core/coderepository/srcfile/readcode",
	overCode:host+"/rest/core/coderepository/srcfile/overcode",
  readCodeClassPath:host+"/rest/core/coderepository/srcfile/readcode/classpath",
  overCodeClassPath:host+"/rest/core/coderepository/srcfile/overcode/classpath",
	getTemplateCode:host+"/rest/core/coderepository/template/getcode",
  checkOutUrl:host+"/rest/core/coderepository/checkout",
  commitUrl:host+"/rest/core/coderepository/commit",
  getBranchnameUrl:host+"/rest/core/coderepository/current/branchname",
}

//代码提交历史记录
export const CORE_CODEHISTORY={
	list:host+"/rest/core/coderepository/history/list/page",
  getById:host+"/rest/core/coderepository/history/detail/id",
}

//tag标签管理
export const CORE_TAGS={
	ListForSelect:host+"/rest/core/tags/list/select",
	ListAllTags:host+"/rest/core/tags/list/all",
}

//服务分类管理
export const CORE_APPSERVICECATEGORY={
	ListTreeSelectDataUrl:host+"/rest/core/appservicecategory/treejson/select",
	ListTreeGridDataUrl:host+"/rest/core/appservicecategory/treejson/grid",
  ListApiLeftMenu:host+"/rest/core/appservicecategory/treejson/leftmenu",
	ListServiceMenuUrl:host+"/rest/core/appservicecategory/treejson/service/menu",
	GetById:host+"/rest/core/appservicecategory/{id}",
	Save:host+"/rest/core/appservicecategory/save",
	Delete:host+"/rest/core/appservicecategory/delete",
	ValidateNodeId:host+"/rest/core/appservicecategory/validate/nodeid",
  exportConfig:host+"/rest/core/appservicecategory/export",
}

//存储过程管理
export const CORE_DESIGNER_PROCEDURE={
	getCount:host+"/rest/core/procedure/count",
	getById:host+"/rest/core/procedure/details/id",
  delete:host+"/rest/core/procedure/delete",
  save:host+"/rest/core/procedure/save",
  list:host+"/rest/core/procedure/listByPage",
  exportConfig:host+"/rest/core/procedure/export",
  generateService:host+"/rest/core/procedure/generateService",
  listProcedures:host+"/rest/core/procedure/db/listprocedures",
  listProceduresParams:host+"/rest/core/procedure/db/listparams",
}

//控制台日记
export const CORE_SYSTEMLOG={
	GetToDayLog:host+"/rest/core/monitor/log/today",
	ClearToDayLog:host+"/rest/core/monitor/log/today/clear",
}

//homepage首页
export const CORE_HOMEPAGE={
	ListQuestionsUrl:host+"/rest/core/homepage/questions",
	ListAppsUrl:host+"/rest/core/homepage/apps",
  ListApisUrl:host+"/rest/core/homepage/apis",
  GetPortalLeftMenuCount:host+"/rest/base/portal/menu/count",
  GetPortalTopWarningCount:host+"/rest/base/portal/warning/count",
  GetPortalModules:host+"/rest/base/portal/modules",
  backupUrl:host+"/rest/core/system/backup",
  systemUpdateUrl:host+"/rest/base/system/update",
}

//openapi导入导出
export const CORE_OPENAPI={
	ExportUrl:host+"/rest/apiportal/openapi/export",
	ImportUrl:host+"/rest/core/openapi/import/{appId}",
  changelogUrl:host+"/rest/core/openapi/changelog",
  recoveryApiVersion:host+"/rest/core/openapi/recoveryApiVersion",
  issuesUrl:host+"/rest/core/openapi/issues",
  SaveIssuesUrl:host+"/rest/core/openapi/issues/save",
  DeleteIssuesUrl:host+"/rest/core/openapi/issues/delete",
}

//openapi导入导出Excel
export const CORE_OPENAPI_EXCELANDWORD={
  exportExcel:host+"/rest/apiportal/export/excel",
  importExcelSave:host+"/rest/core/openapi/list/import/excel/save",
  importExcelUpload:host+"/rest/core/openapi/list/import/excel/upload",
  importExcelDelete:host+"/rest/core/openapi/list/import/excel/delete",
  exportWord:host+"/rest/apiportal/export/word",
}

//sql config配置
export const CORE_SQLCONFIG={
	Delete:host+"/rest/core/modelconfigs/sql/delete",
  Save:host+"/rest/core/modelconfigs/sql/save",
  SaveCondition:host+"/rest/core/modelconfigs/sql/condition/save",
	ListByBeanId:host+"/rest/core/modelconfigs/sql/byBeanId",
  ListByModelId:host+"/rest/core/modelconfigs/sql/byModelId",
  ListByAppId:host+"/rest/core/modelconfigs/sql/byAppId",
  ListForSelect:host+"/rest/core/modelconfigs/sql/select",
  Copy:host+"/rest/core/modelconfigs/sql/copy",
  ListByPage:host+"/rest/core/modelconfigs/sql/listByPage",
  GetById:host+"/rest/core/modelconfigs/sql/{id}",
  ValidateConfigId:host+"/rest/core/modelconfigs/sql/validate/configid",
  exportSqlConfig:host+"/rest/core/modelconfigs/sql/export",
  generatingSqlCode:host+"/rest/core/modelconfigs/sql/generating/code",
}

//集群服务器服务url
export const CORE_CLUSTERSERVER={
  Delete:host+"/rest/core/cluster/server/delete",
  Clear:host+"/rest/core/cluster/server/clear",
  List:host+"/rest/core/cluster/server/listByPage",
  listAll:host+"/rest/core/cluster/server/list",
  changeMasterServer:host+"/rest/core/cluster/server/changeMasterServer",
  listAllServiceName:host+"/rest/core/cluster/server/serviceName/list",
}

//测试计划
export const CORE_TESTPLAN={
  listByPage:host+"/rest/apitest/testService/plan/listByPage",
  select:host+"/rest/apitest/testService/plan/select",
  delete:host+"/rest/apitest/testService/plan/delete",
  getById:host+"/rest/apitest/testService/plan/{id}",
  save:host+"/rest/apitest/testService/plan/save",
  runTask:host+"/rest/apitest/testService/plan/run/{id}",
}

//测试计划与测试用例的关联关系
export const CORE_TESTCASEMAPPLAN={
  listByPage:host+"/rest/apitest/testService/planmapcase/listByPage",
  listByPlanId:host+"/rest/apitest/testService/planmapcase/listByPlanId",
  delete:host+"/rest/apitest/testService/planmapcase/delete",
  getById:host+"/rest/apitest/testService/planmapcase/{id}",
  save:host+"/rest/apitest/testService/planmapcase/save",
}

//测试报告
export const CORE_TESTREPORT={
  listByPage:host+"/rest/apitest/testService/report/listByPage",
  delete:host+"/rest/apitest/testService/report/delete",
  getById:host+"/rest/apitest/testService/report/{id}",
  clear:host+"/rest/apitest/testService/report/clear",
  overRate:host+"/rest/apitest/testService/charts/overRate",
  topCount:host+"/rest/apitest/testService/charts/topCount",
  menuCount:host+"/rest/apitest/testService/charts/menuCount",
}

//测试报告明细
export const CORE_TESTREPORTDETAILS={
  listByPage:host+"/rest/apitest/testService/report/details/listByPage",
  delete:host+"/rest/apitest/testService/report/details/delete",
  getById:host+"/rest/apitest/testService/report/details/{id}",
}

//服务器实例
export const CORE_INSSERVER={
	listByPage:host+"/rest/discovery/server/list",
	delete:host+"/rest/discovery/server/delete",
	getById:host+"/rest/discovery/server/ids/{id}",
	startServer:host+"/rest/discovery/server/start",
	stopServer:host+"/rest/discovery/server/stop",
  directStopServer:host+"/rest/discovery/server/directstop",
	clear:host+"/rest/discovery/server/clear",
	save:host+"/rest/discovery/server/update",
  doubleWeight:host+"/rest/discovery/server/double/weight",
  halfWeight:host+"/rest/discovery/server/half/weight",
}

//服务实例统计报表
export const LIST_REGSERVER_REPORT={
	server_count:host+"/rest/discovery/report/server_count",
  hour_avgresponse_time:host+"/rest/discovery/report/hour_avgresponse_time",
  clear:host+"/rest/discovery/report/clear",
  day_avgresponse_time:host+"/rest/discovery/report/day_avgresponse_time",
}

//注册消息服务
export const LIST_REGSERVER_MESSAGE={
	list_top:host+"/rest/discovery/message/top",
  list_page:host+"/rest/discovery/message/list_page",
  clear:host+"/rest/discovery/message/clear",
  delete:host+"/rest/discovery/message/delete"
}

//配置中心-配置管理服务
export const LIST_CONFIG_CENTER={
  list:host+"/rest/discovery/config/admin/list",
  save:host+"/rest/discovery/config/admin/save",
  listProps:host+"/rest/discovery/config/admin/list/props",
  saveProps:host+"/rest/discovery/config/admin/saveprops",
  getById:host+"/rest/discovery/config/admin/details/{id}",
  delete:host+"/rest/discovery/config/admin/delete",
	publish:host+"/rest/discovery/config/admin/publish",
  realtimePublish:host+"/rest/discovery/config/admin/realtime/publish",
	stop:host+"/rest/discovery/config/admin/stop"
}

//配置中心-配置日记管理
export const LIST_CONFIGCENTER_LOG={
  list:host+"/rest/discovery/config/log/list",
  listByConfigId:host+"/rest/discovery/config/log/list/configid",
  delete:host+"/rest/discovery/config/log/delete",
	clear:host+"/rest/discovery/config/log/clear",
  recover:host+"/rest/discovery/config/log/recover",
}

//配置中心-快照管理
export const LIST_CONFIG_SNAPSHOT={
  list:host+"/rest/discovery/config/snapshot/list",
  create:host+"/rest/discovery/config/snapshot/create",
  delete:host+"/rest/discovery/config/snapshot/delete",
  recover:host+"/rest/discovery/config/snapshot/recover",
}

//配置中心-应用管理
export const LIST_CONFIG_APPLICATION={
  list:host+"/rest/discovery/application/list",
  listAll:host+"/rest/discovery/application/list/all",
  listAllForHome:host+"/rest/discovery/application/list/home",
  save:host+"/rest/discovery/application/save",
  delete:host+"/rest/discovery/application/delete",
  getById:host+"/rest/discovery/application/details/{id}",
}

//配置中心-环境管理
export const CORE_ENVIRONMENTS={
	list:host+"/rest/core/environment/list/page",
  listAll:host+"/rest/core/environment/list/all",
	getById:host+"/rest/core/environment/details/{id}",
	delete:host+"/rest/core/environment/delete",
	save:host+"/rest/core/environment/save",
}

export const LIST_MONITOR_CENTER={
  listApis:host+"/rest/core/apimonitor/apis",
  listServiceLogByUserId:host+"/rest/core/monitor/userlogs/report",
  errorcodeReport:host+"/rest/core/monitor/errorcode/report",
  errorResponsecodeList:host+"/rest/core/monitor/error/responsecode",
  logDbList:host+"/rest/core/monitor/logdb/list",
  changeLogDb:host+"/rest/core/monitor/logdb/change",
  selectLogDb:host+"/rest/core/monitor/logdb/select",
}

//监控信息
export const LIST_MONITOR={
	jvminfo:host+"/rest/discovery/monitor/jvminfo",
  systemgc:host+"/rest/discovery/monitor/system/gc",
  listLocalCacheServer:host+"/rest/core/monitor/servicename/list",
  ramInfo:host+'/rest/core/monitor/charts/ram',
  threadInfo:host+'/rest/core/monitor/charts/thread',
  apiAccessLog:host+'/rest/core/monitor/report/accesslog',
  apiAccessLogByPage:host+'/rest/core/monitor/apilogs',
  apiCallsByMinute:host+'/rest/core/monitor/apicalls/minute',
  apiPerformanceByMinute:host+'/rest/core/monitor/apiperformance/minute',
  allApiPerformance:host+'/rest/core/monitor/report/apiperformance',
  invalidApiParamsList:host+'/rest/core/monitor/apiparams/invalid',
  deleteInvalidApiParams:host+'/rest/core/monitor/apiparams/invalid/delete',
  invalidApis:host+'/rest/core/monitor/api/invalid',
  clientTypeGroupUrl:host+'/rest/core/monitor/report/browser',
  apmTreeLogByTraceId:host+"/rest/core/api/apm/bytraceid",
  apmTreeLogByUserId:host+"/rest/core/api/apm/byuserId",
  apmTreeLogByApiId:host+"/rest/core/api/apm/api/id",
  apmTreeLogByUserIdAndApi:host+"/rest/core/api/apm/byuserId/api",
  apmTreeLogByServiceName:host+"/rest/core/api/apm/byservicename",
  apmServiceNameDependencies:host+"/rest/core/api/apm/servicename/dependencies",
  allApiPerformanceChart:host+'/rest/core/monitor/report/apiperformance/chart',
  allServicePerformanceChart:host+'/rest/core/monitor/servicename/performance',
  allAppCallStatisChartUrl:host+'/rest/core/monitor/appcallstatis/charts',
  allAppCallStatisTopUrl:host+'/rest/core/monitor/appcallstatis/top',
  allApiCallStatisTopUrl:host+'/rest/core/monitor/apicallstatis/top',
  allUserCallStatisTopUrl:host+'/rest/core/monitor/usercallstatis/top',
  allUserCallStatisTopDetailsUrl:host+'/rest/core/monitor/usercallstatis/top/details',
  searchApiLogs:host+'/rest/core/monitor/log/search',
  serverCallStatisUrl:host+'/rest/core/monitor/servercallstatis/charts',
  userLoginLogUrl:host+'/rest/core/monitor/loginlog/list',
  deleteLoginLogUrl:host+'/rest/core/monitor/loginlog/delete',
}

export const LIST_MONITOR_APIQPS={
  apiQps:host+'/rest/core/monitor/apiqps/minute',
  apiAvgResponseTime:host+'/rest/core/monitor/apiresponsetime/minute',
  getById:host+'/rest/core/monitor/log/details',
  logRepeat:host+'/rest/core/monitor/log/repeat',
  isHiddenRepeat:host+'/rest/core/monitor/log/repeat/hidden',
}

//网络连通性测试
export const LIST_MONITOR_NETWORK={
  start:host+'/rest/core/server/monitor/start',
  close:host+'/rest/core/server/monitor/close',
  list:host+'/rest/core/server/monitor/list',
  delete:host+'/rest/core/server/monitor/delete',
  getById:host+'/rest/core/server/monitor/getById',
  save:host+'/rest/core/server/monitor/save',
  export:host+'/rest/core/server/monitor/export'
}

//tcpip网络代理配置
export const LIST_TCPIP_NETWORK={
  start:host+'/rest/proxy/config/start',
  close:host+'/rest/proxy/config/close',
  list:host+'/rest/proxy/config/list',
  delete:host+'/rest/proxy/config/delete',
  getById:host+'/rest/proxy/config/getById',
  save:host+'/rest/proxy/config/save',
  export:host+'/rest/proxy/config/export'
}

//识别的sql结果
export const CORE_TCPIP_SQL={
	list:host+"/rest/proxy/sql/list",
  delete:host+"/rest/proxy/sql/delete",
  clear:host+"/rest/proxy/sql/clear",
  publish:host+"/rest/proxy/sql/publish"
}

//识别的api结果
export const LIST_TCPIP_RECORDAPI={
  list:host+'/rest/proxy/apis/list',
  delete:host+'/rest/proxy/apis/delete',
  clear:host+'/rest/proxy/apis/clear',
  publish:host+'/rest/proxy/apis/publish'
}

//API网关-路由规则
export const CORE_GATEWAY_APICONFIG={
	list:host+"/rest/gateway/api/list",
  selectApi:host+"/rest/gateway/api/select",
  selectAPP:host+"/rest/gateway/api/applications/select",
}

export const CORE_GATEWAY_ROUTER={
	list:host+"/rest/gateway/router/list",
  listAllSelect:host+"/rest/gateway/router/list/select",
	delete:host+"/rest/gateway/router/delete",
	getById:host+"/rest/gateway/router/{id}",
	save:host+"/rest/gateway/router/save",
  leftMenus:host+"/rest/gateway/menus",
  exportRouterConfig:host+"/rest/gateway/router/export",
}
//API网关-灰度发布规则
export const CORE_GATEWAY_GRAY={
	list:host+"/rest/gateway/gray/list",
  listAll:host+"/rest/gateway/gray/listAll",
	delete:host+"/rest/gateway/gray/delete",
	getById:host+"/rest/gateway/gray/{id}",
	save:host+"/rest/gateway/gray/save",
}
//API网关-负载均衡
export const CORE_GATEWAY_BLAN={
	list:host+"/rest/gateway/loadbalance/list",
  listAll:host+"/rest/gateway/loadbalance/listAll",
	delete:host+"/rest/gateway/loadbalance/delete",
	getById:host+"/rest/gateway/loadbalance/{id}",
	save:host+"/rest/gateway/loadbalance/save",
}
//API网关-控制插件
export const CORE_GATEWAY_PLUGIN={
	list:host+"/rest/gateway/plugin/list",
  listAll:host+"/rest/gateway/plugin/listAll",
  listAllSelect:host+"/rest/gateway/plugin/list/select",
	delete:host+"/rest/gateway/plugin/delete",
	getById:host+"/rest/gateway/plugin/{id}",
	save:host+"/rest/gateway/plugin/save",
}
//API网关-路由与插件的关系配置
export const CORE_GATEWAY_ROUTERMAPPLUGIN={
	list:host+"/rest/gateway/router/map/plugin/list/{routerid}",
	delete:host+"/rest/gateway/router/map/plugin/delete",
	save:host+"/rest/gateway/router/map/plugin/save/{routerid}",
}
//API网关-API监控服务
export const CORE_GATEWAY_MONITOR={
	listServiceNames:host+"/rest/gateway/monitor/servicename/list",
  selectServiceNames:host+"/rest/gateway/monitor/servicename/list/select",
  gateWayStatistics:host+"/rest/gateway/monitor/statistics",
  topologicalgraphUrl:host+"/rest/gateway/monitor/topologicalgraph",
  topologicalgraphUrlForHost:host+"/rest/gateway/monitor/topologicalgraph/hosts",
  starArchitecture:host+"/rest/core/gateway/star/architecture",
}

//API网关-Hyxstrix监控
export const CORE_GATEWAY_HYXSTRIX={
	hyxReset:host+"/rest/gateway/hystrix/reset",
  hyxListRouter:host+"/rest/gateway/hystrix/router/list",
  hyxInstanceById:host+"/rest/gateway/hystrix/monitor/instance",
}
//API网关-路由分类管理
export const CORE_GATEWAY_APPCONFIG={
	list:host+"/rest/gateway/appconfig/list/page",
  listAll:host+"/rest/gateway/appconfig/listall",
  getById:host+"/rest/gateway/appconfig/detail/{id}",
  delete:host+"/rest/gateway/appconfig/delete",
  save:host+"/rest/gateway/appconfig/save",
}

//API网关-Services管理
export const CORE_GATEWAY_SERVICES={
	list:host+"/rest/gateway/services/list/page",
  listAll:host+"/rest/gateway/services/list/all",
  getById:host+"/rest/gateway/services/details",
  delete:host+"/rest/gateway/services/delete",
  save:host+"/rest/gateway/services/save",
  exportServicesConfig:host+"/rest/gateway/services/export",
}

//API网关-实时数据监控
export const CORE_GATEWAY_HEALTH={
	qps:host+"/rest/core/health/qps",
  requestinfo:host+"/rest/core/health/requestinfo",
  realtimelinks:host+"/rest/core/health/realtimelinks",
}

//API网关-预警规则管理
export const CORE_GATEWAY_WARING={
	list:host+"/rest/core/waring/list",
  export:host+"/rest/core/waring/export",
  getById:host+"/rest/core/waring/details/{id}",
  delete:host+"/rest/core/waring/delete",
  save:host+"/rest/core/waring/save",
  scopelist:host+"/rest/core/waring/scopeitems/list",
  scopedelete:host+"/rest/core/waring/scopeitems/delete",
  scopesave:host+"/rest/core/waring/scopeitems/save",
  history_list:host+"/rest/core/waring/history/list",
  history_delete:host+"/rest/core/waring/history/delete",
  history_clear:host+"/rest/core/waring/history/clear",
}

//API网关-安全设置
export const CORE_GATEWAY_SECURITY={
	list:host+"/rest/core/security/config/list",
  listForSelect:host+"/rest/core/security/config/list/select",
  export:host+"/rest/core/security/config/export",
  getById:host+"/rest/core/security/config/details/{id}",
  delete:host+"/rest/core/security/config/delete",
  save:host+"/rest/core/security/config/save",
  scopelist:host+"/rest/core/security/config/scopeitems/list",
  scopedelete:host+"/rest/core/security/config/scopeitems/delete",
  scopesave:host+"/rest/core/security/config/scopeitems/save",
  listCacheData:host+"/rest/core/security/datacache/list",
  deleteCacheData:host+"/rest/core/security/datacache/delete",
  listByApisId:host+"/rest/core/security/config/list/byapi",
}

//core平台-数据源
export const CORE_DATASOURCE={
	list:host+"/rest/core/datasource/list",
  listAll:host+"/rest/core/datasource/listall",
  select:host+"/rest/core/datasource/select",
  save:host+"/rest/core/datasource/save",
  copy:host+"/rest/core/datasource/copy",
  delete:host+"/rest/core/datasource/delete",
  getById:host+"/rest/core/datasource/{id}",
  connect:host+"/rest/core/datasource/connect",
  testConnect:host+"/rest/core/datasource/test/connect",
  exportConfig:host+"/rest/core/datasource/export",
  letMenuUrl:host+"/rest/core/datasource/category/menu",
  datasourceTypes:host+"/rest/core/datasource/newtypes",
}

//系统流水号
export const CORE_SERIALNUMBER={
  getNewSerialNumber:host+"/rest/core/serialnumber/new",
}

//APIPortal-应用管理
export const LIST_APIPORTAL_APPLICATION={
  list:host+"/rest/apiportal/application/list",
  listAll:host+"/rest/apiportal/application/list/all",
  select:host+"/rest/apiportal/application/select",
  save:host+"/rest/apiportal/application/save",
  delete:host+"/rest/apiportal/application/delete",
  getById:host+"/rest/apiportal/application/details/{id}",
  frontendConst:host+'/rest/base/apidocs/front/{appId}/constants.js',
  apiApmInfo:host+'/rest/apiportal/apis/apm',
  isAdminUrl:host+'/rest/apiportal/application/isadmin',
  download:host+"/rest/apiportal/application/download",
}

//APIPortal-API管理
export const CORE_APIPORTAL_APIMANAGER={
	ListApisUrl:host+"/rest/apiportal/application/api/list",
  ListApiMgrMenuUrl:host+"/rest/apiportal/application/api/menus",
  ListRecycleApis:host+"/rest/apiportal/apis/recycle",
}

//APIPortal-API分类管理
export const CORE_APIPORTAL_APICATEGORY={
	ListServiceMenuUrl:host+"/rest/apiportal/apicategory/menus",
  ListApplicationMenusUrl:host+"/rest/apiportal/apicategory/application/menus",
  ListTreeSelectDataUrl:host+"/rest/apiportal/apicategory/treejson/select",
  ListTreeGridDataUrl:host+"/rest/apiportal/apicategory/treejson/grid",
  GetById:host+"/rest/apiportal/apicategory/{id}",
  Save:host+"/rest/apiportal/apicategory/save",
  Delete:host+"/rest/apiportal/apicategory/delete",
  exportConfig:host+"/rest/apiportal/apicategory/export",
}

//API注册管理
export const CORE_APIREG_MANAGER={
	leftMenus:host+"/rest/apimanager/application/menus",
}

//APIPortal-API发布管理
export const CORE_APIPORTAL_PUBLISH={
	publish:host+"/rest/apiportal/api/publish",
  publishAll:host+"/rest/apiportal/api/publish/all",
}

//APIPortal-API变更管理
export const CORE_APIPORTAL_CHANGE={
	publish:host+"/rest/apiportal/version/change/publish",
  list:host+"/rest/apiportal/version/change/list",
  listMe:host+"/rest/apiportal/version/change/list/me",
  delete:host+"/rest/apiportal/version/change/delete",
  details:host+"/rest/apiportal/version/change/details",
  readall:host+"/rest/apiportal/version/change/readall"
}

export const CORE_APIPORTAL_HOEMMENU={
	topCount:host+"/rest/apiportal/homepage/top/count",
  leftmenuCount:host+"/rest/apiportal/homepage/leftmenu/count",
  getSystemInfo:host+"/rest/apiportal/platformConfig/system/permissions",
  apiGuideValue:host+"/rest/apiportal/guide/value",
}

//api portal test测试服务
export const CORE_APIPORTAL_TEST={
	getApiTestConfig:host+"/rest/apiportal/testService/getConfig",
}

//api portal api审批管理
export const CORE_APIPORTAL_APPY={
	appyApi:host+"/rest/apiportal/callappy/appy",
  approvers:host+"/rest/apiportal/callappy/approvers",
  myappys:host+"/rest/apiportal/callappy/myappys",
  delete:host+"/rest/apiportal/callappy/delete",
  agree:host+"/rest/apiportal/callappy/agree",
  refuse:host+"/rest/apiportal/callappy/refuse",
}

//APIPortal-API管理
export const CORE_APIPORTAL_APICONFIG={
	listByPage:host+"/rest/apiportal/apis/list",
  listByPageRequireAppy:host+"/rest/apiportal/apis/list/require/appy",
  listMyPublishApis:host+"/rest/apiportal/apis/list/mypublishs",
  hotapis:host+"/rest/apiportal/apis/hotapis",
  recommendapis:host+"/rest/apiportal/apis/recommendapis",
  follows:host+"/rest/apiportal/apis/follows",
  showdetails:host+"/rest/apiportal/apis/showdetails",
  showDesignerDetails:host+"/rest/core/services/showdetails",
  changelog:host+"/rest/apiportal/apis/changelog",
  delete:host+"/rest/apiportal/apis/delete",
  follow:host+"/rest/apiportal/apis/follow",
  addComment:host+"/rest/apiportal/apis/comments/update",
  deleteComment:host+"/rest/apiportal/apis/comments/delete",
  listComments:host+"/rest/apiportal/apis/comments",
  openApiDoc:host+"/rest/apiportal/openapi/export",
  save:host+"/rest/apiportal/apis/save",
  getById:host+"/rest/apiportal/apis/getbyid",
  apiCount:host+"/rest/apiportal/apis/count",
  exportExcel:host+"/rest/apiportal/apis/export/excel",
}

//系统MongoDB数据库管理
export const CORE_DBMGR_MONGODB={
	getDatabaseNames:host+"/rest/dbmanager/mongo/getDatabaseNames",
  getAllDocByCollectionName:host+"/rest/dbmanager/mongo/getAllDocByCollectionName",
  export:host+"/rest/dbmanager/mongo/export",
  getCollInf:host+"/rest/dbmanager/mongo/getCollInf",
  backupsUrl:host+"/rest/dbmanager/mongo/backup",
  searchData:host+"/rest/dbmanager/mongo/getDocByFilters",
}

//系统链接器应用
export const CORE_CONNECTOR={
	menuUrl:host+"/rest/connector/menus",
  	listApps:host+"/rest/connector/list",
}

//版本发布
export const CORE_DATAPUBLISH={
	list:host+"/rest/core/appVersions/publish/list",
  deleteById:host+"/rest/core/appVersions/publish/children/deletebyid",
  changestatus:host+"/rest/core/appVersions/publish/children/changestatus",
  listChildrenData:host+"/rest/core/appVersions/publish/children/list",
  package:host+"/rest/core/appVersions/publish/children/package",
  send:host+"/rest/core/appVersions/publish/children/send",
  serverInfo:host+"/rest/core/appVersions/publish/serverInfo",
  approverDataList:host+"/rest/core/appVersions/receive/approver/list",
  deleteApproverData:host+"/rest/core/appVersions/receive/approver/delete",
  agreeApproverData:host+"/rest/core/appVersions/receive/approver/agree",
  approverCategorysList:host+"/rest/core/appVersions/receive/approver/categorys/list",
  approverCategorysDataList:host+"/rest/core/appVersions/receive/approver/categorys/data/list",
}

//API注册-错误码标准管理
export const CORE_ErrorCodes={
	listView:host+"/rest/standard/errorcode/list/page/view",
  listManager:host+"/rest/standard/errorcode/list/page/manager",
  listAll:host+"/rest/standard/errorcode/list/all",
  getById:host+"/rest/standard/errorcode/details",
  delete:host+"/rest/standard/errorcode/delete",
  save:host+"/rest/standard/errorcode/save",
  export:host+"/rest/standard/errorcode/export",
}

//API注册-Header头标准管理
export const CORE_HeaderCodes={
  listView:host+"/rest/standard/headercode/list/page/view",
  listManager:host+"/rest/standard/headercode/list/page/manager",
  listAll:host+"/rest/standard/headercode/list/all",
  getById:host+"/rest/standard/headercode/details",
  delete:host+"/rest/standard/headercode/delete",
  save:host+"/rest/standard/headercode/save",
  export:host+"/rest/standard/headercode/export",
}

//API注册-主数据标准管理
export const CORE_MasterData={
  listView:host+"/rest/standard/masterdata/list/page/view",
  listManager:host+"/rest/standard/masterdata/list/page/manager",
  listAll:host+"/rest/standard/masterdata/list/all",
  getById:host+"/rest/standard/masterdata/details",
  delete:host+"/rest/standard/masterdata/delete",
  save:host+"/rest/standard/masterdata/save",
  fields:host+"/rest/standard/masterdata/fields",
  saveFields:host+"/rest/standard/masterdata/fields/save",
  parserFields:host+"/rest/standard/masterdata/fields/parser",
  export:host+"/rest/standard/masterdata/export",
  jsonBody:host+"/rest/standard/masterdata/jsonbody",
  datamappingImport:host+"/rest/standard/masterdata/datamapping/import"
}

//API监控平台-log业务日志监控
export const CORE_BUSINESSLOG_APPCONFIG={
  list:host+"/rest/businesslog/fieldCode/list/page",
  listAll:host+"/rest/businesslog/fieldCode/list/all",
  getById:host+"/rest/businesslog/fieldCode/details",
  delete:host+"/rest/businesslog/fieldCode/delete",
  save:host+"/rest/businesslog/fieldCode/save",
  apiLogList:host+"/rest/businesslog/api/list/page",
  quickHistoryQueryList:host+"/rest/businesslog/historyQuery/list/page",//快捷查询列表
  quickHistoryQuerySave:host+"/rest/businesslog/historyQuery/save",//快捷查询列表保存
  quickHistoryQueryDelete:host+"/rest/businesslog/historyQuery/delete",//快捷查询列表删除
}

//API注册-业务域管理
export const CORE_BusinessDomain={
	listView:host+"/rest/standard/businessarea/page/view",
  listManager:host+"/rest/standard/businessarea/page/manager",
	save:host+"/rest/standard/businessarea/save",
	treeOptData:host+"/rest/standard/businessarea/tree",
	getById:host+"/rest/standard/businessarea/details/{id}",
	delete:host+"/rest/standard/businessarea/delete",
  exporConfigUrl:host+"/rest/standard/businessarea/exports",
}

//API标签管理
export const CORE_ApiTagsConfig={
	listView:host+"/rest/standard/apitags/list/page/view",
  listManager:host+"/rest/standard/apitags/list/page/manager",
  listAll:host+"/rest/standard/apitags/list/all",
  getById:host+"/rest/standard/apitags/details",
  delete:host+"/rest/standard/apitags/delete",
  save:host+"/rest/standard/apitags/save",
  export:host+"/rest/standard/apitags/export",
}

//网关数据映射模板管理
export const Gateway_DATAMAPPING_CATEGORY={
	page:host+"/rest/gateway/datamapping/category/page",
	delete:host+"/rest/gateway/datamapping/category/delete",
	getById:host+"/rest/gateway/datamapping/category/{id}",
	save:host+"/rest/gateway/datamapping/category/save",
  exportConfig:host+"/rest/gateway/datamapping/category/export",
	parserUrl:host+"/rest/gateway/datamapping/engine/parser"
}

//网关数据映射字段管理
export const Gateway_DATAMAPPING_ITEM={
	page:host+"/rest/gateway/datamapping/item/page",
	tree:host+"/rest/gateway/datamapping/item/tree",
	delete:host+"/rest/gateway/datamapping/item/delete",
	save:host+"/rest/gateway/datamapping/item/save",
  getById:host+"/rest/gateway/datamapping/item/details",
  validate:host+"/rest/gateway/datamapping/item/validate",
	inputJsonPaths:host+"/rest/gateway/datamapping/item/input/jsonpaths",
	outputparamsUrl:host+"/rest/gateway/datamapping/item/output/importparams",
}

//连接器配置项管理
export const CONNECTOR_CONFIG={
	list:host+"/rest/connector/config/list",
	save:host+"/rest/connector/config/save",
	getById:host+"/rest/connector/config/getById",
	delete:host+"/rest/connector/config/delete"
}
