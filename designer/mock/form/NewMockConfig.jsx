import React from 'react';
import { Form, Select, Input, Button,Spin,Radio,InputNumber,Tabs} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AppSelect from '../../../core/components/AppSelect';
import AjaxSelect from '../../../core/components/AjaxSelect';
import EditMockColumns from './../grid/EditMockColumns';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const submitUrl=URI.CORE_MOCK_MGR.save;
const loadDataUrl=URI.CORE_MOCK_MGR.getById;
const entryDataModelUrl=URI.CORE_DATAMODELS.selectDataModels.replace('{modelType}','E'); //实体模型列表
const entryDataModelColumnUrl=URI.CORE_DATAMODELS.selectColumnList;//载入实体模型的列配置

class form extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:true,
      formData:{columnConfig:[]},
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
            if(data.columnConfig!==undefined && data.columnConfig!=='' && data.columnConfig!==null){
              data.columnConfig=JSON.parse(data.columnConfig);
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
          this.setState({mask:true});
          AjaxUtils.post(submitUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showInfo("服务请求失败,请检查服务接口处于可用状态!");
              }else{
                AjaxUtils.showInfo("保存成功!");
                this.props.close(true);
              }
          });
      }
    });
  }

  columnChange=(data)=>{
    // console.log(data);
    this.state.formData.columnConfig=JSON.stringify(data);
  }

  loadEntryModelColumn=()=>{
    let url=entryDataModelColumnUrl.replace("{modelId}",this.props.form.getFieldValue("entryModelId"));
    // console.log(url);
    AjaxUtils.get(url,(data)=>{
      // console.log(data);
      let i=0;
      let newdata=data.map((item)=>{
        i++;
        let text=item.text;
        if(text.indexOf("|")!==-1){text=text.substring(text.indexOf("|")+1,text.length);}
        return {id:i,colId:item.value,colName:text};
      });
      this.state.formData.columnConfig=JSON.stringify(newdata);//设置到表单中去，保存时有用
      this.refs.editMockColumns.loadParentData(newdata); //调用子组件的方法
      // console.log(newdata);
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};

    return (
    <Spin spinning={this.state.mask} tip="Loading..." >
      <Form onSubmit={this.onSubmit} >
        <Tabs size="large"  style={{minHeight:'400px'}} >
          <TabPane  tab="基本属性" key="props"  >
              <FormItem
                label="所属应用"
                {...formItemLayout4_16}
                hasFeedback
                help='应用唯一id'
              >
                {
                  getFieldDecorator('appId', {
                    rules: [{ required: true, message: 'Please input the appId!' }],
                    initialValue:this.props.appId,
                  },)
                  (<AppSelect/>)
                }
              </FormItem>
              <FormItem
                label="配置名称"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                hasFeedback
                help="指定任何有意义的且能描述本配置的名称"
              >
                {
                  getFieldDecorator('configName', {
                    rules: [{ required: true, message: 'Please input the configName!' }]
                  })
                  (<Input placeholder="配置名称" />)
                }
              </FormItem>
              <FormItem
                label="生成模拟数据量"
                {...formItemLayout4_16}
                help='指定每次执行最大可生成的模拟数据量'
              >
                {
                  getFieldDecorator('maxDocNum', {
                    rules: [{ required: true}],
                    initialValue:'50',
                  })
                  (<InputNumber min={1} max={10000} />)
                }
              </FormItem>
              <FormItem
                label="绑定实体数据模型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                help='默认在模拟表中生成数据,绑定实体表后可直接在实体数据模型中生成模拟数据'
              >
                {
                  getFieldDecorator('entryModelId')
                  (<AjaxSelect url={entryDataModelUrl} onChange={this.changeEntryModel} options={{showSearch:true,combobox:true}} />)
                }
              </FormItem>
              <FormItem wrapperCol={{ span: 8, offset: 4 }}>
                <Button type="primary" onClick={this.onSubmit}  >
                  提交
                </Button>
                {' '}
                <Button onClick={this.props.close.bind(this,false)}  >
                  取消
                </Button>
              </FormItem>
        </TabPane>
          <TabPane  tab="模拟数据配置" key="columns"  >
              <EditMockColumns size='small' ref="editMockColumns" data={this.state.formData.columnConfig} onChange={this.columnChange} loadData={this.loadEntryModelColumn} />
              <div>固定字符串中使用#符号可以设置随机值(如:差#中#优#良),如果使用变量或者Class则表示带入变量或方法中的参数</div>
          </TabPane>
        </Tabs>


      </Form>
      </Spin>
    );
  }
}

const NewMockConfig = Form.create()(form);

export default NewMockConfig;
