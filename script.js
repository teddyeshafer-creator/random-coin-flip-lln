(() => {
  // --- State ---
  let total=0, heads=0, tails=0;
  let bias = 0.50; // P(heads)
  let history = []; // store heads% as 0..1
  const maxPoints = 200;
  let timer = null;
  let speed = 120;

  // --- DOM ---
  const $ = id => document.getElementById(id);
  const totalEl=$('total'), headsEl=$('heads'), tailsEl=$('tails');
  const headsPctEl=$('headsPct'), tailsPctEl=$('tailsPct');
  const deltaEl=$('delta'), ciEl=$('ci');
  const sparkPath=$('sparkPath');
  const biasInput=$('bias'), biasVal=$('biasVal');
  const speedInput=$('speed'), speedVal=$('speedVal');
  const autoBtn=$('autoBtn'), resetBtn=$('resetBtn');

  // Buttons
  document.querySelectorAll('.lln-buttons button[data-flips]').forEach(btn=>{
    btn.addEventListener('click', ()=> flip(parseInt(btn.dataset.flips,10)));
  });

  autoBtn.addEventListener('click', () => {
    if(timer){ stopAuto(); }
    else { startAuto(); }
  });

  resetBtn.addEventListener('click', reset);

  // Sliders
  biasInput.addEventListener('input', e=>{
    const v = parseInt(e.target.value,10);
    bias = v/100;
    biasVal.textContent = v + '% ' + (v===50?'(fair)': (v>50? '→ heads‑lean' : '→ tails‑lean'));
  });

  speedInput.addEventListener('input', e=>{
    speed = parseInt(e.target.value,10);
    speedVal.textContent = speed + ' ms';
    if(timer){ stopAuto(); startAuto(); }
  });

  // Keyboard shortcuts: 1/2/3
  window.addEventListener('keydown', e=>{
    if(e.key==='1') flip(1);
    if(e.key==='2') flip(10);
    if(e.key==='3') flip(100);
  });

  function flip(n){
    for(let i=0;i<n;i++){
      const isHead = Math.random() < bias;
      if(isHead) heads++; else tails++;
      total++;

      // Track heads% point-by-point for a smoother sparkline
      history.push(heads/total);
      if(history.length>maxPoints) history.shift();
    }
    render();
  }

  function startAuto(){
    autoBtn.textContent='Stop Auto‑Flip';
    autoBtn.classList.remove('ghost');
    autoBtn.classList.add('active');
    timer = setInterval(()=>flip(1), speed);
  }

  function stopAuto(){
    clearInterval(timer); timer=null;
    autoBtn.textContent='Start Auto‑Flip';
    autoBtn.classList.add('ghost');
    autoBtn.classList.remove('active');
  }

  function reset(){
    stopAuto();
    total=heads=tails=0;
    history.length=0;
    render();
  }

  function render(){
    totalEl.textContent = total;
    headsEl.textContent = heads;
    tailsEl.textContent = tails;

    const hPct = total? (heads/total)*100 : 0;
    const tPct = total? (tails/total)*100 : 0;
    headsPctEl.textContent = hPct.toFixed(2)+'%';
    tailsPctEl.textContent = tPct.toFixed(2)+'%';

    const delta = Math.abs(hPct - 50);
    deltaEl.textContent = delta.toFixed(2)+'%';

    // 95% CI for p̂ (normal approx): p̂ ± 1.96*sqrt(p̂(1-p̂)/n)
    if(total>0){
      const ph = heads/total;
      const m = 1.96 * Math.sqrt(ph*(1-ph)/total);
      const lo = Math.max(0, (ph - m)*100);
      const hi = Math.min(100, (ph + m)*100);
      ciEl.textContent = `${lo.toFixed(2)}% to ${hi.toFixed(2)}%`;
    } else {
      ciEl.textContent = '–';
    }

    drawSpark();
  }

  function drawSpark(){
    if(history.length < 2){ sparkPath.setAttribute('d',''); return; }
    const w = 1000, h = 200;
    const step = w/(history.length-1);
    const min = Math.min(...history);
    const max = Math.max(...history);

    let d = `M 0 ${h*(1 - (history[0]-min)/(max-min || 1))}`;
    for(let i=1;i<history.length;i++){
      const x = i*step;
      const yNorm = (history[i]-min)/(max-min || 1);
      const y = h*(1 - yNorm);
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    sparkPath.setAttribute('d', d);
  }

  // initial
  render();
})();
