import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs,Table,Row, Col,Card,Menu,Icon,Tag,Dropdown,Popconfirm,Button,Modal,Input,Divider,Popover,Badge} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import ListWaringScopeItems from '../../../gateway/waring/grid/ListWaringScopeItems';
import ListSecurityScopeItems from '../../../gateway/security/grid/ListSecurityScopeItems';

const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL=URI.CORE_GATEWAY_SECURITY.listByApisId;
const ButtonGroup = Button.Group;
const TabPane = Tabs.TabPane;

class EditApiRules extends React.Component {
  constructor(props) {
    super(props);
    this.id=this.props.id;
    this.waringType=2;
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

  onPageChange=(pagination, filters, sorter)=>{
   this.loadData(pagination,filters,sorter);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData=(pagination=this.state.pagination, filters={}, sorter={})=>{
    let url=LIST_URL+"?id="+this.id;
    GridActions.loadData(this,url,pagination,filters,sorter);
  }


  render(){
    const rowSelection = {selectedRowKeys:this.state.selectedRowKeys,onChange: this.onSelectChange};
    const {rowsData,pagination,selectedRowKeys,loading,currentId,serviceId}=this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle ={marginTop: '8px',marginBottom: '8px',}
    const columns=[{
        title: '规则名称',
        dataIndex: 'ruleName',
        width: '30%',
      },{
        title: '规则匹配URL',
        dataIndex: 'url',
        width: '30%',
      },{
        title: '状态',
        dataIndex: 'state',
        width:'10%',
        render: (text,record) => {if(text==='Y'){return <Tag color='green'>启用</Tag>} else if(text==='N'){return <Tag color='red'>停用</Tag>}else if(text==='D'){return <Tag color='red'>调试</Tag>}}
      },{
        title: '创建者',
        dataIndex: 'creator',
        width:'10%',
      },{
        title: '最后修改',
        dataIndex: 'editTime',
        width:'15%',
      }];

      const expandedRow=(record)=>{
        return (
        <Card>
          {record.ruleType==='Waring'?
            <ListWaringScopeItems id={record.id} />
            :
            <ListSecurityScopeItems id={record.id} />
          }
        </Card>);
      }

    return (
      <div >
        <Row style={{marginBottom:5}} gutter={0} >
          <Col span={12} >
            <Button  type="primary" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
          </Col>
          <Col span={12}>
          </Col>
        </Row>
        <Table
          bordered={false}
          rowKey={record => record.id}
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

export default EditApiRules;
