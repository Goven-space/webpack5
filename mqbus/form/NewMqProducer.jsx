import React, { Fragment } from "react";
import {
  Form,
  Select,
  Input,
  Button,
  Spin,
  Icon,
  Radio,
  InputNumber,
  Col,
  Tooltip,
  Popover,
  Divider,
  AutoComplete,
} from "antd";
import * as URI from "../../core/constants/RESTURI";
import * as AjaxUtils from "../../core/utils/AjaxUtils";
import * as FormUtils from "../../core/utils/FormUtils";
import TreeNodeSelect from "../../core/components/TreeNodeSelect";
import AjaxSelect from "../../core/components/AjaxSelect";

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const GetById = URI.MQBUS.MQ_Producer_MESSAGE.getById; //获取测试服务配置信息的url地址
const SubmitUrl = URI.MQBUS.MQ_Producer_MESSAGE.save; //存盘地址
const dataSourceSelect =
  URI.CORE_DATASOURCE.select + "?configType=Kafka,mqtt,jms,RabbitMQ,rocketmq,RocketMQ_Local";
const SelectTopicUrl = URI.MQBUS.MQ_TOPIC_MGR.select; //选择topic
const mqTypeUrl = URI.MQBUS.MQ_Producer_MESSAGE.listMqType; //获取MQ消息种类（RocketMQ）
const mqSendSdkTypeUrl = URI.MQBUS.MQ_Producer_MESSAGE.listMqSendSdkType; //获取MQ发送sdk类型
const delayTimeLevelUrl = URI.MQBUS.MQ_Producer_MESSAGE.delayTimeLevel

// RocketMq数据源类型
const rocketMqConfigType = "rocketmq";
// RabbitMq数据源类型
const rabbitMqConfigType = "RabbitMQ";


class form extends React.Component {
  constructor(props) {
    super(props);
    this.appId = this.props.appId;
    this.id = this.props.id;
    this.selectRef = {};
    this.state = {
      mask: false,
      formData: {},
      mqKindList: [],
      mqSendSdkTypeList: [],
      rocketMqSourceFlag: false,
      rabbitMqSourceFlag: false,
      targetMqKind: '',
      delayTimeLevel: [],
      openFlag: false
    };
  }

  componentDidMount() {
    this.getMqKind();
    this.getMqSendSdkType();
    this.getDelayTimeLevelList();
    if (this.props.id === "") {
      return;
    }
    let url = GetById + "?id=" + this.id;
    this.setState({ mask: true });
    AjaxUtils.get(url, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        if (data.rocketmq_mqKind) {
          this.setState({ rocketMqSourceFlag: true, targetMqKind: data.rocketmq_mqKind });
        }
        if (data.rabbitmq_exchangeType) {
          this.setState({ rabbitMqSourceFlag: true });
        }
        if (data.rocketmq_messageType === 'OPEN') {
          this.setState({ openFlag: true })
          data.delayTime += ''
        }
        this.setState({ formData: data });
        FormUtils.setFormFieldValues(this.props.form, data);
      }
    })
  }
  

  getDelayTimeLevelList = () => {
    AjaxUtils.get(`${delayTimeLevelUrl}?mqType=rocketmq`, (data) => {
      if (data) {
        this.setState({ delayTimeLevel: data }, () => {
        })
      }
    })
  }

  // 获取MQ种类
  getMqKind = () => {
    AjaxUtils.get(mqTypeUrl + "?mqType=rocketmq", (data) => {
      if (data) {
        this.setState({ mqKindList: data });
      }
    });
  };

  // 获取MQ种类
  getMqSendSdkType = () => {
    AjaxUtils.get(mqSendSdkTypeUrl + "?mqType=rocketmq", (data) => {
      if (data) {
        this.setState({ mqSendSdkTypeList: data });
      }
    });
  };

  onSubmit = (closeFlag, testConn = "") => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let postData = {};
        Object.keys(values).forEach(function (key) {
          if (values[key] !== undefined) {
            let value = values[key];
            if (value instanceof Array) {
              postData[key] = value.join(","); //数组要转换为字符串提交
            } else {
              postData[key] = value;
            }
          }
        });
        postData = Object.assign({}, this.state.formData, postData);
        postData.appId = this.appId;
        let dataSourceId = postData.dataSourceId;
        let configType = this.getConfigTypeByConfig(
          this.selectRef.state.treeData,
          dataSourceId
        );
        let rocketmq_mqKind = postData.rocketmq_mqKind;
        // 数据源类型不为rocketMq时 置空rabbitMq相关字段
        if (configType !== rocketMqConfigType) {
          postData.rocketmq_messageType = "";
          postData.rocketmq_mqKind = "";
          postData.rocketmq_messageTag = "";
          postData.rocketmq_messageKey = "";
        }
        if (configType !== rocketMqConfigType ||
          (rocketmq_mqKind !== "DELAY_MQ" &&
            rocketmq_mqKind !== "TIME_MQ")
        ) {
          postData.delayTime = "";
        }
        if (configType !== rocketMqConfigType ||
          rocketmq_mqKind !== "ORDER_MQ") {
            postData.shardingKey = ""
          }
        // 数据源类型不为rabbitMq时 置空rabbitMq相关字段
        if (configType !== rabbitMqConfigType) {
          postData.rabbitmq_routingKey = "";
          postData.rabbitmq_exchangeType = "";
          postData.rabbitmq_routingKey = "";
        }
        this.setState({ mask: true });
        AjaxUtils.post(SubmitUrl, postData, (data) => {
          this.setState({ mask: false });
          if (data.state === false) {
            AjaxUtils.showError(data.msg);
          } else {
            AjaxUtils.showInfo(data.msg);
            if (closeFlag) {
              this.props.close(true);
            }
          }
        });
      }
    });
  };

  handleSelectChange = (value) => {
    let configType = this.getConfigTypeByConfig(
      this.selectRef.state.treeData,
      value
    );
    if (configType === rocketMqConfigType) {
      let rocketmq_mqKind = this.props.form.getFieldValue("rocketmq_mqKind");
      if (!rocketmq_mqKind) {
        this.props.form.setFieldsValue({
          rocketmq_mqKind: "COMMON_MQ",
          rocketmq_messageType: "HTTP",
        });
      }
      this.setState({ rocketMqSourceFlag: true });
    } else {
      this.setState({ rocketMqSourceFlag: false });
    }
    if (configType === rabbitMqConfigType) {
      let rabbitmq_exchangeType = this.props.form.getFieldValue("rabbitmq_exchangeType");
      if (!rabbitmq_exchangeType) {
        this.props.form.setFieldsValue({
          rabbitmq_exchangeType: "direct"
        });
      }
      this.setState({ rabbitMqSourceFlag: true });
    } else {
      this.setState({ rabbitMqSourceFlag: false });
    }
  };


  getConfigTypeByConfig = (treeData, value) => {
    let configType = "";
    const loop = (data) => {
      for (let item of data) {
        if (item.configId === value) return item.configType;
        if (item.children && item.children.length) {
          let config = loop(item.children)
          if (config) return config
        }
      }
    }
    configType = loop(treeData) || ''
    return configType;
  };

  mqKindChange = (e) => {
    let value = e.target.value;
    this.setState({ targetMqKind: value })
  };

  messageTypeChange = (e) => {
    let value = e.target.value;
    if (value === 'OPEN') {
      this.setState({ openFlag: true })
    } else {
      this.setState({ openFlag: false })
    }


  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { rocketMqSourceFlag, targetMqKind, delayTimeLevel, openFlag, mask, mqSendSdkTypeList, mqKindList, rabbitMqSourceFlag } = this.state
    const selectMethod = getFieldDecorator("apiMethod", {
      initialValue: "POST",
    })(
      <Select style={{ width: 80 }}>
        <Option value="GET">GET</Option>
        <Option value="POST">POST</Option>
      </Select>
    );

    return (
      <Spin spinning={mask} tip="Loading...">
        <Form onSubmit={this.onSubmit}>
          <FormItem
            label="指定数据源"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help="请选择一个数据源"
          >
            {getFieldDecorator("dataSourceId", {
              rules: [{ required: true }],
              initialValue: "",
            })(
              <TreeNodeSelect
                ref={(childRef) => (this.selectRef = childRef)}
                url={dataSourceSelect}
                options={{
                  showSearch: true,
                  multiple: false,
                  allowClear: true,
                  treeNodeFilterProp: "label",
                  searchPlaceholder: "输入搜索关键字",
                }}
                onChange={this.handleSelectChange}
              />
            )}
          </FormItem>
          <FormItem
            label="发布者说明"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            hasFeedback
            help="指定任何有意义且能描述本消息的说明"
          >
            {getFieldDecorator("configName", { rules: [{ required: true }] })(
              <Input />
            )}
          </FormItem>
          {rocketMqSourceFlag ? (
            <Fragment>
              <FormItem
                label="消息接入方式"
                help="指定RocketMQ生产者发送消息接入方式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator("rocketmq_messageType", {
                  initialValue: "HTTP",
                })(
                  <RadioGroup onChange={this.messageTypeChange}>
                    {mqSendSdkTypeList.map((item) => {
                      return (
                        <Radio key={item.mqConfigId} value={item.mqConfigId}>
                          {item.mqConfigName}
                        </Radio>
                      );
                    })}
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="消息种类"
                help="指定MQ消息种类"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator("rocketmq_mqKind", {
                  initialValue: "COMMON_MQ",
                })(
                  <RadioGroup onChange={this.mqKindChange}>
                    {mqKindList.map((item) => {
                      return (
                        <Radio value={item.mqConfigId} key={item.mqConfigId}>
                          {item.mqConfigName}
                        </Radio>
                      );
                    })}
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem
                label="消息标签"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator("rocketmq_messageTag")(<Input />)}
              </FormItem>
              <FormItem
                label="消息key"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator("rocketmq_messageKey", { rules: [{ required: true }] })(<Input />)}
              </FormItem>
            </Fragment>
          ) : null}
          {rocketMqSourceFlag && ['DELAY_MQ', 'TIME_MQ'].includes(targetMqKind) &&
            <FormItem
              label="延时/定时时间"
              help={`延时时间或定时时间${openFlag ? '' : '-单位毫秒（ms）'}`}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >
              {getFieldDecorator("delayTime")(
                openFlag ?
                  <Select style={{ width: '400px' }}>
                    {
                      delayTimeLevel.map(item => {
                        return <Option value={item.value}  >{item.text}</Option>
                      })
                    }
                  </Select>
                  : <InputNumber min={0} style={{ minWidth: '400px' }} />
              )}
            </FormItem>
          }
          {
            rocketMqSourceFlag && targetMqKind === 'ORDER_MQ' &&
            <FormItem
              label="分区标识"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >
              {getFieldDecorator("shardingKey")(<Input />)}
            </FormItem>
          }

          {rabbitMqSourceFlag ? (
            <Fragment>
              <FormItem
                label="交换机类型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator("rabbitmq_exchangeType", {
                  initialValue: "direct",
                })(
                  <RadioGroup>
                    <Radio value="direct">direct</Radio>
                    <Radio value="topic">topic</Radio>
                    <Radio value="fanout">fanout</Radio>
                  </RadioGroup>)}
              </FormItem>
              <FormItem
                label="交换机名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator("rabbitmq_exchangeName")(<Input />)}
              </FormItem>
              <FormItem
                label="Routing Key"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {getFieldDecorator("rabbitmq_routingKey")(<Input />)}
              </FormItem>
            </Fragment>
          ) : null}
          <FormItem
            label="类型"
            help="指定消息生产者类型"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >
            {getFieldDecorator("topicType", { initialValue: "topic" })(
              <RadioGroup>
                <Radio value="topic">topic</Radio>
                <Radio value="queue">queue</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem
            label="消息topic/queue"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            hasFeedback
            help="选择消息的topic或queue"
          >
            {getFieldDecorator("topic", {
              rules: [{ required: true }],
              initialValue: "",
            })(<AjaxSelect url={SelectTopicUrl} />)}
          </FormItem>
          <FormItem
            label="调试"
            help="调试输出发送的数据到控制台"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >
            {getFieldDecorator("debug", { initialValue: "true" })(
              <RadioGroup>
                <Radio value="true">是</Radio>
                <Radio value="false">否</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem
            label="备注"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >
            {getFieldDecorator("remark")(<Input.TextArea autosize />)}
          </FormItem>
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this, true, "")}>
              保存
            </Button>{" "}
            <Button onClick={this.props.close.bind(this, false)}>关闭</Button>
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
