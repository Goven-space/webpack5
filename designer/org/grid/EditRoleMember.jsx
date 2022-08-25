import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,Input,Select} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import EditSelect from '../../../core/components/EditSelect';
import DeptTreeSelect from '../../../core/components/DeptTreeSelect';
import UserAsynTreeSelect from '../../../core/components/UserAsynTreeSelect';
import RolesSelect from '../../../core/components/RolesSelectObj';

const LIST_URL=URI.CORE_USER_ROLEMEMBER.listAll;
const SAVE_URL=URI.CORE_USER_ROLEMEMBER.save;

class EditRoleMember extends React.Component {
  constructor(props) {
    super(props);
    this.roleCode=this.props.roleCode;
    this.roleName=this.props.roleName;
    this.state = {
      pagination:{pageSize:15,current:1,showSizeChanger:false,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      memberType:'USER',
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
      deleteIds:[],
    };
  }

  componentDidMount(){
      this.loadData();
  }

  //通过ajax远程载入数据
  loadData=()=>{
    this.setState({deleteIds:[]});
    let url=LIST_URL+"?roleCode="+this.roleCode;
    GridActions.loadEditGridData(this,url,(data)=>{
        this.setState({data:data,loading:false});
      }
    );
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.setState({pagination:pagination});
  }

  //保存所有数据行，不管是否有编辑都要重新保存一次
  saveData=()=>{
    this.setState({curEditIndex:-1});
    let url=SAVE_URL;
    let postData=this.state.data.filter(dataItem=>dataItem.EditFlag===true); //只有修改过的才需要提交，没有修改的不提交
    let deleteData=this.state.deleteIds; //新增的数据的id都是2位数以下的，这些新增的删除时不用提交
    GridActions.saveEditGridData(this,url,postData,deleteData);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  renderMemberType(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text==='USER'){
        return '用户';
      }else if(text==='DEPT'){
        return '部门';
      }else if(text==='ROLE'){
        return '角色';
      }
    }else{
      let data=[{text:"用户",value:'USER'},{text:"部门",value:'DEPT'},{text:"角色",value:'ROLE'}];
      return (<EditSelect value={text} size='small' data={data} onChange={value => this.userTypeChange(key, index, value)} />);
    }
  }

  renderMemberCode(index, key, text,url) {
    if(index!==this.state.curEditIndex){return text;}
    if(this.state.memberType==='USER'){
      return (<UserAsynTreeSelect value={text} onChange={(value,label) => this.handleChange(key, index, value,label)}  options={{style:{width:300}}} />);
    }else if(this.state.memberType==='DEPT'){
      return (<DeptTreeSelect value={text} onChange={(value,label) => this.handleChange(key, index, value,label)} options={{dropdownStyle:{maxHeight: 400, overflow: 'auto' },style:{width:300}}} />);
    }else if(this.state.memberType==='ROLE'){
      return (<RolesSelect value={{key:text}} onChange={(value,label) => this.handleChange(key, index, value,label)} options={{showSearch:true,style:{width:300}}} />);
    }
  }

  userTypeChange=(key, index, value)=>{
    const { data } = this.state;
    data[index][key] = value;
    data[index].EditFlag=true; //标记为已经被修改过
    this.setState({ data:data,memberType:value});
  }

  handleChange=(key, index, value,label)=>{
    if(typeof(label)==="object"){
        label=label[0];
    }
    const { data } = this.state;
    data[index][key] = value;
    let spos=label.indexOf("|");
    if(spos!==-1){
      label=label.substring(0,spos);
    }
    data[index].memberName = label;
    data[index].EditFlag=true; //标记为已经被修改过
    this.setState({ data:data});
  }

  deleteRow=(id)=>{
    //删除选中行
    let deleteIds=this.state.deleteIds;
    if(id!==undefined && id!=="" && id!==null){
      if(id.length>10){
        deleteIds.push(id);
      }
      let data=this.state.data.filter((dataItem) => dataItem.id!==id);
      this.setState({data,deleteIds});
    }
  }

  insertRow=()=>{
    //新增加一行
    let key=this.state.newIdNum+1;
    let newRow={id:key,memberType:'USER',roleName:this.roleName,roleCode:this.roleCode};
    let newData=this.state.data;
    newData.unshift(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index,memberType:record.memberType});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys});
  }

  render() {
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;
    const columns=[{
      title: '成员类型',
      dataIndex: 'memberType',
      width:'20%',
      render: (text, record, index) => this.renderMemberType(index, 'memberType', text),
    },{
      title: '成员Id',
      dataIndex: 'memberCode',
      render: (text, record, index) => this.renderMemberCode(index, 'memberCode', text),
      width:'40%'
    },{
      title: '成员名称',
      dataIndex: 'memberName',
      width:'30%'
    }, {
      title: '操作',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (
              <a   >
                 <Popconfirm title="注意删除后要点击保存才有效" onConfirm={this.deleteRow.bind(this,record.id)} >删除</Popconfirm>
              </a>);
      },
    }];
    return (
      <div style={{minHeight:'500px'}}>
        <div style={{paddingBottom:10}} >
          <Button type="primary" onClick={this.saveData} icon="save"  >保存</Button>
           {' '}
          <Button  onClick={this.insertRow} icon="plus-circle-o" >新增</Button>
          {' '}
          <Button  type="ghost" onClick={this.refresh} icon="reload" >刷新</Button>
        </div>
        <Table
        bordered
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        rowSelection={rowSelection}
        onRowClick={this.onRowClick}
        loading={this.state.loading}
        pagination={this.state.pagination}
        onChange={this.onPageChange}
        size="small"
        />
      </div>
      );
  }
}

export default EditRoleMember;
