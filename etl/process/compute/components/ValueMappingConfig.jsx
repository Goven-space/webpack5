import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,Popover,Switch,message} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelectOne';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';

const TabPane = Tabs.TabPane;
const ColumnsURL=URI.ETL.PROCESSNODE.prevnodeColumnsSelect;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class ValueMappingConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentForm=this.props.parentForm;
    this.processId=this.props.processId;
    this.pNodeId=this.props.pNodeId;
    this.updateFieldMapConfigs=this.props.updateFieldMapConfigs;
    this.state = {
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: JSON.parse(this.props.data),
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
    // console.log("key="+key+" index="+index+" value="+value);
    this.setState({ data });
  }

  renderSymbol(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {value:"*",text:'任意值'},
      {value:"=",text:'等于'},
      {value:"!=",text:'不等于'},
      {value:">",text:'大于'},
      {value:"<",text:'小于'},
      {value:">=",text:'大于等于'},
      {value:"<=",text:'小于等于'},
      {text:"is null",value:'is null'},
      {text:"not is null",value:'not is null'},
      {text:"开始字符",value:'startsWith'},
      {text:"结束字符",value:'endsWith'},
      {text:"包含字符",value:'contains'},
      {text:"不包含字符",value:'not contains'},
      {text:"正则匹配(全部替换)",value:'matches all'},
      {text:"正则匹配(替换匹配部分)",value:'matches part'},
      {text:"in交集(逗号分隔)",value:'in'},
      {text:"not in(逗号分隔)",value:'not in'},
      {text:"长度大于",value:'lenght gt'},
      {text:"长度小于",value:'lenght lt'},
      {text:"长度等于",value:'lenght eq'},
      ];
    return (<EditSelect value={text} data={data}  size='small' onChange={value => this.handleChange(key, index, value)} />);
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
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} placeholder={placeholder} />);
  }

  deleteRow=(id)=>{
    if(id!==undefined && id!==""  && id!==null ){
      let data=this.state.data.filter((dataItem) => dataItem.key!==id);
      this.setState({data});
    }
  }

  insertRow=()=>{
    //新增加一行
    let key=this.state.newIdNum+1;
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
      title: '输入字段Id',
      dataIndex: 'colId',
      width:'15%',
      render: (text, record, index) =>this.renderSourceColId(index,'colId',text,record),
    },{
      title: '比较运算符',
      dataIndex: 'symbol',
      width:'20%',
      render: (text, record, index) => this.renderSymbol(index, 'symbol', text),
    },{
      title: '输入字段比较值',
      dataIndex: 'colValue',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index,'colValue', text,record),
    },{
      title: '替换为新值',
      dataIndex: 'targetValue',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index,'targetValue', text,record,"${字段id}获取字段值以及变量"),
    },{
      title: '输出字段Id',
      dataIndex: 'newColId',
      width:'15%',
      render: (text, record, index) => this.renderEditText(index,'newColId', text,record,'新值赋给本字段'),
    },{
      title: '删除',
      dataIndex: 'action',
      width:'5%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.key)}>删除</a></span>);
      },
    },{
      title: '序号',
      dataIndex: 'index',
      width:'5%',
      render: (text, record, index) => {return index+1;}
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
              注意:同一个字段后面的映射条件有可能会覆盖前面的数值,请尽量使用枚举值
      </div>
      );
  }
}

export default ValueMappingConfig;
