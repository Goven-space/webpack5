import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover,Badge} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_GATEWAY_SECURITY.listCacheData;
const DELETE_URL=URI.CORE_GATEWAY_SECURITY.deleteCacheData;
const ButtonGroup = Button.Group;

class ListAPIDataCache extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.parentId;
    this.state={
      pagination:{pageSize:25,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
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
    this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.setState({pagination});
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?id="+this.parentId;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }


 clearData=(cacheKey)=>{
   let url=DELETE_URL;
   this.setState({loading:true});
   AjaxUtils.post(url,{parentId:this.parentId,cacheKey:cacheKey},(data)=>{
    this.setState({loading:false});
     if(data.state===false){
       AjaxUtils.showError(data.msg);
     }else{
       AjaxUtils.showInfo(data.msg);
       this.loadData();
     }
   });
 }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '缓存Key',
        dataIndex: 'cacheKey',
        width: '70%'
      },{
        title: '缓存创建时间',
        dataIndex: 'creatTime',
        width: '20%',
      },{
        title: '删除',
        dataIndex: 'editor',
        width:'10%',
        render:(text,r)=>{return <a onClick={AjaxUtils.showConfirm.bind(this,'删除缓存','删除本缓存数据!',this.clearData.bind(this,r.cacheKey))} >删除</a>;}
      }];

      const expandedRow=(record)=>{
        return (
        <Card>
          <Input.TextArea  autosize value={JSON.stringify(record)} />
        </Card>);
      }

    return (
      <div >
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <ButtonGroup>
            <Button  type="primary" onClick={AjaxUtils.showConfirm.bind(this,'清空缓存','清空本规则缓存的所有数据!',this.clearData)} icon="delete" >清空</Button>
            <Button  type="ghost" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
            </ButtonGroup>
          </Col>
          <Col span={12}>
          </Col>
        </Row>
        <Table
          bordered={false}
          rowKey={record => record.cacheKey}
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

export default ListAPIDataCache;
