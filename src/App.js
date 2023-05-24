import { useEffect, useReducer } from "react";
import clsx from "clsx";
import axios from "axios";
import _ from "lodash";
import "./app.css";

const reducer = (state, action) => {
  if (action.type === "SCORE_RED") {
    return {
      ...state,
      scoreRed: state.scoreRed + 1,
      rounds: state.rounds - 1,
      redHistory: [...state.redHistory, state.red],
      blue: action.dogs[0],
    };
  }
  if (action.type === "SCORE_BLUE") {
    return {
      ...state,
      scoreBlue: state.scoreBlue + 1,
      rounds: state.rounds - 1,
      blueHistory: [...state.blueHistory, state.blue],
      red: action.dogs[0],
    };
  }
  if (action.type === "REPLAY") {
    return {
      red: action.dogs[0],
      blue: action.dogs[1],
      redHistory: [],
      blueHistory: [],
      scoreRed: 0,
      scoreBlue: 0,
      rounds: 11,
    };
  }
  return state;
};

const fetchDoggy = async () => {
  const response = await axios.get("https://dog.ceo/api/breeds/image/random/2");
  return response.data.message;
};

function App() {
  const [state, dispatch] = useReducer(reducer, {
    red: null,
    blue: null,
    redHistory: [],
    blueHistory: [],
    scoreRed: 0,
    scoreBlue: 0,
    rounds: 11,
  });

  const replay = async () => {
    const puppies = await fetchDoggy();
    dispatch({ type: "REPLAY", dogs: puppies });
  };

  const score = async (team) => {
    const data = await fetchDoggy();
    dispatch({ type: `SCORE_${team}`, dogs: data });
  };

  const getWinner = () => {
    const winner = state.scoreRed > state.scoreBlue ? "red" : "blue";
    const mvp = _.head(
      _(state[`${winner}History`]).countBy().entries().maxBy(_.last)
    );
    return { team: winner, mvp: mvp };
  };

  const getBackground = () => {
    if (state.rounds !== 0) {
      return "bg-slate-700";
    }
    return getWinner().team === "blue" ? "bg-blue-700" : "bg-red-700";
  };

  useEffect(() => {
    replay();
  }, []);

  return (
    <div>
      <div
        className={clsx(
          "h-screen w-screen flex flex-col justify-center gap-5 items-center font-mono",
          getBackground()
        )}
      >
        <div className="flex flex-row justify-center items-center">
          <h1 className="text-center text-6xl select-none text-stone-200">
            PUPPY BATTLE
          </h1>
        </div>
        <div className="w-5/6 bg-slate-300 border-4 rounded-2xl">
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-row justify-center items-center select-none">
              <h1 className="text-center text-4xl uppercase">
                {state.rounds !== 0
                  ? `ROUND ${11 - state.rounds + 1}/11`
                  : `WINNER TEAM ${getWinner().team}`}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-8 w-5/6 h-4/6 justify-center">
          {state.rounds > 0 ? (
            <>
              <DoggyCard
                team={"red"}
                handleSelect={() => score("RED")}
                score={state.scoreRed}
                img={state.red}
              />
              <DoggyCard
                team={"blue"}
                score={state.scoreBlue}
                handleSelect={() => score("BLUE")}
                img={state.blue}
              />
            </>
          ) : (
            <WinnerCard
              handleSelect={() => replay()}
              getMVP={getWinner}
            ></WinnerCard>
          )}
        </div>
        <div className="w-5/6 bg-slate-300 border-4 rounded-2xl">
          <div>
            <p className="block text-center text-2xl">
              Choose the cutest dog each round to decide the winning team
            </p>
            <div className="flex flex-row justify-end">
              <button
                onClick={() => replay()}
                className="w-40 bg-orange-500 rounded-2xl"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DoggyCard = ({ img, team, score, handleSelect }) => {
  const color = team === "blue" ? "bg-blue-500" : "bg-red-500";
  return (
    <div
      onClick={handleSelect}
      className={clsx(
        "w-1/2 h-5/6 rounded-2xl cursor-pointer select-none doggy-card",
        color
      )}
    >
      <div className="w-full h-full rounded-2xl select-none">
        <div className="text-center">
          <h1 className="uppercase text-3xl">{team}</h1>
          <h1 className="text-3xl">SCORE {score}</h1>
        </div>
        <img
          className="w-full h-full rounded-2xl select-none "
          draggable={false}
          src={img}
          alt={team}
        />
      </div>
    </div>
  );
};

const WinnerCard = ({ handleSelect, getMVP }) => {
  const winner = getMVP();
  const dogName = [
    "Darwin",
    "Kitmir",
    "Bella",
    "Max",
    "Luna",
    "Charlie",
    "Lucy",
    "Cooper",
    "Daisy",
    "Milo",
    "Pasha",
    "Rocky",
  ];

  return (
    <div
      onClick={handleSelect}
      className={clsx(
        "w-1/2 h-5/6 rounded-2xl cursor-pointer select-none bg-yellow-600"
      )}
    >
      <div className="w-full h-full rounded-2xl select-none">
        <div className="text-center uppercase">
          <h1 className="text-3xl">MVP</h1>
          <h1 className="text-3xl">{_.sample(dogName)}</h1>
        </div>
        <img
          className="w-full h-full rounded-2xl select-none "
          draggable={false}
          src={winner.mvp}
          alt="mvp"
        />
      </div>
    </div>
  );
};

export default App;
