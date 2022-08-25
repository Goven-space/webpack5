import { Button, Card, Col, Divider, Input, Modal, Row, Table, Tag } from 'antd';
import React from 'react';
import AjaxSelect from '../../components/AjaxSelect';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as GridActions from '../../utils/GridUtils';
import EditServiceControlParams from '../form/EditServiceControlParams';
import NewServiceControlPlugs from '../form/NewServiceControlPlugs';
import ListCategoryNode from './ListCategoryNode';

const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_SERVICECONTROLPLUGS.listByPage; //分页显示
const DELETE_URL=URI.CORE_SERVICECONTROLPLUGS.delete;//删除
const exporConfigUrl=URI.CORE_SERVICECONTROLPLUGS.exportConfig;
const categroyUrl=URI.CORE_CATEGORYNODE.listAllNodes+"?categoryId=ControlStrategy";

class ListServiceControlStrategy extends React.Component {
  constructor(props) {
    super(props);
    this.url=LIST_URL;
    this.appId=this.props.appId;
    this.categoryId=this.props.categoryId;
		this.defaultPagination = {pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`}
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: true,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      action:'edit',
      categoryId:'all',
			searchValue:''
    }
  }

  componentDidMount(){
    this.loadData();
  }

  componentWillReceiveProps=(nextProps)=>{
    /* this.categoryId=nextProps.categoryId;
    this.state.pagination.current=1;
    this.loadData(); */
		if(this.categoryId !== nextProps.categoryId) {
			this.categoryId = nextProps.categoryId
			this.loadData(this.defaultPagination);
		}
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
		const searchValue = this.state.searchValue?this.state.searchValue:undefined
		let searchFilters={"configName":searchValue,"configId":searchValue,"beanId":searchValue};
    sorter={"order":'ascend',"field":'configId'};
    if(this.categoryId!=='all' && this.categoryId!==undefined && this.categoryId!==null ){filters.categoryId=[this.categoryId]}
    GridActions.loadData(this,this.url,pagination,filters,sorter,searchFilters);
  }

  loadControlStrategy(){
      let url=getControllerCategorysUrl+"?categoryId=ControlStrategy";
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({controllerStrategyData:data});
          }
      });
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:'New'});
    }else if(action==="Delete"){
      this.deleteData(record.id);
    }else if(action==="Edit"){
      this.setState({visible: true,currentId:record.id,action:'edit'});
    }else if(action==="Config"){
      this.setState({visible: true,currentId:record.id,action:'Config'});
    }else if(action==="Category"){
      this.setState({visible: true,currentId:'',action:action});
    }
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  deleteData=(argIds)=>{
    GridActions.deleteData(this,DELETE_URL,argIds);
  }

  showDevLog=(id)=>{
    this.setState({visible: true,currentId:id,action:'read'});
  }

  showConfirm=()=>{
      var self=this;
      confirm({
      title: '确定要删除选中的策略吗',
      content: '注意:删除后不可恢复!',
      onOk(){
        return self.deleteData();
      },
      onCancel() {},
      });
  }

  closeModal=(reLoadFlag)=>{
      this.setState({visible: false,});
      if(reLoadFlag===true){
        this.loadData();
      }
  }

  handleCancel=(e)=>{
      this.setState({visible: false,});
  }

	searchChange = (e) => {
		this.setState({
			searchValue:e.target.value
		})
	}

  //通过ajax远程载入数据
  search=(value)=>{
    /* let filters={};
    let sorter={};
    let searchFilters={};
    let url=this.url; */
		this.loadData(this.defaultPagination)
    /* GridActions.loadData(this,url,this.state.pagination,filters,sorter,searchFilters); */
  }

  //导出设计
  exportConfig=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    GridActions.downloadBlob(this, exporConfigUrl, { ids: ids });
  }

  onCategoryChange=(value)=>{
    this.categoryId=value;
    this.state.categoryId=value;
    this.state.pagination.current=1;
    this.loadData()
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '配置说明',
        dataIndex: 'configName',
        width: '25%'
      },{
        title: '配置Id',
        dataIndex: 'configId',
        width: '20%'
      },{
        title: '控制点',
        dataIndex: 'controlPoint',
        width: '18%',
        render:(text,record)=>{
          if(text==="BeforeServiceExecution"){
            return "服务执行前";
          }else if(text==='RequestInit'){
            return "请求初始化时";
          }else if(text==='ServiceRunException'){
            return "服务执行异常时";
          }else if(text==='AfterServiceExecution'){
            return "服务执行后";
          }else if(text==='ServiceRunFinally'){
            return "Finally始终";
          }else if(text==='BeforeConnectionUrl'){
            return "服务转发前";
          }else if(text==='UserContextInit'){
            return "用户初始化时";
          }else{
            return text;
          }
        }
      },{
        title: '控制范围',
        dataIndex: 'controlAppIds',
        width: '10%',
        render:(text,record)=>{
          if(text==="*"){
            return (<Tag color='green' >全局策略</Tag>);
          }else if(text==='binding'){
            return (<Tag color="blue" >服务绑定</Tag>);
          }else{
            return text;
          }
        }
      },{
        title: '顺序',
        dataIndex: 'sortNum',
        width: '6%',
      },{
        title: '状态',
        dataIndex: 'state',
        width: '8%',
        render:(text,record)=>{
          if(text==='1'){
            return (<Tag color="#87d068" >启用</Tag>)
          }else{
            return (<Tag color="#f50" >停用</Tag>)
          }
        }
      },{
        title: '操作',
        dataIndex: '',
        key: 'x',
        width:'13%',
        render: (text,record) => {
                return <span>
                    <a onClick={this.onActionClick.bind(this,"Edit",record)} >修改</a>
                    <Divider type="vertical" />
                    <a onClick={this.onActionClick.bind(this,"Config",record)} >配置</a>
                  </span>;
        }
      },];

      let formContent,title;
      if(this.state.action==='edit' || this.state.action==='New'){
        title='服务控制策略';
        formContent=<NewServiceControlPlugs appId={this.appId} id={currentId} close={this.closeModal} />;
      }else if(this.state.action==='Category'){
        title='策略分类管理';
        formContent=(<ListCategoryNode appId={this.appId} categoryId='ControlStrategy' rootName='策略分类管理'  close={this.closeModal} />);
      }else{
        title='配置策略参数';
        formContent=<EditServiceControlParams id={currentId} close={this.closeModal} />;
      }
    return (
      <Card title="服务控制策略管理" style={{minHeight:600}}>
	          <Modal key={Math.random()} title={title} maskClosable={false}
                visible={this.state.visible}
                width='850px'
				        style={{ top: 20}}
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                {formContent}
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={12} >
                <ButtonGroup>
                <Button  type="primary" onClick={this.onActionClick.bind(this,'New')} icon="plus-circle-o"  >新增控制策略</Button>
                <Button  type="ghost" onClick={this.showConfirm} icon="delete"  disabled={!hasSelected} >删除</Button>
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'导出配置','导出配置后可以使用导入功能重新导入!',this.exportConfig)} icon="download"  disabled={!hasSelected}  >导出</Button>
                <Button  type="ghost" onClick={this.onActionClick.bind(this,'Category')} icon="appstore" >策略分类管理</Button>
                <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                </ButtonGroup>
              </Col>
              <Col span={12}>
               <span style={{float:'right'}} >
                 分类:<AjaxSelect value={this.state.categoryId}
                 onChange={this.onCategoryChange} url={categroyUrl}  valueId="nodeId" textId="nodeText"
                 style={{width:'250px',marginRight:'15px',marginLeft:'5px'}} />
               {' '}搜索策略:<Search
                  style={{ width: 260,marginLeft:'5px' }}
                  placeholder='配置名称或Id'
                  onSearch={value => this.search(value)}
									onChange = {this.searchChange}
                />
                 </span>
              </Col>
            </Row>
            <Table
              bordered={false}
              rowKey={record => record.id}
              dataSource={rowsData}
              columns={columns}
              rowSelection={rowSelection}
              loading={loading}
              onChange={this.onPageChange}
              pagination={pagination}
            />
      </Card>
    );
  }
}

export default ListServiceControlStrategy;
