import React from 'react';
import { Tree, Table, Icon, Button, Select, Input, Tag, Row, Col, Spin, Typography,Radio} from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import { any } from 'prop-types';

const InputGroup = Input.Group;
const TypographyTitle = Typography.Title;
const Option = Select.Option;
const ButtonGroup = Button.Group;

const listRestUrl = URI.ESB.CORE_ESB_API.selectAPI;
const applicationMenuUrl = URI.ESB.CORE_ESB_API.selectApplication;

//服务选择用
class ListSelectResourceByAppId extends React.Component {
  constructor(props) {
    super(props);
    this.defaultPagination = { pageSize: 15, current: 1, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` }
    this.state = {
      pagination: { pageSize: 15, current: 1, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` },
      selectedRowKeys: [],
      selectedRows: [],
      rowsData: [],
      loading: true,
      searchKeyWords: '',
      selectAppId: this.props.appId || 'esb',
      onSelect: [],
      selectedKeys: ['allapis'],
      openKeys: [],
      treeData: [],
      appId:'',
      publishFlag:0,
      mask: false,
      isNeedCategoryId: true,/* 如果是root不需要把selectedKeys传过去 */
    }
  }

  componentDidMount() {
    this.loadData(undefined,{configType:['REG','WEBSERVICE','DUBBO','RestToWebService','JOIN']},{},{},true);
    this.getTreeData()
  }



  //载入菜单
  getTreeData = () => {
    this.setState({ mask: true });
    let url=applicationMenuUrl+"?publishFlag="+this.state.publishFlag;
    AjaxUtils.get(url, (data) => {
      this.setState({ mask: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        const newTreeData = []
        const openKeys = []/* 获取默认需要全部展开的父项 */
        const selectedKeys = []/* 获取默认选中的第一项 */
        if (data.rows.length) {
          data.rows.forEach(item => {
            /* if (item.appId !== 'allapis') {} */
              const obj = {
                key: item.key,
                title: item.label,
                children: [],
                appId: item.appId,
                selectable:true,
                parentNodeId:'root'
              }
              if (item.children && item.children.length) {
                openKeys.push(item.key)
                obj.children = this.dealTreeData(item.children,openKeys,selectedKeys)
                obj.selectable = false
              }else {
                if(!selectedKeys.length) {
                  selectedKeys.push(item.key)
                }

              }
              newTreeData.push(obj)

          })
        }
        this.setState({treeData:newTreeData,/* openKeys,selectedKeys */})
      }
    });
  }

  dealTreeData = (arr=[], openKeyArr=[], selectedKeyArr=[]) => {
    return arr.map(item => {
      const obj = {
        key: item.key,
        title: item.label,
        children: [],
        appId: item.appId,
        selectable:true
      }
      if(item.children && item.children.length) {
        openKeyArr.push(item.key)
        obj.children =  this.dealTreeData(item.children, openKeyArr, selectedKeyArr)
        obj.selectable = false
      }else {
        if(!selectedKeyArr.length) {
          selectedKeyArr.push(item.key)
        }

      }
      return obj
    })
  }


  //记录选中行的key关键字，可以翻页选
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys: selectedRowKeys, selectedRows });
  }

  //返回选中的所有行
  getSelectedRows = () => {
    return this.state.selectedRows;
  }



  onRowSelect = (record, selected, selectedRows) => {
    let oldSelectedRows = this.state.selectedRows;
    if (selected) {
      //选中加入
      if (!this.hadSelectedRow(oldSelectedRows, record)) {
        oldSelectedRows.push(record);
      }
    } else {
      //取消选择
      oldSelectedRows = oldSelectedRows.filter((item) => {
        return item.id !== record.id;
      });
    }
    // console.log(oldSelectedRows);
    this.setState({ selectedRows: oldSelectedRows });
  }

  //看是否已经选中，如果已经选中不再加入
  hadSelectedRow = (selectedRows, record) => {
    let r = false;
    selectedRows.forEach((item) => {
      if (item.id === record.id) {
        r = true;
      }
    });
    return r;
  }

  onPageChange = (pagination, filterDatas, sorter) => {
    let filters = {};
    if(!this.state.appId) {
      filters={configType:['REG','WEBSERVICE','DUBBO','RestToWebService','JOIN']}
    }else if(!this.state.isNeedCategoryId) {
      filters={appId:[this.state.appId]}
    }else {
      filters={appId:[this.state.appId],categoryIdthis: this.state.selectedKeys}
    }
    this.loadData(pagination, filters, sorter);
  }

  //通过ajax远程载入数据
  search = () => {
    this.setState({ selectedRowKeys: [], selectedRows: [] });//搜索时先清空已经选择的
    if (this.props.onSelect !== undefined) {
      this.props.onSelect([]); //搜索时清空
    }
    let filters = {};
    if(!this.state.appId) {
      filters={configType:['REG','WEBSERVICE','DUBBO','RestToWebService','JOIN']}
    }else if(!this.state.isNeedCategoryId) {
      filters={appId:[this.state.appId]}
    }else {
      filters={appId:[this.state.appId],categoryIdthis: this.state.selectedKeys}
    }
    this.loadData(this.defaultPagination,filters,{ "order": 'ascend', "field": 'mapUrl' })
  }

  //通过ajax远程载入数据
  loadData = (pagination = this.state.pagination, filters = {}, sorter = {}, searchFilters={ "mapUrl": this.state.searchKeyWords,"creator": this.state.searchKeyWords,"creatorName": this.state.searchKeyWords,"tags": this.state.searchKeyWords, "configName": this.state.searchKeyWords },isNeedSelected=false ) => {
    let url=listRestUrl+"?publishFlag="+this.state.publishFlag;
    GridActions.loadData(this, url, pagination, filters, sorter, searchFilters, (data) => {
      if(isNeedSelected && this.props.serviceId) {
        const selectedItem =  data.rows.find(item => item.id===this.props.serviceId)
        if(selectedItem) {
          this.setState({
            selectedRowKeys:[selectedItem.id],
            selectedRows:[selectedItem]
          })
        } /* */
      }
      this.setState({ rowsData: data.rows, pagination: {...this.state.pagination,total:data.total, current:data.pageNo, pageSize:data.pageSize} });
    });
  }

  onSearchChange = (e) => {
    this.setState({
      searchKeyWords: e.target.value,
    })
  }

  onSelect = (selectedKeys, e) => {
    const {node:{props}} = e
    this.setState({
      selectedKeys,
      appId: selectedKeys[0]==='allapis'?undefined:props.appId,
      isNeedCategoryId: props.parentNodeId==='root'?false:true,
      searchKeyWords:''
    })
    if(selectedKeys[0] === 'allapis') {
      this.loadData(this.defaultPagination,{configType:['REG','WEBSERVICE','DUBBO','RestToWebService','JOIN']},{},{},true);
    }else {
      this.loadData(this.defaultPagination,{appId:[props.appId],categoryId:props.parentNodeId==='root'?undefined:selectedKeys},{},{})
    }
  }

  onOpenChange = (openKeys, e) => {
    this.setState({
      openKeys
    })
  }

  setPublishFlag=(e)=>{
    let value=e.target.value;
    this.state.publishFlag=value;
    this.state.pagination.current=1;
    this.state.appId='';
    this.state.categoryIdthis='';
    this.setState({publishFlag:value});
    this.loadData(undefined,{configType:['REG','WEBSERVICE','DUBBO','RestToWebService','JOIN']},{},{},true);
    this.getTreeData();
  }


  render() {
    const rowSelection = { selectedRowKeys: this.state.selectedRowKeys, onChange: this.onSelectChange, type:'radio'/* onSelect: this.onRowSelect */ };
    const { rowsData, pagination, selectedRowKeys, loading } = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const columns = [{
      title: 'Method',
      dataIndex: 'methodType',
      width: '10%',
      render: (text, record) => {
        let method = record.methodType;
        if (method === "POST") {
          return <Tag color="#87d068" style={{ width: 50 }} >POST</Tag>;
        } else if (method === "GET") {
          return <Tag color="#108ee9" style={{ width: 50 }} >GET</Tag>;
        } else if (method === "DELETE") {
          return <Tag color="#f50" style={{ width: 50 }} >DELETE</Tag>;
        } else if (method === "PUT") {
          return <Tag color="pink" style={{ width: 50 }} >PUT</Tag>;
        } else if (method === "*") {
          return <Tag color="#f50" style={{ width: 50 }} >全部</Tag>;
        }else {
          return <Tag color="blue" style={{ width: 50 }} >{text}</Tag>;
        }
      }
    }, {
      title: '服务名',
      dataIndex: 'configName',
      width: '30%',
      sorter: true,
      ellipsis: true,
    }, {
      title: '服务URL',
      dataIndex: 'mapUrl',
      width: '50%',
      sorter: true,
      ellipsis: true,
    }, {
      title: '应用',
      dataIndex: 'appId',
      width: '10%',
      sorter: true,
    }];

    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
          <Row>
            <Col span={4} style={{ height: 730, overflowY: "auto", marginRight: 20 }}>
              <TypographyTitle level={3}><Tag color='magenta'>应用分类：</Tag></TypographyTitle>
              <Tree
                onSelect={this.onSelect}
                expandedKeys={this.state.openKeys}
                selectedKeys={this.state.selectedKeys}
                onExpand={this.onOpenChange}
                showIcon={true}
                showLine={true}
                treeData={this.state.treeData}
                defaultExpandAll={true}
                autoExpandParent={true}
              >
              </Tree>
            </Col>
            <Col span={19} style={{ height: 730, overflowY: "auto" }}>
              <div style={{ marginTop: '0px', marginBottom: '8px',  }}>
                <Row>
                    <Col span={12} >
                      <Radio.Group  value={this.state.publishFlag} onChange={this.setPublishFlag} >
                        <Radio.Button  value={0} >本节点未发布API</Radio.Button>
                        <Radio.Button  value={1} >所有已发布API</Radio.Button>
                      </Radio.Group>
                    </Col>
                    <Col span={12} >
                      <InputGroup compact style={{ fontSize: '14px' }} >
                        <Input.Search placeholder="请输入要搜索的API的URL或名称" style={{ width: '100%',float:'right' }} onChange={this.onSearchChange} value={this.state.searchKeyWords} onSearch={this.search}/>
                      </InputGroup>
                    </Col>
                  </Row>
              </div>
              <Table
                bordered={false}
                rowKey={record => record.id}
                rowSelection={rowSelection}
                dataSource={rowsData}
                columns={columns}
                loading={loading}
                onChange={this.onPageChange}
                pagination={pagination}
                size='small'
              />
            </Col>
          </Row>
      </Spin>
    );
  }
}

export default ListSelectResourceByAppId;
