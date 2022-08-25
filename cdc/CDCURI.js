//cdc-实时数据
export const CONSUMER = {
  list:       host + "/rest/cdc/consumer/list",
  save:       host + "/rest/cdc/consumer/save",
  delete:     host + "/rest/cdc/consumer/delete",
  getById:    host + "/rest/cdc/consumer/getById",
  PROCESS: {
    select:   host + "/rest/cdc/consumer/process/select" // 选择ETL流程
  }
};
export const CONSUMER_RECORD = {
  list:       host + "/rest/cdc/consumer/record/list",
  clear:      host + "/rest/cdc/consumer/record/clear"
};

export const PRODUCER = {
  list:       host + "/rest/cdc/producer/list",
  save:       host + "/rest/cdc/producer/save",
  delete:     host + "/rest/cdc/producer/delete",
  getById:    host + "/rest/cdc/producer/getById"
};
export const PRODUCER_RECORD = {
  list:       host + "/rest/cdc/producer/record/list",
  clear:      host + "/rest/cdc/producer/record/clear"
};

export const TOPIC = {
  list:       host + "/rest/cdc/topic/list",
  save:       host + "/rest/cdc/topic/save",
  delete:     host + "/rest/cdc/topic/delete",
  getById:    host + "/rest/cdc/topic/getById",
  select:     host + "/rest/cdc/topic/select" // 选择topic
};
export const HOME_CHARTS = {
  byTime:     host + "/rest/cdc/home/charts/byTime"
};