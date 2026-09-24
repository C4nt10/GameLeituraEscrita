import { router } from 'expo-router';
import { TelaDitado } from '../../screens/rodada/ditado';

const ALFABETO = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function DevDitado() {
  return (
    <TelaDitado
      desafio={{ palavra: 'gato', nivel: 2, classificacoes: ['animais'], modalidade: 'ditado' }}
      candidatasLetra={ALFABETO}
      falar={() => Promise.resolve()}
      onAcerto={() => router.back()}
      onErro={() => {}}
      onSair={() => router.back()}
    />
  );
}
