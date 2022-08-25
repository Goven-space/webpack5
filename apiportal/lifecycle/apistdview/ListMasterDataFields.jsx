import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Tag,Modal,Tabs,Icon,Select,Input,Checkbox,Divider,Card,Drawer} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';

//主数据JSON字段配置

const Option = Select.Option;
const ButtonGroup = Button.Group;
const LIST_URL=URI.CORE_MasterData.fields;

class ListMasterDataFields extends React.Component {
  constructor(props) {
    super(props);
    this.parentId=this.props.id;
    this.state = {
      loading:true,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
      deleteIds:[],
      currentRecord:{},
      currentRecordId:-1,
      action:'',
    };
  }

  componentDidMount(){
      this.loadData();
  }

  //通过ajax远程载入数据
  loadData=()=>{
    this.setState({loading:true});
    let url=LIST_URL+"?id="+this.parentId;
    AjaxUtils.get(url,data=>{
      this.setState({data:data,loading:false});
    });
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '字段Id',
      dataIndex: 'fieldId',
      width:'35%',
    },{
      title: '字段类型',
      dataIndex: 'fieldType',
      width:'10%',
    },{
      title: '数据样列',
      dataIndex: 'sampleValue',
      width:'10%',
      ellipsis: true,
    },{
      title: '字段说明',
      dataIndex: 'fieldName',
      width:'10%',
    },{
      title: '必填',
      dataIndex: 'required',
      width:'5%'
    },{
      title: '长度',
      dataIndex: 'maxLength',
      width:'5%',
    }];

    return (
      <div style={{background:'#fff'}}>
            <Table
            rowKey={record => record.id}
            dataSource={data}
            columns={columns}
            loading={this.state.loading}
            pagination={false}
            size="small"
            />
      </div>
      );
  }
}

export default ListMasterDataFields;
