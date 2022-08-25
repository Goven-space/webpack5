import { AutoComplete, Button, Form, Input, Modal, Radio, Select, Spin, Tag } from 'antd';
import React from 'react';
import AjaxSelect from '../../core/components/AjaxSelect';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as FormUtils from '../../core/utils/FormUtils';
import RolesSelect from '../../designer/components/FormComponents/RolesSelect';
import ServiceControlPlugsSelect from '../../designer/components/FormComponents/ServiceControlPlugsSelect';
import TagsSelect from '../../designer/components/FormComponents/TagsSelect';
import SelectServices from '../../designer/components/GridComponents/SelectServices';
import ServiceDependencyConfig from '../../designer/designer/form/ServiceDependencyConfig';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.NEW_SERVICE.save;
const loadDataUrl=URI.NEW_SERVICE.load;
const selectMockResponseUrl=URI.CORE_MOCK_RESPONSE.listAllSelect;
const ListAppServiceCategroyUrl=URI.CORE_APPSERVICECATEGORY.ListTreeSelectDataUrl;
const listAllGatewayAppUrl=URI.CORE_GATEWAY_APPCONFIG.listAll;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.appServiceCategroyUrl=ListAppServiceCategroyUrl+"?categoryId="+this.appId+".ServiceCategory&rootName=服务分类";
    this.categoryId=this.props.categoryId;
    this.state={
      mask:true,
      formData:{joinRestId:'[]'},
      mockDisplay:'none',
      visible:false,
      action:'',
      joinServiceItem:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        FormUtils.getSerialNumber(this.props.form,"configId",this.appId,"API");
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
          }else{
            if(data.effectiveUser!==undefined && data.effectiveUser!=='' && data.effectiveUser!==null){
              data.effectiveUser=data.effectiveUser.split(",");
            }else{
              data.effectiveUser=[];
            }
            if(data.joinRestId==='' || data.joinRestId===undefined || data.joinRestId===null ){
              data.joinRestId="[]";
            }
            if(data.tags!==undefined && data.tags!=='' && data.tags!==null){
              data.tags=data.tags.split(",").filter(v=>v!==''); //去掉空数组
            }else{
              data.tags=[];
            }
            if(data.categoryId!==undefined && data.categoryId!=='' && data.categoryId!==null){
              data.categoryId=data.categoryId.split(",").filter(v=>v!==''); //去掉空数组
            }else{
              data.categoryId=[];
            }
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
            if(data.modelId!==''){
              this.setState({filtersDisplay:''});
            }
            if(data.state==='4'){this.setState({mockDisplay:''});}
            if(data.scsPlugConfig!==undefined && data.scsPlugConfig!=="" && data.scsPlugConfig!==null ){
              this.refs.ServiceControlSel.setSelectedRows(JSON.parse(data.scsPlugConfig)); //设置服务控制策略
            }
          }
      });
    }
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          //console.log(values);
          //console.log(this.props.editRowData);
          let postData={};
          Object.keys(values).forEach(
            function(key){
              let v=values[key];
              if(v!==undefined){
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          postData.configType='JOIN'; //标记为聚合的服务地址
          postData.beanId='JoinServiceDispatcher';
          postData.beanMethodName='executeJoinServer';
          postData.scsPlugConfig=this.refs.ServiceControlSel.getSelectedRows();
          postData.appId=this.appId;
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              if(data.state===false){
                AjaxUtils.showError("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
                if(closeFlag===true){
                  this.props.closeTab();
                }
              }
          });
      }
    });
  }

  onServiceStateChange=(e)=>{
    let v=e.target.value;
    if(v==='4'){
      this.setState({mockDisplay:''});
    }else{
      this.setState({mockDisplay:'none'});
    }
  }

  //服务选择相关函数
  saveSelectedServices=(item)=>{
    if(this.state.action==='AddService'){
      //调用子窗口获取已经选中的行
      let selectedRows=this.refs.SelectServices.getSelectedRows();
      let joinRestJson=JSON.parse(this.state.formData.joinRestId);
      selectedRows.forEach((item)=>{
        if(!this.hadSelectedRow(joinRestJson,item)){
          joinRestJson.push({serviceId:item.id,url:item.mapUrl,method:item.methodType,prevServiceId:''});
        }
      });
      let formData=this.state.formData;
      formData.joinRestId=JSON.stringify(joinRestJson);
      this.setState({formData:formData,visible:false});
    }else{
      //保存服务依赖配置
      let formData=this.state.formData;
      let selectedItem=this.refs.ServiceDependencyConfig.getSelectedItem();
      let joinRestJson=JSON.parse(formData.joinRestId);
      joinRestJson=joinRestJson.map(item=>{
          if(item.serviceId===selectedItem.serviceId){
              return selectedItem;
          }else{
            return item;
          }
      });
      // console.log(joinRestJson);
      formData.joinRestId=JSON.stringify(joinRestJson);
      // console.log(formData);
      this.setState({formData:formData,visible:false});
    }
  }



  //看是否已经选中，如果已经选中不再加入
  hadSelectedRow=(selectedJoinRest,rows)=>{
    let r=false;
    selectedJoinRest.forEach((item)=>{
      if(item.serviceId===rows.id){
        r=true;
      }
    });
    return r;
  }
  onCloseTag=(id)=>{
    let joinRestJson=JSON.parse(this.state.formData.joinRestId);
    joinRestJson=joinRestJson.filter((item)=>{
      return item.serviceId!==id;
    });
    this.state.formData.joinRestId=JSON.stringify(joinRestJson);
  }
  joinServiceClick=(item)=>{
    // console.log(this.state.formData.joinRestId);
    // console.log(item.serviceId);
    let joinRestJson=JSON.parse(this.state.formData.joinRestId);
    let r=false;
    joinRestJson.forEach((selectedItem)=>{
        if(selectedItem.serviceId===item.serviceId){
          r=true;
        }
    });
    if(r===false){return;}
    this.setState({visible: true,joinServiceItem:item,action:"DependencyConfig"});
  }

  showModal=(action)=>{
    this.setState({visible: true,action:action});
  }
  closeModal=()=>{
      this.setState({visible: false,});
  }
  handleCancel=(e)=>{
      this.setState({visible: false,});
  }
  //服务选择结束

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    const selectMethod = (
        getFieldDecorator('methodType',{ initialValue:'GET'})
        (<Select style={{width:70}} >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
      </Select>)
      );

    let serviceTag;
    if(this.state.formData.joinRestId!=='[]'){
      let joinRestJson=JSON.parse(this.state.formData.joinRestId);
      let i=0;
      serviceTag=joinRestJson.map((item)=>{
        i++;
        return (
          <div key={item.serviceId}>
            <Tag  color='green' closable={true} onClick={this.joinServiceClick.bind(this,item)} onClose={this.onCloseTag.bind(this,item.serviceId)} >
            {i+"."+item.method+"->"+item.url+(item.prevServiceId===''?'':'(有依赖服务)')}
            </Tag>
          </div>
          );
      });
    }
    let modelForm;
    let modelTitle;
    let modelWidth;
    if(this.state.action==='AddService'){
      modelTitle="添加服务资源";
      modelWidth='850px';
      modelForm=<SelectServices ref='SelectServices' appId={this.appId}  closeModal={this.closeModal} />;
    }else{
      modelTitle="服务依赖配置";
      modelWidth='550px';
      modelForm=<ServiceDependencyConfig ref='ServiceDependencyConfig' joinServiceItem={this.state.joinServiceItem}  allService={JSON.parse(this.state.formData.joinRestId)} closeModal={this.closeModal} />;
    }

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >

        <Modal key={Math.random()} title={modelTitle} maskClosable={false}
            width={modelWidth}
            style={{ top: 20 }}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onOk={this.saveSelectedServices}
            cancelText='关闭'
            okText='确定'
            >
            {modelForm}
        </Modal>

      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="所属网关应用"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='选择本API所属的网关应用'
        >
          {
            getFieldDecorator('gatewayAppId',{rules: [{ required: true}]})
            (<AjaxSelect url={listAllGatewayAppUrl}  valueId='gatewayAppId' textId='gatewayAppName' options={{showSearch:true}} />)
          }
        </FormItem>
        <FormItem
          label="服务说明"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="指定任何有意义的且能描述本服务的名称"
        >
          {
            getFieldDecorator('configName', {
              rules: [{ required: true, message: 'Please input the configName!' }]
            })
            (<Input placeholder="配置名称" />)
          }
        </FormItem>
        <FormItem
          label="服务URL"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='尽量符合Restful风格,{变量}为Path参数,/rest/目录为必须'
        >
          {
            getFieldDecorator('mapUrl', {
              rules: [{ required: true, message: 'Please input the service url!' }],
              initialValue:'/rest/'+this.props.appId+'/',
            })
            (<Input addonBefore={selectMethod}  style={{width:'100%'}} />)
          }
        </FormItem>
        <FormItem
          label="服务Id"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          hasFeedback
          help="建议配置唯一Id作为前端Ajax调用的常量"
        >
          {
            getFieldDecorator('configId')
            (<Input placeholder="服务Id" />)
          }
        </FormItem>
        <FormItem
          label="API版本"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="注册API的版本,在header中传入version可以调用指定版本API"
        >
          {
            getFieldDecorator('version',{initialValue:'1.0'})
            (<Input placeholder="API版本" />)
          }
        </FormItem>
        <FormItem
          label="要聚合的服务"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='所有被聚合的服务必须返回Json字符串,RequestMethod应尽量保持一至,服务应配置唯一configId,点击已经添加的服务可以设置依赖关系(没有依赖时服务执行顺序为从上至下)'
        >{
          (
          <div>{serviceTag}
          <Button type="primary"  onClick={this.showModal.bind(this,'AddService')} size="small" >添加服务</Button></div>
          )
        }
        </FormItem>
        <FormItem
          label="Produces ContentType"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定服务返回的数据类型"
        >{
          getFieldDecorator('produces',{initialValue:'application/json;charset=utf-8'})
          (<AutoComplete   >
              <Option value="*">透传注册服务的ContentType</Option>
              <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
              <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
              <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
              <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
              <Option value="application/x-msdownload;charset=utf-8">application/x-msdownload;charset=utf-8</Option>
            </AutoComplete>
          )}
        </FormItem>
        <FormItem
          label="Consumes ContentType"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help="指定传入参数的数据类型,如果有文件上传时请选择multipart/form-data"
        >{
          getFieldDecorator('consumes',{initialValue:'*'})
          (<AutoComplete >
              <Option value="">不限定</Option>
              <Option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</Option>
              <Option value="multipart/form-data">multipart/form-data</Option>
              <Option value="application/octet-stream">application/octet-stream</Option>
              <Option value="text/json;charset=utf-8">text/json;charset=utf-8</Option>
              <Option value="text/plain;charset=utf-8">text/plain;charset=utf-8</Option>
              <Option value="text/html;charset=utf-8">text/html;charset=utf-8</Option>
              <Option value="application/json;charset=utf-8">application/json;charset=utf-8</Option>
            </AutoComplete>
          )}
        </FormItem>
        <FormItem label="参数类型" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='调用本服务时参数传入的可选类型'
        >
          {getFieldDecorator('requestBodyFlag',{initialValue:false})
          (
            <RadioGroup>
              <Radio value={false}>键值对参数</Radio>
              <Radio value={true}>RequestBody字符串参数</Radio>
            </RadioGroup>
          )}
        </FormItem>

        <FormItem label="日记策略" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator('logType',{initialValue:1})
          (
            <Select>
              <Option value={1}>调用次数及请求地址记录(默认模式)</Option>
              <Option value={2}>记录全部输入输出数据(适用于错误追踪)</Option>
              <Option value={0}>不记录(并发量大的服务稳定后可不监控)</Option>
            </Select>
          )}
        </FormItem>

        <FormItem label="事务支持" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='只有关系数据库才支持事务功能'
        >
          {getFieldDecorator('transaction',{initialValue:"N"})
          (
            <RadioGroup>
              <Radio value="N">否</Radio>
              <Radio value="Y">是</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="认证方式"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='需要认证表示用户登录后如果有权则可调用,需要审批表示用户必须申请了API的调用权限才可以,匿名调用表示无需登录直接调用'
        >{getFieldDecorator('authType',{initialValue:1})
          (
            <RadioGroup>
              <Radio value={1}>需要认证</Radio>
              <Radio value={2}>需要审批</Radio>
              <Radio value={0}>匿名调用</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem label="状态" labelCol={{ span: 4 }} wrapperCol={{ span: 8 }} >
          {getFieldDecorator('state', {initialValue:'1'})
          (
            <RadioGroup onChange={this.onServiceStateChange}>
              <Radio value='1'>启用</Radio>
              <Radio value='2'>调试</Radio>
              <Radio value='3'>停止</Radio>
              <Radio value='4'>模拟</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="绑定模拟配置"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          style={{display:this.state.mockDisplay}}
        >{
          getFieldDecorator('mockResponseConfigId')
          (<AjaxSelect url={selectMockResponseUrl} style={{ width: '30%' }}  options={{showSearch:true}} />)
        }
        </FormItem>
        <FormItem label="同步调用模式" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}
          help='设置本服务是否为同步调用模式(默认为同步模式),异步模式时调用本服务的所有请求将会自动加入队列中'
        >
          {getFieldDecorator('syncFlag',{initialValue:true})
          (
            <RadioGroup>
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          label="服务控制策略"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          <ServiceControlPlugsSelect ref='ServiceControlSel' />
          }
        </FormItem>
        <FormItem
          label="标签"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          help='通过标签可以让不同应用的服务聚合到相同的标签或功能点上'
        >
          {
            getFieldDecorator('tags')
            (<TagsSelect appId={this.appId}  />)
          }
        </FormItem>
        <FormItem
          label="发布范围"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('effectiveUser')
          (<RolesSelect options={{showSearch:true,mode:'multiple'}} />)
        }
        </FormItem>
        <FormItem
          label="备注"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
        >{
          getFieldDecorator('remark')
          (<Input.TextArea autosize />)
          }
        </FormItem>

        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
            保存并关闭
          </Button>
          {' '}
          <Button onClick={this.onSubmit}  >
            保存
          </Button>
          {' '}
          <Button  onClick={this.props.closeTab.bind(this,false)}  >
            关闭
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

const NewJoinService = Form.create()(form);

export default NewJoinService;
