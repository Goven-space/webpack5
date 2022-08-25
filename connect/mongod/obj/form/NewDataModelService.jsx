import React from 'react';
import { Form, Select, Input, Button, Spin, Alert, Icon, Switch, Checkbox, Tabs, Radio, Modal } from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
//通用生成服务

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl = URI.CONNECT.MONGOD.generateApi;

class form extends React.Component {
  constructor(props) {
    super(props);
    this.appId = this.props.record.appId;
    this.objectId = this.props.record.objectId;
    this.keyId = this.props.record.keyId;
    this.objectName = this.props.record.objectName;
    this.collName = this.props.record.collName || this.modelId;
    this.dbName = this.props.record.dbName;
    this.modelType = this.props.modelType; //数据模型的类型E表示实体模型，R表示业务模型
    let keyIdArray = this.props.record.keyId.split(",");
    this.keyId = keyIdArray[0];
    this.state = {
      mask: false,
      formData: [],
      pageCreatFlag: 'true',
      idCreatFlag: 'true',
      saveCreatFlag: 'false',
      deleteCreatFlag: 'false',
      coverCreatFlag: 'false',
      updateCreatFlag: 'false',
    };
  }
componentDidMount(){
 if( this.keyId===""){
   this.setState({idCreatFlag:'false'})
 }
}
  onSubmit = (closeFlag = true) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let postData = {};
        Object.keys(values).forEach(
          function (key) {
            if (values[key] !== undefined) {
              postData[key] = values[key];
            }
          }
        );
        postData = Object.assign({}, this.state.formData, postData);
        postData.appId = this.appId;
        postData.objectId = this.objectId;
        this.setState({ mask: true });
        AjaxUtils.post(SubmitUrl, postData, (data) => {
          this.setState({ mask: false });
          if (data.state === false) {
            Modal.error({ title: '服务生成失败', content: data.msg, width: 600 });
          } else {
            Modal.info({ title: '服务生成结果', content: data.msg, width: 600 });
            this.props.close(true);
          }
        });
      }
    });
  }

  onQueryFiltersChange = (data) => {
    this.state.formData.getByFiltersServiceContion = JSON.stringify(data);
  }

  onDeleteFiltersChange = (data) => {
    this.state.formData.deleteByFiltersServiceContion = JSON.stringify(data);
  }
  pageOnChange = e => {
    e.target.value === 'true' ?
      this.setState({
        pageCreatFlag: 'true',
      }) :
      this.setState({
        pageCreatFlag: 'false',
      });
  };
  idOnChange = e => {
    e.target.value === 'true' ?
      this.setState({
        idCreatFlag: 'true',
      }) :
      this.setState({
        idCreatFlag: 'false',
      });
  };
  saveOnChange = e => {
    e.target.value === 'true' ?
      this.setState({
        saveCreatFlag: 'true',
      }) :
      this.setState({
        saveCreatFlag: 'false',
      });
  };
  deleteOnChange = e => {
    e.target.value === 'true' ?
      this.setState({
        deleteCreatFlag: 'true',
      }) :
      this.setState({
        deleteCreatFlag: 'false',
      });
  };
  coverOnChange = e => {
    e.target.value === 'true' ?
      this.setState({
        coverCreatFlag: 'true',
      }) :
      this.setState({
        coverCreatFlag: 'false',
      });
  };
  updateOnChange = e => {
    e.target.value === 'true' ?
      this.setState({
        updateCreatFlag: 'true',
      }) :
      this.setState({
        updateCreatFlag: 'false',
      });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = { labelCol: { span: 4 }, wrapperCol: { span: 18 }, };

    const SaveMethodType = (
      getFieldDecorator('saveMethodType', { initialValue: 'POST' })
        (<Select style={{ width: 80 }} >
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>)
    );

    const DeleteMethodType = (
      getFieldDecorator('deleteMethodType', { initialValue: 'POST' })
        (<Select style={{ width: 80 }} >
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>)
    );

    const ListMethodType = (
      getFieldDecorator('pageMethodType', { initialValue: 'GET' })
        (<Select style={{ width: 80 }} >
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>)
    );

    const GetMethodType = (
      getFieldDecorator('idMethodType', { initialValue: 'GET' })
        (<Select style={{ width: 80 }} >
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>)
    );

    const CoverMethodType = (
      getFieldDecorator('coverMethodType', { initialValue: 'POST' })
        (<Select style={{ width: 80 }} >
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>)
    );

    const UpdateByFiltersMethodType = (
      getFieldDecorator('updateMethodType', { initialValue: 'POST' })
        (<Select style={{ width: 80 }} >
          <Option value="GET">GET</Option>
          <Option value="POST">POST</Option>
          <Option value="PUT">PUT</Option>
          <Option value="DELETE">DELETE</Option>
        </Select>)
    );


    let spos = this.objectId.indexOf(".");
    let tmpCollName = this.collName.toLowerCase();
    let tmpDbName = this.dbName.toLowerCase();
    const saveServiceUrl = "/insert";
    const deleteServiceUrl = "/delete";
    const coverServiceUrl = "/cover";
    const listServiceUrl = "/lists";
    const getByIdServiceUrl = "/details";
    const updateServiceUrl = "/update";
    const baseUrl = "/" + this.appId + "/" + tmpDbName + "/" + tmpCollName;
    const updateServiceName = "根据" + this.keyId + "更新" + this.objectName + "的数据";
    const coverServiceName = "根据" + this.keyId + "覆盖" + this.objectName + "的数据";
    const saveServiceName = "插入" + this.objectName + "的数据";
    const deleteServiceName = "根据" + this.keyId + "删除" + this.objectName + "的多条记录";
    const listServiceName = "分页查询" + this.objectName + "的数据";
    const getByIdServiceName = "根据" + this.keyId + "获取" + this.objectName + "的一条记录";

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Form onSubmit={this.onSubmit} >
          <Tabs defaultActiveKey="0" tabPosition='left' style={{ minHeight: '350px' }}>
            <TabPane tab={<span>服务基础URL</span>} key="0">
            {this.keyId===""?<Alert
      message="发布提示"
      description="您未配置主字段，无法使用按主字段操作功能！"
      type="warning"
      showIcon
      closable
    />:""}
           <FormItem
                label="服务基础URL"
                help='尽量符合Restful风格,可以使用/rest/api/{变量}表示Path参数'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('baseUrl', { initialValue: baseUrl })
                    (<Input />)
                }
              </FormItem>
            </TabPane>
            <TabPane tab={<span>分页查询</span>} key="1">
              <FormItem
                label="服务名"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('listServiceName', { initialValue: listServiceName })
                    (<Input />)
                }
              </FormItem>
              <FormItem
                label="URL"
                help="分页查询数据"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('listServiceUrl', { initialValue: listServiceUrl })
                    (<Input addonBefore={ListMethodType} style={{ width: '100%' }} />)
                }
              </FormItem>
              <FormItem
                label="是否生成"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('pageCreatFlag', { initialValue: 'true' })
                    (<RadioGroup onChange={this.pageOnChange}>
                      <Radio value='true'>是</Radio>
                      <Radio value='false'>否</Radio>
                    </RadioGroup>)
                }
              </FormItem>
            </TabPane>
            <TabPane tab={<span>按主字段查询</span>} key="2" disabled={this.keyId===""?true:false}>
              <FormItem
                label="服务名"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('getByIdServiceName', { initialValue: getByIdServiceName })
                    (<Input />)
                }
              </FormItem>
              <FormItem
                label="URL"
                help='根据唯一主键查询一条记录的数据(多个主键字段时只支持第一个主键字段)'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('getByIdServiceUrl', { initialValue: getByIdServiceUrl })
                    (<Input addonBefore={GetMethodType} style={{ width: '100%' }} />)
                }
              </FormItem>
              <FormItem
                label="是否生成"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('idCreatFlag', { initialValue: 'true' })
                    (<RadioGroup onChange={this.idOnChange}>
                      <Radio value='true'>是</Radio>
                      <Radio value='false'>否</Radio>
                    </RadioGroup>)
                }
              </FormItem>
            </TabPane>
            <TabPane tab={<span>插入数据</span>} key="3" >
              <FormItem
                label="服务名"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('saveServiceName', { initialValue: saveServiceName })
                    (<Input />)
                }
              </FormItem>
              <FormItem
                label="URL"
                help='插入一条新记录（可以选择是否判断主字段记录是否唯一）'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('saveServiceUrl', { initialValue: saveServiceUrl })
                    (<Input addonBefore={SaveMethodType} style={{ width: '100%' }} />)
                }
              </FormItem>
              <FormItem
                label="参数类型"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('saveRequestBodyParams', { initialValue: 'true' })
                    (<RadioGroup>
                      <Radio value='true'>RequestBody</Radio>
                      <Radio value='false'>键值对</Radio>
                    </RadioGroup>)
                }
              </FormItem>
              <FormItem
                label="记录是否唯一"
                help='选择是否判断记录中主字段的值是否存在，存在就不能插入新记录'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('saveIsOnlyFlag', { initialValue: this.keyId===""?'false':'true' })
                    (<RadioGroup>
                      <Radio value='true' disabled={this.keyId===""?true:false}>是</Radio>
                      <Radio value='false'>否</Radio>
                    </RadioGroup>)
                }
              </FormItem>
              <FormItem
                label="是否生成"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('saveCreatFlag', { initialValue: 'false' })
                    (<RadioGroup onChange={this.saveOnChange}>
                      <Radio value='true'>是</Radio>
                      <Radio value='false'>否</Radio>
                    </RadioGroup>)
                }
              </FormItem>
            </TabPane>
            <TabPane tab={<span>按主字段删除</span>} key="4" disabled={this.keyId===""?true:false}>
              <FormItem
                label="服务名"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('deleteServiceName', { initialValue: deleteServiceName })
                    (<Input />)
                }
              </FormItem>
              <FormItem
                label="URL"
                help="根据唯一字段来删除数据(只能使用一个主键字段)"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('deleteServiceUrl', { initialValue: deleteServiceUrl })
                    (<Input addonBefore={DeleteMethodType} style={{ width: '100%' }} />)
                }
              </FormItem>
              <FormItem
                label="是否生成"
                {...formItemLayout4_16}
              >

                {
                  getFieldDecorator('deleteCreatFlag', { initialValue: 'false' })
                    (<RadioGroup onChange={this.deleteOnChange}>
                      <Radio value='true'>是</Radio>
                      <Radio value='false'>否</Radio>
                    </RadioGroup>)
                }
              </FormItem>
            </TabPane>
            <TabPane tab={<span>按主字段覆盖</span>} key="5" disabled={this.keyId===""?true:false}>
              <FormItem
                label="服务名"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('coverServiceName', { initialValue: coverServiceName })
                    (<Input />)
                }
              </FormItem>
              <FormItem
                label="URL"
                help='根据唯一主字段覆盖一条记录的数据(覆盖原有的记录，将原来的记录替换掉)'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('coverServiceUrl', { initialValue: coverServiceUrl })
                    (<Input addonBefore={CoverMethodType} style={{ width: '100%' }} />)
                }
              </FormItem>
              <FormItem
                label="参数类型"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('coverRequestBodyParams', { initialValue: 'true' })
                    (<RadioGroup>
                      <Radio value='true'>RequestBody</Radio>
                      <Radio value='false'>键值对</Radio>
                    </RadioGroup>)
                }
              </FormItem>
              <FormItem
                label="是否生成"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('coverCreatFlag', { initialValue: 'false' })
                    (<RadioGroup onChange={this.coverOnChange}>
                      <Radio value='true'>是</Radio>
                      <Radio value='false'>否</Radio>
                    </RadioGroup>)
                }
              </FormItem>
            </TabPane>
            <TabPane tab={<span>按主字段更新</span>} key="6" disabled={this.keyId===""?true:false}>
              <FormItem
                label="服务名"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('updateServiceName', { initialValue: updateServiceName })
                    (<Input />)
                }
              </FormItem>
              <FormItem
                label="URL"
                help='根据唯一主字段更新一条记录的数据(按字段更新，记录中字段不存在就追加)'
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('updateServiceUrl', { initialValue: updateServiceUrl })
                    (<Input addonBefore={UpdateByFiltersMethodType} style={{ width: '100%' }} />)
                }
              </FormItem>
              <FormItem
                label="参数类型"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('updateRequestBodyParams', { initialValue: 'true' })
                    (<RadioGroup >
                      <Radio value='true'>RequestBody</Radio>
                      <Radio value='false'>键值对</Radio>
                    </RadioGroup>)
                }
              </FormItem>
              <FormItem
                label="是否生成"
                {...formItemLayout4_16}
              >
                {
                  getFieldDecorator('updataCreatFlag', { initialValue: 'false' })
                    (<RadioGroup onChange={this.updateOnChange}>
                      <Radio value='true'>是</Radio>
                      <Radio value='false'>否</Radio>
                    </RadioGroup>)
                }
              </FormItem>
            </TabPane>
          </Tabs>

          <FormItem wrapperCol={{ span: 20, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit}  >
              提交
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

const NewViewModelService = Form.create()(form);

export default NewViewModelService;
