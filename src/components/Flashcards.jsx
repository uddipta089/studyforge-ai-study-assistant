import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

export default function Flashcards({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  useEffect(() => { setIndex(0); setFlipped(false); setKnown([]); }, [cards]);
  const next = () => { setFlipped(false); setIndex((n) => (n + 1) % cards.length); };
  const previous = () => { setFlipped(false); setIndex((n) => (n - 1 + cards.length) % cards.length); };
  const toggleKnown = () => setKnown((old) => old.includes(index) ? old.filter((n) => n !== index) : [...old, index]);
  return (
    <section className="activity" aria-label="Flashcard practice">
      <div className="activity-head"><div><span className="eyebrow">ACTIVE RECALL</span><h2>Flip. Learn. Repeat.</h2><p>Tap the card to reveal the answer.</p></div><span className="count-bubble">{index + 1} <span>/ {cards.length}</span></span></div>
      <div className="study-progress" role="progressbar" aria-label="Flashcard position" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={cards.length}><span style={{ width: `${((index + 1) / cards.length) * 100}%` }} /></div>
      <button type="button" className={`flip-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)} aria-label={flipped ? 'Show flashcard question' : 'Reveal flashcard answer'}>
        <span className="card-corner"><Sparkles size={15} /> {flipped ? 'ANSWER' : 'QUESTION'}</span>
        <span className="flash-main">{flipped ? cards[index].back : cards[index].front}</span>
        <span className="tap-hint"><RotateCcw size={15} /> Click to flip</span>
      </button>
      <div className="flash-actions"><button className="icon-button" onClick={previous} aria-label="Previous flashcard"><ArrowLeft size={19} /></button><button className={`known-button ${known.includes(index) ? 'marked' : ''}`} onClick={toggleKnown}>{known.includes(index) ? '✓ Marked as known' : 'Mark as known'}</button><button className="icon-button" onClick={next} aria-label="Next flashcard"><ArrowRight size={19} /></button></div>
      <p className="quiet-note">{known.length} of {cards.length} cards marked as known</p>
    </section>
  );
}
