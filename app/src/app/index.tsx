import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { cores, espacamento } from '../theme';

/**
 * Placeholder temporário. A tela inicial de verdade (abrir pronto pra
 * jogar, Princípio VII) é da Fase 5 (US3, configuração da rodada) —
 * ainda não construída. Por ora, só um menu pra alcançar as telas de
 * desafio já implementadas (T029-T032).
 */
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>GameLeituraEscrita</Text>
      <Text style={styles.legenda}>menu temporário — Fase 3 em construção</Text>
      <Link href="/_dev/ditado" style={styles.link}>
        Ditado (nível 2+)
      </Link>
      <Link href="/_dev/ditado-nivel1" style={styles.link}>
        Ditado (nível 1)
      </Link>
      <Link href="/_dev/montar" style={styles.link}>
        Leitura · montar
      </Link>
      <Link href="/_dev/voz" style={styles.link}>
        Leitura · voz
      </Link>
      <Link href="/_dev/resultado" style={styles.link}>
        Resultado
      </Link>
      <Text style={styles.legenda}>rodada completa (orquestrador)</Text>
      <Link href="/_dev/rodada?modalidade=ditado" style={styles.link}>
        Rodada — Ditado
      </Link>
      <Link href="/_dev/rodada?modalidade=leitura_montar" style={styles.link}>
        Rodada — Leitura · montar
      </Link>
      <Link href="/_dev/rodada?modalidade=leitura_voz" style={styles.link}>
        Rodada — Leitura · voz
      </Link>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.papel,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamento.md,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: cores.tinta,
  },
  legenda: {
    fontSize: 12,
    color: cores.tintaFraca,
  },
  link: {
    fontSize: 17,
    fontWeight: '700',
    color: cores.blocoAzul,
    marginTop: espacamento.sm,
  },
});
