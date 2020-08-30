import React from "react";
import axios from "axios";
import loading from "./loading.svg";
import GetDetail from "./GetDetail.js";

class GetMoreProfile extends React.Component {
  state = {
    isLoading: true,
    name: this.props.name,
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

  getPlayerNumber(match_data) {
    var playerNumber = 0; // 10명의 플레이어 중 해당 플레이어 찾기
    for (var j = 0; j < 10; j++) {
      if (
        match_data.participantIdentities[j].player.summonerName ===
        this.state.name
      ) {
        playerNumber = j;
        return playerNumber;
      }
    }
  }

  async getGameInfo(
    api_key,
    totalMatchLists,
    numOfLoadedGames,
    numOfRecentGames,
    patch
  ) {
    const matchLists = totalMatchLists.slice(
      numOfLoadedGames,
      numOfLoadedGames + numOfRecentGames
    );
    // 각 게임 정보 얻기
    var matchInfoList = [];
    for (var i = 0; i < matchLists.length; i++) {
      var match_data = await axios.get(
        `/lol/match/v4/matches/${matchLists[i].gameId}?api_key=${api_key}`
      );
      var queueType = match_data.data.queueId;
      if (queueType === 420) {
        queueType = "솔랭";
      } else if (queueType === 440) {
        queueType = "자유랭";
      } else if (queueType === 450) {
        queueType = "칼바람";
      } else {
        queueType = "일반";
      }
      var playerNumber = this.getPlayerNumber(match_data.data);
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
      if (match_data.data.participants[playerNumber].stats.deaths === 0) {
        average = "Perfect";
      } else {
        average =
          String(
            (
              ((match_data.data.participants[playerNumber].stats.kills +
                match_data.data.participants[playerNumber].stats.assists) *
                100) /
              match_data.data.participants[playerNumber].stats.deaths /
              100
            ).toFixed(2)
          ) + ":1";
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
        win: win,
        cs:
          match_data.data.participants[playerNumber].stats.totalMinionsKilled +
          match_data.data.participants[playerNumber].stats.neutralMinionsKilled,
      };
      matchInfoList.push(matchInfo);
    }
    console.log(matchInfoList);
    this.setState({
      matchInfoList: matchInfoList,
      isLoading: false,
    });
  }

  isButtonClicked = (id) => {
    var { clickedButtonList } = this.state;
    var result = clickedButtonList.find((button_id) => {
      return button_id === id;
    });
    return result;
  };

  buttonClicked = (id) => {
    var { clickedButtonList } = this.state;
    console.log(clickedButtonList);
    console.log(id);
    if (clickedButtonList[id] === false) {
      clickedButtonList[id] = true;
    } else {
      clickedButtonList[id] = false;
    }
    this.setState({
      clickedButtonList: clickedButtonList,
    });
  };

  componentDidMount() {
    console.log(this.props);
    const api_key = this.props.api_key;
    var totalMatchLists = this.props.totalMatchLists;
    const numOfLoadedGames = this.props.numOfLoadedGames;
    const numOfRecentGames = this.props.numOfRecentGames;
    const patch = this.props.patch;
    this.setState({
      clickedButtonList: this.props.clickedButtonList,
      api_key: api_key,
      patch: patch,
      numOfLoadedGames: numOfLoadedGames,
    });
    this.getGameInfo(
      api_key,
      totalMatchLists,
      numOfLoadedGames,
      numOfRecentGames,
      patch
    );
  }

  render() {
    const {
      matchInfoList,
      patch,
      isLoading,
      clickedButtonList,
      api_key,
      name,
      numOfLoadedGames,
    } = this.state;
    const { buttonClicked } = this;
    return (
      <div>
        {isLoading ? (
          <div className="flex justify-center">
            <img src={loading} className="w-32" />
          </div>
        ) : (
          <div className="mt-16">
            <script
              src="https://kit.fontawesome.com/843c5da1dc.js"
              crossorigin="anonymous"
            ></script>
            {matchInfoList.map((match, id) => {
              var bg_color = "";
              var border_color = "";
              var text_color = "";
              if (match.win === "승리") {
                bg_color = "bg-blue-300";
                border_color = "border-blue-500";
                text_color = "text-blue-700";
              } else if (match.win === "패배") {
                bg_color = "bg-red-300";
                border_color = "border-red-500";
                text_color = "text-red-700";
              } else {
                bg_color = "bg-gray-400";
                border_color = "border-gray-600";
              }
              return (
                <div
                  className={`${bg_color} mx-20 mb-3 border ${border_color} rounded-md`}
                  key={id}
                >
                  <div className="flex flex-col">
                    <div className="flex flex-row justify-center items-center mb-1 mx-5">
                      <div className="mr-4 text-center flex-grow-1">
                        <div className="font-medium text-lg">
                          {match.queueType}
                        </div>
                        <div className={`font-semibold text-lg ${text_color}`}>
                          {match.win}
                        </div>
                        <div className="font-medium text-base">
                          {Math.floor(match.gameDuration / 60)}분{" "}
                          {match.gameDuration % 60}초
                        </div>
                      </div>
                      <div className="flex-grow-1 flex flex-col items-center">
                        <img
                          className="mt-2 rounded-full w-20 h-20 mb-px content-center"
                          src={`https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${match.championName}.png`}
                        />
                        <div className="font-medium text-base text-center">
                          {match.championName}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="flex flex-col-2">
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
                        </div>
                      </div>
                      <div className="ml-4 flex-grow-1 flex flex-col items-center">
                        <div className="text-center">
                          <span className="font-bold text-xl">
                            {match.kills}
                          </span>
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
                          {match.average}
                          <span className="font-medium ml-px text-center">
                            평점
                          </span>
                        </span>
                      </div>
                      <div className="ml-4 flex-grow-1 text-center font-medium">
                        <div className="">레벨 {match.champLevel}</div>
                        <div>
                          CS {match.cs} (
                          {Math.round(
                            (match.cs * 10) / (match.gameDuration / 60)
                          ) / 10}
                          )
                        </div>
                        <div>시야점수 {match.visionScore}</div>
                      </div>

                      <div className="flex-grow-2">
                        <div className="ml-4 flex">
                          {match.item.map((item, j) => {
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
                                />
                              );
                            }
                          })}
                        </div>
                      </div>
                      <button
                        onClick={this.buttonClicked.bind(
                          this,
                          id + numOfLoadedGames
                        )}
                      >
                        <i className="fas fa-angle-down"></i>
                      </button>
                    </div>
                    <div className="flex flex-col justify-center">
                      {clickedButtonList[id + numOfLoadedGames] ? (
                        <GetDetail
                          name={name}
                          api_key={api_key}
                          patch={patch}
                          gameId={match.gameId}
                        />
                      ) : (
                        <div></div>
                      )}
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

export default GetMoreProfile;
