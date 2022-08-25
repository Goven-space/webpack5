import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,Popover,Switch,message} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelectOne';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';

const TabPane = Tabs.TabPane;
const ColumnsURL=URI.ETL.PROCESSNODE.prevnodeColumnsSelect;
const Option = Select.Option;
const ButtonGroup = Button.Group;
const ruleSelectUrl=URI.ETL.RULE.select;

class DataFiltersFieldConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentForm=this.props.parentForm;
    this.processId=this.props.processId;
    this.pNodeId=this.props.pNodeId;
    this.updateFieldMapConfigs=this.props.updateFieldMapConfigs;
    this.ruleSelectUrl=ruleSelectUrl+"?applicationId="+this.props.applicationId;
    this.state = {
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: JSON.parse(this.props.data||'[]'),
      targetColIds:[],
      sourceColIds:[],
      newIdNum:0,
      deleteIds:[],
    };
  }

  componentDidMount(){

  }

  refresh=(e)=>{
    e.preventDefault();
    this.setState({curEditIndex:-1});
  }

  handleChange=(key, index, value,label,extra)=>{
    const { data } = this.state;
    if(value instanceof Array){
      value=value.join(","); //数组转为字符串
    }
    data[index][key] = value;
    if(label!==undefined){
      data[index]['ruleName'] = label;
    }
    // console.log("key="+key+" index="+index+" value="+value);
    this.setState({ data });
  }

  renderSymbol(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {value:"=",text:'等于'},
      {value:"!=",text:'不等于'},
      {value:">",text:'大于'},
      {value:"<",text:'小于'},
      {value:">=",text:'大于等于'},
      {value:"<=",text:'小于等于'},
      {text:"is null",value:'is null'},
      {text:"not is null",value:'not is null'},
      {text:"绑定质量规则(成立规则返回1)",value:'rule=1'},
      {text:"绑定质量规则(不成立规则返回0)",value:'rule=0'},
      {text:"开始字符(以什么字符开始)",value:'startsWith'},
      {text:"结束字符(以什么字符结束)",value:'endsWith'},
      {text:"字符值为null或者长度为0",value:'blank'},
      {text:"in交集(用逗号分隔)",value:'in'},
      {text:"not in(用逗号分隔)",value:'not in'},
      {text:"包含字符",value:'contains'},
      {text:"不包含字符",value:'not contains'},
      {text:"正则匹配(比较值填正则表达式)",value:'matches'},
      {text:"非正则匹配(比较值填正则表达式)",value:'not matches'},
      {text:"长度大于",value:'lenght gt'},
      {text:"长度小于",value:'lenght lt'},
      {text:"长度等于",value:'lenght eq'},
      ];
    return (<EditSelect value={text} data={data}  size='small' onChange={value => this.handleChange(key, index, value)} />);
  }


  renderColValue(index, key, text,record) {
    if(record.symbol==='rule=1' || record.symbol==='rule=0'){
      //绑定规则
      if(index!==this.state.curEditIndex){
        if(record.ruleName!==undefined && record.ruleName.join(",")!==''){
          return <Tag color='blue'>{record.ruleName}</Tag>;
        }else{
          return '';
        }
      }
      let data=[];
      return (<TreeNodeSelect url={this.ruleSelectUrl} options={{showSearch:true,multiple:false,allowClear:true,treeNodeFilterProp:'label'}} value={text}  size='small' onChange={(value,text) => this.handleChange(key, index, value,text)} />);
    }else{
      //普通比较值
      if(index!==this.state.curEditIndex){
        return text;
      }
      return (<EditText value={text} size='small' placeholder='支持变量${变量}' onChange={value => this.handleChange(key, index, value)}  />);
    }
  }

  renderSourceColId(index, key, text,record) {
    if(index!==this.state.curEditIndex){
          return text;
    }
    let url=ColumnsURL+"?processId="+this.processId+"&nodeId="+this.parentForm.getFieldValue("sourceNodeIds");
    return (<AjaxSelect url={url} value={text} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText(index, key, text,record,placeholder) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditText value={text} size='small' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    if(id!==undefined && id!==""  && id!==null ){
      let data=this.state.data.filter((dataItem) => dataItem.key!==id);
      this.setState({data});
    }
  }

  insertRow=()=>{
    //新增加一行
    let key=AjaxUtils.guid();
    let newData=this.state.data;
    let newRow={key:key,transfer:true};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys});
  }

  render() {
    this.updateFieldMapConfigs(this.state.data); //更新节点中的数据
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;

    let columns=[{
      title: '字段Id',
      dataIndex: 'colId',
      width:'20%',
      render: (text, record, index) =>this.renderSourceColId(index,'colId',text,record),
    },{
      title: '运算符',
      dataIndex: 'symbol',
      width:'20%',
      render: (text, record, index) => this.renderSymbol(index, 'symbol', text),
    },{
      title: '比较值|规则',
      dataIndex: 'colValue',
      width:'30%',
      render: (text, record, index) => this.renderColValue(index,'colValue', text,record),
    },{
      title: '备注|规则参数',
      dataIndex: 'colParams',
      width:'15%',
      render: (text, record, index) => this.renderEditText(index,'colParams', text,record),
    },{
      title: '删除',
      dataIndex: 'action',
      width:'5%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.key)}>删除</a></span>);
      },
    }
    ];

    return (
      <div  >
              <div style={{paddingBottom:10}} >
              <ButtonGroup >
                <Button type='primary'  onClick={this.insertRow} icon="plus"  >新增字段</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>
              </ButtonGroup>{' '}
              </div>
              <Table
              bordered
              rowKey={record => record.key}
              dataSource={data}
              columns={columns}
              onRowClick={this.onRowClick}
              loading={this.state.loading}
              pagination={false}
              size="small"
              />
      </div>
      );
  }
}

export default DataFiltersFieldConfig;
