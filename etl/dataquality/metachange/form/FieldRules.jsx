import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs} from 'antd';
import EditSelect from '../../../../core/components/EditSelect';
import EditText from '../../../../core/components/EditText';
import AjaxSelect from '../../../../core/components/AjaxSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import TreeNodeSelect from '../../../../core/components/TreeNodeSelect';

const TabPane = Tabs.TabPane;
const getColumnsByTableName=URI.ETL.SQLREADNODE.getFieldsByTableName;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class FieldRules extends React.Component {
  constructor(props) {
    super(props);
    this.form=this.props.form;
    this.applicationId=this.props.applicationId;
    this.data=this.props.data||[];
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

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCheckBox(index, key, text) {
    return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
  }

  deleteRow=()=>{
    //???????????????
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

  handleChange=(key, index, value,label)=>{
    const { data } = this.state;
    data[index][key] = value;
    if(label!==undefined){
      data[index]['ruleName'] = label;
    }
    this.setState({ data });
  }
  insertRow=()=>{
    //???????????????
    let key=AjaxUtils.guid();
    let newData=this.state.data;
    let newRow={id:key,EditFlag:true,colId:'',colType:'varchar'};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys});
  }

  loadTableColumns=()=>{
    //??????????????????
    let tableName=this.form.getFieldValue("tableName");
    if(tableName===''){message.error("?????????????????????????????????????????????!");return;}
    let formData=this.form.getFieldsValue();
    formData.dbConnId=formData.dataSourceId;
    this.setState({loading:true});
    AjaxUtils.post(getColumnsByTableName,formData,(data)=>{
          if(data.state===false){
            this.setState({loading:false});
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({data:data,loading:false});
          }
    });
  }

  selectAll = () => {
    let {data}=this.state;
    data.forEach(function(item, index, array) {
        item.checkFlag=true;
    });
    this.setState({data:data});
  }

  render() {
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;
    const columns=[{
      title: '??????Id',
      dataIndex: 'colId',
      width:'30%',
      render: (text, record, index) => this.renderEditText(index,'colId', text),
    },{
      title: '????????????',
      dataIndex: 'colName',
      width:'40%',
      render: (text, record, index) =>this.renderEditText(index,'colName',text),
    },{
      title: '????????????',
      dataIndex: 'colType',
      width:'20%',
      render: (text, record, index) => this.renderFieldType(index, 'colType', text),
    },{
      title: '????????????',
      dataIndex: 'checkFlag',
      width:'10%',
      render: (text, record, index) => this.renderCheckBox(index,'checkFlag', text),
    }
    ];

    return (
      <div>
          <div style={{paddingBottom:10}} >
              <ButtonGroup >
              <Button type='primary' onClick={AjaxUtils.showConfirm.bind(this,"????????????????","???????????????????????????????????????,?????????????????????????????????!",this.loadTableColumns.bind(this))}  icon="select"  >???????????????</Button>
              <Button  onClick={this.deleteRow} icon="delete"  >????????????</Button>
              <Button  onClick={this.insertRow} icon="plus-circle-o"  >????????????</Button>
              <Button  onClick={this.selectAll} icon="check"  >????????????</Button>
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

export default FieldRules;
