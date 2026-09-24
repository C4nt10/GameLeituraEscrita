import { router } from 'expo-router';
import { TelaResultado } from '../../screens/resultado';

export default function DevResultado() {
  return (
    <TelaResultado
      resultado={{ precisao: 0.875, estrelas: 4.5 }}
      acertos={7}
      erros={1}
      modalidade="leitura_montar"
      contadorAjuda={2}
      onJogarDeNovo={() => router.back()}
      onSubirDeNivel={() => router.back()}
    />
  );
}
