import React from 'react';
import { Form, InputNumber, Input, Button, message,Spin,TreeSelect,Select,Radio,Checkbox,Row,Col,Tabs,Divider,AutoComplete,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';
import AceEditor from '../../../core/components/AceEditor';
import TreeNodeSelect from '../../../core/components/TreeNodeSelect';
import AjaxEditSelect from '../../../core/components/AjaxEditSelect';
import FieldCaseWhenConfig from './FieldCaseWhenConfig';
import DataMappingTest from './DataMappingTest';


const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

const loadDataUrl=URI.ESB.DATAMAPPING_ITEM.getById;
const saveDataUrl=URI.ESB.DATAMAPPING_ITEM.save;
const jsontPathUrl=URI.ESB.DATAMAPPING_ITEM.inputJsonPaths;
const treeUrl=URI.ESB.DATAMAPPING_ITEM.tree;
const dataSourceSelect=URI.CORE_DATASOURCE.select+"?configType=RDB,Driver";
const listAllTables=URI.CORE_DATAMODELS.listAllTables;
const getSqlCodeUrl=URI.CORE_SQLCONFIG.generatingSqlCode;

class form extends React.Component{
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.id=this.props.id;
    this.dbType="R";
    this.parentId=this.props.parentId;
    this.categoryId=this.props.categoryId;
    this.treeNodeSelctUrl=treeUrl+"?categoryId="+this.categoryId;
    this.jsontPathUrl=jsontPathUrl+"?categoryId="+this.categoryId;
    this.currentCategoryRecord=this.props.currentCategoryRecord;
    this.state={
      mask:false,
      formData:{},
    };
  }

  componentDidMount(){
    this.loadFormData();
  }

  //载入表单数据
  loadFormData=()=>{
    let id=this.id;
    if(id===undefined || id===''){
        this.state.formData.configName=this.currentCategoryRecord.configName;
        this.state.formData.inputJson=this.currentCategoryRecord.inputJson;
        this.state.formData.categoryId=this.currentCategoryRecord.categoryId;
        this.props.form.setFieldsValue({parentId:this.parentId||'root'});
    }else{
        let url=loadDataUrl+"?id="+id+"&categoryId="+this.categoryId;
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

  onSubmit = (closeFlag) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
          let postData={};
          Object.keys(values).forEach((key)=>{
              if(values[key]!==undefined){
                let value=values[key];
                if(value instanceof Array){
                  let value=this.props.form.getFieldValue(key);
                  postData[key]=value.join(","); //数组要转换为字符串提交
                }else{
                  //普通字符串
                  postData[key]=value;
                }
              }
            }
          );
          postData=Object.assign({},this.state.formData,postData);
          postData.categoryId=this.categoryId;
          postData.appId=this.appId;
          postData.applicationId=this.applicationId;
          if(closeFlag==false && (postData.id=='' || postData.id==undefined)){
            postData.id=AjaxUtils.getId(22);
            this.state.formData.id=postData.id;
          }
          this.setState({mask:true});
          AjaxUtils.post(saveDataUrl,postData,(data)=>{
              this.setState({mask:false});
              if(data.state===false){
                AjaxUtils.showError(data.msg);
              }else{
                if(closeFlag){
                  this.props.closeModal(true);
                }else{
                  AjaxUtils.showInfo("保存成功!");
                }
              }
          });
      }
    });
  }

inserDemo1=()=>{
    let code=`//responseDoc为api输出结果map对像,resultDoc为已计算的结果map,fieldId为当前字段的id
public Object run(Document responseDoc,Document resultDoc,String fieldId){
  String fdValue=responseDoc.getString(fieldId);
  return fdValue;
}`;
    this.props.form.setFieldsValue({"eventCode":code});
  }

  inserDemo2=()=>{
      let code=`//responseDoc为api输出结果map对像,resultDoc为已计算的结果map,fieldId为当前字段的id
public Object run(Document responseDoc,Document resultDoc,String fieldId){
  Document doc=new Document();
  doc.put("field1","字段值1");
  doc.put("field2","字段值2");
  return doc;
}`;
this.props.form.setFieldsValue({"eventCode":code});
    }

  inserDemo3=()=>{
      let code=`//responseDoc为api输出结果map对像,resultDoc为已计算的结果map,fieldId为当前字段的id
  public Object run(Document responseDoc,Document resultDoc,String fieldId){
    String sql="select * from table where id=1";
    Document doc=RdbUtil.getDoc(RdbUtil.getConnection("数据源id"),sql);
    return doc;
  }`;
    this.props.form.setFieldsValue({"eventCode":code});
    }

    loadDatabaseTable=()=>{
      //载入数据库表
      let dbName="SYSDB";
      let dbConnId=this.props.form.getFieldValue("fieldBandingDbConnId");
      this.setState({mask:true});
      AjaxUtils.post(listAllTables,{dbName:dbName,dbType:this.dbType,dbConnId:dbConnId},(data)=>{
            if(data.state===false){
              this.setState({mask:false});
              message.error(data.msg);
            }else{
              AjaxUtils.showInfo("数据库表载入成功!");
              this.setState({tableList:data,mask:false});
              this.props.form.setFieldsValue({tableName:''});
            }
      });
    }

    createSelectSql=()=>{
      let dbConnId=this.props.form.getFieldValue("fieldBandingDbConnId");
      let tableName=this.props.form.getFieldValue("tableName");
      let url=getSqlCodeUrl+"?dbConnId="+dbConnId+"&tableName="+tableName+"&codeType=select";
      this.setState({mask:true});
      AjaxUtils.get(url,(data)=>{
            this.setState({mask:false});
            if(data.state===false){
              AjaxUtils.showError(data.msg);
            }else{
              AjaxUtils.showInfo("SQL生成成功!");
              this.props.form.setFieldsValue({fieldBandingSqlCode:data.select});
            }
      });
    }


  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout4_16 = {labelCol: { span: 4 },wrapperCol: { span: 18 },};
    const dataFromType=this.props.form.getFieldValue("fieldDataFromType");
    const fieldType=this.props.form.getFieldValue("fieldType");
    const fieldDefaultType=this.props.form.getFieldValue("fieldDefaultType");
    const fieldComputeType=this.props.form.getFieldValue("fieldComputeType");
    const objectDataFromType=this.props.form.getFieldValue("objectDataFromType");
    const arrayDataFromType=this.props.form.getFieldValue("arrayDataFromType");

    //控制js脚本显示
    let jsCodeDisplay="none";
    if(fieldType=='object' && objectDataFromType==6){jsCodeDisplay='';}
    else if(fieldType=='array' && arrayDataFromType==6){jsCodeDisplay='';}
    else if(fieldType!='object' && fieldType!='array' && dataFromType==6){jsCodeDisplay='';}

    //控制sql脚本显示
    let sqlCodeDisplay="none";
    if(fieldType=='object' && objectDataFromType==4){sqlCodeDisplay='';}
    else if(fieldType=='array' && arrayDataFromType==4){sqlCodeDisplay='';}
    else if(fieldType!='object' && fieldType!='array' && dataFromType==4){sqlCodeDisplay='';}

    //数据库表列表
    let tableOptionsItem =[];
    if(this.state.tableList instanceof Array){
     tableOptionsItem=this.state.tableList.map(item => <Option key={item.tableName}>{item.tableName+'('+item.tableType+')'}</Option>);
    }

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <Form>
        <Tabs size="large">
          <TabPane  tab="字段属性" key="props"  >
            <FormItem key='parentId'  label="上级对象" {...formItemLayout4_16} hasFeedback>
            {
              getFieldDecorator('parentId',{rules: [{ required: true}]})
              (<TreeNodeSelect url={this.treeNodeSelctUrl} labelId='fieldName' valueId='id'  options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' }}} />)
            }
            </FormItem>
            <FormItem
              label="字段Id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              hasFeedback
              help="唯一Id不允许重复"
            >
              {
                getFieldDecorator('fieldId', {
                  rules: [{ required: true}]
                })
                (<Input  placeholder="字段Id" />)
              }
            </FormItem>
            <FormItem
              label="字段说明"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              hasFeedback
              help="指定任何有意义的名称"
            >
              {
                getFieldDecorator('fieldName', {
                  rules: [{ required: false}]
                })
                (<Input placeholder="字段说明" />)
              }
            </FormItem>
            <FormItem
              label="字段类型"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('fieldType',{rules: [{ required: true}],initialValue:"string"})
              (<Select  >
                <Option value='string'>字符串[string]</Option>
                <Option value='object'>JSON对像[object]</Option>
                <Option value='array'>JSON数组[array]</Option>
                <Option value='arrayString'>字符串数组[arrayString]</Option>
                <Option value='arrayNumber'>数字数组[arrayNumber]</Option>
                <Option value='datetime'>日期[datetime]</Option>
                <Option value='int'>整数[int]</Option>
                <Option value='long'>长整数[long]</Option>
                <Option value='double'>双精度[double]</Option>
                <Option value='float'>浮点数[float]</Option>
                <Option value='boolean'>布尔[boolean]</Option>
                <Option value='number'>数字[number]</Option>
              </Select>)
              }
            </FormItem>
            <FormItem
              label="时间格式"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:this.props.form.getFieldValue("fieldType")==='datetime'?'':'none'}}
            >{
              getFieldDecorator('datetimeFormat',{rules: [{ required: false}],initialValue:"yyyy-MM-dd HH:mm:ss"})
              (<Input  />)
              }
            </FormItem>
            <FormItem
              label="数组类型"
              help='动态行表示由源数据字段循环转换而来,固定行表示固定追加到第几行(一般用来汇总或行数相对固定)'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:fieldType==='array'?'':'none'}}
            >{
              getFieldDecorator('arrayType',{rules: [{ required: false}],initialValue:"rowsDynamic"})
              (<RadioGroup  >
                <Radio value='rowsDynamic'>动态行</Radio>
                <Radio value='rowsNumber'>固定行</Radio>
              </RadioGroup>)
              }
            </FormItem>
            <FormItem
              label="固定行数"
              help='0表示第一行,-1表示最后一行'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:fieldType==='array' && this.props.form.getFieldValue("arrayType")==='rowsNumber' ?'':'none'}}
            >{
              getFieldDecorator('arrayRowsIndex',{rules: [{ required: true}],initialValue:0})
              (<InputNumber min={-1} />)
              }
            </FormItem>
            <FormItem
              label="加解密"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              style={{display:(fieldType==='array'||fieldType==='object')?'none':''}}
            >{
              getFieldDecorator('valueSecretType',{rules: [{ required: true}],initialValue:"NO"})
              (<Select  >
                <Option value='NO'>不处理</Option>
                <Option value='DES'>DES加密</Option>
                <Option value='UNDES'>DES解密</Option>
                <Option value='AES'>AES加密</Option>
                <Option value='UNAES'>AES解密</Option>
                <Option value='BASE64'>BASE64编码</Option>
                <Option value='UNBASE64'>BASE64解码</Option>
              </Select>)
              }
            </FormItem>
            <FormItem
              label="排序"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
            >{
              getFieldDecorator('sortNum',{rules: [{ required: true}],initialValue:"1001"})
              (<InputNumber min={1001} />)
              }
            </FormItem>
            <FormItem
              label="备注"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
            >
              {
                getFieldDecorator('remark')
                (<Input  />)
              }
            </FormItem>
          </TabPane>
          <TabPane  tab="字段值来源" key="dataFrom"  >
            <div  style={{display:(fieldType!=='array' && fieldType!=='object')?'':'none'}} >
              <FormItem
                label="字段数据来源"
                help='指定本字段值的来源,如果是输出映射表示来自API的结果，如果是输入表示来自API的输入参数'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('fieldDataFromType',{rules: [{ required: false}],initialValue:1})
                (<Select  >
                  <Option value={1}>上一节点的输出</Option>
                  <Option value={0}>固定字符值</Option>
                  <Option value={2}>汇总计算(对数组中的数据行字段进行运算)</Option>
                  <Option value={4}>执行SQL获取外部数据</Option>
                  <Option value={5}>当前时间</Option>
                  <Option value={6}>绑定Java脚本</Option>
                </Select>)
                }
              </FormItem>
              <FormItem
                label="固定值"
                help='设置一个固定值给字段'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:dataFromType===0?'':'none'}}
              >{
                getFieldDecorator('constantValue',{rules: [{ required: false}],initialValue:""})
                (<Input  />)
                }
              </FormItem>
              <FormItem
                label="指定来源字段的Id"
                help='指定本字段来自于API输出/输入中的某一个字段Id,支持使用JsonPath指定层次如:$.data.userid,如果是数组的子字段则直接$.字段id即可,在数组中0-N表示指定行,*号表示所有行,x表示当前行'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:dataFromType===1?'':'none'}}
              >{
                getFieldDecorator('fieldJsonPathId',{rules: [{ required: false}],initialValue:""})
                (<AjaxEditSelect url={this.jsontPathUrl}  />)
                }
              </FormItem>
              <FormItem
                label="当输入字段不存在时"
                help='当输入字段不存在时的赋值方式'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:dataFromType===1?'':'none'}}
              >{
                getFieldDecorator('fieldDefaultType',{rules: [{ required: false}],initialValue:0})
                (<RadioGroup  >
                  <Radio value={0}>赋值为空字符串</Radio>
                  <Radio value={1}>给null值</Radio>
                  <Radio value={2}>删除本字段</Radio>
                  <Radio value={3}>给一个缺省值</Radio>
                </RadioGroup>)
                }
              </FormItem>
              <FormItem
                label="缺省值"
                help='当输入字段不存在时的缺省值'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:fieldDefaultType===3?'':'none'}}
              >{
                getFieldDecorator('fieldDefaultValue',{rules: [{ required: false}],initialValue:""})
                (<Input  />)
                }
              </FormItem>
              <FormItem
                label="汇总类型"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:dataFromType===2?'':'none'}}
              >{
                getFieldDecorator('fieldComputeType',{rules: [{ required: false}],initialValue:"sum"})
                (<Select  >
                  <Option value='sum'>求和</Option>
                  <Option value='avg'>平均值</Option>
                  <Option value='count'>记录数</Option>
                  <Option value='min'>最小值</Option>
                  <Option value='max'>最大值</Option>
                </Select>)
                }
              </FormItem>
              <FormItem
                label="汇总字段"
                help='对数组中的字段值进行汇总计算，同级字段汇总只需指定字段Id即可，对其他层级字段汇总可用jsonpath指定字段如:$.data.age'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:dataFromType===2?'':'none'}}
              >{
                getFieldDecorator('fieldComputeFieldId',{rules: [{ required: false}],initialValue:""})
                (<AjaxEditSelect url={this.jsontPathUrl}  />)
                }
              </FormItem>
              <FormItem
                label="保留小数位"
                help='求和及平均值后保留的小数位数,0表示不保留'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:(dataFromType===2 && (fieldComputeType==='sum' || fieldComputeType==='avg'))?'':'none'}}
              >{
                getFieldDecorator('fieldDecimalFormat',{rules: [{ required: false}],initialValue:2})
                (<InputNumber min={0} />)
                }
              </FormItem>
            </div>


            <div style={{display:(fieldType=='object')?'':'none'}}  >
              <FormItem
                label="对像数据来源"
                help='指定本对像值的来源,如果是输出映射表示来自API的结果，如果是输入表示来自API的输入参数'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('objectDataFromType',{rules: [{ required: false}],initialValue:1})
                (<Select  >
                  <Option value={1}>上一节点的输出</Option>
                  <Option value={4}>从SQL返回一行数据(不再计算子字段)</Option>
                  <Option value={6}>绑定Java脚本生成对像(不再计算子字段)</Option>
                </Select>)
                }
              </FormItem>
              <FormItem
                label="指定来源字段Id"
                help='指定API输出或输入字段,可使用JsonPath取值:$.data,空表示取与本字段Id同名的字段值'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:(objectDataFromType==1)?'':'none'}}
              >{
                getFieldDecorator('objectJsonPathId',{rules: [{ required: false}],initialValue:""})
                (<AjaxEditSelect url={this.jsontPathUrl}  />)
                }
              </FormItem>
              <FormItem
                label="当输入字段不存在时"
                help='当输入字段不存在时赋值方式'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:(objectDataFromType==1)?'':'none'}}
              >{
                getFieldDecorator('objectDefaultType',{rules: [{ required: false}],initialValue:1})
                (<RadioGroup  >
                  <Radio value={1}>计算子字段</Radio>
                  <Radio value={3}>直接赋值为空对象{}</Radio>
                  <Radio value={0}>给null值</Radio>
                  <Radio value={2}>删除本字段</Radio>
                </RadioGroup>)
                }
              </FormItem>
            </div>



            <div style={{display:(fieldType=='array')?'':'none'}} >
              <FormItem
                label="数组数据来源"
                help='指定本对数组的来源,如果是输出映射表示来自API的结果，如果是输入表示来自API的输入参数'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
              >{
                getFieldDecorator('arrayDataFromType',{rules: [{ required: false}],initialValue:1})
                (<Select  >
                  <Option value={1}>上一节点的输出</Option>
                  <Option value={4}>从SQL返回多行数据(不再计算子字段)</Option>
                  <Option value={6}>绑定Java脚本生成数组(不再计算子字段)</Option>
                </Select>)
                }
              </FormItem>
              <FormItem
                label="指定输入字段Id[数组]"
                help='指定API输入或输出字段支持使用JsonPath取值如:$.data，如果为固定行可以为空'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:(arrayDataFromType==1)?'':'none'}}
              >{
                getFieldDecorator('arrayJsonPathId',{rules: [{ required: false}],initialValue:""})
                (<AjaxEditSelect url={this.jsontPathUrl}  />)
                }
              </FormItem>
              <FormItem
                label="当输入字段不存在时"
                help='当输入字段不存在时的赋值方式'
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
                style={{display:(arrayDataFromType==1)?'':'none'}}
              >{
                getFieldDecorator('arrayDefaultType',{rules: [{ required: false}],initialValue:1})
                (<RadioGroup  >
                  <Radio value={1}>计算子字段</Radio>
                  <Radio value={3}>直接赋值为空数组[]</Radio>
                  <Radio value={0}>给null值</Radio>
                  <Radio value={2}>删除本字段</Radio>
                </RadioGroup>)
                }
              </FormItem>
            </div>

            <FormItem
              label="指定数据源"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 16 }}
              help="请指定要执行SQL的数据源"
              style={{display:sqlCodeDisplay}}
            >
              {
                getFieldDecorator('fieldBandingDbConnId',{rules: [{ required: false}],initialValue:''})
                (<TreeNodeSelect url={dataSourceSelect} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label',searchPlaceholder:'输入搜索关键字'}}  />)
              }
            </FormItem>
            <FormItem
              label="选择数据库表"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              style={{display:sqlCodeDisplay}}
              help='可以选择一个数据库表并生成SQL语句'
            >
              <Row gutter={1}>
                <Col span={12}>
                  {
                    getFieldDecorator('tableName', {
                      rules: [{ required: false}],
                    })
                    (
                      <AutoComplete filterOption={true} placeholder='选择数据库表' >
                      {tableOptionsItem}
                      </AutoComplete>
                    )
                  }
                </Col>
                <Col span={12}>
                  <Button  onClick={this.loadDatabaseTable}  >
                    <Icon type="search" />载入数据表
                  </Button>{' '}
                  <Button  onClick={this.createSelectSql}  >
                    <Icon type="code" />生成查询SQL
                  </Button>
                </Col>
              </Row>
            </FormItem>
            <FormItem
              label="Select SQL语句"
              help='执行一个select语句可返回多个字段值或行,可以使用${字段id}来取值作为sql条件 where id=${id}'
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              style={{display:sqlCodeDisplay}}
            >
              {getFieldDecorator('fieldBandingSqlCode', {
                rules: [{ required: false, message: '' }],initialValue:'select field from table where id=${id}'
              })(<AceEditor
                mode='sql'
                width='100%'
                height='200px'
              />)}
            </FormItem>

            <FormItem
            label="执行Java脚本:"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            style={{display:jsCodeDisplay}}
            help={<span>
              请使用Java语法进行数据处理并返回:
              <a style={{cursor:'pointer'}} onClick={this.inserDemo1}>代码示例1</a><Divider type="vertical" />{' '}
              <a style={{cursor:'pointer'}} onClick={this.inserDemo2}>代码示例2</a><Divider type="vertical" />{' '}
              <a style={{cursor:'pointer'}} onClick={this.inserDemo3}>代码示例3</a>
                 </span>}
          >
            {getFieldDecorator('eventCode', {
              rules: [{ required: false, message: '' }],
            })(<AceEditor
              mode='java'
              width='100%'
              height='300px'
            />)}
            </FormItem>

          </TabPane>
          <TabPane  tab="字段值转换" key="caseWhen"   disabled={(fieldType!=='array' && fieldType!=='object')?false:true} >
            <div>
              <FieldCaseWhenConfig
                currentRecord={this.state.formData}
                updateData={this.updateData}
                />
            </div>
          </TabPane>
          <TabPane  tab="测试" key="tester"  >
            <DataMappingTest data={this.state.formData} apiId={this.apiId} close={this.props.closeModal} closeButton='0' />
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Button type="primary" onClick={this.onSubmit.bind(this,true)}  >
            保存并关闭
          </Button>
          {' '}
          <Button type="ghost" onClick={this.onSubmit.bind(this,false)}  >
            保存
          </Button>
          {' '}
          <Button onClick={this.props.closeModal.bind(this,false)}  >
            取消
          </Button>
        </FormItem>
      </Form>

      </Spin>
    );
  }
}

export default Form.create()(form);
