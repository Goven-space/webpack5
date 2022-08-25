export const SAPRFC={
	menu:host+"/connect/sap/menu",
	list:host+"/connect/sap/list",
	save:host+"/connect/sap/save",
	delete:host+"/connect/sap/delete",
	getById:host+"/connect/sap/getById",
	exportConfig:host+"/connect/sap/export",
	copy:host+"/connect/sap/copy",
	createApi:host+"/connect/sap/create/api",
	createWebService:host+"/connect/sap/create/webservice",
	inputparams:host+"/connect/sap/save/inputparams",
	outputparams:host+"/connect/sap/save/outputparams",
	tableparams:host+"/connect/sap/save/tableparams",
	cropparams:host+"/connect/sap/save/cropparams",
	readparams:host+"/connect/sap/read/params",
}

//sap-规则管理
export const SAP_RULE={
  getById:host+"/connect/sap/rules/detail/{id}",
  getByRuleId:host+"/connect/sap/rules/detail/query/{ruleId}",
  list:host+"/connect/sap/rules/list/page",
  save:host+"/connect/sap/rules/save",
  delete:host+"/connect/sap/rules/delete",
  select:host+'/connect/sap/rules/select',
  export:host+'/connect/sap/rules/export'
}

export const MONGOD={
	listAllCollections:host+"/connect/mongo/object/listAllCollections",
	listAllDbNames:host+"/connect/mongo/object/listAllDbNames",
	generateApi:host+"/connect/mongo/generate/service/api",
	fullConfig:host+"/connect/mongo/object/full/getMongoObject",
	menu:host+"/connect/mongo/object/category/list/y",
	objectList:host+"/connect/mongo/object/listMongoObjectByPage",
	save:host+"/connect/mongo/object/save",
	delete:host+"/connect/mongo/object/delete",
	getById:host+"/connect/mongo/object/getMongoObject",
	copy:host+"/connect/mongo/object/copy",
	saveField:host+"/connect/mongo/field/save",
	parseField:host+"/connect/mongo/field/parse",
	listAllOriginalData:host+"/connect/mongo/dataObject/data/all",
	ListObjectDatasColumns:host+"/connect/mongo/dataObject/data/columns",
	listCategory:host+"/",
	addCategory:host+"/connect/mongo/object/category/add",
	saveClipMethod:host+"/connect/mongo/clip/save"
}
