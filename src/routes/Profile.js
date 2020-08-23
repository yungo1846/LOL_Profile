import React from "react";
import axios from "axios";

class Profile extends React.Component {
  state = {
    isLoading: true,
    api_key: "RGAPI-6003cb11-75ce-44ec-ad37-fc1bba1a4a7a",
    name: this.props.location.state,
  };
  getSummonerInfo = async () => {
    const { data } = await axios.get(
      // 소환사 정보
      `/lol/summoner/v4/summoners/by-name/${this.state.name}?api_key=${this.state.api_key}`
    );
    this.setState({
      accountId: data.accountId,
      id: data.id,
      profileIconId: data.profileIconId,
      puuid: data.puuid,
      summonerLevel: data.summonerLevel,
      isLoading: false,
    });
    const data_matchLists = await axios.get(
      // 게임 리스트 정보
      `/lol/match/v4/matchlists/by-account/${this.state.accountId}?api_key=${this.state.api_key}`
    );
    const matchLists = data_matchLists.data.matches.slice(0, 20);
    this.setState({});
    console.log(matchLists);
  };

  componentDidMount() {
    this.getSummonerInfo();
  }
  render() {
    const { isLoading, name, summonerLevel } = this.state;
    console.log(this.state);
    return (
      <div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div>
            <div className="">{name}</div>
            <div className="">{summonerLevel}</div>
            <div className="">{name}</div>
            <div className="">{name}</div>
            <div className="">{name}</div>
            <div></div>
          </div>
        )}
      </div>
    );
  }
}

export default Profile;
