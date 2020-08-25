import React from "react";
import axios from "axios";
import "../index.css";

class Profile extends React.Component {
  state = {
    isLoading: true,
    api_key: "",
<<<<<<< HEAD
    name: "곤이씨", //this.props.location.state,
    matchInfoList: [],
=======
    name: this.props.location.state,
>>>>>>> 83262253006719c3bb42ff853699fef8eb08d8d0
  };
  getSummonerInfo = async () => {
    var { data } = await axios.get(
      // 소환사 정보
      `/lol/summoner/v4/summoners/by-name/${this.state.name}?api_key=${this.state.api_key}`
    );
    this.setState({
      accountId: data.accountId,
      id: data.id,
      profileIconId: data.profileIconId,
      puuid: data.puuid,
      summonerLevel: data.summonerLevel,
    });
    // 가장 최근 패치버젼 확인
    var patchList = await axios.get(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    var updated_patch = patchList.data[0];
    // 소환사 티어, 승패
    var { data } = await axios.get(
      `/lol/league/v4/entries/by-summoner/${this.state.id}?api_key=${this.state.api_key}`
    );
    this.setState({
      tier: data[0].tier,
      rank: data[0].rank,
      leaguePoints: data[0].leaguePoints,
      queueType: data[0].queueType,
      wins: data[0].wins,
      losses: data[0].losses,
    });
    // 게임 리스트 정보
    const data_matchLists = await axios.get(
      `/lol/match/v4/matchlists/by-account/${this.state.accountId}?api_key=${this.state.api_key}`
    );
    // 게임 리스트 정보 중 10개만 선택
    const matchLists = data_matchLists.data.matches.slice(0, 3);
    // 각 게임 정보 얻기
    var matchInfoList = [];
    for (var i = 0; i < matchLists.length; i++) {
      var match_data = await axios.get(
        `/lol/match/v4/matches/${matchLists[i].gameId}?api_key=${this.state.api_key}`
      );
      var queueType = match_data.data.queueId;
      if (queueType === 420) {
        queueType = "솔랭";
      } else if (queueType === 440) {
        queueType = "자유랭";
      } else {
        queueType = "일반";
      }
      var playerNumber = 0; // 10명의 플레이어 중 해당 플레이어 찾기
      for (var j = 0; j < 10; j++) {
        if (
          match_data.data.participantIdentities[j].player.summonerName ===
          this.state.name
        ) {
          playerNumber = j;
          break;
        }
      }
      // 게임 승리 판단
      var gameDuration = match_data.data.gameDuration;
      var win = match_data.data.participants[playerNumber].stats.win;
      if (gameDuration < 300) {
        win = "다시하기";
      } else {
        if (match_data.data.participants[playerNumber].stats.win === true) {
          win = "승리";
        } else {
          win = "패배";
        }
      }

      // 챔피언 이름 찾기
      var championId = String(
        match_data.data.participants[playerNumber].championId
      );
      var championData = await axios.get(
        `http://ddragon.leagueoflegends.com/cdn/${updated_patch}/data/en_US/champion.json`
      );
      var championLists = Object.keys(championData.data.data);
      for (var k = 0; k < championLists.length; k++) {
        if (championData.data.data[championLists[k]].key === championId) {
          var championName = championLists[k];
          break;
        }
      }

      // 스펠 이름 찾기
      var spell1Id = String(
        match_data.data.participants[playerNumber].spell1Id
      );
      var spell2Id = String(
        match_data.data.participants[playerNumber].spell2Id
      );
      var spellData = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${updated_patch}/data/en_US/summoner.json`
      );
      var spellLists = Object.keys(spellData.data.data);
      for (var l = 0; l < spellLists.length; l++) {
        if (spellData.data.data[spellLists[l]].key === spell1Id) {
          var spell1Name = spellLists[l];
        }
        if (spellData.data.data[spellLists[l]].key === spell2Id) {
          var spell2Name = spellLists[l];
        }
      }

      // 룬 이미지 정보
      var perk0 = match_data.data.participants[playerNumber].stats.perk0;
      var perkPrimaryStyle =
        match_data.data.participants[playerNumber].stats.perkPrimaryStyle;
      var perkSubStyle =
        match_data.data.participants[playerNumber].stats.perkSubStyle;
      var perkData = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${updated_patch}/data/en_US/runesReforged.json`
      );
      for (var m = 0; m < perkData.data.length; m++) {
        if (perkData.data[m].id === perkPrimaryStyle) {
          for (var n = 0; n < perkData.data[m].slots[0].runes.length; n++) {
            if (perkData.data[m].slots[0].runes[n].id === perk0) {
              var perkMain = perkData.data[m].slots[0].runes[n].key;
              var perkMain_img = perkData.data[m].slots[0].runes[n].icon;
              break;
            }
          }
        }
      }
      for (var p = 0; p < perkData.data.length; p++) {
        if (perkData.data[p].id === perkSubStyle) {
          var perkSub = perkData.data[p].key;
          var perkSub_img = perkData.data[p].icon;
        }
      }

      // 각 게임별 정보
      var matchInfo = {
        gameId: match_data.data.gameId,
        gameCreation: match_data.data.gameCreation,
        gameDuration: match_data.data.gameDuration,
        queueType: queueType,
        gameMode: match_data.data.gameMode,
        gameType: match_data.data.gameType,
        playerNumber: playerNumber,
        spell1Id: spell1Name,
        spell2Id: spell2Name,
        champLevel: match_data.data.participants[playerNumber].stats.champLevel,
        kills: match_data.data.participants[playerNumber].stats.kills,
        deaths: match_data.data.participants[playerNumber].stats.deaths,
        assists: match_data.data.participants[playerNumber].stats.assists,
        championName: championName,
        visionScore:
          match_data.data.participants[playerNumber].stats.visionScore,
        item: [
          match_data.data.participants[playerNumber].stats.item0,
          match_data.data.participants[playerNumber].stats.item1,
          match_data.data.participants[playerNumber].stats.item2,
          match_data.data.participants[playerNumber].stats.item3,
          match_data.data.participants[playerNumber].stats.item4,
          match_data.data.participants[playerNumber].stats.item5,
          match_data.data.participants[playerNumber].stats.item6,
        ],
        perkMain: perkMain,
        perkMain_img: perkMain_img,
        perkSub: perkSub,
        perkSub_img: perkSub_img,
        win: win,
        cs:
          match_data.data.participants[playerNumber].stats.totalMinionsKilled +
          match_data.data.participants[playerNumber].stats.neutralMinionsKilled,
      };
      matchInfoList.push(matchInfo);
    }
    this.setState({
      matchInfoList: matchInfoList,
      patch: updated_patch,
      isLoading: false,
    });

    console.log(this.state);
  };

  componentDidMount() {
    this.getSummonerInfo();
  }
  render() {
    const {
      isLoading,
      name,
      summonerLevel,
      profileIconId,
      tier,
      rank,
      leaguePoints,
      queueType,
      wins,
      losses,
      matchInfoList,
      patch,
      championName,
    } = this.state;
    return (
      <div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="">
            <div className="mt-12 flex flex-row justify-center">
              <img
                className="w-32 h-32 mr-10"
                src={`http://ddragon.leagueoflegends.com/cdn/${patch}/img/profileicon/${profileIconId}.png`}
              />
              <div>
                <div className="flex items-center">
                  <div className="font-semibold text-2xl mr-2">{name}</div>
                  <div className="font-bold text-xl ">{summonerLevel}</div>
                </div>
                <div className="">
                  {tier} {rank} {leaguePoints}LP
                </div>
                <div className="">
                  {wins}승 {losses}패
                </div>
                <div className="">
                  승률 {Math.round((wins / (wins + losses)) * 100)}%
                </div>
              </div>
            </div>

            <div className="mt-32 flex flex-col">
              {matchInfoList.map((match, i) => {
                return (
                  <div className="flex flex-row items-center" key={i}>
                    <div className="mr-4 text-center">
                      <div className="font-medium text-lg">
                        {match.queueType}
                      </div>
                      <div className="font-semibold text-lg">{match.win}</div>
                      <div className="font-medium text-base">
                        {Math.floor(match.gameDuration / 60)}분{" "}
                        {match.gameDuration % 60}초
                      </div>
                    </div>
                    <div>
                      <img
                        className="rounded-full w-20 h-20 mb-px"
                        src={`https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${match.championName}.png`}
                      />
                      <div className="font-medium text-base text-center">
                        {match.championName}
                      </div>
                    </div>
                    <div className="ml-4">
                      <img
                        className="w-8 h-8 mb-2 rounded-lg"
                        src={`http://ddragon.leagueoflegends.com/cdn/${patch}/img/spell/${match.spell1Id}.png`}
                      />
                      <img
                        className="w-8 h-8 rounded-lg"
                        src={`http://ddragon.leagueoflegends.com/cdn/${patch}/img/spell/${match.spell2Id}.png`}
                      />
                    </div>
                    <div className="ml-px">
                      <img
                        className="w-8 h-8 bg-black rounded-lg mb-2"
                        src={`https://ddragon.leagueoflegends.com/cdn/img/${match.perkMain_img}`}
                      />
                      <img
                        className="w-8 h-8 bg-black rounded-lg"
                        src={`https://ddragon.leagueoflegends.com/cdn/img/${match.perkSub_img}`}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-center">
                        <span className="font-bold text-xl">{match.kills}</span>
                        <span className="mx-px font-bold text-xl">/</span>
                        <span className="font-bold text-xl text-red-700">
                          {match.deaths}
                        </span>
                        <span className="mx-px font-bold text-xl">/</span>
                        <span className="font-bold text-xl">
                          {match.assists}
                        </span>
                      </div>
                      <span className="font-semibold text-base text-center">
                        {Math.round(
                          ((match.kills + match.assists) * 100) / match.deaths
                        ) / 100}
                        :1
                      </span>
                      <span className="font-medium ml-px">평점</span>
                    </div>
                    <div className="ml-4 text-center font-medium">
                      <div>레벨 {match.champLevel}</div>
                      <div>
                        CS {match.cs} ({Math.round((match.cs * 10) / 60) / 10})
                      </div>
                      <div>시야점수 {match.visionScore}</div>
                    </div>

                    <div className="ml-4 flex">
                      {match.item.map((item, j) => {
                        if (item === 0) {
                          return;
                        } else {
                          return (
                            <img
                              className="w-12 h-12"
                              key={j}
                              src={`https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${item}.png`}
                            />
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Profile;
