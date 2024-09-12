import { useEffect, useState, useRef, useMemo } from 'react';

import axios from 'axios';

import Card from './Card.jsx';

import preloadImages from '../utils/imagePreloader.js';

import PokemonLogo from '../assets/pokemon-logo.svg';

const API_URL = 'https://pokeapi.co/api/v2/pokemon/';

function shuffleArray(arr) {
  let shuffled = [];
  arr.map((x) => {
    if (Math.random() <= 0.5) {
      shuffled.push(x);
    } else {
      shuffled.unshift(x);
    }
  });
  return shuffled;
}

function generateRandomUniqueIDList(amount) {
  let IDs = [];
  for (let i = 0; i < amount; i++) {
    let uniqueID = null;
    // Prevents duplicate cards
    while (uniqueID === null) {
      let newNumber = Math.floor(Math.random() * 1000);
      if (!IDs.includes(newNumber)) uniqueID = newNumber;
    }
    IDs[i] = uniqueID;
  }
  return IDs;
}

export default function Game({ shownCards, totalCards, endGame }) {
  const [currentScore, setCurrentScore] = useState(0);
  const [canClickCard, setCanClickCard] = useState(true);
  const [shownPokemonCards, setShownPokemonCards] = useState(null);
  const [animationStates, setAnimationStates] = useState({
    playingFlippingCards: false
  });

  // Values that don't need to re-render the component
  const pokemonCards = useRef(null);
  const clickedPokemonIDs = useRef([]);
  const deleteImagesRef = useRef(null);

  // Used to stop API calls happening twice because of React Strict Mode
  const didMountRef = useRef(false);

  // const isEndlessMode = useMemo(() => shownCards === 1 && totalCards === 0);

  function randomiseShownCards() {
    if (!pokemonCards.current) return;

    let newShownCards = [];
    let allClickedCards = [];
    let allUnclickedCards = [];

    pokemonCards.current.map((x) => {
      if (clickedPokemonIDs.current.includes(x[0])) {
        allClickedCards.push(x);
      } else {
        allUnclickedCards.push(x);
      }
    })
    
    allClickedCards = shuffleArray(allClickedCards);
    allUnclickedCards = shuffleArray(allUnclickedCards);

    newShownCards.push(allUnclickedCards[0]);
    allUnclickedCards.splice(0,1);

    while (newShownCards.length !== shownCards) {
      let isShowingClickedCard = Math.random() <= 0.5;

      // Ignore random selection if its not able to show chosen type
      if (allUnclickedCards.length === 0) isShowingClickedCard = true;
      if (allClickedCards.length === 0) isShowingClickedCard = false;

      if (isShowingClickedCard) {
        newShownCards.push(allClickedCards[0]);
        allClickedCards.shift();
      } else {
        newShownCards.push(allUnclickedCards[0]);
        allUnclickedCards.shift();
      }
    }

    newShownCards = shuffleArray(newShownCards);
    setShownPokemonCards(newShownCards);
  }

  function cardClicked(pokemonID, ) {
    if (!canClickCard) return;
    setCanClickCard(false);

    // Milliseconds
    const transitionTime = 750;
    const delayTime = 20;

    if (clickedPokemonIDs.current.includes(pokemonID)) {
      endGame(false, currentScore);
      return;
    }
    
    if (currentScore + 1 === totalCards) {
      endGame(true, totalCards);
      return;
    }

    clickedPokemonIDs.current.push(pokemonID);
    setCurrentScore(currentScore + 1);

    // Hide card by showing back
    setAnimationStates((prevState) => ({
      ...prevState,
      playingFlippingCards: true,
    }));

    // After card has turned to its back, change cards and show front
    setTimeout(() => {
      randomiseShownCards();
      setAnimationStates((prevState) => ({
        ...prevState,
        playingFlippingCards: false
      }));
    }, (transitionTime + delayTime));

    // After transition is fully finished, enable clicking
    setTimeout(() => {
      setCanClickCard(true);
    }, (2*(transitionTime + delayTime)));
  }

  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;

    let IDs = generateRandomUniqueIDList(totalCards);

    axios.all(IDs.map((ID) => axios.get(`${API_URL + ID}`)))
    .then((responses) => {
      let pokemonData = [];
      responses.forEach((response) => {
        pokemonData.push([
          response.data.id,
          response.data.name, 
          response.data.sprites.other["official-artwork"].front_default,
        ]);
      });

      (async () => {
        deleteImagesRef.current = await preloadImages("pokemonImages", pokemonData.map((x) => x[2]));
        pokemonCards.current = pokemonData;
        setShownPokemonCards(pokemonData.filter((_, i) => i < shownCards));
      })();
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      endGame(false, 0);
    });
  }, []);

  useEffect(() => {
    // On unmount, delete all of the images in cache.
    // This has to be seperate because of behaviour
    // created by React Strict Mode in development.
    return () => {
      if (deleteImagesRef.current !== null) {
        console.log("deleting images!");
        deleteImagesRef.current();
      }
    };
  },[]);

  if (!pokemonCards.current || !shownPokemonCards || shownPokemonCards.length === 0) {
    return <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column"
    }}>
      <img src={PokemonLogo} height={"55px"}/>
      <h1>Loading Pokemon...</h1>
    </div>;
  }

  return (
    <div>
      <p className="game-text">Score: {currentScore}</p>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "5px"
      }}>
        {shownPokemonCards.map((cardData, index) => {
          return <Card
            key={index}
            id={cardData[0]}
            name={cardData[1]}
            image={cardData[2]}
            onClick={cardClicked}
            isClickable={canClickCard}
            playFlipCard={animationStates.playingFlippingCards}
          ></Card>
        })}
      </div>
      <p className="game-text">Found {clickedPokemonIDs.current.length}/{totalCards}</p>
    </div>
  )
}