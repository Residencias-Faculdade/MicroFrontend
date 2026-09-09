const phase = [
  'Subindo container',
  'Aguarde alguns minutos',
  'carregando pacotes...',
  'Configurando ambiente...',
  'Processando informações...',
  'Talvez demore um pouco mais do que o esperado..',
] as const;

const filler = [
  'Aguarde alguns minutos',
  'Estamos analisando a situação',
  'talvez o wifi esteja um pouco lento',
] as const;

const finals = ['Pronto para o uso', 'Carregamento concluído'] as const;

const loaderCss = `
  .box-loader-container { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:48px; min-height:480px; width:100%; padding:48px 16px 40px; background:#f8fafc; transform-style:preserve-3d; }
  .loader { --duration: 3s; --primary: rgba(0,0,0,1); --primary-light:#333333; --primary-rgba:rgba(0,0,0,0); width:200px; height:320px; position:relative; transform-style:preserve-3d; }
  @media (max-width:480px){ .loader{ zoom:0.44; } }
  .loader:before,.loader:after{ --r:20.5deg; content:""; width:320px; height:140px; position:absolute; right:32%; bottom:-11px; background:#f8fafc; transform:translateZ(200px) rotate(var(--r)); animation:mask var(--duration) linear forwards infinite; }
  .loader:after{ --r:-20.5deg; right:auto; left:32%; }
  .loader .ground{ position:absolute; left:-50px; bottom:-120px; transform-style:preserve-3d; transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); }
  .loader .ground div{ transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(0); width:200px; height:200px; background:var(--primary); background:linear-gradient(45deg,var(--primary) 0%,var(--primary) 50%,var(--primary-light) 50%,var(--primary-light) 100%); transform-style:preserve-3d; animation:ground var(--duration) linear forwards infinite; }
  .loader .ground div:before,.loader .ground div:after{ --rx:90deg; --ry:0deg; --x:44px; --y:162px; --z:-50px; content:""; width:156px; height:300px; opacity:0; background:linear-gradient(var(--primary),var(--primary-rgba)); position:absolute; transform:rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--x),var(--y)) translateZ(var(--z)); animation:ground-shine var(--duration) linear forwards infinite; }
  .loader .ground div:after{ --rx:90deg; --ry:90deg; --x:0; --y:177px; --z:150px; }
  .loader .box{ --x:0; --y:0; position:absolute; animation:var(--duration) linear forwards infinite; transform:translate(var(--x),var(--y)); }
  .loader .box div{ background-color:var(--primary); width:48px; height:48px; position:relative; transform-style:preserve-3d; animation:var(--duration) ease forwards infinite; transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); }
  .loader .box div:before,.loader .box div:after{ --rx:90deg; --ry:0deg; --z:24px; --y:-24px; --x:0; content:""; position:absolute; background-color:inherit; width:inherit; height:inherit; transform:rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--x),var(--y)) translateZ(var(--z)); filter:brightness(var(--b,1.2)); }
  .loader .box div:after{ --rx:0deg; --ry:90deg; --x:24px; --y:0; --b:1.4; }
  .loader .box.box0{ --x:-220px; --y:-120px; left:58px; top:108px; animation-name:box-move0; } .loader .box.box0 div{ animation-name:box-scale0; }
  .loader .box.box1{ --x:-260px; --y:120px; left:25px; top:120px; animation-name:box-move1; } .loader .box.box1 div{ animation-name:box-scale1; }
  .loader .box.box2{ --x:120px; --y:-190px; left:58px; top:64px; animation-name:box-move2; } .loader .box.box2 div{ animation-name:box-scale2; }
  .loader .box.box3{ --x:280px; --y:-40px; left:91px; top:120px; animation-name:box-move3; } .loader .box.box3 div{ animation-name:box-scale3; }
  .loader .box.box4{ --x:60px; --y:200px; left:58px; top:132px; animation-name:box-move4; } .loader .box.box4 div{ animation-name:box-scale4; }
  .loader .box.box5{ --x:-220px; --y:-120px; left:25px; top:76px; animation-name:box-move5; } .loader .box.box5 div{ animation-name:box-scale5; }
  .loader .box.box6{ --x:-260px; --y:120px; left:91px; top:76px; animation-name:box-move6; } .loader .box.box6 div{ animation-name:box-scale6; }
  .loader .box.box7{ --x:-240px; --y:200px; left:58px; top:87px; animation-name:box-move7; } .loader .box.box7 div{ animation-name:box-scale7; }
  @keyframes box-move0{12%{transform:translate(var(--x),var(--y))}25%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
  @keyframes box-scale0{6%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}14%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
  @keyframes box-move1{16%{transform:translate(var(--x),var(--y))}29%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
  @keyframes box-scale1{10%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}18%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
  @keyframes box-move2{20%{transform:translate(var(--x),var(--y))}33%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
  @keyframes box-scale2{14%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}22%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
  @keyframes box-move3{24%{transform:translate(var(--x),var(--y))}37%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
  @keyframes box-scale3{18%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}26%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
  @keyframes box-move4{28%{transform:translate(var(--x),var(--y))}41%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
  @keyframes box-scale4{22%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}30%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
  @keyframes box-move5{32%{transform:translate(var(--x),var(--y))}45%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
  @keyframes box-scale5{26%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}34%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
  @keyframes box-move6{36%{transform:translate(var(--x),var(--y))}49%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
  @keyframes box-scale6{30%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}38%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
  @keyframes box-move7{40%{transform:translate(var(--x),var(--y))}53%,52%{transform:translate(0,0)}80%{transform:translate(0,-32px)}90%,100%{transform:translate(0,188px)}}
  @keyframes box-scale7{34%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0)}42%,100%{transform:rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1)}}
  @keyframes ground{0%,65%{transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(0)}75%,90%{transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(1)}100%{transform:rotateX(90deg) rotateY(0deg) translate(-48px,-120px) translateZ(100px) scale(0)}}
  @keyframes ground-shine{0%,70%{opacity:0}75%,87%{opacity:0.2}100%{opacity:0}}
  @keyframes mask{0%,65%{opacity:0}66%,100%{opacity:1}}
  .box-loader-text{ position:relative; z-index:10; transform:translateZ(300px); min-height:24px; margin-top:16px; font-family:monospace; font-size:14px; letter-spacing:0.04em; color:#3f3f46; transition:opacity 1000ms ease; border-right:2px solid #3f3f46; padding-right:4px; white-space:nowrap; overflow:hidden; }
  .box-loader-text.fade-out{ opacity:0; } .box-loader-text.fade-in{ opacity:1; }
`;

function createBoxes(): string {
  return Array.from({ length: 8 }, (_, i) => `<div class="box box${i}"><div></div></div>`).join('');
}

export type BoxLoaderHandle = {
  showFinal: (message?: string) => Promise<void>;
  destroy: () => void;
};

export function mountBoxLoader(target: HTMLElement): BoxLoaderHandle {
  const style = document.createElement('style');
  style.textContent = loaderCss;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.className = 'box-loader-container';
  container.innerHTML = `<div class="loader">${createBoxes()}<div class="ground"><div></div></div></div><p class="box-loader-text" aria-live="polite"></p>`;
  target.appendChild(container);

  const textEl = container.querySelector<HTMLParagraphElement>('.box-loader-text')!;
  let phaseIndex = 0;
  let fillerLast = '';
  let typingTimer: number | undefined;
  let cycleTimer: number | undefined;
  let finished = false;

  function typeText(fullText: string, onDone?: () => void): void {
    textEl.classList.remove('fade-out');
    textEl.classList.add('fade-in');
    textEl.textContent = '';
    let charPos = 0;
    clearInterval(typingTimer);
    typingTimer = window.setInterval(() => {
      charPos += 1;
      textEl.textContent = fullText.slice(0, charPos);
      if (charPos >= fullText.length) {
        clearInterval(typingTimer);
        if (onDone) setTimeout(onDone, 400);
      }
    }, 120);
  }

  function pickFiller(): string {
    const candidates = filler.filter((text) => text !== fillerLast);
    const pool = candidates.length > 0 ? candidates : [...filler];
    const choice = pool[Math.floor(Math.random() * pool.length)];
    fillerLast = choice;
    return choice;
  }

  function scheduleNext(): void {
    if (finished) return;
    clearTimeout(cycleTimer as number);
    cycleTimer = window.setTimeout(() => {
      textEl.classList.add('fade-out');
      setTimeout(() => {
        if (finished) return;
        let nextText: string;
        if (phaseIndex < phase.length) {
          nextText = phase[phaseIndex];
          phaseIndex += 1;
        } else {
          nextText = pickFiller();
        }
        typeText(nextText);
        scheduleNext();
      }, 600);
    }, 5000);
  }

  typeText(phase[0]);
  phaseIndex = 1;
  scheduleNext();

  return {
    showFinal: (message?: string) =>
      new Promise<void>((resolve) => {
        finished = true;
        clearInterval(typingTimer);
        clearTimeout(cycleTimer as number);
        textEl.classList.add('fade-out');
        setTimeout(() => {
          const finalText = message ?? finals[Math.floor(Math.random() * finals.length)];
          typeText(finalText, () => setTimeout(resolve, 1500));
        }, 600);
      }),
    destroy: () => {
      finished = true;
      clearInterval(typingTimer);
      clearTimeout(cycleTimer as number);
      style.remove();
      container.remove();
    },
  };
}

export function showGlobalLoader(): BoxLoaderHandle {
  const overlay = document.createElement('div');
  overlay.id = 'global-box-loader';
  overlay.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;background:rgba(248,250,252,0.92);backdrop-filter:blur(2px);z-index:9999;';
  document.body.appendChild(overlay);
  const handle = mountBoxLoader(overlay);
  return {
    showFinal: handle.showFinal,
    destroy: () => {
      handle.destroy();
      overlay.remove();
    },
  };
}
