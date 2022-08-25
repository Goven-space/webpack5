import React from 'react';
import ReactDOM from 'react-dom';
import {Input,Switch} from 'antd';
import ReactQuill, { Quill } from 'react-quill';
import '../../node_modules/react-quill/dist/quill.snow.css';

class Editor extends React.Component{
  constructor(props){
    super(props);
    this.state={
	   text:'',
     htmlCode:'',
     showCode:'none',
     showEditor:'',
     editorMode:false,
    };
  }

  setText=(text)=>{
    if(text.substring(0,3)==='<p>' || text.substring(0,4)==='<li>' || text.substring(0,4)==='<ol>' || text.substring(0,4)==='<ul>' ){
      console.log(1);
      this.setState({text:text,htmlCode:text,editorMode:false,showEditor:'',showCode:'none'});
    }else{
      console.log(2);
      this.setState({text:text,htmlCode:text,editorMode:true,showEditor:'none',showCode:''});
    }
  }

  onBodyChange=(text)=>{
    // console.log("当前模式="+this.state.editorMode);
    if(this.state.editorMode===false){
      //只有设计模式时才更新
      // console.log("更新设计模式="+text);
      this.setState({text:text});
      this.props.onChange(text);
    }
  }

  onSwitchChange=(checked)=>{
    if(checked){
      this.setState({editorMode:checked,showCode:'',showEditor:'none',htmlCode:this.state.text});
    }else{
      this.setState({editorMode:checked,showCode:'none',showEditor:'',text:this.state.htmlCode});
    }
  }
  onInputPressEnter=(e)=>{
    let text=e.target.value;
    this.setState({htmlCode:text});
    this.props.onChange(text);
    // console.log("更新源码模式="+text);
  }

  render() {
  const modules={
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline','strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],[{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  }

  const formats=[
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'color','background'
  ]
	return(
    <div>
      <div style={{display:this.state.showEditor}}>
    	  <ReactQuill
    		{...this.props.options}
    		modules={modules}
        formats={formats}
    		value={this.state.text}
    		onChange={this.onBodyChange}
    	  />
      </div>
      <Input.TextArea value={this.state.htmlCode} onChange={this.onInputPressEnter} autosize={{ minRows: 18, maxRows: 18 }} style={{display:this.state.showCode}}/>
      <Switch checked={this.state.editorMode} onChange={this.onSwitchChange} checkedChildren="源码" unCheckedChildren="设计" />
    </div>
    );
	}

}

export default Editor;
