import React from 'react';
import { Form, Select, Input, Button, Modal,message,Spin,Radio,Row,Col,Tooltip,Tabs,Popover} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import PermissionSelect from '../../../core/components/PermissionSelect';
//业务模型中列的事件配置

const FormItem = Form.Item;
const Option = Select.Option;
const columnGetByIdUrl=URI.CORE_DATAMODELS.columnGetById;
const saveDataUrl=URI.CORE_DATAMODELS.columnSaveById;
const TabPane = Tabs.TabPane;

class form extends React.Component{
  constructor(props){
    super(props);
    this.id=this.props.id;
    this.loadDataUrl=columnGetByIdUrl.replace("{id}",this.id);
    this.state={
      mask:true,
      formData:{},
      saveButtonDisplay:'',
    };
  }

  componentDidMount(){
    if((this.id+" ")<10){
      AjaxUtils.showError("当前列还有没有保存，不能定义事件!");
      this.setState({mask:false,saveButtonDisplay:'none'});
    }else{
      AjaxUtils.get(this.loadDataUrl,(data)=>{
          this.setState({mask:false});
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false,saveButtonDisplay:''});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach(
            function(key){
              if(values[key]!==undefined){
                let value=values[key];
                if(value instanceof Array){
                  postData[key]=value.join(","); //数组要转换为字符串提交
                }else{
                  postData[key]=value;
                }
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              if(data.state==='false'){
                this.showInfo(data.msg);
              }else{
                this.setState({mask:false});
                AjaxUtils.showInfo("保存成功!");
              }
          });
      }
    });
  }

  insertLoadEventCode=(type=1)=>{
      let code="";
      if(type===1){
        code=`//使用RdbDataModelUtil获取关联数据模型的数据
var sqlWhere="a='"+doc.getString("a")+"'";
var docs=RdbDataModelUtil.listBySqlWhere("Hello.DataModel",sqlWhere);
if(docs.size()>0){
    doc.put(fieldId,docs);
}`
}else if(type===2){
          code=`//使用RdbUtil工具类跨数据源读取数据列表,fieldId表示当前字段的Id,doc表示当前记录行的数据集
var id=DocumentUtil.getString(doc,fieldId);//获取当前字段的值,也可以指定其他字段Id
var sql="select * from table where id="+id;
var docs=RdbUtil.listDocs(RdbUtil.getConnection("数据源Id"),sql); //从另一个数据源中读取多条符合条件的数据
doc.put(fieldId,docs);`;
}else if(type===3){
          code=`//使用RdbUtil工具类跨数据源读取字段数据,oracle所有字段为大写,fieldId表示当前字段的Id,doc表示当前记录行的数据集
var userId=DocumentUtil.getString(doc,fieldId); //读取当前字段的值
var sql="select USERNAME from table where userId='"+userId+"'"; //组成sql语句
var xdoc=RdbUtil.getDoc(RdbUtil.getConnection("数据源Id"),sql); //去另一个数据源中执行sql并获取userName值
if(xdoc!=null){
  doc.put(fieldId,DocumentUtil.getString(xdoc,"USERNAME"));
}else{
  doc.put(fieldId,"用户不存在");
}`
}
      this.props.form.setFieldsValue({loadEventCode:code});
  }

  insertSaveEventCode=(type=1)=>{
      let code="";
      if(type===1){
        code=`//使用RdbDataModelUtil持久化到其他数据模型中去
var docs=doc.get(fieldId); //获取字段中的数据
if(docs!=null){
  RdbDataModelUtil.save("Hello.DataModel数据模型Id",docs);
}`
      }else{
          code=`//使用RdbUtil持久化字段中的数据到其他数据源中
var docs=doc.get(fieldId);//获取字段中的数据要是List<Document>对象
if(docs!=null){
  RdbUtil.saveDocs(RdbUtil.getConnection("数据源id"),"tableName",docs,"keyId主键"); //把数据保存到另一个数据源中
}`
      }
      this.props.form.setFieldsValue({saveEventCode:code});
  }

  insertDeleteEventCode=(type=1)=>{
      let code="";
      if(type===1){
        code=`//使用RdbDataModelUtil删除其他数据模型中的数据
var docs=doc.get(fieldId);
if(docs!=null){
  RdbDataModelUtil.delete("Hello.DataModel",docs);
}`
      }else{
          code=`//使用RdbUtil删除其他数据库表中的数据
var sql="delete from tableName where id=?";
RdbUtil.executeDeleteSql(RdbUtil.getConnection("数据源Id"),sql,doc.getString("id"));`
      }
      this.props.form.setFieldsValue({deleteEventCode:code});
  }

  insertLoadRestClientCode=()=>{
      let code=`//使用RestClient调用API聚合数据
var url="http://localhost:8080/restcloud/rest/users";
var userdoc=RestClient.getInstance().setUrl(url).get().getDocument();
doc.put(fieldId,userdoc);`;
      this.props.form.setFieldsValue({loadEventCode:code});
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
        <Form onSubmit={this.onSubmit} >
          <FormItem label='绑定权限' labelCol={{ span: 4 }}  wrapperCol={{ span: 18 }} help='绑定权限后只有此权限的用户才会输出此字段数据,没有权限的用户将隐藏' >
          {
            getFieldDecorator('permissionIds')
            (<PermissionSelect options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}}  />)
          }
          </FormItem>
          <FormItem
            label="初始化事件"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            help={<div><Tooltip title="fieldId为自动计算的字段名,示例:doc.put(fieldId,AppContext.getUserId())如果有别名设置值时以别名优先,
            可使用RdbUtil,RdbMapperUtil,RdbDataModelUtil,RestClient获取关联的数据"
              ><a >查看帮助</a></Tooltip> &nbsp;
               <a onClick={this.insertLoadEventCode.bind(this,1)}>示例代码1</a>&nbsp;
               <a onClick={this.insertLoadEventCode.bind(this,2)}>示例代码2</a>&nbsp;
               <a onClick={this.insertLoadEventCode.bind(this,3)}>示例代码3</a>
              </div>}
          >{
            getFieldDecorator('loadEventCode')
            (<Input.TextArea autosize={{ minRows: 2, maxRows: 16 }} />)
            }
          </FormItem>
          <FormItem
            label="持久化事件"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            help={<div><Tooltip
              title='可使用工具类RdbUtil,RdbMapperUtil,RdbDataModelUtil对数据进行关联持久化'
              ><a >查看帮助</a></Tooltip>  <a onClick={this.insertSaveEventCode.bind(this,1)}>示例代码1</a> <a onClick={this.insertSaveEventCode.bind(this,2)}>示例代码2</a> </div>}
          >{
            getFieldDecorator('saveEventCode')
            (<Input.TextArea autosize={{ minRows: 2, maxRows: 16 }} />)
            }
          </FormItem>
          <FormItem
            label="删除事件"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            help={<div><Tooltip
              title='可使用工具类RdbUtil,RdbMapperUtil,RdbDataModelUtil对数据进行关联删除'
              ><a >查看帮助</a></Tooltip>  <a onClick={this.insertDeleteEventCode.bind(this,1)}>示例代码1</a> <a onClick={this.insertDeleteEventCode.bind(this,2)}>示例代码2</a> </div>}
          >{
            getFieldDecorator('deleteEventCode')
            (<Input.TextArea autosize={{ minRows: 2, maxRows: 16 }} />)
            }
          </FormItem>
        <FormItem wrapperCol={{ span: 8, offset:4 }} style={{display:this.state.saveButtonDisplay}}>
          <Button type="primary"  onClick={this.onSubmit.bind(this,false)}  >
            保存配置
          </Button>
        </FormItem>
       </Form>
      </Spin>
    );
  }
}

const FormColumnEventCode = Form.create()(form);

export default FormColumnEventCode;
