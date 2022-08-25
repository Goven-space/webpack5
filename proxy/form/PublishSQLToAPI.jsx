import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Tabs,Radio,Modal} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import TreeNodeSelect from '../../core/components/TreeNodeSelect';

//发布SQL为API服务

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.CORE_TCPIP_SQL.publish; //发布API
const ListAppServiceCategroyUrl=URI.CORE_APIPORTAL_APICATEGORY.ListTreeSelectDataUrl;
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";

class form extends React.Component{
  constructor(props){
    super(props);
    this.record=this.props.record;
    this.record.methodType="GET";
    this.record.mapUrl="/"+this.record.appId+"/";
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.record.appId+".ServiceCategory&rootName=API分类";
    this.state={
      mask:false,
      formData:this.record,
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
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showError(data.msg);
              }
              this.props.close(true);
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    const QueryMethodType = (
        getFieldDecorator('methodType',{ initialValue:this.record.methodType})
        (<Select style={{width:80}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
    );

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属应用"
          {...formItemLayout4_16}
        >
          {this.record.appId}
        </FormItem>
        <FormItem
          label="指定数据库链接"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          help="执行本SQL时所使用的数据库链接"
        >
          {
            getFieldDecorator('dbConnId',{initialValue:'default'})
            (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
          }
        </FormItem>
        <FormItem
          label="执行方法"
          help='请根据SQL中的insert,update,select选择相应的执行方法,注意:Hive不支持普通SQL分页'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('executeBeanMethodName',{initialValue:'selectList'})
            (<Select  >
                  <Option value="selectOne">selectOne(查询单条符合记录的数据)</Option>
                  <Option value="selectList">selectList(查询多条符合记录的数据)</Option>
                  <Option value="selectListByPage">selectListByPage(普通SQL使用游标分页,支持动态SQL分页)</Option>
                  <Option value="insert">insert(执行插入数据的SQL语句)</Option>
                  <Option value="update">update(执行更新数据的SQL语句)</Option>
                  <Option value="delete">delete(执行删除数据的SQL语句)</Option>
          </Select>)
          }
        </FormItem>
        <FormItem
          label="API分类"
          {...formItemLayout4_16}
          help='指定发布后本API所属的分类(可以在应用中的API分类中进行管理)'
        >
          {
            getFieldDecorator('categoryId',
              {
                rules: [{ required: false}],
                initialValue:this.categoryId
              }
            )
            (<TreeNodeSelect  url={this.appServiceCategroyUrl} options={{multiple:false,dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
          }
        </FormItem>
        <FormItem
          label="API名称"
          help='任意能描述本API的说明'
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('configName',{rules: [{ required: true}],initialValue:this.record.configName})
            (<Input />)
          }
        </FormItem>
        <FormItem
          label="API URL"
          help="注意:请指定一个API要发布的URL"
          {...formItemLayout4_16}
        >
          {
            getFieldDecorator('mapUrl',{rules: [{required: true}],initialValue:this.record.mapUrl})
            (<Input addonBefore={QueryMethodType} style={{width:'100%'}} />)
          }
        </FormItem>
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

export default Form.create()(form);
