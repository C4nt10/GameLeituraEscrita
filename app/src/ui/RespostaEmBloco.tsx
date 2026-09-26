import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import { cor, tamanho } from '../theme/tema';
import { Bloco } from './Bloco';
import { useTremor } from './movimento';

/**
 * Resposta de escolha (4 alternativas): bloco de madeira. Errada: treme e
 * volta, sem vermelho e sem som (D-54); a contagem do erro é de quem chama
 * (`aoErrar`, D-06). Certa: vira verde e, um instante depois, avisa
 * `aoAcertar`.
 */
export function RespostaEmBloco({
  texto,
  certa,
  aoAcertar,
  aoErrar,
  aoComecarAcerto,
  familia = 'display',
  largura = 110,
  altura = 84,
  travada = false,
}: {
  texto: string;
  certa: boolean;
  aoAcertar: () => void;
  aoErrar: () => void;
  /** Avisa já no toque certo (antes do atraso de `aoAcertar`), pra quem chama travar as outras. */
  aoComecarAcerto?: () => void;
  familia?: 'letra' | 'display';
  largura?: number;
  altura?: number;
  /** Depois de acertar, as outras respostas ficam travadas. */
  travada?: boolean;
}) {
  const tremor = useTremor();
  const [acertou, setAcertou] = useState(false);

  useEffect(() => {
    if (!acertou) return;
    const espera = setTimeout(aoAcertar, 450);
    return () => clearTimeout(espera);
  }, [acertou, aoAcertar]);

  function tocar() {
    if (acertou || travada) return;
    if (certa) {
      setAcertou(true);
      aoComecarAcerto?.();
    } else {
      tremor.disparar();
      aoErrar();
    }
  }

  return (
    <Animated.View style={tremor.estilo}>
      <Bloco
        cor={
          acertou ? cor.verde : { base: cor.madeira, degrau: cor.madeiraBorda, texto: cor.tinta }
        }
        texto={texto}
        largura={largura}
        altura={altura}
        tamanhoDaFonte={tamanho.alternativa}
        raioDoBloco={20}
        familia={familia}
        onPress={tocar}
        acessibilidade={`resposta ${texto}`}
      />
    </Animated.View>
  );
}
