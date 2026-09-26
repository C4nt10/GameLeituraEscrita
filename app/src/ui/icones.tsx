import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import type { IconeDeEstrela } from '../theme/helpers';
import { cor as paleta } from '../theme/tema';

/**
 * Ícones do padrão "Letra Viva" v1 — desenhos do protótipo do dono
 * (`design/`), em SVG. A criança entende pelo símbolo (Princípio VI); o
 * texto é pro adulto.
 */

export type NomeDoIcone =
  'som' | 'x' | 'volta' | 'play' | 'mic' | 'parar' | 'olho' | 'engrenagem' | 'maca';

export interface IconeProps {
  nome: NomeDoIcone;
  tamanho?: number;
  /** Cor do traço/preenchimento; branco por padrão (ícones dos blocos coloridos). */
  cor?: string;
}

export function Icone({ nome, tamanho = 26, cor = '#FFFFFF' }: IconeProps) {
  const traco = {
    stroke: cor,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  } as const;

  if (nome === 'maca') {
    return (
      <Svg width={tamanho} height={tamanho} viewBox="0 0 20 20">
        <Path
          d="M10 6c-2-1.6-6-1-6 3.6C4 14 7 18 10 16.6 13 18 16 14 16 9.6 16 5 12 4.4 10 6z"
          fill={paleta.vermelho.base}
        />
        <Path
          d="M10 6c.2-2 1.2-3.4 3-4"
          stroke="#6B4A2A"
          strokeWidth={1.4}
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M11 4.2c1.6-.9 3.2-.5 3.8.2-1.4.9-2.9.9-3.8-.2z" fill={paleta.verde.base} />
      </Svg>
    );
  }

  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      {nome === 'som' && (
        <>
          <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={cor} />
          <Path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" strokeWidth={2} {...traco} />
        </>
      )}
      {nome === 'x' && <Path d="M6 6l12 12M18 6L6 18" strokeWidth={3} {...traco} />}
      {nome === 'volta' && <Path d="M15 5l-7 7 7 7" strokeWidth={3} {...traco} />}
      {nome === 'play' && <Path d="M7 4.5v15l12.5-7.5z" fill={cor} />}
      {nome === 'mic' && (
        <>
          <Rect x={9} y={3} width={6} height={11} rx={3} fill={cor} />
          <Path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" strokeWidth={2.2} {...traco} />
        </>
      )}
      {nome === 'parar' && <Rect x={6} y={6} width={12} height={12} rx={3} fill={cor} />}
      {nome === 'olho' && (
        <>
          <Path
            d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"
            strokeWidth={2.2}
            {...traco}
          />
          <Circle cx={12} cy={12} r={3} fill={cor} />
        </>
      )}
      {nome === 'engrenagem' && (
        <>
          <Circle cx={12} cy={12} r={3} strokeWidth={2} {...traco} />
          <Path
            d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"
            strokeWidth={2}
            {...traco}
          />
        </>
      )}
    </Svg>
  );
}

const ESTRELA = 'M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z';

/** Estrela cheia, meia (recorte da cheia — A-22, o guia só tem a inteira) ou vazia. */
export function Estrela({ tipo, tamanho = 44 }: { tipo: IconeDeEstrela; tamanho?: number }) {
  const cheia = { fill: paleta.amarelo.base, stroke: paleta.amarelo.degrau };
  const vazia = { fill: paleta.grade, stroke: paleta.madeiraBorda };
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Defs>
        <ClipPath id="metade">
          <Rect x={0} y={0} width={12} height={24} />
        </ClipPath>
      </Defs>
      <Path
        d={ESTRELA}
        strokeWidth={1.4}
        strokeLinejoin="round"
        {...(tipo === 'cheia' ? cheia : vazia)}
      />
      {tipo === 'meia' && (
        <Path
          d={ESTRELA}
          strokeWidth={1.4}
          strokeLinejoin="round"
          clipPath="url(#metade)"
          {...cheia}
        />
      )}
    </Svg>
  );
}

/** Mascote: um bloco amarelo com rosto e um "A" na lateral (D-50). */
export function Mascote({ tamanho = 140 }: { tamanho?: number }) {
  return (
    <Svg width={tamanho} height={(tamanho * 94) / 78} viewBox="22 14 78 94">
      <Path d="M22 34 L60 16 L98 34 L60 52 Z" fill="#F7C93A" />
      <Path d="M98 34 L98 88 L60 106 L60 52 Z" fill={paleta.amarelo.degrau} />
      <Path d="M22 34 L60 52 L60 106 L22 88 Z" fill={paleta.amarelo.base} />
      <G rotation={-8} origin="79, 72">
        <SvgText
          x={79}
          y={80}
          fontFamily="Andika_700Bold"
          fontSize={26}
          fill="#FFFFFF"
          textAnchor="middle"
        >
          A
        </SvgText>
      </G>
      <Circle cx={34} cy={62} r={5.5} fill={paleta.tinta} />
      <Circle cx={50} cy={70} r={5.5} fill={paleta.tinta} />
      <Circle cx={35.6} cy={60.4} r={1.8} fill="#FFFFFF" />
      <Circle cx={51.6} cy={68.4} r={1.8} fill="#FFFFFF" />
      <Path
        d="M34 78 Q41 88 50 84"
        stroke={paleta.tinta}
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
      />
      <Ellipse cx={28} cy={74} rx={4} ry={2.6} fill={paleta.vermelho.base} opacity={0.45} />
    </Svg>
  );
}
