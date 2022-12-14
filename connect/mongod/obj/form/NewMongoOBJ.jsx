import React from 'react';
import {  Form, Select, Input, Button, Alert,message,Spin,Radio,Row,Col,AutoComplete,Icon } from 'antd';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../../core/utils/FormUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import { connect } from 'echarts';
const listAllCollections = URI.CONNECT.MONGOD.listAllCollections
const listAllDbNames = URI.CONNECT.MONGOD.listAllDbNames
//Mongo obj
const loadDataUrl=URI.CONNECT.MONGOD.fullConfig;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const save = URI.CONNECT.MONGOD.save
const TreeMenuUrl = URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;
const dataSourceSelect = URI.CORE_DATASOURCE.select + "?configType=MongoDB";

class form extends React.Component {
  constructor(props) {
    super(props);
    this.id=this.props.id;
    this.appId = this.props.appId;
    this.objectId = this.props.objectId;
    this.categoryId = this.props.categoryId === 'all' ? '' : this.props.categoryId;
    this.categoryUrl = TreeMenuUrl + "?categoryId=mongo.mongoObjCategory&rootName=root";
    this.state = {
      dbNameList:[],
      collectionList: [],
      mask: false,
      formData: {},
    };
  }

  // componentDidMount() {
  //   if (this.props.id === '') { return; }
  //   let url = GetById + "?id=" + this.id;  
  //   this.setState({ mask: true });
  //   AjaxUtils.get(url, (data) => {
  //     this.setState({ mask: false });
  //     if (data.state === false) {
  //       AjaxUtils.showError(data.msg);
  //     } else {
  //       this.setState({ formData: data });
  //       FormUtils.setFormFieldValues(this.props.form, data);
  //     }
  //   });
  // }
  componentDidMount(){
    //console.log(this.props);
    console.log(this.id)
    if( this.id===undefined|| this.id===""){
        FormUtils.getSerialNumber(this.props.form,"objectId","MONGO","OBJ");
        this.setState({mask:false});
    }
    else{
      // let url=loadDataUrl.replace('{id}',id);
         let url = loadDataUrl + "/" + this.objectId;

      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.ShowError(data.msg);
          }else{
            if(data.keyId!=='' && data.keyId!==undefined){
              data.keyId=data.keyId.split(",");
            }
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }
  loadDatabaseDbName = () => {
    //??????????????????
    let dbConnId = this.props.form.getFieldValue("dbConnId");
    this.setState({ mask: true });
    AjaxUtils.post(listAllDbNames, { dbConnId: dbConnId }, (data) => {
      if (data.state === false) {
        this.setState({ mask: false });
        message.error("??????????????????,???????????????????????????????????????!");
      } else {
        AjaxUtils.showInfo("????????????????????????!");
        this.setState({ dbNameList: data.allMongoDbName, mask: false });
        this.props.form.setFieldsValue({ tableName: '' });
      }
    });
  }
  loadDatabaseCollection = () => {
    //??????????????????
    let dbConnId = this.props.form.getFieldValue("dbConnId");
    let dbName = this.props.form.getFieldValue("dbName");
    this.setState({ mask: true });
    AjaxUtils.post(listAllCollections, { dbName: dbName, dbConnId: dbConnId }, (data) => {
      if (data.state === false) {
        this.setState({ mask: false });
        message.error("??????????????????,???????????????????????????????????????!");
      } else {
        AjaxUtils.showInfo("????????????????????????!");
        this.setState({ collectionList: data, mask: false });
        this.props.form.setFieldsValue({ tableName: '' });
      }
    });
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {

          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let value=values[key];
                if(value instanceof Array){
                  postData[key]=value.join(","); //?????????????????????????????????
                }else{  
                  postData[key]=value;
                }
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData); 
          postData.dbType=this.dbType;
          this.setState({mask:true});
          AjaxUtils.post(save,postData,(data)=>{
              if(data.state===false){
                message.error(data.msg);
              }else{
                message.info("????????????!");
                this.props.closeTab();
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = { labelCol: { span: 4 }, wrapperCol: { span: 16 }, };
    let dbNameOptionsItem = [];
    if (this.state.dbNameList instanceof Array) {
      dbNameOptionsItem = this.state.dbNameList.map(item => <Option key={item}>{item}</Option>);
    }
    let collectionOptionsItem = [];
    if (this.state.collectionList instanceof Array) {
      collectionOptionsItem = this.state.collectionList.map(item => <Option key={item.tableName}>{item.tableName + '(' + item.tableType + ')'}</Option>);
    }
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
     
        <Form onSubmit={this.onSubmit} >
        <Alert
        message={this.id===undefined?"????????????":"????????????"}
                      description={ this.id===undefined?"???????????????????????????????????????????????????????????????":"?????????????????????????????????????????????????????????????????????????????????"}
                      type="info"
                      showIcon
                      closable
                    />
          <FormItem
            label="????????????"
            {...formItemLayout4_16}
            help='????????????????????????????????????'
          >
            {
              getFieldDecorator('categoryId',
                {
                  rules: [],
                  initialValue: this.categoryId
                }
              )
                (<TreeNodeSelect url={this.categoryUrl} options={{ multiple: false, dropdownStyle: { maxHeight: 400, overflow: 'auto' } }} />)
            }
          </FormItem>
          <FormItem
            label="????????????"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            hasFeedback
            help="???????????????????????????????????????????????????"
          >
            {
              getFieldDecorator('objectName', { rules: [{ required: true }] })
                (<Input />)
            }
          </FormItem>
          <FormItem
            label="??????????????????ID"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help="????????????Mongo???????????????ID???????????????"
          >
            {
              getFieldDecorator('objectId', {
                rules: [{ required: true }]
              })
                (<Input placeholder="????????????id"/>)
            }
          </FormItem>
          <FormItem
            label="?????????????????????"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
            help="????????????????????????Mongo?????????"
          >
            {
              getFieldDecorator('dbConnId', { rules: [{ required: true }], initialValue: 'default' })
                (<TreeNodeSelect url={dataSourceSelect} options={{ showSearch: true, multiple: false, allowClear: true, treeNodeFilterProp: 'label', searchPlaceholder: '?????????????????????' }} />)
            }
          </FormItem>
          <FormItem
            label="???????????????"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            help='????????????????????????????????????'
          >
            <Row gutter={1}>
              <Col span={12}>
                {
                  getFieldDecorator('dbName', {
                    rules: [{ required: true }],
                  })
                    (
                      <AutoComplete filterOption={true} placeholder='?????????????????????????????????' >
                        {dbNameOptionsItem}
                      </AutoComplete>
                    )
                }
              </Col>
              <Col span={12}>
                <Button onClick={this.loadDatabaseDbName}  >
                  <Icon type="search" />???????????????
              </Button>
              </Col>
            </Row>


          </FormItem>
          <FormItem
            label="??????????????????Collection"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            help='????????????????????????????????????'
          >
            <Row gutter={1}>
              <Col span={12}>
                {
                  getFieldDecorator('collName', {
                    rules: [{ required: true }],
                  })
                    (
                      <AutoComplete filterOption={true} placeholder='????????????????????????????????????Collection' >
                        {collectionOptionsItem}
                      </AutoComplete>
                    )
                }
              </Col>
              <Col span={12}>
                <Button onClick={this.loadDatabaseCollection}  >
                  <Icon type="search" />??????collection
              </Button>
              </Col>
            </Row>


          </FormItem>
          <FormItem
            label="??????"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 16 }}
          >
            {
              getFieldDecorator('remark', {
                 initialValue: ''
              })
                (<Input />)
            }
          </FormItem>
          <FormItem wrapperCol={{ span: 8, offset: 4 }}>
            <Button type="primary" onClick={this.onSubmit}  >??????</Button>{' '}
            <Button onClick={this.props.closeTab.bind(this, false)}  >??????</Button>
          </FormItem>

        </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
