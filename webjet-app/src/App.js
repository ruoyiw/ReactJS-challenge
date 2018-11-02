import React, { Component } from 'react';
import './App.css';
import Filter from './components/Filter';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import axios from 'axios';
import {csv} from 'd3-request';
import moment from 'moment';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // array to store all flight information
      allFlights: [], 
      // array to store flight information with selected origin and destination
      filteredFlights: [],
      // array to store all the airports
      allAirports: [],
      // airport selected as origin
      selectedOrigin: null,
      // airport selected as destination
      selectedDestination: null,
      // if there is flight info between selected origin and destination
      hasFlightInfo: true,
      // error information
      error: null
    }
  }
  
  componentDidMount() {
    this.handleGetFlightsFromCSV();
    this.handleGetFlightsfromJSON();
  }

  /*
   * get the flight data from json file
   */
  async handleGetFlightsfromJSON () {
    const jsonFilePath = 'flight_data/flight_data.json';  
    await axios.get(jsonFilePath)
    .then(response => {  
        // add data to allFlights array
        const newFlightArray = response.data.concat(this.state.allFlights);
        // remove duplicate json element in the array
        const removeJsonDuplicates = array => [...new Set(array.map(obj => JSON.stringify(obj)))].map(str => JSON.parse(str));
        const uniqueFlights = removeJsonDuplicates(newFlightArray);

        // store origin and destination airports to airportArray
        let airportArray = [];
        uniqueFlights.forEach(flight => {
          airportArray.push(flight.Origin);
          airportArray.push(flight.Destination)
        });
        // remove duplicates from airportArray
        const uniqueAirports = airportArray.filter((val, id, array) => array.indexOf(val) === id);
        // sort airport by alphabetically
        const sortedAirports = uniqueAirports.sort ((a, b) => {
            if (a < b) return -1;
            else if (a > b) return 1;
            return 0;
          });

        this.setState({
          allFlights: uniqueFlights,
          allAirports: sortedAirports,
          hasFlightInfo: true
        });
    }).catch(err => {
      this.setState({
        hasFlightInfo: false,
        error: err.toString()
      });   
    });
  }
  
  /*
   * get the flight data from csv file
   */
  async handleGetFlightsFromCSV () {
    const csvFilePath = 'flight_data/flight_data.csv';
    await csv(csvFilePath, (error, data) => {
      if (error) {
        this.setState({
          hasFlightInfo: false,
          error: error.toString()
        });  
      } else {
        // replace the header name
        data = JSON.parse(JSON.stringify(data).split('"DepDate":').join('"DepartureDate":'));
        // change of date format as YYYY-MM-DD
        data.forEach(flight => (
          flight.DepartureDate = moment(flight.DepartureDate).format('YYYY-MM-DD')
        ));
        this.setState ({
          hasFlightInfo: true,
          allFlights: data
        }) 
      }
    });
  }

  /*
   * set the selecedOrigin state 
   */
  handleSelectedOrigin = selected => {
    this.setState({ selectedOrigin: selected });
  }

  /*
   * set the selecedDestination state 
   */
  handleSelectedDestination = selected => {
    this.setState({ selectedDestination: selected });
  }

  /*
   * filter the flight based on selected origin and destionation
   */
  handleFilterFlight = () => {
    const {allFlights,selectedOrigin,selectedDestination} = this.state;
    const filterdFlight = allFlights.filter(flight => (
      flight.Origin === selectedOrigin && flight.Destination === selectedDestination
      ));
    // sort the filtered flight by the departure date
    const sortedFlight = filterdFlight.sort((a, b) => {
      return new Date(a.DepartureDate).getTime() - new Date(b.DepartureDate).getTime();
    });
    this.setState ({
      filteredFlights: sortedFlight
    });      
  }


  render() {
    const {filteredFlights, hasFlightInfo, error} = this.state;
    // if there is available flight infomation between selected origin and destination
    // and no error occurred, render the webpage; else render the error message
    if (hasFlightInfo && !error) {
      return (
      <div className="container-fluid">
      {/* title */}
      <div
          className="title-row"
          style={{
              color: "#4682B4",
              fontSize: "30px",
              fontWeight: "bold"
          }}
      >
      Webjet API Test
      </div>
      <br/>
      <div className="row justify-content-center">
        <div className="col-3">
          <Filter
            defaultValue="Select Origin"
            options={this.state.allAirports}
            dropDownValue={this.handleSelectedOrigin}
          />
        </div>
        <div className="col-3">
          <Filter
            defaultValue="Select Destination"
            options={this.state.allAirports}
            dropDownValue={this.handleSelectedDestination}
          />
        </div>
        <button 
          type="button" 
          className="btn btn-primary btn-sm"
          onClick={this.handleFilterFlight}
        >
         Search Flights
        </button>
      </div>
      
      <br/>
      {/* if the searched flights can be found, list them as table; else 
          return "No matched flight"
       */}
      {filteredFlights.length > 0 ? (
      <div 
        className="table-responsive"
        style={{
          width: '60%',
          margin: 'auto'
        }}
      >         
      <table className="table table-striped text-centered">
        <thead>
          <tr>
            <th scope="col-2">Departure Date</th>
            <th scope="col-2">Carrier</th>
          </tr>
        </thead>
        <tbody>
          {filteredFlights.map(flight => (
            <tr key={filteredFlights.indexOf(flight)}>  
              <td>{flight.DepartureDate}</td>
              <td>{flight.Carrier}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      ) : 
      <p className="text-muted">No matched flight</p>
      }
      </div>
    );
  } else {
    return <div>{error}</div>;
  }
  }
}

export default App;

