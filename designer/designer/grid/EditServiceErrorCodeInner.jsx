import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Popconfirm,Button,Tag,Modal,Tabs,Inputm,Select,Input,Checkbox} from 'antd';
import EditText from '../../../core/components/EditText';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as GridActions from '../../../core/utils/GridUtils';
import EditSelect from '../../../core/components/EditSelect';

//API错误码配置

const Option = Select.Option;
const ButtonGroup = Button.Group;
const LIST_URL=URI.SERVICE_ERRORCODE_CONFIG.list;
const CODELIST_URL=URI.SERVICE_ERRORCODE_CONFIG.code_list;
const SAVE_URL=URI.SERVICE_ERRORCODE_CONFIG.save;
const confirm = Modal.confirm;

class EditServiceErrorCodeInner extends React.Component {
  constructor(props) {
    super(props);
    this.configId=this.props.id;
    this.appId=this.props.appId;
    this.state = {
      loading:true,
      curEditIndex:-1,
      data: [],
      newIdNum:0,
      deleteIds:[],
      currnetEditRow:{},
      CodeOpt: [],
      CodeData: []
    };
  }

  componentDidMount(){
      this.loadData();
      this.getStatusCodeOpt()
  }

  getStatusCodeOpt = () => {
    AjaxUtils.get(CODELIST_URL, (data) => {
      if(data.state === false) {
        AjaxUtils.showError(data.msg)
      }else {
        this.setState({
          CodeData:data.map(item => ({code: String(item.value.errorCode), message:item.value.errorName,description:item.value.errorMsg})),
          CodeOpt: data.map(item => ({text: item.text, value: String(item.value.errorCode)}))
        })
      }
    })
  }

  //通过ajax远程载入数据
  loadData=()=>{
    //获得列数据
    this.setState({deleteIds:[]});
    let url=LIST_URL+"?configId="+this.configId;
    GridActions.loadEditGridData(this,url,(data)=>{
      data.forEach((item,index,arr)=>{
        item.id=index;
      });
      this.setState({data:data});
    });
  }


  //保存所有数据行，不管是否有编辑都要重新保存一次
  saveData=()=>{
    this.setState({curEditIndex:-1});
    let url=SAVE_URL+"?configId="+this.configId;
    let postData=this.state.data;
    GridActions.saveEditGridData(this,url,postData,this.state.deleteIds,this.appId);
  }

  refresh=(e)=>{
    e.preventDefault();
    this.setState({curEditIndex:-1});
    this.loadData();
  }

  renderCode=(index, key, text)=>{
    if(index!==this.state.curEditIndex){return text;}
    /* let data=[{text:"200",value:"200"},{text:"4xx",value:"4xx"},{text:"3xx",value:"3xx"},{text:"500",value:"500"}]; */
    return (<EditSelect value={text} data={this.state.CodeOpt} size='small' options={{mode:'combobox'}} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderDataType=(index, key, text)=>{
    if(index!==this.state.curEditIndex){return text;}
    let data=[{text:"JSON",value:"JSON"},{text:"ARRAY",value:"ARRAY"},{text:"STRING",value:"STRING"}];
    if(text===''||text===undefined){text="STRING";}
    return (<EditSelect value={text} data={data} size='small' options={{mode:'combobox'}} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditText=(index, key, text)=>{
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='small' onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditRefId=(index, key, text)=>{
    if(index!==this.state.curEditIndex){return text;}
    return (<Input value={text} placeholder='数据模型id|BeanId|Class路径' size='small' onChange={e => this.handleChange(key, index, e.target.value)} />);
  }

  renderTextArea=(index, key, text)=>{
    if(index!==this.state.curEditIndex){return text;}
    return (<Input.TextArea value={text} autosize size='small' onChange={(e) => this.handleChange(key, index, e.target.value)} />);
  }


  deleteRow=(id)=>{
    //删除选中行
    let deleteIds=this.state.deleteIds;
    if(id!==undefined && id!==""  && id!==null){
      if(id.length>10){
        deleteIds.push(id);
      }
      let data=this.state.data.filter((dataItem) => dataItem.id!==id);
      this.setState({data,deleteIds});
    }
  }

  handleChange(key, index, value) {
    const { data,CodeData } = this.state;
    if(key === 'code' && CodeData.find(item => item.code === value)) {
      let itemData = CodeData.find(item => item.code === value)
      itemData.EditFlag=true
      data[index] = {...data[index],...itemData}
    }else {
      data[index][key] = value; 
      data[index].EditFlag=true;
    }
    /* data[index][key] = value; 
    data[index].EditFlag=true; //标记为已经被修改过*/
    this.setState({ data:data });
  }
  insertRow=()=>{
    //新增加一行
    let newData=this.state.data;
    let key=newData.length+1;
    let newRow={id:key,EditFlag:true,contentDataType:"STRING",code:'',message:'',description:''};
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }
  editRow=(record,index)=>{
    this.setState({curEditIndex:index,currnetEditRow:record,visible:true});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: '状态码',
      dataIndex: 'code',
      width:'10%',
      render: (text, record, index) =>this.renderCode(index,'code',text),
    },/* {
      title: '数据类型',
      dataIndex: 'contentDataType',
      width:'10%',
      render: (text, record, index) =>this.renderDataType(index,'contentDataType',text),
    },{
      title: '引用对象ID',
      dataIndex: 'contentModelRef',
      width:'15%',
      render: (text, record, index) =>this.renderEditRefId(index,'contentModelRef',text),
    }, */{
      title: '输出消息',
      dataIndex: 'message',
      width:'30%',
      render: (text, record, index) =>this.renderEditText(index,'message',text),
    },{
      title: '详细描述',
      dataIndex: 'description',
      width:'25%',
      render: (text, record, index) =>this.renderTextArea(index,'description',text),
    },{
      title: '操作',
      dataIndex: 'action',
      width: '10%',
      render: (text, record, index) => {
        return (<span><a onClick={() => this.deleteRow(record.id)}>删除</a></span>);
      },
    }];


    return (
      <div>
            <div style={{paddingBottom:5}}  >
            <ButtonGroup>
              <Button type="primary" onClick={this.saveData} icon="save"  >保存配置</Button>
              <Button  onClick={this.insertRow} icon="plus-circle-o"  >新增配置</Button>
              <Button  onClick={this.refresh} icon="reload"  >刷新</Button>
            </ButtonGroup>
            </div>
            <Table
            rowKey={record => record.id}
            dataSource={data}
            columns={columns}
            onRowClick={this.onRowClick}
            loading={this.state.loading}
            pagination={false}
            size="small"
            />
      </div>
      );
  }
}

export default EditServiceErrorCodeInner;
