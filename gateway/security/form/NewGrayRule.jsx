import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Radio,InputNumber,Tabs,Tooltip,Icon,Row,Col,Divider} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AjaxSelect from '../../../core/components/AjaxSelect';
import ListClusterServers from '../../../core/components/ListClusterServers';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import AceEditor from '../../../core/components/AceEditor';

//新增灰度发布规则

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_GATEWAY_SECURITY.save;
const loadDataUrl=URI.CORE_GATEWAY_SECURITY.getById;

class form extends React.Component{
  constructor(props){
    super(props);
    this.securityType=10;
    this.appId=this.props.appId;
    this.userId=AjaxUtils.getCookie("userId");
    this.dataDirection=this.props.dataDirection;
    this.state={
      mask:true,
      formData:{},
    };
  }

  componentDidMount(){
    //console.log(this.props);
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            if(data.dataUserId!==undefined && data.dataUserId!==null && data.dataUserId!==''){
              data.dataUserId=data.dataUserId.split(",");
            }
            this.setState({formData:data,mask:false});
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
                let v=values[key];
                if(v instanceof Array){v=v.join(",");}
                postData[key]=v;
              }
            }
          );

          postData=Object.assign({},this.state.formData,postData);
          postData.securityType=this.securityType;
          postData.dataDirection=this.dataDirection;
          if(postData.appId==undefined){
            postData.appId=this.appId;
          }
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo(data.msg);
              }else{
                AjaxUtils.showInfo("保存成功，可在规则前面的+号中设定作用范围!");
                this.props.close(true);
              }
          });
      }
    });
  }


        updateCode=(newCode)=>{
          let formData=this.state.formData;
          formData.filtersCode=newCode; //代码
        }

  inserDemo1=()=>{
          let code=`//返回true表示选择本规则中指定的版本api,false表示不匹配本规则
public boolean run(String requestUrl)throws Exception{
  String userId=AppContext.getUserId();
  return true;
}`;
          this.props.form.setFieldsValue({"filtersCode":code});
        }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 16 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <Tabs size="large">
          <TabPane  tab="规则基本属性" key="props"  >
            <FormItem
              label="规则名称"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='任意描述字符串'
            >
              {
                getFieldDecorator('configName',{rules: [{ required: true}]})
                (<Input />)
              }
            </FormItem>
            <FormItem
              label="指定版本号"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='如果本规则成立系统将选择与此版本号对应的API进行调用'
            >{
              getFieldDecorator('grayRuleVersion',{rules: [{ required: false}],initialValue:"2.0"})
              (<Input />)
            }
            </FormItem>
            <FormItem
              label="指定灰度用户"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='指定用户使用本规则中绑定的API版本(空表示针对所有用户)'
            >{
              getFieldDecorator('grayUserIds',{rules: [{ required: false}],initialValue:""})
              (<UserAsynTreeSelect options={{treeCheckable:true}} />)
              }
            </FormItem>
            <FormItem
              label="指定IP段"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='在此IP段内的IP将使用本规则的API版本,多个用逗号分隔(空表示所有IP)'
            >{
              getFieldDecorator('grayIPs')
              (<Input />)
            }
            </FormItem>
            <FormItem
              label="排序"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help='数字越小越先执行,如果检测不通过则不再检测后续规则'
            >{
              getFieldDecorator('sortNum',{rules: [{ required: true}],initialValue:100})
              (<InputNumber min={1} />)
              }
            </FormItem>
            <FormItem
              label="状态"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('state',{initialValue:"Y"})
              (            <RadioGroup>
                            <Radio value="Y">启用</Radio>
                            <Radio value="N">停用</Radio>
                          </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('remark')
              (<Input.TextArea  autosize />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="自定义规则" key="dataRule"   >
            <FormItem
              label="规则代码"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help={<span>请使用标准JAVA语法进行判断:<a style={{cursor:'pointer'}} onClick={this.inserDemo1}>代码示例</a></span>}
            >
              {getFieldDecorator('filtersCode')
                (<AceEditor mode='java' width='100%' height='400px'/>)
              }
            </FormItem>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit}  >
            提交
          </Button>
          {' '}
          <Button onClick={this.props.close.bind(this,false)}  >
            取消
          </Button>
        </FormItem>

      </Form>
      </Spin>
    );
  }
}

export default Form.create()(form);
