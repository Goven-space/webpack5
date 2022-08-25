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

const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_PERMISSIONS.listAllOrgResByPermissionId;
const SAVE_URL=URI.CORE_PERMISSIONS.savePermissionMapOrg;

class EditPermissionMapRole extends React.Component {
  constructor(props) {
    super(props);
    this.permissionId=this.props.permissionId;
    this.permissionName=this.props.permissionName;
    this.state = {
      pagination:{pageSize:15,current:1,showSizeChanger:true},
      memberType:'ROLE',
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
      deleteIds:[],
      visible:false,
    };
  }

  componentDidMount(){
      this.loadData();
  }

  //通过ajax远程载入数据
  loadData=()=>{
    this.setState({deleteIds:[]});
    let url=LIST_URL.replace('{permissionId}',this.permissionId);
    // console.log("url="+url);
    GridActions.loadEditGridData(this,url,(data)=>{
        this.setState({data:data,loading:false});
      }
    );
  }

  //保存所有数据行，不管是否有编辑都要重新保存一次
  saveData=()=>{
    this.setState({curEditIndex:-1});
    let postData=this.state.data.filter(dataItem=>dataItem.EditFlag===true); //只有修改过的才需要提交，没有修改的不提交
    postData.forEach((value,index,array)=>{
      array[index].permissionId=this.permissionId;
      array[index].permissionName=this.permissionName;
    });
    let deleteData=this.state.deleteIds; //新增的数据的id都是2位数以下的，这些新增的删除时不用提交
    GridActions.saveEditGridData(this,SAVE_URL,postData,deleteData,this.props.appId);
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

  renderResCode(index, key, text,url) {
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
    data[index].orgResName = label;
    data[index].EditFlag=true; //标记为已经被修改过
    this.setState({ data:data});
  }

  deleteRow=(id)=>{
    //删除选中行
    let deleteIds=this.state.deleteIds;
    if(id!==undefined && id!=="" && id!==null ){
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
    let newRow={id:key,orgResType:'ROLE'};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index,orgResType:record.orgResType});
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys});
  }


  render() {
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const { data,configFormId } = this.state;
    const columns=[{
      title: '关联类型',
      dataIndex: 'orgResType',
      width:'20%',
      render: (text, record, index) => this.renderMemberType(index, 'orgResType', text),
    },{
      title: '用户/角色/部门',
      dataIndex: 'orgResCode',
      render: (text, record, index) => this.renderResCode(index, 'orgResCode', text),
      width:'40%'
    },{
      title: '绑定名称',
      dataIndex: 'orgResName',
      width:'30%'
    }, {
      title: '操作',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (
              <a href="javascript:void(0)"   >
                 <Popconfirm title="确定删除? 注意:删除后要点击保存才能生效!" onConfirm={this.deleteRow.bind(this,record.id)} >删除</Popconfirm>
              </a>);
      },
    }];
    return (
      <div>
        <div style={{paddingBottom:10}} >
        <ButtonGroup  >
          <Button type="primary" onClick={this.saveData} icon="save"  >保存</Button>
          <Button  onClick={this.insertRow} icon="plus-circle-o" >新增</Button>
          <Button  type="ghost" onClick={this.refresh} icon="reload"  >刷新</Button>
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
        size="small"
        pagination
        />
      </div>
      );
  }
}

export default EditPermissionMapRole;
