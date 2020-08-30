import React from "react";
import axios from "axios";
import loading from "./loading.svg";

class GetDetail extends React.Component {
  state = {
    isLoading: true,
  };

  getPerkSubImg(perkData, perkSubStyle) {
    for (var p = 0; p < perkData.data.length; p++) {
      if (perkData.data[p].id === perkSubStyle) {
        var perkSub_img = perkData.data[p].icon;
        return perkSub_img;
      }
    }
  }

  getPerkMainImg(perkData, perk0, perkPrimaryStyle) {
    for (var m = 0; m < perkData.data.length; m++) {
      if (perkData.data[m].id === perkPrimaryStyle) {
        for (var n = 0; n < perkData.data[m].slots[0].runes.length; n++) {
          if (perkData.data[m].slots[0].runes[n].id === perk0) {
            var perkMain_img = perkData.data[m].slots[0].runes[n].icon;
            return perkMain_img;
          }
        }
      }
    }
  }

  getSpellName(spellData, spellId) {
    var spellLists = Object.keys(spellData.data.data);
    for (var l = 0; l < spellLists.length; l++) {
      if (spellData.data.data[spellLists[l]].key === spellId) {
        var spellName = spellLists[l];
        return spellName;
      }
    }
  }

  getChampName(championData, championId) {
    var championLists = Object.keys(championData.data.data);
    for (var k = 0; k < championLists.length; k++) {
      if (championData.data.data[championLists[k]].key === championId) {
        var championName = championLists[k];
        return championName;
      }
    }
  }

  async getGameInfo(api_key, patch, gameId) {
    // 각 게임 정보 얻기
    var playerInfoList = [];
    const numOfPlayer = 10;
    for (var playerNumber = 0; playerNumber < numOfPlayer; playerNumber++) {
      var match_data = await axios.get(
        `/lol/match/v4/matches/${gameId}?api_key=${api_key}`
      );
      // 각 게임 킬뎃어시

      var kills = match_data.data.participants[playerNumber].stats.kills;
      var deaths = match_data.data.participants[playerNumber].stats.deaths;
      var assists = match_data.data.participants[playerNumber].stats.assists;

      // 챔피언 이름 찾기
      var championId = String(
        match_data.data.participants[playerNumber].championId
      );
      var championData = await axios.get(
        `http://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`
      );
      var championName = this.getChampName(championData, championId);

      // 스펠 이름 찾기
      var spell1Id = String(
        match_data.data.participants[playerNumber].spell1Id
      );
      var spell2Id = String(
        match_data.data.participants[playerNumber].spell2Id
      );
      var spellData = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/summoner.json`
      );

      var spell1Name = this.getSpellName(spellData, spell1Id);
      var spell2Name = this.getSpellName(spellData, spell2Id);

      // 룬 이미지 정보
      var perk0 = match_data.data.participants[playerNumber].stats.perk0;
      var perkPrimaryStyle =
        match_data.data.participants[playerNumber].stats.perkPrimaryStyle;
      var perkSubStyle =
        match_data.data.participants[playerNumber].stats.perkSubStyle;
      var perkData = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/runesReforged.json`
      );
      var perkMain_img = this.getPerkMainImg(perkData, perk0, perkPrimaryStyle);
      var perkSub_img = this.getPerkSubImg(perkData, perkSubStyle);

      // 평점 계산
      var average = 0;
      if (deaths === 0) {
        average = "Perfect";
      } else {
        average =
          String((((kills + assists) * 100) / deaths / 100).toFixed(2)) + ":1";
      }
      // 각 게임별 정보
      var playerInfo = {
        playerNumber: playerNumber,
        name:
          match_data.data.participantIdentities[playerNumber].player
            .summonerName,
        spell1Id: spell1Name,
        spell2Id: spell2Name,
        champLevel: match_data.data.participants[playerNumber].stats.champLevel,
        kills: kills,
        deaths: deaths,
        assists: assists,
        average: average,
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
        perkMain_img: perkMain_img,
        perkSub_img: perkSub_img,
        win: match_data.data.participants[playerNumber].stats.win,
        cs:
          match_data.data.participants[playerNumber].stats.totalMinionsKilled +
          match_data.data.participants[playerNumber].stats.neutralMinionsKilled,
      };
      playerInfoList.push(playerInfo);
    }
    this.setState({
      playerInfoList: playerInfoList,
      patch,
      isLoading: false,
      gameDuration: match_data.data.gameDuration,
    });
  }

  componentDidMount() {
    const api_key = this.props.api_key;
    const patch = this.props.patch;
    const gameId = this.props.gameId;
    this.getGameInfo(api_key, patch, gameId);
  }

  render() {
    const { isLoading, playerInfoList, patch, gameDuration } = this.state;
    return (
      <div>
        <script
          src="https://kit.fontawesome.com/843c5da1dc.js"
          crossorigin="anonymous"
        ></script>
        {isLoading ? (
          <div className="flex justify-center">
            <img src={loading} className="w-24 h-24" alt="loading" />
          </div>
        ) : (
          <div>
            {playerInfoList.map((player, i) => {
              var bg_color = "";
              if (player.win === true) {
                bg_color = "bg-blue-200";
              } else {
                bg_color = "bg-red-200";
              }
              return (
                <div
                  className={`${bg_color} flex flex-row justify-center items-center mb-1 mx-5 rounded-md`}
                >
                  <div className="flex-grow-1 flex flex-col items-center">
                    <img
                      className="rounded-full w-10 h-10 content-center"
                      src={`https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${player.championName}.png`}
                      alt={`${player.championName}`}
                    />
                    <div className="font-medium text-sm text-center">
                      Lv.{player.champLevel}
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="flex flex-col-2">
                      <div className="ml-4">
                        <img
                          className="w-6 h-6 mb-2 rounded-lg"
                          src={`http://ddragon.leagueoflegends.com/cdn/${patch}/img/spell/${player.spell1Id}.png`}
                          alt={`${player.spell1Id}`}
                        />
                        <img
                          className="w-6 h-6 rounded-lg"
                          src={`http://ddragon.leagueoflegends.com/cdn/${patch}/img/spell/${player.spell2Id}.png`}
                          alt={`${player.spell2Id}`}
                        />
                      </div>
                      <div className="ml-px">
                        <img
                          className="w-6 h-6 bg-black rounded-lg mb-2"
                          src={`https://ddragon.leagueoflegends.com/cdn/img/${player.perkMain_img}`}
                          alt={`${player.perkMain_img}`}
                        />
                        <img
                          className="w-6 h-6 bg-black rounded-lg"
                          src={`https://ddragon.leagueoflegends.com/cdn/img/${player.perkSub_img}`}
                          alt={`${player.perkSub_img}`}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-24">
                    <div className="text-start font-semibold text-sm">
                      {player.name}
                    </div>
                  </div>
                  <div className="ml-4 flex-grow-1 flex flex-col items-center">
                    <div className="text-center">
                      <span className="font-bold text-xl">{player.kills}</span>
                      <span className="mx-px font-bold text-xl">/</span>
                      <span className="font-bold text-xl text-red-700">
                        {player.deaths}
                      </span>
                      <span className="mx-px font-bold text-xl">/</span>
                      <span className="font-bold text-xl">
                        {player.assists}
                      </span>
                    </div>
                    <span className="font-semibold text-base text-center">
                      {player.average}
                      <span className="font-medium ml-px text-center">
                        평점
                      </span>
                    </span>
                  </div>
                  <div className="ml-4 flex-grow-1 text-center font-medium">
                    <div className="">레벨 {player.champLevel}</div>
                    <div>
                      CS {player.cs} (
                      {Math.round((player.cs * 10) / (gameDuration / 60)) / 10})
                    </div>
                    <div>시야점수 {player.visionScore}</div>
                  </div>

                  <div className="flex-grow-2">
                    <div className="ml-4 flex">
                      {player.item.map((item, j) => {
                        if (item === 0) {
                          return (
                            <div
                              className="w-8 h-8 bg-gray-600 mx-px rounded-md"
                              key={j}
                            ></div>
                          );
                        } else {
                          return (
                            <img
                              className="w-8 h-8 mx-px rounded-md"
                              key={j}
                              src={`https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${item}.png`}
                              alt={`${item}`}
                            />
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default GetDetail;
