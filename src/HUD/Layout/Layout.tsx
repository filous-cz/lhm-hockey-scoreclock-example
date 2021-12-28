import React from "react";
import { CSGO, Team } from "csgogsi-socket";
import { Match } from "../../api/interfaces";
import "./Layout.scss";
import {configs, actions} from './../../App';
import * as I from '../../api/interfaces';
import TeamLogo from "./TeamLogo";
import { apiUrl } from './../../api/api';
import { getCountry } from "./../countries";

interface Props {
}


interface IState{
    home_goals: number,
    away_goals: number,
    time: number,
    period: number,
    clock_on: boolean,
    clock_visibility: boolean,
    home_team_id: string,
    away_team_id: string,
    home_team_name: string,
    away_team_name: string,
    home_team_color: string,
    away_team_color: string,
}


export default class Layout extends React.Component<Props, IState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      home_goals: 0,
      away_goals: 0,
      time: 1200,
      period: 1,
      clock_on: false,
      clock_visibility: true,
      home_team_id: "",
      away_team_id: "",
      home_team_name: "HOM",
      away_team_name: "AWA",
      home_team_color: "#808080",
      away_team_color: "#808080",
    } 
  }

  componentDidMount() {
    configs.onChange((data:any) => {
      if(!data) return;
      const teams = data.teams_settings;
      
      if(teams.team_away){
        this.setState({away_team_name: teams.team_away.team.shortName, away_team_id: teams.team_away.id, away_team_color: teams.team_away.team.extra.color});
      }
      if(teams.team_home){
        this.setState({home_team_name: teams.team_home.team.shortName, home_team_id: teams.team_home.id, home_team_color: teams.team_home.team.extra.color});
      }
    });

    actions.on("clockState", (state: any) => {
      this.setState({clock_on: state === "start"})
    });

    actions.on("clockVisibility", (state: any) => {
      this.setState({clock_visibility: state === "show"})
    });

    actions.on("homeScore", (state: any) => {
      if(state === "add"){
        var newgoals = this.state.home_goals + 1;
        this.setState({home_goals: newgoals})
      }
      if(state === "subtract" && this.state.home_goals > 0){
        var newgoals = this.state.home_goals - 1;
        this.setState({home_goals: newgoals})
      }
    });

    actions.on("period", (state: any) => {
      if(state === "add"){
        var newperiod = this.state.period + 1;
        this.setState({period: newperiod})
      }
      if(state === "subtract" && this.state.period > 1){
        var newperiod = this.state.period - 1;
        this.setState({period: newperiod})
      }
    });

    actions.on("awayScore", (state: any) => {
      if(state === "add"){
        var newgoals = this.state.away_goals + 1;
        this.setState({away_goals: newgoals})
      }
      if(state === "subtract" && this.state.away_goals > 0){
        var newgoals = this.state.away_goals - 1;
        this.setState({away_goals: newgoals})
      }
    });

    setInterval(this.countdown.bind(this), 1000);
  }

  countdown(){
    if(this.state.clock_on){
      var newtime = this.state.time - 1;
      this.setState({
        time: newtime
      })
    }
    if(this.state.time == -1){
      var newperiod = this.state.period + 1;
      this.setState({
        time: 1200,
        period: newperiod,
        clock_on: false,
      })
    }
  }

  display_time(time: number) {
    var minutes = Math.floor(time / 60);
    var seconds =  time - minutes * 60;
    if(seconds < 10){
      return <span>{minutes}:0{seconds}</span>
    }
    else{
      return <span>{minutes}:{seconds}</span>
    }
  }
  
  get_period_label(period: number){
    if(period === 1){
      return '1st'
    }
    else if(period === 2){
      return '2nd'
    }
    else if(period === 3){
      return '3rd'
    }
    else if(period === 4){
      return 'OT'
    }
    else{
      return "OT" + (period - 3).toString()
    }
  }


  render() {
    const {time, period, home_team_name, away_team_name , home_goals, away_goals, away_team_id, home_team_id, home_team_color, away_team_color, clock_visibility} = this.state;
    return (
      <div className="layout">
        <div className={`scoreclock ${clock_visibility ? "show" : "hide"}`}>
          <div className="logo">IIHF</div>
          <div className="team_container away" style={{backgroundColor: `${away_team_color}`}}>
            <div className="team_logo">{away_team_id === "" ? "" : <img src={`${apiUrl}api/teams/logo/${away_team_id}`} />}</div>
            <div className="name">{away_team_name}</div>
            <div className="goals">{away_goals}</div>
          </div>
          <div className="team_container home" style={{backgroundColor: `${home_team_color}`}}>
            <div className="team_logo">{home_team_id === "" ? "" : <img src={`${apiUrl}api/teams/logo/${home_team_id}`} />}</div>
            <div className="name">{home_team_name}</div>
            <div className="goals">{home_goals}</div>
          </div>
          
          <div className="period">{this.get_period_label(period)}</div>
          <div className="timer">{this.display_time(time)}</div>
        </div>
      </div>
    );
  }
}
