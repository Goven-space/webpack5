import React from 'react';
import { Form, Select, Input, Button, Spin, Icon, Radio, Row, Col, Tooltip, Popover, InputNumber, Tabs } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';

//发送mqtt消息

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const PropsUrl = URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl = URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址
const connectionsUrl = URI.CORE_DATASOURCE.listAll + "?configType=RabbitMQ";

class form extends React.Component {
  constructor(props) {
    super(props);
    this.appId = this.props.appId;
    this.nodeObj = this.props.nodeObj;
    this.eleId = this.props.eldId;
    this.processId = this.props.processId;
    this.state = {
      mask: false,
      formData: {},
    };
  }

  componentDidMount() {
    this.loadNodePropsData();
  }

  loadNodePropsData = () => {
    let url = PropsUrl + "?processId=" + this.processId + "&nodeId=" + this.nodeObj.key;
    this.setState({ mask: true });
    AjaxUtils.get(url, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        if (JSON.stringify(data) === '{}') {
          data = {
            pNodeName: this.nodeObj.text, pNodeId: this.nodeObj.key, processId: this.processId, pNodeType: this.nodeObj.nodeType,
            body: '${indoc}',
            compensateFlag: '1',
            exchangeType: '0',
            msgModel: '0',
            durable: "0"
          };
        }
        // console.log(data);
        this.setState({ formData: data });
        FormUtils.setFormFieldValues(this.props.form, data);
      }
    });
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let postData = {};
        Object.keys(values).forEach(
          function (key) {
            if (values[key] !== undefined) {
              let value = values[key];
              if (value instanceof Array) {
                postData[key] = value.join(","); //数组要转换为字符串提交
              } else {
                postData[key] = value;
              }
            }
          }
        );
        postData = Object.assign({}, this.state.formData, postData);
        postData.appId = this.appId;
        postData.processId = this.processId;
        this.setState({ mask: true });
        AjaxUtils.post(SubmitUrl, postData, (data) => {
          if (data.state === false) {
            this.showInfo(data.msg);
          } else {
            this.setState({ mask: false });
            AjaxUtils.showInfo("保存成功!");
            if (closeFlag) {
              this.props.close(true, postData.pNodeName);
            }
          }
        });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = { labelCol: { span: 4 }, wrapperCol: { span: 16 }, };

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Form onSubmit={this.onSubmit} >
          <Tabs size="large">
            <TabPane tab="基本属性" key="props"  >
              <FormItem
                label="节点名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                hasFeedback
                help="指定任何有意义且能描述本节点的说明"
              >
                {
                  getFieldDecorator('pNodeName', {
                    rules: [{ required: false }]
                  })
                    (<Input />)
                }
              </FormItem>
              <FormItem
                label="节点Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >
                {
                  getFieldDecorator('pNodeId', {
                    rules: [{ required: true }]
                  })
                    (<Input disabled={true} />)
                }
              </FormItem>
              <FormItem
                label="节点类型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: 'none' }}
              >
                {
                  getFieldDecorator('pNodeType', {
                    rules: [{ required: true }]
                  })
                    (<Input />)
                }
              </FormItem>
              <FormItem
                label="RabbitMQ数据源Id"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help="请选择一个RabbitMQ数据源(请在数据源管理中进行链接配置)"
              >{
                  getFieldDecorator('dataSourceId', { rules: [{ required: true }] })
                    (<AjaxSelect url={connectionsUrl} textId="configName" valueId="configId" options={{ showSearch: true }} />)
                }
              </FormItem>

              <FormItem label="消息模型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='指定发送消息的模型'
              >
                {getFieldDecorator('msgModel')
                  (
                    <RadioGroup>
                      <Radio value='0'>队列</Radio>
                      <Radio value='1'>订阅</Radio>
                    </RadioGroup>
                  )}
              </FormItem>

              <FormItem
                label="队列名"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: this.props.form.getFieldValue("msgModel") === '0' ? '' : 'none' }}
                help="指定要发送消息的队列名称"
              >{
                  getFieldDecorator('queueName')
                    (<Input />)
                }
              </FormItem>

              <FormItem
                label="交换机名"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: this.props.form.getFieldValue("msgModel") === '1' ? '' : 'none' }}
                help='指定交换机名称'
              >{
                  getFieldDecorator('exchangeName')
                    (<Input />)
                }
              </FormItem>

              <FormItem
                label="交换机类型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: this.props.form.getFieldValue("msgModel") === '1' ? '' : 'none' }}
                help='请选择一个交换机类型'>
                {getFieldDecorator('exchangeType')
                  (
                    <Select>
                      <Option value='0'>Fanout</Option>
                      <Option value='1'>Direct</Option>
                      <Option value='2'>Topic</Option>
                      <Option value='3'>Headers</Option>
                    </Select>
                  )}
              </FormItem>

              <FormItem
                label="RoutingKey"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{
                  display: (this.props.form.getFieldValue("exchangeType") === '1' ||
                    this.props.form.getFieldValue("exchangeType") === '2') ? '' : 'none'
                }}
                help="指定要绑定的routingKey"
              >{
                  getFieldDecorator('routingKey')
                    (<Input />)
                }
              </FormItem>

              <FormItem
                label="Headers"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{
                  display: (this.props.form.getFieldValue("exchangeType") === '3') ? '' : 'none'
                }}
                help='请用json表示Headers的键值对，如{"aa":"123"}'
              >{
                  getFieldDecorator('headerJson')
                    (<Input />)
                }
              </FormItem>

              <FormItem label="持久化" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help='请选择是否持久化数据'
              >
                {getFieldDecorator('durable')
                  (
                    <RadioGroup>
                      <Radio value='1'>是</Radio>
                      <Radio value='0'>否</Radio>
                    </RadioGroup>
                  )}
              </FormItem>


              <FormItem label="发送失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="当发送失败时是否进行正向补偿"
              >
                {getFieldDecorator('compensateFlag')
                  (
                    <RadioGroup>
                      <Radio value='1'>正向补偿(定时正向补偿)</Radio>
                      <Radio value='0'>跳过(无需补偿)</Radio>
                      <Radio value='2'>终止流程</Radio>
                    </RadioGroup>
                  )}
              </FormItem>
              <FormItem
                label="消息内容"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='取上一节点结果${$.变量},取指定节点结果${$.T00001.变量},获取HTTP请求值:${$.http|header.变量}
              ,${indoc}表示上一节点的全部结果,使用${$rule.规则Id}可调用规则返回值'
              >{
                  getFieldDecorator('body', { rules: [{ required: true }] })
                    (<Input.TextArea autosize style={{ minHeight: '100px' }} />)
                }
              </FormItem>
            </TabPane>
          </Tabs>
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit.bind(this, true)}  >
              保存
            </Button>
            {' '}
            <Button onClick={this.props.close.bind(this, false)}  >
              关闭
              </Button>

          </FormItem>
        </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
