import {useState, type ReactNode} from 'react';
import {ArrowUpRight, ArrowRight, AudioLines, BookOpen, Briefcase, Check, Clock, Flame, GraduationCap, Headphones, Languages, Mic, Play, Sparkles, Target, Timer, Zap, MessagesSquare} from 'lucide-react';
import {routine, type Lesson} from './content';
import type {metrics, recommendPractice} from './learning';

type Props = {
  lessons: Lesson[];
  daily: Lesson;
  stats: ReturnType<typeof metrics>;
  recommendation: ReturnType<typeof recommendPractice>;
  name: string;
  signedIn: boolean;
  openLesson: (lesson: Lesson, speak?: boolean) => void;
  navigate: (page: string) => void;
  startRoutine: () => void;
  openGuide: () => void;
  renderLesson: (lesson: Lesson, index: number) => ReactNode;
};

const paths = [
  {id:'telugu', title:'Everyday English', description:'Turn familiar thoughts into natural conversations.', icon:Languages, tone:'sage', label:'START WITH THE BASICS', categories:['telugu','conversation','expression']},
  {id:'placement', title:'Career conversations', description:'Prepare your voice for interviews and the workplace.', icon:Briefcase, tone:'peach', label:'GET INTERVIEW-READY', categories:['placement','gd','presentation']},
  {id:'gym', title:'Speak with confidence', description:'Find your words. Keep going. Make yourself heard.', icon:AudioLines, tone:'lavender', label:'BUILD YOUR SPEAKING HABIT', categories:['challenge','rescue','story']},
];

export default function Dashboard({lessons,daily,stats,recommendation,name,signedIn,openLesson,navigate,startRoutine,openGuide,renderLesson}:Props) {
  const [collection,setCollection] = useState('for-you');
  const [path,setPath] = useState('all');
  const featured = collection==='everyday'
    ? lessons.filter(l=>l.category==='conversation').slice(0,4)
    : collection==='career'
      ? ['placement','gd','presentation','opinion'].map(c=>lessons.find(l=>l.category===c)!).filter(Boolean)
      : [lessons[0],lessons[2],lessons.find(l=>l.id==='placement-1')!,lessons.find(l=>l.id==='rescue-6')!].filter(Boolean);
  const recommended = lessons.find(l=>l.id===recommendation.lessonId)||daily;
  const selectedPaths = path==='all'?paths:paths.filter(p=>p.id===path);

  return <>
    <section className="dashboardWelcome">
      <div>
        <div className="welcomeKicker"><span className="statusDot"/> YOUR ENGLISH. YOUR NEXT CHAPTER.</div>
        <h1>A little practice.<br className="smallBreak"/> <span>A lot more confidence.</span></h1>
        <p>{signedIn?`${name}, `:''}తెలుగులో అర్థం చేసుకోండి. Englishలో మీ మాట చెప్పండి.</p>
      </div>
      <button className="guideButton" onClick={openGuide}><span><Play size={15} fill="currentColor"/></span>How Vaani works <ArrowUpRight size={15}/></button>
    </section>

    <div className="dashboardHeroGrid">
      <section className="spotlight">
        <div className="spotlightCopy">
          <span className="spotlightLabel"><span className="liveDot"/> TODAY’S SPEAKING PRACTICE</span>
          <h2>Find your words.<br/>Make them <em>yours.</em></h2>
          <p>Perfect English అవసరం లేదు.<br/>ఒక చిన్న sentenceతో మొదలుపెట్టండి.</p>
          <div className="dailyPrompt"><span><MessagesSquare size={14}/> A CONVERSATION STARTER</span><h3>“{daily.question}”</h3></div>
          <div className="spotlightActions">
            <button className="limeButton" onClick={()=>openLesson(daily,true)}><Mic size={18}/> ఇప్పుడే మాట్లాడండి <ArrowUpRight size={17}/></button>
            <button className="spotlightListen" onClick={()=>openLesson(daily)}><Headphones size={16}/> Listen first</button>
          </div>
          <div className="spotlightBenefits"><span><Check size={13}/> Telugu guidance</span><span><Check size={13}/> Your own pace</span></div>
        </div>
        <div className="spotlightVisual">
          <img src="/speaking-community.webp" alt="Illustration of students practising together in a campus library" width="768" height="512" fetchPriority="high"/>
          <span className="visualCaption"><GraduationCap size={15}/> MADE FOR YOUR NEXT CHAPTER</span>
          <div className="voiceNote"><span className="voiceNoteIcon"><AudioLines size={23}/></span><div><b>One sentence at a time.</b><span>మీ voiceకి ఒక చిన్న beginning.</span></div></div>
        </div>
      </section>

      <section className="dailyPlan" aria-labelledby="daily-plan-title">
        <div className="dailyPlanHeading"><span className="eyebrow">A SMALL DAILY COMMITMENT</span><Clock size={17}/></div>
        <h2 id="daily-plan-title">15 minutes. <span>For you.</span></h2>
        <p>చిన్న steps. రోజూ కొంచెం practice.</p>
        <ol>{routine.map((r,i)=><li key={r.title}><span className={'planStep '+(i===0?'first':'')}>{i===0?<Play size={10} fill="currentColor"/>:String(i+1).padStart(2,'0')}</span><div><b>{r.title}</b><span>{r.te}</span></div><small>{r.minutes}<span>min</span></small></li>)}</ol>
        <button className="planStart" onClick={startRoutine}>Start my daily routine <ArrowRight size={16}/></button>
      </section>
    </div>

    <section className="progressStrip" aria-label="Your practice statistics">
      <div className="progressIntro"><span className="eyebrow">YOUR SMALL WINS</span><b>Every attempt counts.</b><span>{signedIn?'Your saved learning activity':'Your current guest session'}</span></div>
      <div className="miniStat"><span className="miniStatIcon warm"><Flame size={20}/></span><div><strong>{stats.streak}<small>days</small></strong><span>Practice streak</span></div></div>
      <div className="miniStat"><span className="miniStatIcon mint"><Mic size={20}/></span><div><strong>{stats.minutes}<small>min</small></strong><span>Recorded practice</span></div></div>
      <div className="miniStat"><span className="miniStatIcon lavender"><Target size={20}/></span><div><strong>{stats.count}</strong><span>Practice attempts</span></div></div>
      <div className="miniStat"><span className="miniStatIcon gold"><Sparkles size={20}/></span><div><strong>{stats.xp}<small>XP</small></strong><span>Showing up matters</span></div></div>
    </section>

    <section className="learningPaths" aria-labelledby="paths-heading">
      <div className="refinedSectionHead"><div><span className="eyebrow">A DIRECTION FOR EVERY AMBITION</span><h2 id="paths-heading">Where would you like to begin?</h2></div><select aria-label="Choose a learning path" value={path} onChange={e=>setPath(e.target.value)}><option value="all">All learning paths</option><option value="telugu">Everyday English</option><option value="placement">Career conversations</option><option value="gym">Speaking confidence</option></select></div>
      <div className={'pathGrid '+(selectedPaths.length===1?'singlePath':'')}>{selectedPaths.map((p,i)=>{const count=lessons.filter(l=>p.categories.includes(l.category)).length;return <button key={p.id} className={'pathCard '+p.tone} onClick={()=>navigate(p.id==='telugu'?'path-everyday':p.id==='placement'?'path-career':'path-confidence')}><div className="pathCardTop"><span className="pathIcon"><p.icon size={23}/></span><span className="pathArrow"><ArrowUpRight size={19}/></span></div><span className="pathLabel">{p.label}</span><h3>{p.title}</h3><p>{p.description}</p><div className="pathCardBottom"><span>{count} lessons across this path</span><span>0{paths.indexOf(p)+1}</span></div></button>;})}</div>
    </section>

    <section aria-labelledby="featured-heading" className="featuredSection">
      <div className="refinedSectionHead"><div><span className="eyebrow">LESS TEXTBOOK. MORE REAL LIFE.</span><h2 id="featured-heading">Your next conversation starts here.</h2></div><button className="textButton" onClick={()=>navigate('library')}>Explore all {lessons.length} lessons <ArrowUpRight size={17}/></button></div>
      <div className="collectionTabs" role="group" aria-label="Featured lesson collection">{[['for-you','Picked for you'],['everyday','Everyday English'],['career','Career ready']].map(([id,label])=><button key={id} aria-pressed={collection===id} className={collection===id?'active':''} onClick={()=>setCollection(id)}>{label}</button>)}<span><BookOpen size={14}/> Learn · Listen · Speak</span></div>
      <div className="lessonGrid featuredLessons">{featured.map(renderLesson)}</div>
    </section>

    <div className="discoveryGrid">
      <section className="quickChallenge"><div className="challengeCopy"><span className="eyebrow"><Zap size={14}/> THE 5-SECOND CHALLENGE</span><h2>Less overthinking.<br/>More <span>“I can do this.”</span></h2><p>ఒక ప్రశ్న. ఒక చిన్న sentence. ఒక brave start.</p><button onClick={()=>navigate('challenge')}>Give it a go <ArrowRight size={17}/></button></div><div className="challengeDial" aria-hidden="true"><span>05</span><small>SECONDS</small><Timer size={22}/></div></section>
      <section className="personalNext"><span className="recommendIcon"><Target size={23}/></span><span className="eyebrow">A LITTLE NUDGE FOR TODAY</span><h2>{recommendation.title}</h2><p>{recommendation.reason}</p><button className="textButton" onClick={()=>openLesson(recommended,true)}>Try this practice <ArrowUpRight size={17}/></button></section>
    </div>

    <section className="closingNote"><span className="closingMark"><AudioLines size={25}/></span><div><h3>You don’t have to be perfect to be heard.</h3><p>మీరు చెప్పాలనుకున్నది చెప్పండి. Practiceతో మరింత సహజంగా వస్తుంది.</p></div><button onClick={()=>navigate('speak')}>Find your voice <ArrowRight size={17}/></button></section>
  </>;
}
