import React from 'react';
import ReactDOM from 'react-dom';
import {Menu,Dropdown,Icon,Button,Modal} from 'antd';
import * as URI from '../constants/RESTURI';
import * as AjaxUtils from '../utils/AjaxUtils';
import * as GridActions from '../utils/GridUtils';
import ImportDataFromBson from '../../portal/ImportData';
import ImportAPIFromExcel from './ImportAPIFromExcel';
import ImportAPIFromOpenApi from './ImportAPIFromOpenApi';

const ButtonGroup = Button.Group;
const exportServices=URI.LIST_CORE_SERVICES.exportServices; //导出BSON APIURL
const exportServicesExcel=URI.CORE_OPENAPI_EXCELANDWORD.exportExcel;//导出EXCEL APIURL
const exportServicesWord=URI.CORE_OPENAPI_EXCELANDWORD.exportWord;//导出WORD APIURL

//对API进行导入导出操作

class ImportAndExportButton extends React.Component {
  constructor(props){
    super(props);
    this.appId=this.props.appId;
    this.ids=this.props.ids;
    this.state = {
      visible:false,
      formId:'',
    }
  }

  componentWillReceiveProps=(nextProps)=>{
    this.ids=nextProps.ids;
  }

    //导出服务(BSON)
    exportBsonData=(key,eType)=>{
      let ids=this.ids;
      if(eType==='all'){ids="";}
      let url=exportServices+"?appId="+this.appId+"&ids="+ids;
      window.open(url);
    }

    //导出服务(excel)
    exportServicesExcel=(key,eType)=>{
      let ids=this.ids;
      if(eType==='all'){ids="";}
      let url=exportServicesExcel+"?type="+eType+"&ids="+ids;
      window.open(url);
    }

    //导出服务(word)
    exportServicesWord=(key,eType)=>{
      let ids=this.ids;
      if(eType==='all'){ids="";}
      let url=exportServicesWord+"?type="+eType+"&ids="+ids;
      window.open(url);
    }

    buttonClick=(e)=>{
      if(e.key=="bson"){
        this.exportBsonData("bson","one");
      }else if(e.key=="allbson"){
        this.exportBsonData("bson","all");
      }else if(e.key=="excel"){
        this.exportServicesExcel("excel","one");
      }else if(e.key=="word"){
        this.exportServicesWord("word","one");
      }else if(e.key=="allWord"){
        this.exportServicesWord("word",this.appId);
      }else if(e.key=="allExcel"){
        this.exportServicesExcel("excel",this.appId);
      }else{
        //说明是导入
        this.setState({menuId:e.key,visible:true});
      }
    }

    handleCancel=(reLoadFlag)=>{
        this.setState({visible: false});
    }

  render() {
    const {data} = this.state;
    const exportmenu = (
      <Menu onClick={this.buttonClick} >
        <Menu.Item key="bson" disabled={this.ids===''?true:false} >导出选中API到BSON</Menu.Item>
        <Menu.Item key="excel" disabled={this.ids===''?true:false} >导出选中API到EXCEL</Menu.Item>
        <Menu.Item key="word" disabled={this.ids===''?true:false} >导出选中API到WORD</Menu.Item>
        <Menu.Item key="allWord"  >导出所有API到WORD</Menu.Item>
        <Menu.Item key="allExcel">导出所有API到EXCEL</Menu.Item>
        <Menu.Item key="allbson"  >导出所有API到BSON</Menu.Item>
      </Menu>
    );
    const importmenu = (
      <Menu onClick={this.buttonClick} >
        <Menu.Item key="importExcel" >从Excel文件导入</Menu.Item>
        <Menu.Item key="importBson" >从BSON文件导入</Menu.Item>
        <Menu.Item key="importOpenApi">从OpenAPI文档导入</Menu.Item>
      </Menu>
    );

    let modelTitle="导入API";
    let formContent;
    if(this.state.menuId=="importBson"){
        formContent=<ImportDataFromBson  close={this.handleCancel} appId={this.props.appId} />;
    }else if(this.state.menuId=="importExcel"){
        formContent=<ImportAPIFromExcel  closeModal={this.handleCancel} appId={this.props.appId} />;
    }else if(this.state.menuId=="importOpenApi"){
        formContent=<ImportAPIFromOpenApi  closeTab={this.handleCancel} appId={this.props.appId} />;
    }

    return (
      <span>
            <Modal key={Math.random()} title='导入API' maskClosable={false}
                  width='1024px'
                  style={{ top: 25 }}
                  visible={this.state.visible}
                  onCancel={this.handleCancel}
                  footer=''
                  >
                  {formContent}
            </Modal>
            <ButtonGroup>
             <Dropdown overlay={importmenu} >
                    <Button icon="upload" >
                      导入<Icon type="down" />
                    </Button>
             </Dropdown>
              <Dropdown overlay={exportmenu} >
                  <Button icon="download" >
                    导出<Icon type="down" />
                  </Button>
              </Dropdown>
           </ButtonGroup>
       </span>
        );
  }

}

export default ImportAndExportButton;
