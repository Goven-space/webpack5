import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,Input,Select,Icon} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import RolesSelect from '../../../core/components/RolesSelectObj';

const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_USER_ROLEMEMBER.listAllRolesMapMember;
const SAVE_URL=URI.CORE_USER_ROLEMEMBER.save;

class EditUserMapRoles extends React.Component {
  constructor(props) {
    super(props);
    this.memberCode=this.props.memberCode;
    this.memberName=this.props.memberName;
    this.memberType=this.props.memberType;
    this.state = {
      pagination:{pageSize:15,current:1,showSizeChanger:true},
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
    let url=LIST_URL+"?memberCode="+this.memberCode+"&memberType=USER";
    // console.log("url="+url);
    GridActions.loadEditGridData(this,url,(data)=>{
        this.setState({data:data,loading:false});
      }
    );
  }

  //保存所有数据行，不管是否有编辑都要重新保存一次
  saveData=()=>{
    let url=SAVE_URL+"?roleCode="
    this.setState({curEditIndex:-1});
    let postData=this.state.data.filter(dataItem=>dataItem.EditFlag===true); //只有修改过的才需要提交，没有修改的不提交
    //postData.forEach((value,index,array)=>{array[index].permissionId=this.permissionId;});
    let deleteData=this.state.deleteIds; //新增的数据的id都是2位数以下的，这些新增的删除时不用提交
    GridActions.saveEditGridData(this,SAVE_URL,postData,deleteData,"");
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  renderRoleSelect=(index, key, text,record)=>{
    if(index!==this.state.curEditIndex){
      return <div><Icon type="user" />{record.roleName}</div>;
    }else{
      return <RolesSelect value={{key:text}} onChange={this.roleSelectChange} options={{showSearch:true,style:{width:300}}} />;
    }
  }

  roleSelectChange=(value,label)=>{
    if(typeof(label)==="object"){
        label=label[0];
    }
    const { data,curEditIndex} = this.state;
    data[curEditIndex].roleCode = value;
    data[curEditIndex].roleName = label;
    data[curEditIndex].EditFlag=true; //标记为已经被修改过
    // console.log(data);
    this.setState({ data:data});
  }

  deleteRow=(id)=>{
    //删除选中行
    let deleteIds=this.state.deleteIds;
    if(id!==undefined && id!==""  && id!==null){
      if(id.length>10){
        deleteIds.push(id);
      }
      let data=this.state.data.filter((dataItem) => dataItem.id!==id);
      this.setState({data,deleteIds});
    }
    this.setState({curEditIndex:-1});
  }

  insertRow=()=>{
    //新增加一行
    let key=this.state.newIdNum+1;
    let newRow={id:key,memberCode:this.memberCode,memberName:this.memberName,memberType:'USER',roleCode:'',roleName:''};
    let newData=this.state.data;
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
      title: '用户名',
      dataIndex: 'memberName',
      width:'30%',
    },{
      title: '角色',
      dataIndex: 'roleCode',
      width:'55%',
      render:(text, record, index) => this.renderRoleSelect(index, 'roleCode', text,record),
    },{
      title: '操作',
      width:'15%',
      dataIndex: 'action',
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
        <ButtonGroup size="small" >
          <Button type="primary" onClick={this.saveData} icon="save"  >保存配置</Button>
          <Button  onClick={this.insertRow} icon="plus-circle-o"  >新增角色</Button>
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

export default EditUserMapRoles;
