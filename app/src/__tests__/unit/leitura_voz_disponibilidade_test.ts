import * as Speech from 'expo-speech';
import { getRecordingPermissionsAsync } from 'expo-audio';
import {
  leituraVozDisponivel,
  verificarCapacidades,
  type CapacidadesAparelho,
} from '../../services/capacidade_aparelho';
import { verificarMotorDeVoz } from '../../services/stt';

jest.mock('expo-speech', () => ({ getAvailableVoicesAsync: jest.fn() }));
jest.mock('expo-audio', () => ({ getRecordingPermissionsAsync: jest.fn() }));
jest.mock('../../services/stt', () => ({ verificarMotorDeVoz: jest.fn() }));

const OK = { disponivel: true, motivo: null };
const MOTOR_AUSENTE = {
  disponivel: false,
  motivo: 'O reconhecimento de voz ainda não está instalado neste app.',
};
const MIC_NEGADO = { disponivel: false, motivo: 'Permissão de microfone negada.' };

function capacidades(
  microfone: CapacidadesAparelho['microfone'],
  reconhecimentoDeVoz: CapacidadesAparelho['reconhecimentoDeVoz'],
): CapacidadesAparelho {
  return { microfone, vozPortugues: OK, reconhecimentoDeVoz };
}

describe('Leitura · voz só é jogável com microfone E reconhecimento de fala reais (D-44, US1 cenário 9)', () => {
  it('motor de reconhecimento ausente: desabilitada, com o motivo do motor — mesmo com microfone ok', () => {
    const resultado = leituraVozDisponivel(capacidades(OK, MOTOR_AUSENTE));
    expect(resultado.disponivel).toBe(false);
    expect(resultado.motivo).toBe(MOTOR_AUSENTE.motivo);
  });

  it('motor ok mas microfone negado: desabilitada, com o motivo do microfone', () => {
    const resultado = leituraVozDisponivel(capacidades(MIC_NEGADO, OK));
    expect(resultado).toEqual({ disponivel: false, motivo: MIC_NEGADO.motivo });
  });

  it('os dois faltando: mostra primeiro o motivo do motor (permissão não adianta sem motor)', () => {
    const resultado = leituraVozDisponivel(capacidades(MIC_NEGADO, MOTOR_AUSENTE));
    expect(resultado.motivo).toBe(MOTOR_AUSENTE.motivo);
  });

  it('microfone e motor ok: disponível, sem motivo', () => {
    expect(leituraVozDisponivel(capacidades(OK, OK))).toEqual({ disponivel: true, motivo: null });
  });

  it('nunca fica indisponível sem motivo legível (Princípio III — nada de erro genérico)', () => {
    for (const cap of [
      capacidades(OK, MOTOR_AUSENTE),
      capacidades(MIC_NEGADO, OK),
      capacidades(MIC_NEGADO, MOTOR_AUSENTE),
    ]) {
      const r = leituraVozDisponivel(cap);
      expect(r.disponivel).toBe(false);
      expect(r.motivo).toEqual(expect.any(String));
      expect(r.motivo).not.toBe('');
    }
  });
});

describe('verificarCapacidades inclui o estado do motor de reconhecimento', () => {
  beforeEach(() => {
    (Speech.getAvailableVoicesAsync as jest.Mock).mockResolvedValue([
      { identifier: 'x', language: 'pt-BR', name: 'x', quality: 'Default' },
    ]);
    (getRecordingPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
  });

  it('repassa o veredito do serviço de STT', async () => {
    (verificarMotorDeVoz as jest.Mock).mockResolvedValue(MOTOR_AUSENTE);
    const cap = await verificarCapacidades();
    expect(cap.reconhecimentoDeVoz).toEqual(MOTOR_AUSENTE);

    (verificarMotorDeVoz as jest.Mock).mockResolvedValue(OK);
    const cap2 = await verificarCapacidades();
    expect(cap2.reconhecimentoDeVoz).toEqual(OK);
  });
});
