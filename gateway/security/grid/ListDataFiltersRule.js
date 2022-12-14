import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover,Badge} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import NewDataFiltersRule from '../form/NewDataFiltersRule';
import ListSecurityScopeItems from './ListSecurityScopeItems';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_GATEWAY_SECURITY.list;
const DELETE_URL=URI.CORE_GATEWAY_SECURITY.delete;
const ButtonGroup = Button.Group;
const exportServices=URI.CORE_GATEWAY_SECURITY.export;
const TabPane = Tabs.TabPane;

class ListDataFiltersRule extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId||'gateway';
    this.securityType=5;
    this.dataDirection=this.props.dataDirection||'';
    this.searchFilters = {};
    this.sorter = {};
    this.defaultPagination = {pageSize:25,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`};
    this.state={
      pagination:{...this.defaultPagination},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading: true,
      currentId:'',
      currentRecord:{},
      action:'',
      visible:false,
    }
  }

  componentDidMount(){
      this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    if(nextProps.dataDirection!==this.dataDirection){
        this.dataDirection=nextProps.dataDirection;
        this.searchFilters = {};
        this.loadData(this.defaultPagination);
    }
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination)=>{
   this.loadData(pagination);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:action});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.dataDirection=record.dataDirection;
      this.setState({visible: true,currentId:record.id,action:action});
    }
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '??????????????????????????????????',
      content: '??????:?????????????????????!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  refresh=(e)=>{
    e.preventDefault();
    this.searchFilters = {};
    this.loadData();
  }

  //??????ajax??????????????????
  loadData=(pagination=this.state.pagination)=>{
    let url=LIST_URL+"?securityType="+this.securityType;
    const sorter = {"order":'ascend',"field":'createTime'};
    let filters = {};
    if(this.appId!=='gateway'){
      filters.appId=[this.appId];
    }
    if(this.dataDirection!==''){
      filters.dataDirection=[this.dataDirection];
    }
    GridActions.loadData(this,url,pagination,filters,sorter,this.searchFilters);
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({
        visible: false,
      });
  }

  //????????????
  exportData=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    this.setState({loading:true});
    GridActions.downloadBlob(this, exportServices, { ids: ids });
  }

  //??????ajax??????????????????
  search=(value)=>{
    this.searchFilters = value ? {"configName":value,"configName":value} : {};
    this.loadData(this.defaultPagination);
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '??????',
      dataIndex: 'dataDirection',
      width: '8%',
      render: (text,record) =>{
        if(text==='IN'){return <Tag color='green'>????????????</Tag>;}
        else if(text==='OUT'){return <Tag color='blue'>????????????</Tag>;}
        }
    },{
        title: '????????????',
        dataIndex: 'configName',
        width: '25%',
        ellipsis: true,
      },{
        title: '????????????',
        dataIndex: 'fieldId',
        width: '10%',
        render: (text,record) =>{
          if(record.filtersType==2){return '-';}
          else if(record.filtersType==3){return '-';}
          else{return text;}
          }
      },{
        title: '??????',
        dataIndex: 'filtersType',
        width: '8%',
        render: (text,record) =>{
          if(text===0){return <Tag color='red'>????????????</Tag>;}
          else if(text==1){return <Tag color='blue'>????????????</Tag>;}
          else if(text==2){return <Tag color='green'>????????????</Tag>;}
          else if(text==3){return <Tag color='blue'>??????</Tag>;}
          }
      },{
        title: '??????',
        dataIndex: 'sortNum',
        width: '8%'
      },{
        title: '?????????',
        dataIndex: 'creator',
        width:'8%',
      },{
        title: '????????????',
        dataIndex: 'editTime',
        width:'15%',
      },{
        title: '??????',
        dataIndex: 'state',
        width:'6%',
        render: (text,record) => {if(text==='Y'){return <Tag color='green'>??????</Tag>} else if(text==='N'){return <Tag color='red'>??????</Tag>}else if(text==='D'){return <Tag color='red'>??????</Tag>}}
      },{
        title: '??????',
        dataIndex: '',
        key: 'x',
        width:'7%',
        render: (text,record) => {
            return (<span>
              <a onClick={this.onActionClick.bind(this,"Edit",record)} >??????</a>
            </span>);
        }
      },];

      const expandedRow=(record)=>{
        return (
        <Card>
              <ListSecurityScopeItems id={record.id } />
        </Card>);
      }

    return (
      <div >
          <Modal key={Math.random()}  maskClosable={false}
            visible={this.state.visible}
            footer=''
            width='1000px'
            style={{ top: 20}}
            onOk={this.handleCancel}
            onCancel={this.handleCancel} >
            <NewDataFiltersRule  id={currentId} dataDirection={this.dataDirection}  close={this.closeModal} appId={this.appId} />
          </Modal>

        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <ButtonGroup>
            <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="file-add" >????????????????????????</Button>
            <Button  type="ghost" onClick={this.showConfirm} icon="delete" disabled={!hasSelected} >??????</Button>
            <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'????????????','???????????????????????????????????????????????????!',this.exportData)} icon="download"   disabled={!hasSelected}  >??????</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >??????</Button>
            </ButtonGroup>
          </Col>
          <Col span={12}>
           <span style={{float:'right'}} >
             ??????:<Search
              placeholder="????????????"
              style={{ width: 260 }}
              onSearch={value => this.search(value)}
            />
             </span>
          </Col>
        </Row>
        <Table
          bordered={false}
          rowKey={record => record.id}
          rowSelection={rowSelection}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          onChange={this.onPageChange}
          pagination={pagination}
          expandedRowRender={expandedRow}
        />
    </div>
    );
  }
}

export default ListDataFiltersRule;
