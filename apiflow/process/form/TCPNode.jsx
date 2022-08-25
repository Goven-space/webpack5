import React from 'react';
import { Form, Select, Input, Button, Spin, Icon, Radio, Row, Col, Tooltip, Popover, InputNumber, Tabs, Divider } from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

import CodeMirror from 'react-codemirror';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/sql/sql');
require('codemirror/mode/xml/xml');

//执行任务的节点属性
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const PropsUrl = URI.ESB.CORE_ESB_PROCESSNODE.props;
const SubmitUrl = URI.ESB.CORE_ESB_PROCESSNODE.save; //存盘地址

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
                        tcpAddress: '${#config.tcpAddress}',
                        body: '${indoc}',
                        responseData: '1',
                        saveRequestBody: '1',
                        saveResponseBody: '1',
                        xmlToJson: '1',
                        compensateFlag: '1'
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

    updateCode = (newCode) => {
        this.state.formData.assertCode = newCode; //断言代码
    }


    inserDemo = () => {
        let codeMirror = this.refs.codeMirror.getCodeMirror();
        let code = `//使用HTTP状态码作为判断条件
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  var statusCode=engine.getStatusCode(nodeId); //获取当前节点的HTTP状态码
  if(statusCode=="200"){
    result=1; //断言成立
  }
  return result;
}`;
        codeMirror.setValue(code);
        this.state.formData.assertCode = code;
    }

    inserDemo2 = () => {
        let codeMirror = this.refs.codeMirror.getCodeMirror();
        let code = `//执行sql条件作为判断条件
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  var sql="select * from table where id=1";
  var rdoc=RdbUtil.getDoc(sql);
  if(rdoc!==null){
    result=1; //SQL记录存在时断言成立
  }
  return result;
}`;
        codeMirror.setValue(code);
        this.state.formData.assertCode = code;
    }

    inserDemo3 = () => {
        let codeMirror = this.refs.codeMirror.getCodeMirror();
        let code = `//indoc为API执行的结果数据
function assert(engine,nodeDoc,nodeId,indoc){
  var result=0;
  if(DocumentUtil.getString(indoc,"userId")==="admin"){
    result=1; //返回结果符合要求断言成立
  }
  return result;
}`;
        codeMirror.setValue(code);
        this.state.formData.assertCode = code;
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
                                label="节点别名"
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 16 }}
                                help="别名可以在进行数据请求或者输出时作为JSON的数据标识使用,空值表示使用节点Id作为标识"
                            >
                                {
                                    getFieldDecorator('pNodeAlias', {
                                        rules: [{ required: false }]
                                    })
                                        (<Input />)
                                }
                            </FormItem>
                            <FormItem
                                label="TCP服务器地址"
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 16 }}
                                help="请指定TCP服务器地址,如:127.0.0.1:8080,可使用${#config.tcpAddress}引用变量"
                            >{
                                    getFieldDecorator('tcpAddress', { rules: [{ required: true }], initialValue: '${#config.tcpAddress}' })
                                        (<Input />)
                                }
                            </FormItem>
                            <FormItem
                                label="信息内容"
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 16 }}
                                help='取上一节点结果${$.变量},取指定节点结果${$.T00001.变量},获取HTTP请求值:${$.http|header.变量}
              ,${indoc}表示上一节点的全部结果,使用${$rule.规则Id}可调用规则返回值'
                            >{
                                    getFieldDecorator('body', { rules: [{ required: true }] })
                                        (<Input.TextArea autoSize style={{ minHeight: '100px' }} />)
                                }
                            </FormItem>
                        </TabPane>
                        <TabPane tab="输出结果" key="result"   >
                          <FormItem label="输出结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                              help="调用结果数据是否输出给本流程发布的API的调用端"
                          >
                              {getFieldDecorator('responseData', { initialValue: '1' })
                                  (
                                      <Select>
                                          <Select.Option value='1'>输出API结果到调用端</Select.Option>
                                          <Select.Option value='0'>不输出API结果</Select.Option>
                                          <Select.Option value='2'>多次循环调用时累加结果并输出</Select.Option>
                                      </Select>
                                  )}
                          </FormItem>
                          <FormItem label="保存请求参数" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                              help="在节点实例中保存API的请求参数，如果数据量较大建议不要保存，注意不保存则不再支持补偿操作"
                          >
                              {getFieldDecorator('saveRequestBody', { initialValue: '1' })
                                  (
                                      <RadioGroup>
                                          <Radio value='1'>是</Radio>
                                          <Radio value='0'>否</Radio>
                                      </RadioGroup>
                                  )}
                          </FormItem>
                          <FormItem label="保存调用结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                              help="在节点实例中保存WebService调用结果，如果数据量较大建议不要保存"
                          >
                              {getFieldDecorator('saveResponseBody', { initialValue: '1' })
                                  (
                                      <RadioGroup>
                                          <Radio value='1'>是</Radio>
                                          <Radio value='0'>否</Radio>
                                      </RadioGroup>
                                  )}
                          </FormItem>
                          <FormItem label="结果转为JSON" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                              help='后端返回的XML转为JSON传入后继节点，如果不转为JSON则XML作为整体字符串放入到ResponseBody字段中'
                          >
                              {getFieldDecorator('xmlToJson', { initialValue: '1' })
                                  (
                                      <RadioGroup>
                                          <Radio value='1'>是</Radio>
                                          <Radio value='0'>否</Radio>
                                      </RadioGroup>
                                  )}
                          </FormItem>
                          <FormItem
                              label="指定XML节点"
                              labelCol={{ span: 4 }}
                              wrapperCol={{ span: 16 }}
                              style={{ display: this.props.form.getFieldValue("xmlToJson") === '1' ? '' : 'none' }}
                              help='根据xml的路径作为JSON返回的开始节点格式:节点1#节点2'
                          >{
                                  getFieldDecorator('xmlSubNode', { initialValue: "" })
                                      (<Input />)
                              }
                          </FormItem>
                        </TabPane>
                        <TabPane tab="断言" key="Assertion"   >
                            <FormItem label="断言失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                                help="当断言失败时是否跳过节点或者进行补偿运行"
                            >
                                {getFieldDecorator('compensateFlag', { initialValue: '1' })
                                    (
                                        <Select>
                                            <Select.Option value='1'>正向补偿(直到本节点断言成功后继续执行流程)</Select.Option>
                                            <Select.Option value='3'>跳过(事后补偿本节点)</Select.Option>
                                            <Select.Option value='0'>跳过(无需补偿)</Select.Option>
                                            <Select.Option value='2'>终止流程</Select.Option>
                                            <Select.Option value='4'>结束本节点(其他节点可继续执行)</Select.Option>
                                        </Select>
                                    )}
                            </FormItem>
                            <Row>
                                <Col span={4} style={{ textAlign: 'right' }}>断言逻辑:</Col>
                                <Col span={18}>
                                    <div style={{ border: '1px #cccccc solid', minHeight: '280px', margin: '2px', borderRadius: '0px' }}>
                                        <CodeMirror ref='codeMirror'
                                            value={this.state.formData.assertCode}
                                            onChange={this.updateCode}
                                            options={{ lineNumbers: true, mode: 'javascript', autoMatchParens: true }}
                                        />
                                    </div>
                                    <a style={{ cursor: 'pointer' }} onClick={this.inserDemo}>HTTP状态码断言</a> <Divider type="vertical" />{' '}
                                    <a style={{ cursor: 'pointer' }} onClick={this.inserDemo2}>SQL条件断言</a> <Divider type="vertical" />{' '}
                                    <a style={{ cursor: 'pointer' }} onClick={this.inserDemo3}>调用结果断言</a> <Divider type="vertical" />
              返回1断言成立，返回0断言失败，返回2继续运行直到断言成立
              </Col>
                            </Row>
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
