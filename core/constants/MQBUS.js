//core平台-消息订阅者配置
export const CORE_DATASOURCE_MONITOR={
	list:host+"/rest/mqbus/subscribe/list",
  save:host+"/rest/mqbus/subscribe/save",
  start:host+"/rest/mqbus/subscribe/start",
  close:host+"/rest/mqbus/subscribe/close",
  delete:host+"/rest/mqbus/subscribe/delete",
  getById:host+"/rest/mqbus/subscribe/getById",
  exportConfig:host+"/rest/mqbus/subscribe/export",
}

//消息总线，接收到的消息
export const CORE_MQ_RECEIVE_MESSAGE={
	list:host+"/rest/mqbus/receive/list",
  clear:host+"/rest/mqbus/receive/clear",
	delete:host+"/rest/mqbus/receive/delete",
	resend:host+"/rest/mqbus/receive/resend",
}

//消息发布者配置
export const MQ_Producer_MESSAGE={
	list:host+"/rest/mqbus/producer/list",
  delete:host+"/rest/mqbus/producer/delete",
  getById:host+"/rest/mqbus/producer/getById",
  save:host+"/rest/mqbus/producer/save",
	createApi:host+"/rest/mqbus/producer/create/api",
	exportConfig:host+"/rest/mqbus/producer/export",
  listMqType:host+"/rest/mqbus/producer/getMqType",
  listMqSendSdkType: host + "/rest/mqbus/producer/getMqSendSdkType",
  delayTimeLevel: host + "/rest/mqbus/producer/getMqMessageDelayLevel"
}

//主题管理
export const MQ_TOPIC_MGR={
	list:host+"/rest/mqbus/topic/list",
  delete:host+"/rest/mqbus/topic/delete",
  getById:host+"/rest/mqbus/topic/getById",
  save:host+"/rest/mqbus/topic/save",
	select:host+"/rest/mqbus/topic/select",
	exportConfig:host+"/rest/mqbus/topic/export",
}
