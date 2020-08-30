import React from "react";
import axios from "axios";
import { Chart } from "chart.js";
import "../index.css";
import "./Profile.css";
import Navigation from "../components/Navigation";
import loading from "./loading.svg";
import GetMoreProfile from "../components/GetMoreProfile.js";
import GetDetail from "../components/GetDetail.js";

class Profile extends React.Component {
  state = {
    isLoading: true,
    clickedButtonList: Array.from({ length: 100 }, (v, i) => false),
    numOfgetMoreBtnClicked: 0,
    isSummonerExist: true,
    api_key: "",
    name: this.props.match.params.name, //this.props.location.profile,
    matchInfoList: [],
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

  getSummonerInfo = async () => {
    try {
      var { data } = await axios.get(
        // 소환사 정보
        `/lol/summoner/v4/summoners/by-name/${this.state.name}?api_key=${this.state.api_key}`
      );
    } catch {
      this.setState({
        isSummonerExist: false,
      });
      return;
    }
    // 가장 최근 패치버젼 확인
    var patchList = await axios.get(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    var updated_patch = patchList.data[0];
    this.setState({
      accountId: data.accountId,
      id: data.id,
      profileIconId: data.profileIconId,
      puuid: data.puuid,
      summonerLevel: data.summonerLevel,
      patch: updated_patch,
    });

    // 소환사 티어, 승패
    var { data } = await axios.get(
      `/lol/league/v4/entries/by-summoner/${this.state.id}?api_key=${this.state.api_key}`
    );
    if (data.length === 0) {
      this.setState({
        tier: "UnRanked",
        rank: "",
        leaguePoints: 0,
        queueType: "",
        totalWins: 0,
        totalLosses: 0,
      });
    } else {
      var soloRankOrNOt = 0;
      if (data.length === 2) {
        soloRankOrNOt = 1;
      }
      this.setState({
        tier: data[soloRankOrNOt].tier,
        rank: data[soloRankOrNOt].rank,
        leaguePoints: data[soloRankOrNOt].leaguePoints,
        totalWins: data[soloRankOrNOt].wins,
        totalLosses: data[soloRankOrNOt].losses,
      });
    }
    // 게임 리스트 정보
    const data_matchLists = await axios.get(
      `/lol/match/v4/matchlists/by-account/${this.state.accountId}?api_key=${this.state.api_key}`
    );

    // 최근 게임 승리, 패배 기록
    var recentWins = 0;
    var recentLossess = 0;

    // 최근 게임 총 킬, 뎃, 어시
    var recentKills = 0;
    var recentDeaths = 0;
    var recentAssists = 0;

    // 게임 리스트 정보 중 N개만 선택
    var numOfRecentGames = 5;
    if (data_matchLists.data.matches.length < 5) {
      numOfRecentGames = data_matchLists.data.matches.length;
    }
    const totalMatchLists = data_matchLists.data.matches;
    const matchLists = totalMatchLists.slice(0, numOfRecentGames);

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
          recentWins++;
        } else {
          win = "패배";
          recentLossess++;
        }
      }

      // 각 게임 킬뎃어시

      var kills = match_data.data.participants[playerNumber].stats.kills;
      recentKills += kills;
      var deaths = match_data.data.participants[playerNumber].stats.deaths;
      recentDeaths += deaths;
      var assists = match_data.data.participants[playerNumber].stats.assists;
      recentAssists += assists;

      // 챔피언 이름 찾기
      var championId = String(
        match_data.data.participants[playerNumber].championId
      );
      var championData = await axios.get(
        `http://ddragon.leagueoflegends.com/cdn/${updated_patch}/data/en_US/champion.json`
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
        `https://ddragon.leagueoflegends.com/cdn/${updated_patch}/data/en_US/summoner.json`
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
        `https://ddragon.leagueoflegends.com/cdn/${updated_patch}/data/en_US/runesReforged.json`
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
    this.setState({
      matchInfoList: matchInfoList,
      isLoading: false,
      recentWins: recentWins,
      recentLossess: recentLossess,
      recentKills: recentKills,
      recentDeaths: recentDeaths,
      recentAssists: recentAssists,
      numOfLoadedGames: 0, // 표시된 게임 수
      numOfRecentGames: numOfRecentGames, // 한 번에 표시할 게임 수
      totalMatchLists: totalMatchLists,
    });
    // 최근 전적 그래프
    Chart.pluginService.register({
      beforeDraw: function (chart) {
        var width = chart.chart.width;
        var height = chart.chart.height;
        var ctx = chart.chart.ctx;

        ctx.restore();
        var fontSize = (height / 114).toFixed(2);
        ctx.font = fontSize + "em sans-serif";
        ctx.textBaseline = "middle";

        var text =
            String(Math.round((recentWins / numOfRecentGames) * 100)) + "%",
          textX = Math.round((width - ctx.measureText(text).width) / 2),
          textY = (height + 28) / 2;

        ctx.fillText(text, textX, textY);
        ctx.save();
      },
    });
    var ctx = document.getElementById("recentWinRateChart").getContext("2d");
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["승리", "패배"],
        datasets: [
          {
            data: [recentWins, recentLossess],
            backgroundColor: [
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 99, 132, 0.2)",
            ],
            borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {},
    });
  };

  addNumOfGetMoreBtn = () => {
    var {
      numOfgetMoreBtnClicked,
      numOfLoadedGames,
      numOfRecentGames,
    } = this.state;
    this.setState({
      numOfgetMoreBtnClicked: numOfgetMoreBtnClicked + 1,
      numOfLoadedGames: numOfLoadedGames + numOfRecentGames,
    });
  };

  isButtonClicked = (id) => {
    var { clickedButtonList } = this.state;
    var result = clickedButtonList.find((button_id) => {
      return button_id === id;
    });
    return result;
  };

  buttonClicked = (id) => {
    var { clickedButtonList } = this.state;
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
    this.getSummonerInfo();
  }

  render() {
    const {
      isLoading,
      isSummonerExist,
      clickedButtonList,
      numOfgetMoreBtnClicked,
      name,
      summonerLevel,
      api_key,
      profileIconId,
      tier,
      rank,
      leaguePoints,
      totalWins,
      totalLosses,
      matchInfoList,
      patch,
      recentWins,
      recentLossess,
      recentKills,
      recentDeaths,
      recentAssists,
      numOfRecentGames,
      numOfLoadedGames,
      totalMatchLists,
    } = this.state;
    const { addNumOfGetMoreBtn } = this;
    var countGetMoreBtnList = Array.from(
      { length: numOfgetMoreBtnClicked },
      (v, i) => i
    );
    return (
      <div className="flex flex-col w-screen">
        <script
          src="https://kit.fontawesome.com/843c5da1dc.js"
          crossOrigin="anonymous"
        ></script>
        <Navigation />
        {isLoading ? (
          isSummonerExist ? (
            <div className="h-screen flex justify-center items-center">
              <img src={loading} />
            </div>
          ) : (
            <div className="h-screen flex justify-center items-center">
              <div className="flex flex-col text-center font-semibold text-2xl">
                <div className="text-red-600">
                  등록되지 않았거나 최근 전적이 없는 소환사 입니다.
                </div>
                <div>
                  This is an unregistered summoner or who doesn't have recent
                  game result.
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="w-screen flex justify-center">
            <div className="flex flex-col w-1000">
              <div className="mt-12 mx-32 flex flex-row justify-between items-center">
                <div className="flex flex-row">
                  <div className="relative">
                    <img
                      className="w-28 h-28 mr-8"
                      alt={`${profileIconId}`}
                      src={`http://ddragon.leagueoflegends.com/cdn/${patch}/img/profileicon/${profileIconId}.png`}
                    />
                    <div className="absolute -top-2 -left-2">
                      <div className="relative">
                        <img
                          className="w-32 h-32"
                          alt={`${tier}`}
                          src={`/images/tier_border/${tier.toLowerCase()}.png`}
                        />
                        <div className="font-bold text-lg level-wrap text-yellow-500 bg-gray-700 border border-yellow-500 rounded-lg px-2 pb-1">
                          {summonerLevel}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mr-20">
                      <div className="font-semibold text-2xl mr-2">{name}</div>
                    </div>
                    <div className="">
                      {tier} {rank} {leaguePoints}LP
                    </div>
                    <div className="">
                      {totalWins}승 {totalLosses}패
                    </div>
                    <div className="">
                      승률{" "}
                      {Math.round(
                        (totalWins / (totalWins + totalLosses)) * 100
                      )}
                      %
                    </div>
                  </div>
                </div>
                <div className="">
                  <canvas
                    className="mb-3"
                    id="recentWinRateChart"
                    width="200"
                    height="200"
                  ></canvas>
                  <div className="text-center">
                    <div>최근 전적</div>
                    <div>
                      <span className="mr-2 font-semibold">
                        {numOfRecentGames}전
                      </span>
                      <span className="mr-2 font-semibold">{recentWins}승</span>
                      <span className="font-semibold">{recentLossess}패</span>
                    </div>
                    <div>
                      <span className="mr-1 font-semibold">
                        {(recentKills / numOfRecentGames).toFixed(1)}
                      </span>
                      <span className="mr-1 font-semibold">/</span>
                      <span className="text-red-600 mr-1 font-semibold">
                        {(recentDeaths / numOfRecentGames).toFixed(1)}
                      </span>
                      <span className="mr-1 font-semibold">/</span>
                      <span className="font-semibold">
                        {(recentAssists / numOfRecentGames).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16">
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
                      <div className="flex flex-row justify-center items-center mb-1 mx-5">
                        <div className="mr-4 text-center flex-grow-1">
                          <div className="font-medium text-lg">
                            {match.queueType}
                          </div>
                          <div
                            className={`font-semibold text-lg ${text_color}`}
                          >
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
                            alt={`${match.championName}`}
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
                                alt={`${match.spell1Id}`}
                                src={`http://ddragon.leagueoflegends.com/cdn/${patch}/img/spell/${match.spell1Id}.png`}
                              />
                              <img
                                className="w-8 h-8 rounded-lg"
                                alt={`${match.spell2Id}`}
                                src={`http://ddragon.leagueoflegends.com/cdn/${patch}/img/spell/${match.spell2Id}.png`}
                              />
                            </div>
                            <div className="ml-px">
                              <img
                                className="w-8 h-8 bg-black rounded-lg mb-2"
                                alt={`${match.perkMain_img}`}
                                src={`https://ddragon.leagueoflegends.com/cdn/img/${match.perkMain_img}`}
                              />
                              <img
                                className="w-8 h-8 bg-black rounded-lg"
                                alt={`${match.perkSub_img}`}
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
                                    alt={`${item}`}
                                    src={`https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${item}.png`}
                                  />
                                );
                              }
                            })}
                          </div>
                        </div>
                        {clickedButtonList[id] ? (
                          <button onClick={this.buttonClicked.bind(this, id)}>
                            <i className="fas fa-angle-up"></i>
                          </button>
                        ) : (
                          <button onClick={this.buttonClicked.bind(this, id)}>
                            <i className="fas fa-angle-down"></i>
                          </button>
                        )}
                      </div>
                      {clickedButtonList[id] ? (
                        <GetDetail
                          name={name}
                          api_key={api_key}
                          patch={patch}
                          gameId={match.gameId}
                          numOfLoadedGames={numOfLoadedGames}
                        />
                      ) : (
                        <div></div>
                      )}
                    </div>
                  );
                })}
                <div>
                  {numOfgetMoreBtnClicked !== 0 && (
                    <div>
                      {countGetMoreBtnList.map((n, i) => {
                        return (
                          <GetMoreProfile
                            name={name}
                            api_key={api_key}
                            clickedButtonList={clickedButtonList}
                            totalMatchLists={totalMatchLists}
                            numOfLoadedGames={numOfLoadedGames}
                            numOfRecentGames={numOfRecentGames}
                            patch={patch}
                            key={i}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={addNumOfGetMoreBtn}
                className="bg-gray-200 mx-20 h-10 font-medium text-base border text-orange-600 border-orange-300"
              >
                더 보기
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Profile;
