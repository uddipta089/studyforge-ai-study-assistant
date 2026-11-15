import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';

export default function Quiz({ questions }) {
  const [round, setRound] = useState(() => questions.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [isRetest, setIsRetest] = useState(false);
  useEffect(() => { setRound(questions.map((_, i) => i)); setIndex(0); setAnswers({}); setFinished(false); setIsRetest(false); }, [questions]);
  const qid = round[index];
  const q = questions[qid];
  const selected = answers[qid];
  const answered = selected !== undefined;
  const missed = round.filter((id) => answers[id] !== questions[id].answerIndex);
  const correct = round.length - missed.length;
  const reset = (indices, retest = false) => { setRound(indices); setIndex(0); setAnswers({}); setFinished(false); setIsRetest(retest); };
  return (
    <section className="activity" aria-label="Practice quiz">
      {finished ? (
        <div className="quiz-result"><div className="result-mark"><CheckCircle2 size={34}/></div><span className="eyebrow">{isRetest ? 'RETEST COMPLETE' : 'QUIZ COMPLETE'}</span><h2>{correct} out of {round.length} correct</h2><p>{missed.length === 0 ? 'Amazing work — every answer was right!' : `You missed ${missed.length} ${missed.length === 1 ? 'question' : 'questions'}. Review the explanations, then try again.`}</p><div className="result-bar"><span style={{ width: `${(correct / round.length) * 100}%` }} /></div><strong>{Math.round((correct / round.length) * 100)}% accuracy</strong><div className="result-actions">{missed.length > 0 && <button className="primary-button" onClick={() => reset(missed, true)}><RotateCcw size={17} /> Retest missed ({missed.length})</button>}<button className="secondary-button" onClick={() => reset(questions.map((_, i) => i))}>Restart full quiz</button></div></div>
      ) : (
        <><div className="activity-head"><div><span className="eyebrow">{isRetest ? 'SECOND CHANCE' : 'KNOWLEDGE CHECK'}</span><h2>Test what you know.</h2><p>Pick an answer to see instant feedback.</p></div><span className="count-bubble">{index + 1} <span>/ {round.length}</span></span></div><div className="study-progress" role="progressbar" aria-label="Quiz position" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={round.length}><span style={{ width: `${((index + 1) / round.length) * 100}%` }}/></div><h3 className="question-title">{q.question}</h3><div className="options">{q.options.map((opt, i) => { const correctChoice = i === q.answerIndex; const pickedWrong = answered && selected === i && !correctChoice; return <button type="button" key={i} disabled={answered} onClick={() => setAnswers((old) => ({ ...old, [qid]: i }))} className={`option ${answered && correctChoice ? 'right' : ''} ${pickedWrong ? 'wrong' : ''}`}><span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{opt}</span>{answered && correctChoice && <CheckCircle2 className="option-icon" size={19}/>} {pickedWrong && <XCircle className="option-icon" size={19}/>}</button>; })}</div>{answered && <div className={`explanation ${selected === q.answerIndex ? 'success' : 'incorrect'}`} role="status"><strong>{selected === q.answerIndex ? 'That’s correct!' : 'Not quite — keep going.'}</strong><p>{q.explanation}</p></div>}<div className="quiz-footer"><span>{Object.keys(answers).length} answered</span><button className="primary-button" disabled={!answered} onClick={() => index === round.length - 1 ? setFinished(true) : setIndex(index + 1)}>{index === round.length - 1 ? 'See results' : 'Next question'} <ArrowRight size={17}/></button></div></>
      )}
    </section>
  );
}
