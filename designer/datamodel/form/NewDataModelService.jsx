import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Tabs,Radio,Modal} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

//通用生成服务

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.CORE_DATAMODELS.generateService;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.modelId=this.props.modelId;
    this.keyId=this.props.keyId;
    this.modelName=this.props.modelName;
    this.tableName=this.props.tableName||this.modelId;
    this.modelType=this.props.modelType; //数据模型的类型E表示实体模型，R表示业务模型
    let keyIdArray=this.keyId.split(",");
    this.keyId=keyIdArray[0];
    this.state={
      mask:false,
      formData:[],
    };
  }

  onSubmit = (closeFlag=true) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                postData[key]=values[key];
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.appId=this.appId;
          postData.modelId=this.modelId;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                Modal.error({title: 'API生成失败',content:data.msg,width:600});
              }else{
                Modal.info({title: 'API生成结果',content:data.msg,width:600});
                this.props.close(true);
              }
          });
      }
    });
  }

  onQueryFiltersChange=(data)=>{
    this.state.formData.getByFiltersServiceContion=JSON.stringify(data);
  }

  onDeleteFiltersChange=(data)=>{
    this.state.formData.deleteByFiltersServiceContion=JSON.stringify(data);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};

    const SaveMethodType = (
        getFieldDecorator('saveMethodType',{ initialValue:'POST'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    const DeleteMethodType = (
        getFieldDecorator('deleteMethodType',{ initialValue:'POST'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    const ListMethodType = (
        getFieldDecorator('listMethodType',{ initialValue:'GET'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    const GetMethodType = (
        getFieldDecorator('getByIdMethodType',{ initialValue:'GET'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    const QueryMethodType = (
        getFieldDecorator('getByFiltersMethodType',{ initialValue:'GET'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    const DeleteByFiltersMethodType = (
        getFieldDecorator('deleteByFiltersMethodType',{ initialValue:'POST'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    const ListAllMethodType = (
        getFieldDecorator('listAllMethodType',{ initialValue:'GET'})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    let spos=this.modelId.indexOf(".");
    let tmpModelId=this.modelId.toLowerCase();
    const saveServiceUrl="/update";
    const deleteServiceUrl="/delete";
    const deleteByFiltersServiceUrl="/deletes";
    const listServiceUrl="/lists";
    const getByIdServiceUrl="/details";
    const listAllServiceUrl="/query";
    const baseUrl="/"+this.appId.toLowerCase()+"/v1/"+tmpModelId;

    const deleteByFiltersServiceName="按条件删除"+this.modelName+"的数据";
    const getByFiltersServiceName="按条件查询"+this.modelName+"的数据";
    const saveServiceName="更新或插入"+this.modelName+"的数据";
    const deleteServiceName="根据"+this.keyId+"删除"+this.modelName+"的多条记录";
    const listServiceName="分页查询"+this.modelName+"的数据";
    const getByIdServiceName="根据"+this.keyId+"获取"+this.modelName+"的一条记录";
    const listAllServiceName="列出"+this.modelName+"的所有数据";

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
       <Tabs defaultActiveKey="0" tabPosition='left' style={{minHeight:'360px'}}>
         <TabPane tab="服务基础URL" key="0">
         <FormItem
               label="服务基础URL"
               help='尽量符合Restful风格,可以使用/rest/api/{变量}表示Path参数'
               {...formItemLayout4_16}
             >
               {
                 getFieldDecorator('baseUrl',{initialValue:baseUrl})
                 (<Input />)
               }
         </FormItem>
       </TabPane>
       <TabPane tab="更新数据" key="1">
            <FormItem
              label="服务名"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('saveServiceName',{initialValue:saveServiceName})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="URL"
              help='根据主键判断如果记录不存在时插入已存在时更新'
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('saveServiceUrl',{initialValue:saveServiceUrl})
                (<Input addonBefore={SaveMethodType} style={{width:'100%'}} />)
              }
            </FormItem>
            <FormItem
              label="参数类型"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('requestBodyParams',{initialValue:'true'})
                ( <RadioGroup>
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
                getFieldDecorator('saveCreatFlag',{initialValue:'true'})
                ( <RadioGroup>
                  <Radio value='true'>是</Radio>
                  <Radio value='false'>否</Radio>
                </RadioGroup>)
              }
            </FormItem>
        </TabPane>
        <TabPane tab="按主键删除" key="2">
            <FormItem
              label="服务名"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('deleteServiceName',{initialValue:deleteServiceName})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="URL"
              help="根据唯一主键值来删除数据多个值用逗号分隔(只能使用第一个主键字段)"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('deleteServiceUrl',{initialValue:deleteServiceUrl})
                (<Input addonBefore={DeleteMethodType} style={{width:'100%'}} />)
              }
            </FormItem>
            <FormItem
              label="是否生成"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('deleteCreatFlag',{initialValue:'true'})
                ( <RadioGroup>
                  <Radio value='true'>是</Radio>
                  <Radio value='false'>否</Radio>
                </RadioGroup>)
              }
            </FormItem>
        </TabPane>
        <TabPane tab="分页查询" key="3">
            <FormItem
              label="服务名"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('listServiceName',{initialValue:listServiceName})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="URL"
              help="分页查询数据"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('listServiceUrl',{initialValue:listServiceUrl})
                (<Input addonBefore={ListMethodType} style={{width:'100%'}} />)
              }
            </FormItem>
            <FormItem
              label="是否生成"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('pageCreatFlag',{initialValue:'true'})
                ( <RadioGroup>
                  <Radio value='true'>是</Radio>
                  <Radio value='false'>否</Radio>
                </RadioGroup>)
              }
            </FormItem>
        </TabPane>
        <TabPane tab="按主键查询" key="4">
            <FormItem
              label="服务名"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('getByIdServiceName',{initialValue:getByIdServiceName})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="URL"
              help='根据唯一主键查询一条记录的数据(多个主键字段时只支持第一个主键字段)'
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('getByIdServiceUrl',{initialValue:getByIdServiceUrl})
                (<Input addonBefore={GetMethodType} style={{width:'100%'}} />)
              }
            </FormItem>
            <FormItem
              label="是否生成"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('idCreatFlag',{initialValue:'true'})
                ( <RadioGroup>
                  <Radio value='true'>是</Radio>
                  <Radio value='false'>否</Radio>
                </RadioGroup>)
              }
            </FormItem>
        </TabPane>
        <TabPane tab="条件查询" key="5">
            <FormItem
              label="服务名"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('listAllServiceName',{initialValue:listAllServiceName})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="URL"
              help='根据查询条件进行查询'
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('listAllServiceUrl',{initialValue:listAllServiceUrl})
                (<Input addonBefore={ListAllMethodType} style={{width:'100%'}} />)
              }
            </FormItem>
            <FormItem
              label="查询条件"
              help='空表示查询全部,使用${参数id}可以接收http参数作为条件SQL示例:id=1 order by id'
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('listAllFilters',{initialValue:''})
                (<Input.TextArea placeholder="id='${id}' and b='test'" />)
              }
            </FormItem>
            <FormItem
              label="是否生成"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('listAllCreatFlag',{initialValue:'false'})
                ( <RadioGroup>
                  <Radio value='true'>是</Radio>
                  <Radio value='false'>否</Radio>
                </RadioGroup>)
              }
            </FormItem>
        </TabPane>
        {this.modelType==='E'?
        <TabPane tab="按条件删除" key="6">
            <FormItem
              label="服务名"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('deleteByFiltersServiceName',{initialValue:deleteByFiltersServiceName})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="URL"
              help='根据条件进行删除'
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('deleteByFiltersServiceUrl',{initialValue:deleteByFiltersServiceUrl})
                (<Input addonBefore={DeleteByFiltersMethodType} style={{width:'100%'}} />)
              }
            </FormItem>
            <FormItem
              label="删除条件"
              help='使用${参数id}可以接收http参数作为条件SQL示例:id=1'
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('deleteByFiltersServiceContion',{initialValue:''})
                (<Input.TextArea placeholder="id='${id}' and b='test'" />)
              }
            </FormItem>
            <FormItem
              label="是否生成"
              {...formItemLayout4_16}
            >
              {
                getFieldDecorator('deleteByFiltersCreatFlag',{initialValue:'false'})
                ( <RadioGroup>
                  <Radio value='true'>是</Radio>
                  <Radio value='false'>否</Radio>
                </RadioGroup>)
              }
            </FormItem>
        </TabPane>
        :''}
        </Tabs>

        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
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
