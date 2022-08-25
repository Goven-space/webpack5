import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,Popover,Switch,message} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import EditSelectOne from '../../../../core/components/EditSelectOne';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import CloumnsFieldAction from '../../../components/CloumnsFieldAction';

//字段名映射配置

const TabPane = Tabs.TabPane;
const ColumnsURL=URI.ETL.FIELDMAPPING_NODE.getFieldMaps;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class FieldMappingConfig_Table extends React.Component {
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
      data: [],
      targetColIds:[],
      sourceColIds:[],
      newIdNum:0,
      deleteIds:[],
    };
  }

  componentDidMount(){
      this.loadData();
  }

  //通过ajax远程载入数据
  loadData=()=>{
    let sourceNodeIds=this.parentForm.getFieldValue("sourceNodeIds");
    let targetNodeIds=this.parentForm.getFieldValue("targetNodeIds");
    if(sourceNodeIds==='' || sourceNodeIds==undefined){return;}
    let url=ColumnsURL+"?processId="+this.processId+"&nodeId="+this.pNodeId+"&sourceNodeIds="+sourceNodeIds+"&targetNodeIds="+targetNodeIds;
    this.setState({loading:true});
    AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
        AjaxUtils.showError(data.msg);
      }else{
        this.setState({data:data.fieldMapConfigs,targetColIds:data.targetColIds,sourceColIds:data.sourceColIds,loading:false});
      }
    });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.setState({curEditIndex:-1});
    this.loadData();
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

  renderSourceColId(index, key, text,record) {
    if(index!==this.state.curEditIndex){
      if(text!=='' && text!==undefined){
        if(record.sourceColType!=='' && record.sourceColType!==undefined){
          if(record.colId===record.sourceColId || record.colId===''){
            return <span>{text}[{record.sourceColType}_{record.sourceColLength}]</span>;
          }else{
            return <span style={{color:'red'}}>{text}[{record.sourceColType}_{record.sourceColLength}]</span>;
          }
        }else{
          return text;
        }
      }else{
        return '';
      }
    }
    let data=Object.keys(this.state.sourceColIds);//所有源字段
    let hadConfigData=this.state.data.map(item=>{return item.sourceColId}); //已经配置的字段列
    let newData=data.filter(colId=>{
        return hadConfigData.indexOf(colId)==-1;
      }
    );
    return (<EditSelect value={text} data={newData} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderTargetColId(index, key, text,record) {
    if(index!==this.state.curEditIndex){
      if(text!=='' && text!==undefined){
        if(record.colType!=='' && record.colType!==undefined){
          return <span>{text}[{record.colType}_{record.colLength}]</span>;
        }else{
          return text;
        }
      }else{
        return '';
      }
    }
    //已经选过的字段不再显示
    let data=Object.keys(this.state.targetColIds); //所有目标字段
    let hadConfigData=this.state.data.map(item=>{return item.colId}); //已经配置的字段列
    let newData=data.filter(colId=>{
        return hadConfigData.indexOf(colId)==-1;
      }
    );

    return (<EditSelect value={text} data={newData} options={{mode:'combobox'}} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText(index, key, text,record) {
    if(index!==this.state.curEditIndex){
      return text;
    }
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderCheckBox(index, key, text) {
  //  return (<Checkbox checked={text} onChange={(e)=>this.handleChange(key,index,e.target.checked)}  ></Checkbox>);
    return <Switch checked={text} checkedChildren="是" unCheckedChildren="否" size="small" onChange={(checked)=>this.handleChange(key,index,checked)} />;
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
    let newRow={key:key,id:key,transfer:false};
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
      title: '源字段Id',
      dataIndex: 'sourceColId',
      width:'15%',
      render: (text, record, index) =>this.renderSourceColId(index,'sourceColId',text,record),
    },{
      title: '删除源字段',
      dataIndex: 'transfer',
      width:'8%',
      render: (text, record, index) => this.renderCheckBox(index, 'transfer', text),
    },{
      title: '目标字段Id',
      dataIndex: 'colId',
      width:'15%',
      render: (text, record, index) => this.renderTargetColId(index,'colId', text,record),
    },{
      title: '备注',
      dataIndex: 'remark',
      width:'15%',
      render: (text, record, index) => this.renderEditText(index,'remark', text,record),
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

    // let fieldsConfigData=this.state.data.filter((dataItem) => {
    //   console.log(dataItem);
    //   return dataItem.colId!=='';
    // });
    // let rowThisObj={state:{data:fieldsConfigData}};

    return (
      <div  >
              <div style={{paddingBottom:10}} >
              <ButtonGroup >
                <Button type='primary'  onClick={this.insertRow} icon="plus"  >新增字段</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>
                <CloumnsFieldAction thisobj={this} />
              </ButtonGroup>{' '}
              </div>
              <Table
              bordered
              rowKey={record => record.key}
              dataSource={data}
              columns={columns}
              scroll={{ y: 450 }}
              onRowClick={this.onRowClick}
              loading={this.state.loading}
              pagination={false}
              size="small"
              />
      </div>
      );
  }
}

export default FieldMappingConfig_Table;
