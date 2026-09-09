import React, { useEffect, useState } from 'react';
import Loader from './3d-box-loader-animation';

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

type BoxLoaderProps = {
  isLoading?: boolean;
};

export function BoxLoader({ isLoading = true }: BoxLoaderProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [fillerLast, setFillerLast] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [fade, setFade] = useState(true);
  const [finalShown, setFinalShown] = useState(false);

  useEffect(() => {
    if (!isLoading && !finalShown) {
      setFade(false);
      const timeout = setTimeout(() => {
        const finalText = finals[Math.floor(Math.random() * finals.length)];
        setDisplayText('');
        setFade(true);
        let charPos = 0;
        const interval = setInterval(() => {
          charPos += 1;
          setDisplayText(finalText.slice(0, charPos));
          if (charPos >= finalText.length) clearInterval(interval);
        }, 120);
        setFinalShown(true);
      }, 600);
      return () => clearTimeout(timeout);
    }

    if (!isLoading) return;

    const isInPhase1 = phaseIndex < phase.length;
    const fullText = isInPhase1 ? phase[phaseIndex] : (() => {
      const candidates = filler.filter((text) => text !== fillerLast);
      const pool = candidates.length > 0 ? candidates : [...filler];
      const choice = pool[Math.floor(Math.random() * pool.length)];
      setFillerLast(choice);
      return choice;
    })();

    let charPos = 0;
    setDisplayText('');
    setFade(true);

    const typingInterval = setInterval(() => {
      charPos += 1;
      setDisplayText(fullText.slice(0, charPos));
      if (charPos >= fullText.length) clearInterval(typingInterval);
    }, 120);

    const holdTimeout = setTimeout(() => setFade(false), 3800);

    const nextTimeout = setTimeout(() => {
      if (isInPhase1) setPhaseIndex((current) => current + 1);
      else setPhaseIndex((current) => current + 1);
    }, 5000);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(holdTimeout);
      clearTimeout(nextTimeout);
    };
  }, [phaseIndex, isLoading, fillerLast, finalShown]);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '480px',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '48px',
        background: '#f8fafc',
        padding: '48px 16px',
        transformStyle: 'preserve-3d',
      }}
    >
      <Loader />
      <p
        aria-live="polite"
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: '16px',
          minHeight: '24px',
          transform: 'translateZ(300px) translateY(-8px)',
          fontFamily: 'monospace',
          fontSize: '14px',
          letterSpacing: '0.04em',
          color: '#3f3f46',
          opacity: fade ? 1 : 0,
          transition: 'opacity 1000ms ease',
          borderRight: '2px solid #3f3f46',
          paddingRight: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <span style={{ display: 'inline-block', overflow: 'hidden', whiteSpace: 'nowrap' }}>{displayText}</span>
      </p>
    </div>
  );
}

export default BoxLoader;
