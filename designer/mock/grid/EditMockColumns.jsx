import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Icon} from 'antd';
import * as GridActions from '../../../core/utils/GridUtils';
import EditText from '../../../core/components/EditText';
import EditSelect from '../../../core/components/EditSelect';
import * as URI  from '../../../core/constants/RESTURI';

const ButtonGroup = Button.Group;
const listAllRulesUrl=URI.CORE_MOCK_RULE.listAllSelect;

class EditMockColumns extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      curEditIndex:-1,
      data:this.props.data||[],
      newIdNum:0,
    };
  }

  loadParentData=(data)=>{
    this.setState({data:data,newIdNum:data.length});
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderValueSelect(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditSelect value={text} url={listAllRulesUrl} size='small' options={{mode:'combobox'}} onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    //删除选中行
    let data=this.state.data.filter((dataItem) => dataItem.id!==id);
    this.setState({data});
    this.props.onChange(data); //传给父控件
  }

  handleChange(key, index, value) {
    const { data } = this.state;
    data[index][key] = value;
    this.setState({ data });
    this.props.onChange(this.state.data); //传给父控件
  }

  insertRow=()=>{
    //新增加一行
    let key=this.state.newIdNum+1;
    let newRow={id:key,colId:'',colName:'',colValue:''};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    // console.log(record);
    this.setState({curEditIndex:index});
  }

  render() {
    const { data } = this.state;
    const divStyle ={marginTop: '2px',marginBottom: '5px',}
    const columns=[{
      title: '数据列Id',
      dataIndex: 'colId',
      render: (text, record, index) => this.renderEditText(index,'colId', text),
      width:'width:20%',
    },{
      title: '中文说明',
      dataIndex: 'colName',
      render: (text, record, index) =>this.renderEditText(index,'colName',text),
      width:'width:20%',
    }, {
      title: '模拟值',
      dataIndex: 'colValue',
      width:'50%',
      render: (text, record, index) => this.renderValueSelect(index, 'colValue', text),
    },{
      title: '删除',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (<div><a onClick={() => this.deleteRow(record.id)}>删除</a></div>);
      },
    }];

    return (
      <div>
        <div style={divStyle}>
          <ButtonGroup>
          <Button type="primary"  onClick={this.props.loadData} icon="reload"  >载入数据模型列配置</Button>
          <Button  onClick={this.insertRow} icon="plus-circle-o" >新增字段</Button>
          </ButtonGroup>
       </div>

        <Table
        rowKey={record => record.id}
        dataSource={data}
        columns={columns}
        onRowClick={this.onRowClick}
        pagination={false}
        size="small"
        scroll={{ y: 450 }}
        />
      </div>
      );
  }
}

export default EditMockColumns;
