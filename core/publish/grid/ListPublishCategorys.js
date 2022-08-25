import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,DatePicker} from 'antd';
import * as URI from '../../constants/RESTURI';
import * as AjaxUtils from '../../utils/AjaxUtils';
import * as GridActions from '../../utils/GridUtils';
import SendPublishData from '../form/SendPublishData';
import ListPublishDatas from './ListPublishDatas';
import moment from 'moment';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_DATAPUBLISH.list; //分页显示
const DOWNLOAD_URL=URI.CORE_DATAPUBLISH.package; //打包下载

class ListPublishCategorys extends React.Component {
  constructor(props) {
    super(props);
    this.appId="core";
    this.startDate=this.getLastSevenDays();
    this.endDate=this.getNowFormatDate();
    this.searchFlag='0';
    this.state={
      pagination:{pageSize:15,current:1,showSizeChanger:true,showTotal:(total, range) => `${range[0]}-${range[1]} of ${total} items`},
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      departmentCode:'',
      loading: false,
      visible:false,
      currentId:'',
      searchKeyWords:'',
      action:'edit',
    }
  }

  componentDidMount(){
      this.loadData();
  }

  onSelectChange = (selectedRowKeys,selectedRows) => {
   this.setState({selectedRowKeys:selectedRowKeys,selectedRows:selectedRows});
  }

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  onActionClick=(action,record,url)=>{
    if(action==="New"){
      this.setState({visible: true,currentId:'',action:action});
    }
  }

  searchData=()=>{
    this.searchFlag='1';
    this.loadData();
  }

  refresh=(e)=>{
    e.preventDefault();
    this.searchFlag='0';
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?startDateTime="+this.startDate+"&endDateTime="+this.endDate+"&searchFlag="+this.searchFlag;
    GridActions.loadData(this,url,pagination,filters,sorter,{},(data)=>{
      pagination.total=data.total; //总数
      data.rows.forEach((item, i) => {
        item.columns.push({
              title: '状态',
              dataIndex: 'P_PublishStatus',
              width: '5%',
              render: (text,record) => {
                if(text==1){
                  return <Tag color='green'>允许</Tag>;
                }else{
                  return <Tag color='#ccc'>禁止</Tag>;
                }
              }
        });
      });

      this.setState({rowsData:data.rows,pagination:pagination,selectedRows:[],selectedRowKeys:[]});
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

  download=()=>{
    let ids=this.state.selectedRowKeys.join(",");
    let url=DOWNLOAD_URL+"?ids="+ids;
    window.location.href=url;
  }

  getNowFormatDate=(prvNum)=>{
          let date = new Date();
          var seperator1 = "-";
          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          var strDate = date.getDate()+1;
          if (month >= 1 && month <= 9) {
              month = "0" + month;
          }
          if (strDate >= 0 && strDate <= 9) {
              strDate = "0" + strDate;
          }
          let currentdate = year + seperator1 + month + seperator1 + strDate;
          return currentdate;
   }

   getLastSevenDays=(date)=>{
           var date = date || new Date(),
           timestamp,
           newDate;
            if(!(date instanceof Date)){
                date = new Date(date.replace(/-/g, '/'));
            }
            timestamp = date.getTime();
            newDate = new Date(timestamp - 1 * 24 * 3600 * 1000);
            var month = newDate.getMonth() + 1;
            month = month.toString().length == 1 ? '0' + month : month;
            var day = newDate.getDate().toString().length == 1 ? '0' + newDate.getDate() :newDate.getDate();
            return [newDate.getFullYear(), month, day].join('-');
   }

   onStartDateChange=(date, dateString)=>{
     this.startDate=dateString;
   }

   onEndDateChange=(date, dateString)=>{
     this.endDate=dateString;
   }

   publishToServer=(updateType,remark)=>{

   }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const tableNames=selectedRowKeys.join(",");
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '可迁移的数据分类',
        dataIndex: 'categoryName',
        width: '30%',
      },{
        title: '数据说明',
        dataIndex: 'categoryRemark',
        width: '35%',
      },{
        title: '查询时间',
        dataIndex: 'creatTime',
        width: '15%',
      },{
        title: '变更数量',
        dataIndex: 'count',
        width: '8%',
        render: (text,record) => {return <Tag color='blue'>{text}</Tag>}
      },{
        title: '标记发布数',
        dataIndex: 'publishCount',
        width: '8%',
        render: (text,record) => {return <Tag color='red'>{text}</Tag>}
      }];
      let batchIds=this.state.selectedRowKeys.join(",");
      let modalTitle='发布设计';
      let modalForm=<SendPublishData batchIds={batchIds} close={this.closeModal} />;

      const expandedRow=(record)=>{
        return (
          <ListPublishDatas batchId={record.P_PublishResultBatchId} columns={record.columns} />
          );
      }

    return (
      <div>
	          <Modal key={Math.random()} title={modalTitle} maskClosable={false}
                visible={this.state.visible}
                width='1000px'
				        style={{ top: 20}}
                footer=''
                onOk={this.handleCancel}
                onCancel={this.handleCancel} >
                {modalForm}
            </Modal>
            <Row style={{marginBottom:5}} gutter={0} >
              <Col span={8} >
                <ButtonGroup>
                <Button  type="ghost" onClick={this.onActionClick.bind(this,'New')} icon="file" disabled={!hasSelected} >迁移</Button>
                <Button  type="ghost" onClick={AjaxUtils.showConfirm.bind(this,'打包导出','导出可发布的设计,导出后可以使用首页的导入功能重新导入!',this.download)} icon="download"  disabled={!hasSelected}  >导出</Button>
                <Button  type="primary" onClick={this.refresh} icon="reload"  loading={loading} >刷新</Button>
                <Button  type="ghost" onClick={this.searchData} icon="search" >重新查询</Button>
                </ButtonGroup>
              </Col>
              <Col span={16}>
               <span style={{float:'right'}} >
               修改开始时间:<DatePicker  defaultValue={moment(this.startDate, dateFormat)} showTime format="YYYY-MM-DD HH:mm:ss"   onChange={this.onStartDateChange} />{' '}
               修改结束时间:<DatePicker defaultValue={moment(this.endDate, dateFormat)} showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onEndDateChange} />{' '}
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
              expandedRowRender={expandedRow}
            />
      </div>
    );
  }
}

export default ListPublishCategorys;
