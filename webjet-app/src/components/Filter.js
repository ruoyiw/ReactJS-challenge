import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

class Filter extends Component{

  /*
   * parse the selected value from the dropdown list to the parent component
   */
    handleChange = e => {
        this.props.dropDownValue(e.target.value);
    }

    render(){

        return(
        <div>
            <select 
                className="custom-select" 
                onChange={this.handleChange}
            >
            <option selected hidden value={this.props.defaultValue}>{this.props.defaultValue}</option>
            {   // list all the available options in the select list
                this.props.options.length === 0 ? null : this.props.options.map((option) =>{
                    return <option  
                            key={this.props.options.indexOf(option)}
                            value={option}
                            >
                            {option}
                           </option>
                })
            }
            </select>
        </div>
        );
    }
}
export default Filter;