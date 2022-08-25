import React from 'react';
import {Table,Card,Icon,Menu,Dropdown,Popconfirm,Button,Modal,Input,Row,Col,Tag,Badge} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import ListAppServiceCategoryNode from './ListAppServiceCategoryNode';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_APPSERVICECATEGORY.ListAppCategorys; //分页显示

class ListAppServiceCategoryMgr extends React.Component {
  constructor(props) {
    super(props);
    this.appId=this.props.appId;
    this.state={
      rowsData: [],
      loading: true,
    }
  }

  componentDidMount(){
    this.loadData();
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  loadData=()=>{
    this.setState({loading:true});
     let url=LIST_URL+"?appId="+this.appId;
     AjaxUtils.get(url,(data)=>{
      this.setState({loading:false});
      if(data.state===false){
          AjaxUtils.showError(data.msg);
      }else{
          this.setState({rowsData:data});
      }
    });
  }


  render(){
    const {rowsData,pagination,loading,currentId}=this.state;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '分类名',
        dataIndex: 'categoryName',
        width: '50%',
        render:(text,record)=>{return <span>{text}{' '}<Badge count={record.nodeCount} style={{ backgroundColor: '#87d068' }} /></span>;}
      },{
        title: '分类id',
        dataIndex: 'categoryId',
        width: '40%',
      },{
        title: '所属应用',
        dataIndex: 'appId',
        width: '10%',
        render:(text,record)=>{return this.appId;}
      }];

    const expandedRow=(record)=>{
      return (<Card><ListAppServiceCategoryNode categoryId={record.categoryId} appId={this.appId} rootName={record.categoryName}/></Card>);
    }

    return (
      <div style={{minHeight:600}}>
            <Button  type="ghost" onClick={this.refresh} icon="reload"  loading={loading} style={{marginBottom:'5px'}} >刷新</Button>
            <Table
              bordered={false}
              rowKey={record => record.categoryId}
              dataSource={rowsData}
              columns={columns}
              loading={loading}
              expandedRowRender={expandedRow}
            />
        </div>
    );
  }
}

export default ListAppServiceCategoryMgr;
