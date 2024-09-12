import cardBack from '../assets/card.jpg';

export default function Card({
  image,
  name,
  id,
  onClick,
  isClickable,
  playFlipCard=false,
}) {
  return (
    <div
      className={`card-container ${isClickable ? 'card-clickable' : ''}`}
      onClick={() => onClick(id)}
      style={{
        transform: `rotateY(${playFlipCard ? '180deg' : '0deg'})`
      }}
    >
      <div className="card-front">
        <img draggable="false" src={image} width="100%" style={{objectFit: "contain"}}/>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: "1rem",
          textAlign: "center"
        }}>{name.toUpperCase()}</div>
      </div>
      <div className="card-back">
        <img src={cardBack} width={"100%"} height={"100%"}/>
      </div>
    </div>
  )
}