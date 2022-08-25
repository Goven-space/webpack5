import React, { PropTypes } from 'react';
import { Table,Icon,Tag,Button,Modal,Card,Radio} from 'antd';
import * as URI  from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';

//api 用户top详细列表

const dataUrl=URI.LIST_MONITOR.allApiCallStatisTopUrl;

class ListAppCallStatisTop extends React.Component {
  constructor(props) {
    super(props);
    this.id=this.props.id||'';
    this.state={
      selectedRowKeys:[],
      selectedRows:[],
      rowsData: [],
      loading:true,
      daynum:2,
    }
  }

  componentDidMount(){
    this.loadData();
  }

  loadData=()=>{
   this.setState({loading:true});
   let url=dataUrl+"?id="+this.id+"&daynum="+this.state.daynum;
    AjaxUtils.get(url,(data)=>{
         this.setState({loading:false});
         if(data.state===false){
           AjaxUtils.showError(data.msg);
         }else{
           this.setState({rowsData:data});
         }
     });
   }

   handleSizeChange = (e) => {
      this.state.daynum=e.target.value;
      this.loadData();
  }

  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
      title: '序号',
      dataIndex: '',
      width: '5%',
      render:(text,record,index)=>{return <Tag>{index+1}</Tag>;}
    },{
      title: '',
      dataIndex: '',
      width: '5%',
      render:(text,record,index)=>{return <Icon type="user" />;}
    },{
      title: '用户名',
      dataIndex: 'userName',
      width: '40%',
    },{
      title: '总调用次数',
      dataIndex: 'total',
      width: '30%'
    },{
      title: '平均响应时间(毫秒)',
      dataIndex: 'avg',
      width: '30%'
    }
    ];

    return (
      <div>
        <center style={{marginBottom:'10px'}}>
          统计周期：<Radio.Group value={this.state.daynum} onChange={this.handleSizeChange} >
            <Radio.Button value={2}>2天</Radio.Button>
            <Radio.Button value={7}>7天</Radio.Button>
            <Radio.Button value={15}>15天</Radio.Button>
            <Radio.Button value={30}>30天</Radio.Button>
          </Radio.Group>
        </center>

        <Table
          bordered={true}
          rowKey={record => record.userName}
          dataSource={rowsData}
          columns={columns}
          loading={loading}
          pagination={false}
        />
    </div>
    );
  }
}
export default ListAppCallStatisTop;
