import { router } from 'expo-router';
import { TelaDitado } from '../../screens/rodada/ditado';

const ALFABETO = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function DevDitadoNivel1() {
  return (
    <TelaDitado
      desafio={{ palavra: 'a', nivel: 1, classificacoes: null, modalidade: 'ditado' }}
      candidatasLetra={ALFABETO}
      falar={() => Promise.resolve()}
      onAcerto={() => router.back()}
      onErro={() => {}}
    />
  );
}
