import React from 'react';
import { Form, Select, Input, Button,Spin,notification,Icon,Switch,Checkbox,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const SubmitUrl=URI.CORE_DATAMODELS.saveModelSql;
const getModelTableSql=URI.CORE_DATAMODELS.getModelTableSql;

//生成数据模型的代码

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.modelId=this.props.modelId;
    this.state={
      mask:false,
      tableName:'',
      formData:[],
    };
  }

  componentDidMount(){
    this.loadData('N');
  }

  loadData=(reCreateFlag)=>{
      this.setState({mask:true});
      let url=getModelTableSql+"?modelId="+this.modelId+"&reCreateFlag="+reCreateFlag+"&type=2";
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showInfo(data.msg);
          }else{
            this.setState({formData:data,tableName:data.tableName,mask:false});
            FormUtils.setFormFieldValues(this.props.form,data);
          }
      });
  }

 //仅保存代码
  onSubmit = (action) => {
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
          postData.action=action;
          this.setState({mask:true});
          AjaxUtils.post(SubmitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError("保存失败!"+data.msg);
              }else{
                AjaxUtils.showInfo(data.msg);
              }
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <FormItem
          label="数据库表"
          {...formItemLayout4_16}
          style={{display:'none'}}
        >
        {this.state.tableName}
        </FormItem>
        <Tabs size="large">
          <TabPane  tab="建表SQL" key="tableSql"  >
              <FormItem
                label="SQL代码"
                {...formItemLayout4_16}
                help="生成创建数据库表的SQL语句"
              >{
                 getFieldDecorator('tableSql')
                 (<Input.TextArea autosize style={{minHeight:'350px'}} />)
                }
              </FormItem>
              <FormItem wrapperCol={{ span: 20, offset: 4 }}>
                <Button type="primary" onClick={this.onSubmit.bind(this,"save")}  >
                  仅保存
                </Button>
                {' '}
                <Button  onClick={this.onSubmit.bind(this,"execute")}  >
                  保存并立即执行
                </Button>
                {' '}
                <Button  onClick={this.loadData.bind(this,"Y")}  >
                  重新生成
                </Button>
                {' '}
                <Button onClick={this.props.close.bind(this,false)}  >
                  关闭
                </Button>
              </FormItem>
            </TabPane>
            <TabPane  tab="SelectSQL" key="selectSql"  >
                <FormItem
                  label="SQL代码"
                  {...formItemLayout4_16}
                  help="根据数据模型生成的Select语句"
                >{
                   getFieldDecorator('selectSql')
                   (<Input.TextArea autosize style={{minHeight:'350px'}} />)
                  }
                </FormItem>
              </TabPane>
              <TabPane  tab="InsertSQL" key="insertSql"  >
                  <FormItem
                    label="SQL代码"
                    {...formItemLayout4_16}
                    help="根据数据模型生成的Insert语句,可以直接在SQL配置管理中使用"
                  >{
                     getFieldDecorator('insertSql')
                     (<Input.TextArea autosize style={{minHeight:'350px'}} />)
                    }
                  </FormItem>
              </TabPane>
              <TabPane  tab="UpdateSQL" key="updateSql"  >
                  <FormItem
                    label="SQL代码"
                    {...formItemLayout4_16}
                    help="根据数据模型生成的Update语句,可以直接在SQL配置管理中使用"
                  >{
                     getFieldDecorator('updateSql')
                     (<Input.TextArea autosize style={{minHeight:'350px'}} />)
                    }
                  </FormItem>
              </TabPane>
              <TabPane  tab="DeleteSQL" key="deleteSql"  >
                  <FormItem
                    label="SQL代码"
                    {...formItemLayout4_16}
                    help="根据数据模型生成的delete语句,可以直接在SQL配置管理中使用"
                  >{
                     getFieldDecorator('deleteSql')
                     (<Input.TextArea autosize style={{minHeight:'350px'}} />)
                    }
                  </FormItem>
              </TabPane>
          </Tabs>
      </Form>
      </Spin>
    );
  }
}

const NewDataModelSql = Form.create()(form);

export default NewDataModelSql;
