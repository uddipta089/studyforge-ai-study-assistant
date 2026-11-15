import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, BrainCircuit, Check, ChevronRight, CircleHelp, Clock3, FileText, Layers3, Lightbulb, Menu, Plus, RefreshCw, Sparkles, WandSparkles, X } from 'lucide-react';
import Flashcards from './components/Flashcards.jsx';
import Quiz from './components/Quiz.jsx';
import { sampleDeck, sampleNotes } from './sample.js';

const EXAMPLES = [
  { label: 'Photosynthesis', subject: 'Biology', notes: sampleNotes },
  { label: 'Newton’s laws', subject: 'Physics', notes: 'Newton’s first law states an object remains at rest or in uniform motion unless acted upon by a net external force. The second law states net force equals mass times acceleration, F = ma. The third law says every action has an equal and opposite reaction. Examples include seatbelts, pushing a shopping cart, and rocket propulsion.' },
  { label: 'JavaScript basics', subject: 'Programming', notes: 'JavaScript is a programming language used to create interactive web pages. Variables can be declared with let or const. Arrays store ordered collections of values. Objects store named properties. Functions are reusable blocks of code. The DOM represents web page elements, and event listeners respond to user interactions. Promises represent the eventual result of an asynchronous operation.' },
];

function validateClientData(data) {
  if (!data || typeof data.title !== 'string' || !Array.isArray(data.flashcards) || !Array.isArray(data.questions) || data.flashcards.length < 3 || data.questions.length < 3) return false;
  return data.flashcards.every((c) => typeof c.front === 'string' && typeof c.back === 'string') && data.questions.every((q) => typeof q.question === 'string' && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex <= 3 && typeof q.explanation === 'string');
}

function App() {
  const [notes, setNotes] = useState('');
  const [deck, setDeck] = useState(null);
  const [mode, setMode] = useState('flashcards');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [isSample, setIsSample] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentRequest = useRef(0);
  const controller = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => () => { currentRequest.current += 1; controller.current?.abort(); }, []);

  function invalidateRequest() {
    currentRequest.current += 1;
    controller.current?.abort();
    controller.current = null;
  }

  function startNew() {
    invalidateRequest();
    setDeck(null); setState('idle'); setError(''); setNotes(''); setIsSample(false); setSidebarOpen(false);
  }

  function loadSample() {
    invalidateRequest();
    setNotes(sampleNotes); setDeck({ ...sampleDeck }); setIsSample(true); setMode('flashcards'); setState('success'); setError(''); setSidebarOpen(false);
  }

  async function generate() {
    if (notes.trim().length < 15) { setError('Add a little more detail — at least 15 characters.'); setState('error'); return; }
    if (notes.length > 12000) { setError('Please keep your notes under 12,000 characters.'); setState('error'); return; }
    invalidateRequest();
    const requestId = currentRequest.current;
    const abort = new AbortController();
    controller.current = abort;
    setState('loading'); setError('');
    const clientTimeout = setTimeout(() => abort.abort(), 30000);
    try {
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }), signal: abort.signal });
      let data;
      try { data = await response.json(); } catch { throw new Error('The server returned an unreadable response. Please retry.'); }
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Could not generate study material. Please retry.');
      if (!validateClientData(data)) throw new Error('The server returned unexpected study material. Please retry.');
      if (currentRequest.current !== requestId) return;
      setDeck(data); setIsSample(false); setMode('flashcards'); setState('success');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
    } catch (err) {
      if (currentRequest.current !== requestId) return;
      setState('error');
      setError(err.name === 'AbortError' ? 'This is taking longer than expected. Please try again.' : (err.message || 'Something went wrong. Please retry.'));
    } finally {
      clearTimeout(clientTimeout);
      if (currentRequest.current === requestId) controller.current = null;
    }
  }

  const isBusy = state === 'loading';
  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand" aria-label="StudyForge home"><div className="brand-icon"><Layers3 size={23} strokeWidth={2.5}/></div><span>study<span className="brand-accent">forge</span><span className="brand-dot">.</span></span></div>
        <div className="sidebar-section-label">YOUR WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation"><button className="side-link active" onClick={() => { setSidebarOpen(false); document.querySelector('#workspace')?.scrollIntoView({ behavior: 'smooth' }); }}><BookOpen size={18}/> My study space <ChevronRight size={15} className="push-right"/></button><button className="side-link" onClick={startNew}><Plus size={19}/> New study set</button></nav>
        <div className="sidebar-bottom"><div className="sidebar-tip"><div className="tip-icon"><Lightbulb size={18}/></div><strong>Study smarter, not harder.</strong><p>Active recall helps you remember what matters.</p></div><div className="sidebar-foot"><span className="avatar">S</span><div><strong>Study session</strong><span>Make progress today</span></div></div></div>
      </aside>
      {sidebarOpen && <button className="mobile-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close menu"/>}
      <main className="main-area" id="workspace">
        <header className="topbar"><button className="mobile-menu" aria-label="Open menu" onClick={() => setSidebarOpen(true)}><Menu size={23}/></button><div className="breadcrumb">Workspace <ChevronRight size={15}/> <strong>My study space</strong></div><div className="topbar-right"><span className="status-dot"/> Your learning companion</div></header>
        <div className="content-wrap">
          <div className="welcome-bar"><span className="pill"><Sparkles size={13}/> AI-POWERED LEARNING</span><div className="welcome-title-row"><div><h1>Make it <em>stick.</em></h1><p>Turn your notes into bite-sized flashcards and quizzes that actually help you learn.</p></div><div className="hero-symbol" aria-hidden="true"><BrainCircuit size={73} strokeWidth={1.1}/><span className="hero-spark">✦</span></div></div></div>
          <section className="input-panel" aria-label="Create study material"><div className="panel-top"><div className="panel-heading"><span className="panel-icon"><FileText size={20}/></span><div><h2>What are we learning today?</h2><p>Paste notes, a concept, or any topic you want to master.</p></div></div><span className="step-label">STEP 01</span></div>
            <label className="sr-only" htmlFor="notes-input">Your study notes or topic</label><textarea id="notes-input" value={notes} maxLength={12000} onChange={(e) => { setNotes(e.target.value); if (state === 'error') { setState(deck ? 'success' : 'idle'); setError(''); } }} placeholder={'Start typing or paste your notes here...\n\ne.g. Explain the key concepts of photosynthesis, including light-dependent reactions and the Calvin cycle.'} disabled={isBusy} />
            <div className="input-bottom"><span>{notes.length.toLocaleString()} / 12,000 characters</span><button className="primary-button generate-button" disabled={isBusy || notes.trim().length < 15} onClick={generate}>{isBusy ? <><span className="spinner"/> Creating your study set...</> : <><WandSparkles size={18}/> Generate study set <ArrowRight size={17}/></>}</button></div>
            {state === 'error' && <div className="error-banner" role="alert"><CircleHelp size={20}/><div><strong>Couldn't create your study set</strong><p>{error}</p></div><button onClick={generate} disabled={notes.trim().length < 15}>Retry</button></div>}
          </section>
          <div className="example-row"><span>NEED INSPIRATION?</span>{EXAMPLES.map((e) => <button key={e.label} onClick={() => { if (isBusy) return; setNotes(e.notes); setError(''); setState(deck ? 'success' : 'idle'); }} disabled={isBusy}>{e.label}<ArrowRight size={14}/></button>)}<button className="sample-link" onClick={loadSample} disabled={isBusy}>Explore sample deck <ChevronRight size={15}/></button></div>
          {isBusy && <div className="loading-panel" role="status" aria-live="polite"><div className="loading-illustration"><BrainCircuit size={34}/></div><h2>Building your brain workout...</h2><p>Creating flashcards and quiz questions from your material.</p><div className="skeleton-row"><span/><span/><span/></div><button className="cancel-button" onClick={() => { invalidateRequest(); setState(deck ? 'success' : 'idle'); setError(''); }}>Cancel generation</button></div>}
          {deck && <section className="results" ref={resultRef} aria-label="Generated study set"><div className="results-head"><div><span className="eyebrow"><Check size={14}/> {isSample ? 'SAMPLE STUDY SET' : 'STUDY SET READY'}</span><h2>{deck.title}</h2><p>{deck.summary}</p></div><button className="new-set-button" onClick={startNew}><Plus size={17}/> New set</button></div><div className="stats-row"><div className="stat"><span className="stat-symbol lavender"><Layers3 size={22}/></span><div><strong>{deck.flashcards.length}</strong><span>Flashcards</span></div></div><div className="stat"><span className="stat-symbol mint"><CircleHelp size={22}/></span><div><strong>{deck.questions.length}</strong><span>Quiz questions</span></div></div><div className="stat"><span className="stat-symbol peach"><Clock3 size={22}/></span><div><strong>~{Math.max(3, Math.round((deck.flashcards.length + deck.questions.length) / 3))} min</strong><span>Study time</span></div></div></div><div className="activity-tabs" role="tablist" aria-label="Study mode"><button role="tab" aria-selected={mode === 'flashcards'} className={mode === 'flashcards' ? 'selected' : ''} onClick={() => setMode('flashcards')}><Layers3 size={17}/> Flashcards</button><button role="tab" aria-selected={mode === 'quiz'} className={mode === 'quiz' ? 'selected' : ''} onClick={() => setMode('quiz')}><BrainCircuit size={17}/> Practice quiz</button></div>{mode === 'flashcards' ? <Flashcards cards={deck.flashcards}/> : <Quiz questions={deck.questions}/>}</section>}
          {!deck && !isBusy && <div className="empty-area"><div className="empty-symbol"><Sparkles size={27}/></div><h3>Your next aha moment starts here.</h3><p>Add your notes above or explore the sample to see how StudyForge works.</p><button onClick={loadSample}>Try a sample study set <ArrowRight size={16}/></button></div>}
          <footer className="footer">Made for curious minds <span>✦</span> StudyForge · Built with React + AI</footer>
        </div>
      </main>
    </div>
  );
}

export default App;
