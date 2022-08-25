import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Card,Modal,InputNumber,Icon,Select,Tag,Checkbox,Radio,Tabs,Popover,Switch,message} from 'antd';
import EditText from '../../../../core/components/EditText';
import EditSelect from '../../../../core/components/EditSelect';
import * as URI from '../../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../../core/utils/AjaxUtils';
import * as GridActions from '../../../../core/utils/GridUtils';
import CloumnsFieldAction from '../../../components/CloumnsFieldAction';

//数据合并后的节点配置

const TabPane = Tabs.TabPane;
const ColumnsURL=URI.ETL.PROCESSNODE.prevnodeColumnsConfig;
const Option = Select.Option;
const ButtonGroup = Button.Group;

class JoinDataFieldConfig_Merge extends React.Component {
  constructor(props) {
    super(props);
    this.getTableColumns=this.props.getTableColumns;
    this.state = {
      selectedRowKeys:[],
      loading:false,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
    };
  }

  componentDidMount(){
    let tableColumns=this.getTableColumns();
    this.setState({data:JSON.parse(tableColumns)});
  }

  refresh=(e)=>{
    e.preventDefault();
    let tableColumns=this.getTableColumns();
    this.setState({data:JSON.parse(tableColumns)});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  handleChange=(key, index, value,label,extra)=>{
    const { data } = this.state;
    if(value instanceof Array){
      value=value.join(","); //数组转为字符串
    }
    data[index][key] = value;
    this.setState({ data });
  }

  renderEditText(index, key, text,record) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  render() {
    const { data } = this.state;

    let columns=[{
      title: '字段Id',
      dataIndex: 'colId',
      width:'30%',
      render: (text, record, index) => {return record.tableName+"."+text;}
    },{
      title: '字段说明',
      dataIndex: 'colName',
      width:'30%'
    },{
      title: '数据类型',
      dataIndex: 'colType',
      width:'20%'
    },{
      title: '序号',
      dataIndex: 'index',
      width:'5%',
      render: (text, record, index) => {return index+1;}
    }
    ];

    return (
      <div  >
              <div style={{paddingBottom:10}} >
              <ButtonGroup >
                <Button type='primary'  onClick={this.refresh} icon="reload"  >刷新</Button>
              </ButtonGroup>{' '}
              </div>
              <Table
              bordered
              rowKey={record => record.id}
              dataSource={data}
              columns={columns}
              scroll={{ y: 450 }}
              loading={this.state.loading}
              pagination={false}
              size="small"
              />
      </div>
      );
  }
}

export default JoinDataFieldConfig_Merge;
