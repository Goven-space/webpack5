import React from "react";
import { Form, Radio, Select, Input,InputNumber  } from "antd";

class BasicAttributes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <Form>
              <Form.Item label="输出结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="API调用结果数据是否输出给本流程发布的API的调用端"
              >
                {getFieldDecorator('responseData', { initialValue: '1' })
                  (
                    <Select  >
                      <Option value='1'>输出API结果到调用端</Option>
                      <Option value='0'>不输出API结果</Option>
                      <Option value='2'>多次循环调用时累加结果并输出</Option>
                    </Select>
                  )}
              </Form.Item>
              <Form.Item label="分页读取" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="针对数据查询节点可以指定分页循环读取直到最后一页,必须在API参数中通过${pageNo}获取页数作为输入参数"
              >
                {getFieldDecorator('pageReadDataFlag', { initialValue: '0' })
                  (
                    <Radio.Group>
                      <Radio value='0'>否</Radio>
                      <Radio value='1'>是</Radio>
                    </Radio.Group>
                  )}
              </Form.Item>
              <Form.Item
                label="数据体所在字段"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{ display: this.props.form.getFieldValue("pageReadDataFlag") === '1' ? '' : 'none' }}
                help="指定数据体所在字段支持JsonPath指定层次，如果没有数据了就停止读取"
              >
                {
                  getFieldDecorator('pageDataJsonPath', {
                    rules: [{ required: false }],
                    initialValue: '$.data'
                  })
                    (<Input />)
                }
              </Form.Item>
              <Form.Item label="保存请求参数" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="在节点实例中保存API的请求参数，如果数据量较大建议不要保存，注意不保存则不再支持补偿操作"
              >
                {getFieldDecorator('saveRequestBody', { initialValue: '1' })
                  (
                    <Radio.Group>
                      <Radio value='1'>是</Radio>
                      <Radio value='0'>否</Radio>
                    </Radio.Group>
                  )}
              </Form.Item>
              <Form.Item label="保存API调用结果" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="在节点实例中保存API的调用结果，如果数据量较大建议不要保存"
              >
                {getFieldDecorator('saveResponseBody', { initialValue: '1' })
                  (
                    <Radio.Group>
                      <Radio value='1'>是</Radio>
                      <Radio value='0'>否</Radio>
                    </Radio.Group>
                  )}
              </Form.Item>
              <Form.Item
                label="网络链接超时"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='网络链接的超时时间(默认10秒)单位毫秒'
              >{
                  getFieldDecorator('netConnectTimeout', { rules: [{ required: true }], initialValue: "10000" })
                    (<InputNumber min={0} />)
                }
              </Form.Item>
              <Form.Item
                label="请求读取超时"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='读取API返回数据超时时间(默认3秒)单位毫秒'
              >{
                  getFieldDecorator('connectTimeout', { rules: [{ required: true }], initialValue: "30000" })
                    (<InputNumber min={0} />)
                }
              </Form.Item>
              <Form.Item
                label="重试次数"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='调用后端服务失败后是否进行重试(默认0表示不重试)'
              >{
                  getFieldDecorator('retryNum', { rules: [{ required: true }], initialValue: "0" })
                    (<InputNumber min={0} />)
                }
              </Form.Item>
              <Form.Item
                label="重试间隔"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                help='每次重试时的间隔时间0表示立即重试(单位:毫秒)'
              >{
                  getFieldDecorator('retrySleep', { rules: [{ required: true }], initialValue: "0" })
                    (<InputNumber min={0} />)
                }
              </Form.Item>
              <Form.Item label="断言失败" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
                help="当断言失败时是否跳过节点或者进行补偿运行"
              >
                {getFieldDecorator('compensateFlag', { initialValue: '1' })
                  (
                    <Select>
                      <Option value='1'>正向补偿(直到本节点断言成功后继续执行流程)</Option>
                      <Option value='3'>跳过(事后补偿本节点)</Option>
                      <Option value='0'>跳过(无需补偿)</Option>
                      <Option value='2'>终止流程</Option>
                      <Option value='4'>结束本节点(其他节点可继续执行)</Option>
                    </Select>
                  )}
              </Form.Item>
            </Form>
        );
    }
}

const BasicAttributesForm = Form.create()(BasicAttributes);

export default BasicAttributesForm;
