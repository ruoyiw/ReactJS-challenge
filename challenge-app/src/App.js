import React, { Component } from 'react';
import './App.css';
import Filter from "./components/Filter";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import axios from "axios";
import moment from "moment";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      allRaces: [],
      filteredRaces: [],
      allTypes: [],
      selectedRaceType: null,
      hasRaceInfo: true,
      error: null
    }
  }
  
  componentDidMount() {
    this.handleGetRaces();
  }

  async handleGetRaces () {
     let url = "https://s3-ap-southeast-2.amazonaws.com/bet-easy-code-challenge/next-to-jump"
    //get the race data from API
    await axios.get(url)
    .then(response => {
      if (response.data.success) {
        let typeArray = [];
        response.data.result.map(race => (
          typeArray.push(race.EventTypeDesc)
        ));
        const uniqueTypes = typeArray.filter((val, id, array) => array.indexOf(val) === id);
        this.setState({
          allRaces: response.data.result,
          filteredRaces: response.data.result,
          allTypes: uniqueTypes,
          hasRaceInfo: true
        });
      } else {
        this.setState({
          hasRaceInfo: false,
          error: "Failure in getting race information."
        });        
      }
    }).catch(err => {
      this.setState({
        hasRaceInfo: false,
        error: err.toString()
      });   
    });
  }
  
   
  handleSelectedRaceType = selected => {
    this.setState({ selectedRaceType: selected });
  }

  handleFilterRace = () => {
    const {allRaces,selectedRaceType} = this.state;
    if (selectedRaceType !== "All types") {   
      this.setState ({
        filteredRaces: allRaces.filter(race => (
        race.EventTypeDesc === selectedRaceType
      ))
      });      
    } else {
      this.setState ({
        filteredRaces: allRaces
      });
    }
  }


  render() {
    const {filteredRaces, hasRaceInfo, error} = this.state;
    if (hasRaceInfo) {
      return (
      <div className="container-fluid">
      {/* title */}
      <div
          className="titleRow"
          style={{
              color: "#4682B4",
              fontSize: "30px",
              fontWeight: "bold"
          }}
      >
      Front End Challenge
      </div>
      <br/>

      <div className="row justify-content-center">
        <div className="col-4">
          <Filter
            defaultValue="All types"
            options={this.state.allTypes}
            dropDownValue={this.handleSelectedRaceType}
          />
        </div>
        <button 
          type="button" 
          className="btn btn-primary btn-sm"
          onClick={this.handleFilterRace}
        >
         Search
        </button>
      </div>
      
      <br/>
      <div 
        className="table-responsive"
        style={{
          width: '90%',
          margin: 'auto'
        }}
      > 
        <table className="table table-striped text-centered">
        <thead>
          <tr>
            <th scope="col">Event Name</th>
            <th scope="col">Event Venue</th>
            <th scope="col">Start Time</th>
          </tr>
        </thead>
        <tbody>
        {filteredRaces.map(race => (
          <tr key={race.EventID}>          
            <th scope="row">{race.EventName}</th>
            <td>{race.Venue.Venue}</td>
            <td>{moment(`${race.AdvertisedStartTime}`).format('MMMM D YYYY, h:mm A')}</td>
          </tr>
        ))}
        </tbody>
      </table>
      </div>
      </div>
    );
  } else {
    return <div>{error}</div>;
  }
  }
}

export default App;

