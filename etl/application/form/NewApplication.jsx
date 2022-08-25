import React from 'react';
import { Form, Select, Input, Button, message,Spin,Upload,Icon,Row,Col,Radio,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';

//新建ETL应用

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const loadDataUrl=URI.ETL.APPLICATION.getById;
const saveDataUrl=URI.ETL.APPLICATION.save;
const listAppCategorysUrl=URI.CORE_CATEGORYNODE.listAllNodes+"?categoryId=ETLAppCategory&creatorOnly=1"

class form extends React.Component{
  constructor(props){
    super(props);
    this.userId=AjaxUtils.getUserId();
    this.categoryId=(this.props.categoryId=='*'||this.props.categoryId=='myapps'||this.props.categoryId==undefined)?'缺省分类':this.props.categoryId;
    this.id=this.props.id||'';
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    this.loadData(); //载入表单数据
  }

  loadData(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      //载入表单数据
      this.setState({mask:true});
      let url=loadDataUrl+"?id="+this.id;
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
    }
  }

  onSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
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
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                this.props.close(true);
                AjaxUtils.showInfo("应用成功保存!");
              }
          });
      }
    });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};
    let icon=this.state.formData.icon;

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form  >
        <Tabs size="large">
          <TabPane  tab="应用属性" key="props"  >
                <FormItem  label="所属分类"   {...formItemLayout4_16} help="请选择应用的所属分类,可以应用管理中定义分类"  >
                  {
                    getFieldDecorator('categoryId',{
                      rules: [{ required: true}],
                      initialValue:this.categoryId,
                    })
                    (<AjaxSelect valueId="nodeId" textId="nodeText" url={listAppCategorysUrl} />)
                  }
                </FormItem>
                <FormItem  label="应用名称"   {...formItemLayout4_16} help="任意可描述本应用功能或模块的名称" >
                  {
                    getFieldDecorator('applicationName', {
                      rules: [{ required: true, message: 'Please input the AppName!' }]
                    })
                    (<Input />)
                  }
                </FormItem>
                <FormItem  label="应用Id"   {...formItemLayout4_16}  help='应用Id必须唯一且不可修改,任意小写英文字母或数字组成' >
                  {
                    getFieldDecorator('applicationId',{rules: [{ required: true}]})
                    (<Input placeholder="应用唯一id" maxLength={15} disabled={this.id!==''}  />)
                  }
                </FormItem>
                <FormItem
                  label="版本"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                >{
                  getFieldDecorator('version',{initialValue:'1.0'})
                  (<Input  />)
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
              </TabPane>
              <TabPane  tab="权限设置" key="acl"  >
                <FormItem
                  label="应用创建者"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                  help='应用的创建者'
                >{
                    getFieldDecorator('creator',{rules: [{ required: false}],initialValue:this.userId})
                    (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
                  }
                </FormItem>
                <FormItem  label="开发权限"  labelCol={{ span: 4 }}   wrapperCol={{ span: 16 }} help='可以对应用的所有设计进行新增、修改、删除的用户，空表示所有登录用户' >
                  {
                    getFieldDecorator('designer',{initialValue:this.userId})
                    (<UserAsynTreeSelect options={{showSearch:true,multiple:true}} />)
                  }
                </FormItem>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
