import React from 'react';
import ReactDOM from 'react-dom';
import {Input} from 'antd';

class EditText extends React.Component {
  constructor(props){
    super(props);
    this.state = {value: props.value}
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value
      })
    }
    return nextProps.value !== this.state.value;
  }

  handleChange(e) {
    const value = e.target.value;
    this.setState({ value });
    this.props.onChange(value);
  }
  render() {
    const {value} = this.state;
    const size=this.props.size||'default';
    const placeholder=this.props.placeholder||'';
    const options=this.props.options||{};
    return (<Input size={size} placeholder={placeholder} value={value} {...options} onChange={e => this.handleChange(e)} />);
  }
}

export default EditText;
