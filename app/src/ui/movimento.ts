import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
import { duracaoDoMovimento } from '../theme/helpers';
import { movimento } from '../theme/tema';

/**
 * Movimento do padrão "Letra Viva" (D-54) com `Animated` do próprio React
 * Native — sem `reanimated`. Tudo é transform/opacity, então roda no driver
 * nativo. Com "reduzir movimento" do sistema ligado, duração 0 e nenhum loop.
 */

export function useReduzirMovimento(): boolean {
  const [reduzir, setReduzir] = useState(false);
  useEffect(() => {
    let ativo = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (ativo) setReduzir(v);
    });
    const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzir);
    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, []);
  return reduzir;
}

/** Afunda 3 px ao pressionar (120 ms) — todo bloco tocável. */
export function useAfundar() {
  const reduzir = useReduzirMovimento();
  const [y] = useState(() => new Animated.Value(0));
  const animar = useCallback(
    (para: number) =>
      Animated.timing(y, {
        toValue: para,
        duration: duracaoDoMovimento(movimento.toque, reduzir),
        useNativeDriver: true,
      }).start(),
    [y, reduzir],
  );
  return useMemo(
    () => ({
      estilo: { transform: [{ translateY: y }] },
      aoPressionar: () => animar(3),
      aoSoltar: () => animar(0),
    }),
    [y, animar],
  );
}

/** Peça errada: ±7 px, dois ciclos, volta ao lugar (380 ms). Sem vermelho, sem som. */
export function useTremor() {
  const reduzir = useReduzirMovimento();
  const [x] = useState(() => new Animated.Value(0));
  const disparar = useCallback(() => {
    if (reduzir) return;
    const passo = movimento.treme / 5;
    Animated.sequence(
      [-7, 7, -7, 7, 0].map((para) =>
        Animated.timing(x, { toValue: para, duration: passo, useNativeDriver: true }),
      ),
    ).start();
  }, [x, reduzir]);
  const estilo = useMemo(
    () => ({
      transform: [
        { translateX: x },
        { rotate: x.interpolate({ inputRange: [-7, 7], outputRange: ['-4deg', '4deg'] }) },
      ],
    }),
    [x],
  );
  return { estilo, disparar };
}

/** Peça certa entra na vaga: escala 0,6 → 1 com leve mola (250 ms). */
export function useEncaixe() {
  const reduzir = useReduzirMovimento();
  const [escala] = useState(() => new Animated.Value(1));
  const disparar = useCallback(() => {
    if (reduzir) return;
    escala.setValue(0.6);
    Animated.timing(escala, {
      toValue: 1,
      duration: movimento.encaixe,
      easing: Easing.out(Easing.back(1.8)),
      useNativeDriver: true,
    }).start();
  }, [escala, reduzir]);
  return { estilo: { transform: [{ scale: escala }] }, disparar };
}

/** Loop de respiração (convite do botão, 1,8 s). Parado com "reduzir movimento". */
export function usePulso(duracao: number = movimento.convite, escalaMaxima = 1.05) {
  const reduzir = useReduzirMovimento();
  const [escala] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (reduzir) {
      escala.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(escala, {
          toValue: escalaMaxima,
          duration: duracao / 2,
          useNativeDriver: true,
        }),
        Animated.timing(escala, { toValue: 1, duration: duracao / 2, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [escala, reduzir, duracao, escalaMaxima]);
  return { transform: [{ scale: escala }] };
}

/** Anel que se expande e some, em loop (alto-falante do Ouvir e montar, 2,2 s). */
export function useOnda(duracao: number = movimento.onda) {
  const reduzir = useReduzirMovimento();
  const [progresso] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduzir) {
      progresso.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(progresso, { toValue: 1, duration: duracao, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [progresso, reduzir, duracao]);
  return useMemo(
    () => ({
      opacity: progresso.interpolate({ inputRange: [0, 1], outputRange: [reduzir ? 0 : 0.5, 0] }),
      transform: [
        { scale: progresso.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] }) },
      ],
    }),
    [progresso, reduzir],
  );
}

/** Bloco do logo caindo (550 ms), com atraso por letra. */
export function useQueda(atrasoMs: number) {
  const reduzir = useReduzirMovimento();
  const [t] = useState(() => new Animated.Value(reduzir ? 1 : 0));
  useEffect(() => {
    if (reduzir) {
      t.setValue(1);
      return;
    }
    t.setValue(0);
    Animated.timing(t, {
      toValue: 1,
      duration: movimento.queda,
      delay: atrasoMs,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, [t, reduzir, atrasoMs]);
  return useMemo(
    () => ({
      opacity: t.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 1] }),
      transform: [
        { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-240, 0] }) },
        { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '0deg'] }) },
      ],
    }),
    [t],
  );
}

/** Letra da comemoração: um pulo de 16 px (500 ms), com atraso por letra. */
export function usePulo(atrasoMs: number) {
  const reduzir = useReduzirMovimento();
  const [y] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduzir) return;
    Animated.sequence([
      Animated.delay(atrasoMs),
      Animated.timing(y, { toValue: -16, duration: movimento.pulo * 0.4, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: movimento.pulo * 0.6, useNativeDriver: true }),
    ]).start();
  }, [y, reduzir, atrasoMs]);
  return { transform: [{ translateY: y }] };
}
