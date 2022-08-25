import React from "react";
import ApiExportParamsConfig from '../../../process/apinode/components/ApiExportParamsConfig';

class OutputVariable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    getData = () => {
        return this.refs.exportParams.parentData;
    }
    render() {

        return (
            <div>
                <ApiExportParamsConfig ref='exportParams' exportParams={[]} />
                将API返回的JSON数据标注为变量id放入全局变量中，方便在后继节点中使用
            </div>
        );
    }
}

export default OutputVariable;
