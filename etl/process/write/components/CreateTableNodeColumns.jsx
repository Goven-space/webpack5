import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs} from 'antd';
import EditSelect from '../../../../core/components/EditSelect';
import EditText from '../../../../core/components/EditText';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import CloumnsFieldAction from '../../../components/CloumnsFieldAction';

//创建表结构字段配置

const TabPane = Tabs.TabPane;
const getColumnsByTableName=URI.ETL.SQLREADNODE.getFieldsByTableName;
const ColumnsURL=URI.ETL.PROCESSNODE.prevnodeColumnsConfig;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class CreateTableNodeColumns extends React.Component {
  constructor(props) {
    super(props);
    this.form=this.props.form;
    this.processId=this.props.processId;
    let colData=this.props.data||'[]';
    this.data=JSON.parse(colData);
    this.state = {
      configFormId:'',
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: this.data,
      newIdNum:0,
      deleteIds:[],
    };
  }

  componentDidMount(){
  }

  getTableColumns=()=>{
    return this.state.data;
  }

  refresh=(e)=>{
    e.preventDefault();
    this.setState({curEditIndex:-1});
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=()=>{
    let nodeId=this.form.getFieldValue("dataNodeId");
    if(nodeId==undefined||nodeId==''){AjaxUtils.showError("请选择一个数据来源节点!");return;}
    let url=ColumnsURL+"?processId="+this.processId+"&nodeId="+nodeId;
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        this.setState({data:data,loading:false});
      }
    });
  }

  renderFieldType(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    let data=[
      {text:"varchar",value:'varchar'},
      {text:"nvarchar",value:'nvarchar'},
      {text:"char",value:'char'},
      {text:"date",value:'date'},
      {text:"datetime",value:'datetime'},
      {text:"float",value:'float'},
      {text:"int",value:'int'},
      {text:"smallint",value:'smallint'},
      {text:"bigint",value:'bigint'},
      {text:"bit",value:'bit'},
      {text:"numeric",value:'numeric'},
      {text:"text",value:'text'},
      {text:"longvarchar",value:'longvarchar'},
      {text:"clob",value:'clob'},
      ];
    return (<EditSelect value={text} data={data} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText(index, key, text,placeholder) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderYNSelect(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text){return <Tag color='blue'>是</Tag>;}else{return <Tag>否</Tag>;}
    }
    let data=[{text:"是",value:true},{text:"否",value:false}];
    return (<EditSelect value={text} size='small' data={data} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCheckBox(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  deleteRow=()=>{
    //删除选中行
    let deleteIds=this.state.deleteIds;
    let selectedRowKeys=this.state.selectedRowKeys;
    selectedRowKeys.forEach(function(value, index, array) {
      if(value.length>10){deleteIds.push(value);}
    });
    let data=this.state.data.filter(
      (dataItem) => {
        var flag=true;
        for(var i=0;i<selectedRowKeys.length;i++){
            if(selectedRowKeys[i]===dataItem.id){
              flag=false;
            }
        }
        //if(dataItem.colId===this.keyId){flag=true;}
        return flag;
      }
    );
    this.setState({data:data,deleteIds:deleteIds});
  }

  handleChange=(key, index, value)=>{
    const { data } = this.state;
    data[index][key] = value;
    data[index].EditFlag=true; //标记为已经被修改过
    this.setState({ data });
  }

  insertRow=()=>{
    //新增加一行
    let key=this.state.data.length+1;
    let newData=this.state.data;
    let newRow={id:key,EditFlag:true,colId:'',colType:'varchar',colLength:'50'};
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
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;
    const columns=[{
      title: '字段Id',
      dataIndex: 'colId',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index,'colId', text),
    },{
      title: '字段说明',
      dataIndex: 'colName',
      width:'15%',
      render: (text, record, index) =>this.renderEditText(index,'colName',text),
    },{
      title: '类型',
      dataIndex: 'colType',
      width:'15%',
      render: (text, record, index) => this.renderFieldType(index, 'colType', text),
    },{
      title: '长度',
      dataIndex: 'colLength',
      width:'10%',
      render: (text, record, index) => this.renderEditText(index, 'colLength', text),
    },{
      title: '精度',
      dataIndex: 'digits',
      width:'6%',
      render: (text, record, index) => this.renderEditText(index, 'digits', text),
    },{
      title: '缺省值',
      dataIndex: 'defaultValue',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index, 'defaultValue', text),
    },{
      title: '主键',
      dataIndex: 'primaryKey',
      width:'8%',
      render: (text, record, index) => this.renderCheckBox(index,'primaryKey', text),
    }
    ];

    return (
      <div>
              <div style={{paddingBottom:10}} >
                  <ButtonGroup >
                    <Button  onClick={this.deleteRow} icon="delete"  >删除字段</Button>
                    <Button  onClick={this.insertRow} icon="plus-circle-o"  >新增字段</Button>
                    <Button  type="ghost" onClick={this.refresh} icon="reload"  >导入字段</Button>
                    <CloumnsFieldAction thisobj={this} />
                  </ButtonGroup>
              </div>
              <Table
              bordered
              rowKey={record => record.id}
              dataSource={data}
              columns={columns}
              rowSelection={rowSelection}
              onRowClick={this.onRowClick}
              loading={this.state.loading}
              pagination={false}
              scroll={{ y: 450 }}
              size="small"
              />
      </div>
      );
  }
}

export default CreateTableNodeColumns;
