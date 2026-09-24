import { router } from 'expo-router';
import { TelaLeituraMontar } from '../../screens/rodada/leitura_montar';

export default function DevMontar() {
  return (
    <TelaLeituraMontar
      desafio={{
        palavra: 'gato',
        nivel: 2,
        classificacoes: ['animais'],
        modalidade: 'leitura_montar',
      }}
      onAcerto={() => router.back()}
      onErro={() => {}}
    />
  );
}
