import React from 'react';
import ReactDOM from 'react-dom';
import { Table,Button,Radio} from 'antd';
import EditText from '../../../core/components/EditText';
import EditSelect from '../../../core/components/EditSelect';
import EditSelectOne from '../../../core/components/EditSelectOne';
import EditTextArea from '../../../core/components/EditTextArea';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const ButtonGroup = Button.Group;
const RadioGroup = Radio.Group;

const headerOptListUrl=URI.NEW_SERVICE.headerOptList;
const GetHEADERPARADATA_URL=URI.SERVICE_HEADER_CONFIG.list;
const SAVEHEADERPARADATA_URL=URI.SERVICE_HEADER_CONFIG.save;

class EditApiHeadersParams extends React.Component {
  constructor(props) {
    super(props);
    this.configId = this.props.id;
    this.state = {
      curEditIndex:-1,
      newIdNum:0,
      data:[],
      HeaderOpt:[],
      HeaderData:[],
      backendHeaderParams: '',
      backendHaderTransparent: 1
    };
  }

  componentDidMount(){
    this.getHeaderParamsData()
    this.getHeaderListOpt()
  }

  getHeaderParamsData = () =>{
    AjaxUtils.get(`${GetHEADERPARADATA_URL}?configId=${this.configId}`, (data) => {
      if(data.state === false) {
        AjaxUtils.showError(data.msg)
      }else {
          const headerData = this.setData(data.backendHeaderParams)
          this.setState({
            data: headerData,
          backendHaderTransparent: data.backendHaderTransparent
        })
      }
    })
  }

  getHeaderListOpt = () => {
    AjaxUtils.get(headerOptListUrl, (data) => {
      if(data.state === false) {
        AjaxUtils.showError(data.msg)
      }else {
        this.setState({
          HeaderData:data.map(item => ({headerId: item.value?String(item.value.headerId):'', headerValue:item.value.headerValue,description:item.value.errorMsg, headerName:item.value.headerName,headerType:item.value.headerType})),
          HeaderOpt: data.map(item => ({text: item.text, value: item.value?String(item.value.headerId):''})) /**/
        })
      }
    })
  }

  getData=()=>{
    let jsonStr=JSON.stringify(this.state.data);
    return jsonStr;
  }

   setData=(headerParams)=>{
    if(headerParams==='' || headerParams==undefined){
      headerParams="[]"
    }
    let jsonData=JSON.parse(headerParams);
    return jsonData.map((item,index)=>{
        item.id= AjaxUtils.guid();
        return item
    });
  }

  renderEditText(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    return (<EditText value={text} size='default' onChange={value => this.handleChange(key, index, value)} />);
  }

  handleBackendHaderTransparentChange = (e) => {
    this.setState({
        backendHaderTransparent: e.target.value
    })
  }

  renderHeader(index, key, text) {
    if(index!==this.state.curEditIndex){return text;}
    /* let data=[
      {text:"Content-Type",value:'Content-Type'},
      {text:"Authorization",value:'Authorization'},
      {text:"Connection",value:'Connection'},
      {text:"identitytoken",value:'identitytoken'},
      {text:"SOAPAction",value:'SOAPAction'}
      ]; */
    return (<EditSelect value={text} data={this.state.HeaderOpt}  onChange={value => this.handleChange(key, index, value)} />);
  }

  renderEditTextArea(index, key, text,placeholder) {
    if(text===undefined || text==='undefined'){text='';}
    if(index!==this.state.curEditIndex){return text;}
    text=AjaxUtils.formatJson(text).trim(); //?????????json???????????????
    return (<EditTextArea value={text} size='default' placeholder={placeholder} onChange={value => this.handleChange(key, index, value)} />);
  }

  renderType(index, key, text) {
    if(index!==this.state.curEditIndex){
      if(text==='OVER'){return '??????(???????????????????????????)';}
      if(text==='DELETE'){return '??????(???????????????)';}
      if(text==='COPY'){return '??????(???????????????)';}
      if(text==='BASIC'){return 'Basic????????????';}
      return text;
    }
    let data=[
      {value:"OVER",text:'??????(???????????????????????????)'},
      {value:"DELETE",text:'??????(???????????????)'},
      {value:"COPY",text:'??????(???????????????)'},
      {value:"BASIC",text:'Basic????????????(??????:userId:password)'},
    ];
    return (<EditSelectOne value={text} data={data}   onChange={value => this.handleChange(key, index, value)} />);
  }

  deleteRow=(id)=>{
    //???????????????
    let data=this.state.data.filter((dataItem) => dataItem.id!==id);
    data.forEach((v,index,item)=>{
      data[index].id=index;
    });
    this.setState({data});
  }

  handleChange=(key, index, value)=>{
    const { data, HeaderData} = this.state;
    if(key === 'headerId' && HeaderData.find(item => item.headerId === value)) {
      let itemData = HeaderData.find(item => item.headerId === value)
      data[index] = {...data[index],...itemData}
    }else {
      data[index][key] = value
    }
    ;
    this.setState({ data });
  }

  insertRow=()=>{
    this.getHeaderListOpt()
    //???????????????
    let key=this.state.data.length+1;
    let newRow={id:key,headerId:'',headerValue:'',/* headerType:'OVER' */};
    let newData=this.state.data;
    newData.push(newRow);
    this.setState({data:newData,curEditIndex:-1,newIdNum:key});
  }

  onRowClick=(record, index)=>{
    this.setState({curEditIndex:index});
  }

  refresh = () => {
    this.getHeaderParamsData()
  }

  saveData = () => {
    this.setState({ curEditIndex: -1});
    const {backendHaderTransparent, data} = this.state
    let postData = { configId: this.configId, headerData: JSON.stringify({backendHaderTransparent:backendHaderTransparent,backendHeaderParams:JSON.stringify(data)}) };
    AjaxUtils.post(SAVEHEADERPARADATA_URL, postData, data => {
      if (data.state == false) {
        AjaxUtils.showError(data.msg);
      } else {
        AjaxUtils.showInfo('???????????????');
      }
    });
  }

  render() {
    const { data } = this.state;
    const columns=[{
      title: 'Header',
      dataIndex: 'headerId',
      render: (text, record, index) => this.renderHeader(index,'headerId', text),
      width:'30%',
    },{
      title: 'Header???',
      dataIndex: 'headerValue',
      render: (text, record, index) =>this.renderEditTextArea(index,'headerValue',text,"????????????:${$config.??????Id}"),
      width:'40%',
    },{
      title: '????????????',
      dataIndex: 'headerType',
      render: (text, record, index) =>this.renderType(index,'headerType',text),
      width:'20%',
    },{
      title: '??????',
      dataIndex: 'action',
      width:'10%',
      render: (text, record, index) => {
        return (<div>
          <a onClick={() => this.deleteRow(record.id)}>??????</a></div>);
      },
    }];

    return (
        <div>
          <div style={{ paddingBottom: 5 }}>
            <ButtonGroup>
                <Button type="primary" onClick={this.saveData} icon="save"  >????????????</Button>
                <Button onClick={this.insertRow} icon="plus"  >??????Header???</Button>
                <Button onClick={this.refresh} icon="reload"  >??????</Button>
            </ButtonGroup>
          </div>
            <Table
            rowKey={record => record.id}
            dataSource={data}
            columns={columns}
            onRowClick={this.onRowClick}
            pagination={false}
            size="small"
            />
            <div style={{marginTop:20}}>
                    <RadioGroup value={this.state.backendHaderTransparent} onChange={this.handleBackendHaderTransparentChange} defaultValue={0}>
                    <Radio value={1}>????????????Header</Radio>
                    <Radio value={0}>???</Radio>
                    </RadioGroup>
            </div>
        </div>
      );
  }
}

export default EditApiHeadersParams;
