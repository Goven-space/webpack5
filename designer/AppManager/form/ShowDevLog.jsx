import React from 'react';
import {Button, Spin,Select,Icon,Tag} from 'antd';
import * as URI from '../../../core/constants/RESTURI';
import * as AjaxUtils from '../../../core/utils/AjaxUtils';
import * as FormUtils from '../../../core/utils/FormUtils';

const loadDataUrl=URI.CORE_DEVLOG.getById;

class ShowNotice extends React.Component{
  constructor(props){
    super(props);
    this.state={
      mask:false,
      formData:{},
      fileList:[],
    };
  }

  componentDidMount(){
    let id=this.props.id;
    if(id===undefined || id===''){
        this.setState({mask:false});
    }else{
      this.setState({mask:true});
      //载入附件数据
      FormUtils.getFiles(id,(fileList)=>{
        if(fileList.length>0){
          console.log(fileList);
          this.setState({ fileList:fileList });
        }
      });
      //载入表单数据
      let url=loadDataUrl.replace('{id}',id);
      AjaxUtils.get(url,(data)=>{
          if(data.state===false){
            AjaxUtils.showError(data.msg);
          }else{
            this.setState({formData:data,mask:false});
          }
      });
    }
  }

  render() {
    return (
      <Spin spinning={this.state.mask} tip="Loading..." >
      <div style={{marginRight:'60px',marginLeft:'60px'}}>
        <div style={{textAlign:'center',lineHeight:'30px'}}><h2>{this.state.formData.title}</h2></div>
        <div style={{textAlign:'center',lineHeight:'30px'}}><h3>发布者:{this.state.formData.creator}{' '}日期:{this.state.formData.createDate}</h3></div>
        <div style={{lineHeight:'30px',minHeight:'400px'}} dangerouslySetInnerHTML={{__html:this.state.formData.body}} >

        </div>
        <div style={{lineHeight:'30px'}} >
          { this.state.fileList.map((item)=>{
            let url=URI.baseResUrl+item.filePath;
            return (<div key={item.id}><Icon type="link" /><a href={url} target='_blank' >{item.fileName}</a></div>);
           })
          }
        </div>
        <div style={{textAlign:'center',lineHeight:'60px'}} >
          <Button type="primary" onClick={this.props.close.bind(this,false)} size='large' >
            关闭
          </Button>
        </div>
      </div>
      </Spin>
    );
  }
}

export default ShowNotice;
