import { router } from 'expo-router';
import { TelaLeituraVoz } from '../../screens/rodada/leitura_voz';

export default function DevVoz() {
  return (
    <TelaLeituraVoz
      desafio={{
        palavra: 'gato',
        nivel: 2,
        classificacoes: ['animais'],
        modalidade: 'leitura_voz',
      }}
      iniciarGravacao={() => Promise.resolve()}
      pararGravacao={() => Promise.resolve('file://dev.wav')}
      transcrever={() => Promise.resolve('gato')}
      onAcerto={() => router.back()}
      onErro={() => {}}
      onSair={() => router.back()}
    />
  );
}
