import { useState, useRef } from 'react';

import Game from './components/Game.jsx';
import Modal from './components/Modal.jsx';

import './app.scss';

import PokemonLogo from './assets/pokemon-logo.svg';

// https://c.tenor.com/lmA7VALYIAsAAAAC/tenor.gif - Sad gif
// https://c.tenor.com/tZVpbfTIjNMAAAAC/tenor.gif - Happy Gif

const difficulties = [
  {
    "name": "Easy",
    "shownCards": 3,
    "totalCards": 5
  },
  {
    "name": "Medium",
    "shownCards": 4,
    "totalCards": 12
  },
  {
    "name": "Hard",
    "shownCards": 5,
    "totalCards": 20
  },
  {
    "name": "Extreme",
    "shownCards": 5,
    "totalCards": 35
  }
];

function App() {
  const [menuStates, setMenuStates] = useState({
    mainEnabled: true,
    gameEndEnabled: false,
    gameEnabled: false
  });

  const [difficultyOption, setDifficultyOption] = useState(0);
  const didUserWin = useRef(false);
  const finalScore = useRef(0);

  function startGame() {
    setMenuStates(prevState => {
      return {
        ...prevState,
        mainEnabled: false,
        gameEndEnabled: false,
        gameEnabled: true
      }
    });
  }

  function endGame(isGameWon, score) {
    didUserWin.current = isGameWon;
    finalScore.current = score;
    setMenuStates(prevState => {
      return {
        ...prevState,
        gameEndEnabled: true,
        gameEnabled: false
      }
    });
  }

  function mainMenu() {
    setMenuStates(prevState => {
      return {
        ...prevState,
        mainEnabled: true,
        gameEndEnabled: false,
      }
    });
  }

  return (
    <div className="app-background">
      <header>
        <img src={PokemonLogo} height={"55px"}/>
      </header>
      <main>
        {menuStates.mainEnabled &&
          <Modal>
            <h1>Pokemon Memory Cards</h1>
            <span><b>Don't click on the same card twice!</b></span>
            <div className="difficulty-container">
              <span><u>Select Difficulty</u></span>
              {difficulties.map((difficultyData, i) => {
                return <button
                  key={i}
                  onClick={() => setDifficultyOption(i)}
                  className={`option-btn ${difficultyOption === i ? 'option-btn-selected' : ''}`}
                >{difficultyData.name}</button>
              })}
            </div>
            <button
              className="main-btn"
              onClick={() => startGame()}
            >Start Game</button>
          </Modal>
        }
        {menuStates.gameEndEnabled &&
          <Modal>
            <h1>{didUserWin.current ? 'Victory!' : 'You lose!'}</h1>
            <span>Your final score was <b>{finalScore.current}</b> out of <b>{difficulties[difficultyOption].totalCards}</b></span>
            <img
              src={didUserWin.current ?
                'https://c.tenor.com/tZVpbfTIjNMAAAAC/tenor.gif' :
                'https://c.tenor.com/lmA7VALYIAsAAAAC/tenor.gif'
              }
              width="400px" height="200px" style={{objectFit: "cover", borderRadius: "10px"}}
            />
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px"
            }}>
              <button className="option-btn" onClick={() => mainMenu()}>Quit</button>
              <button className="option-btn" onClick={() => startGame()}>Play Again</button>
            </div>
          </Modal>
        }
        {menuStates.gameEnabled &&
          <Game
            shownCards={difficulties[difficultyOption].shownCards}
            totalCards={difficulties[difficultyOption].totalCards}
            endGame={endGame}
          />
        }
      </main>
    </div>
  )
}

export default App;