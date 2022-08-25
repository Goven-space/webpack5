import React from 'react';
import { Table, Card, Icon, Menu, Dropdown, Popconfirm, Button, Modal, Input, Row, Col, Tag, Radio, DatePicker } from 'antd';
import * as URI from '../../core/constants/RESTURI';
import * as AjaxUtils from '../../core/utils/AjaxUtils';
import * as GridActions from '../../core/utils/GridUtils';
import AjaxSelect from '../../core/components/AjaxSelect';
import ReactJson from 'react-json-view';
import moment from 'moment';

//mq接收到的消息log

const dateFormat = 'YYYY-MM-DD';
const ButtonGroup = Button.Group;
const Search = Input.Search;
const confirm = Modal.confirm;
const LIST_URL = URI.MQBUS.CORE_MQ_RECEIVE_MESSAGE.list; //分页显示
const CLEAR_URL = URI.MQBUS.CORE_MQ_RECEIVE_MESSAGE.clear;//清空
const RESEND_URL = URI.MQBUS.CORE_MQ_RECEIVE_MESSAGE.resend;//重发
const DELETE_URL = URI.MQBUS.CORE_MQ_RECEIVE_MESSAGE.delete;//删除
const LIST_LOGDB = URI.LIST_MONITOR_CENTER.selectLogDb;

class ListMqRecevieMessage extends React.Component {
  constructor(props) {
    super(props);
    this.parentId = this.props.parentId;
    this.startDate = this.getLastSevenDays();
    this.endDate = this.getNowFormatDate();
    this.state = {
      pagination: { pageSizeOptions: [10, 20, 50, 100], pageSize: 50, current: 1, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` },
      selectedRowKeys: [],
      selectedRows: [],
      rowsData: [],
      departmentCode: '',
      loading: true,
      visible: false,
      currentId: '',
      searchKeyWords: '',
      action: 'edit',
      assertStatus: '6',
      logDbName: ''
    }
  }

  componentDidMount() {
    this.loadData();
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys: selectedRowKeys, selectedRows: selectedRows });
  }

  onPageChange = (pagination, filters, sorter) => {
    this.loadData(pagination, filters, sorter);
  }

  onActionClick = (action, record, url) => {
    if (action === "New") {
      this.setState({ visible: true, currentId: '', action: 'edit' });
    } else if (action === "Delete") {
      this.deleteData(record.id);
    } else if (action === "Edit") {
      this.setState({ visible: true, currentId: record.id, action: 'edit' });
    }
  }

  refresh = (e) => {
    e.preventDefault();
    this.loadData();
  }

  //通过ajax远程载入数据
  loadData = (pagination = this.state.pagination, filters = {}, sorter = {}) => {
    this.url = LIST_URL + "?parentId=" + this.parentId + "&status=" + this.state.assertStatus + "&logDbName=" + this.state.logDbName + "&startDate=" + this.startDate + "&endDate=" + this.endDate;
    GridActions.loadData(this, this.url, pagination, filters, sorter);
  }

  deleteData = (argIds) => {
    GridActions.deleteData(this, DELETE_URL, argIds);
  }

  showConfirm = () => {
    var self = this;
    confirm({
      title: '清空确认?',
      content: '注意:清空后不可恢复!',
      onOk() {
        return self.clear();
      },
      onCancel() { },
    });
  }

  clear = () => {
    this.setState({ loading: true });
    AjaxUtils.post(CLEAR_URL, { parentIds: this.parentId }, (data) => {
      this.setState({ loading: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        AjaxUtils.showInfo("共清除(" + data.msg + ")条数据!");
      }
      this.loadData();
    });
  }

  resend = () => {
    this.setState({ loading: true });
    let ids = this.state.selectedRowKeys.join(",");
    AjaxUtils.post(RESEND_URL, { ids: ids, logDbName:this.state.logDbName }, (data) => {
      this.setState({ loading: false });
      if (data.state === false) {
        AjaxUtils.showError(data.msg);
      } else {
        AjaxUtils.showInfo(data.msg);
      }
      this.loadData();
    });
  }

  handleCancel = (e) => {
    this.setState({ visible: false, });
  }

  setStatus = (e) => {
    this.state.pagination.current = 1;
    let value = e.target.value;
    this.state.assertStatus = value;
    this.loadData();
  }

  logDbChange = (dbName) => {
    this.setState({ logDbName: dbName }, () => {
      this.loadData();
    });

  }

  onStartDateChange = (date, dateString) => {
    this.startDate = dateString;
  }

  onEndDateChange = (date, dateString) => {
    this.endDate = dateString;
  }

  getNowFormatDate = (prvNum) => {
    let date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate() + 1;
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    let currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
  }

  getLastSevenDays = (date) => {
    var date = date || new Date(),
      timestamp,
      newDate;
    if (!(date instanceof Date)) {
      date = new Date(date.replace(/-/g, '/'));
    }
    timestamp = date.getTime();
    newDate = new Date(timestamp - 7 * 24 * 3600 * 1000);
    var month = newDate.getMonth() + 1;
    month = month.toString().length == 1 ? '0' + month : month;
    var day = newDate.getDate().toString().length == 1 ? '0' + newDate.getDate() : newDate.getDate();
    return [newDate.getFullYear(), month, day].join('-');
  }

  render() {
    const rowSelection = { selectedRowKeys: this.state.selectedRowKeys, onChange: this.onSelectChange };
    const { rowsData, pagination, selectedRowKeys, loading, currentId } = this.state;
    const hasSelected = selectedRowKeys.length > 0;
    const divStyle = { marginTop: '8px', marginBottom: '8px', }
    const columns = [{
      title: '接收时间',
      dataIndex: 'receivedTime',
      width: '15%',
      sorter: true,
    }, {
      title: '转发状态',
      dataIndex: 'status',
      width: '10%',
      render: (text, record) => {
        if (text === 1) {
          return <Tag color='green'>成功</Tag>
        } else if (text === 2) {
          return <Tag color='red'>重试失败</Tag>
        } else {
          return <Tag color='red' >失败</Tag>
        }
      }
    }, {
      title: '重试次数',
      dataIndex: 'resendCount',
      width: '10%',
    }, {
      title: '结果',
      dataIndex: 'responseBody',
      width: '65%',
      ellipsis: true,
    }];

    const expandedRow = (record) => {
      return (
        <ReactJson src={record} />
      );
    }

    return (
      <Card title="MQ消费日志" size="small" >
        <Row style={{ marginBottom: 5 }} gutter={0} >
          <Col span={24} >
            <Radio.Group value={this.state.assertStatus} onChange={this.setStatus} >
              <Radio.Button value="6">所有记录</Radio.Button>
              <Radio.Button value="1">成功的</Radio.Button>
              <Radio.Button value="0">失败的</Radio.Button>
              <Radio.Button value="2">重试失败的</Radio.Button>
            </Radio.Group>
            {' '}
            <ButtonGroup style={{marginBottom:'5px'}}>
              <Button type="ghost" onClick={AjaxUtils.showConfirm.bind(this, '重发消息', '需要重新发送选中消息吗?', this.resend)} icon="check" disabled={!hasSelected}  >重发消息</Button>
              <Button type="ghost" onClick={AjaxUtils.showConfirm.bind(this, '删除消息', '删除选中消息吗?', this.deleteData)} icon="delete" disabled={!hasSelected}  >删除</Button>
              <Button type="ghost" onClick={this.showConfirm} icon="delete"  >清空消息</Button>
              <Button type="primary" onClick={this.refresh} icon="reload" loading={loading} >刷新</Button>
            </ButtonGroup>
            <br/>
            日志库：<AjaxSelect url={LIST_LOGDB} value={this.state.logDbName} onChange={this.logDbChange} valueId='dbName' textId='dbName' options={{ placeholder: '选择日志库', showSearch: true, style: { minWidth: '200px' } }} />{' '}
            开始时间:<DatePicker defaultValue={moment(this.startDate, dateFormat)} showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onStartDateChange} />{' '}
            结束时间:<DatePicker defaultValue={moment(this.endDate, dateFormat)} showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.onEndDateChange} />{' '}
            <Button type="primary" onClick={this.loadData} icon="search" >开始查询</Button>{' '}
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
          size='small'
          expandedRowRender={expandedRow}
        />
      </Card>
    );
  }
}

export default ListMqRecevieMessage;
