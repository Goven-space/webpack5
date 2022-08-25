import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,Popover,Switch,message} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import CloumnsFieldAction from '../../../components/CloumnsFieldAction';

//数据合并后的节点配置

const TabPane = Tabs.TabPane;
const ColumnsURL=URI.ETL.PROCESSNODE.prevnodeColumnsConfig;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class JoinDataFieldConfig extends React.Component {
  constructor(props) {
    super(props);
    this.parentForm=this.props.parentForm;
    this.processId=this.props.processId;
    this.pNodeId=this.props.pNodeId;
    this.updateTableColumns=this.props.updateTableColumns;
    this.tableColumns=this.props.tableColumns||'[]';
    this.getNodeIds=this.props.getNodeIds;
    this.state = {
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
    };
  }

  componentDidMount(){
    if(this.tableColumns=='[]'){
      this.loadData();
    }else{
      this.setState({data:JSON.parse(this.tableColumns)});
    }
  }

	componentDidUpdate(prevProps) {
		if(prevProps.joinNodeIds && prevProps.joinNodeIds !== this.props.joinNodeIds) {
			this.loadData()
		}
	}

  //通过ajax远程载入数据
  loadData=()=>{
    let joinNodeIds= this.props.joinNodeIds? this.props.joinNodeIds:'';
    let url=ColumnsURL+"?processId="+this.processId+"&nodeId="+joinNodeIds;
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
    this.setState({ data });
  }

  renderEditText(index, key, text,record) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(colId)=>{
      let data=this.state.data.filter((dataItem) => dataItem.colId!==colId);
      this.setState({data});
  }

  insertRow=()=>{
    //新增加一行
    let key=this.state.newIdNum+1;
    let newData=this.state.data;
    let newRow={id:key,colId:"field_"+key,colType:'varchar'};
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
    this.updateTableColumns(this.state.data); //更新节点中的数据
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;

    let columns=[{
      title: '字段Id',
      dataIndex: 'colId',
      width:'20%',
      render: (text, record, index) =>this.renderEditText(index,'colId',text,record),
    },{
      title: '字段说明',
      dataIndex: 'colName',
      width:'30%',
      render: (text, record, index) =>this.renderEditText(index,'colName',text,record),
    },{
      title: '数据类型',
      dataIndex: 'colType',
      width:'20%',
      render: (text, record, index) =>this.renderEditText(index,'colType',text,record),
    },{
      title: '备注',
      dataIndex: 'remark',
      width:'20%',
      render: (text, record, index) => this.renderEditText(index,'remark', text,record),
    },{
      title: '删除',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.colId)}>删除</a></span>);
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
                <Button  type="ghost" onClick={this.refresh} icon="reload"  >重新导入字段</Button>
                <CloumnsFieldAction thisobj={this} />
              </ButtonGroup>{' '}
              </div>
              <Table
              bordered
              rowKey={record => record.id}
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

export default JoinDataFieldConfig;
