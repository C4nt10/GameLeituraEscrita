import * as Speech from 'expo-speech';
import { getRecordingPermissionsAsync } from 'expo-audio';
import { verificarCapacidades } from '../../services/capacidade_aparelho';

jest.mock('expo-speech', () => ({
  getAvailableVoicesAsync: jest.fn(),
}));

jest.mock('expo-audio', () => ({
  getRecordingPermissionsAsync: jest.fn(),
}));

const getAvailableVoicesAsync = Speech.getAvailableVoicesAsync as jest.Mock;
const getRecordingPermissionsAsyncMock = getRecordingPermissionsAsync as jest.Mock;

describe('capacidade_aparelho — "desabilitado com motivo", nunca oculto (Princípio I/III, FR-013)', () => {
  beforeEach(() => {
    getAvailableVoicesAsync.mockReset();
    getRecordingPermissionsAsyncMock.mockReset();
  });

  it('microfone indisponível (permissão negada) retorna disponivel=false com motivo legível', async () => {
    getRecordingPermissionsAsyncMock.mockResolvedValue({
      status: 'denied',
      granted: false,
      canAskAgain: true,
      expires: 'never',
    });
    getAvailableVoicesAsync.mockResolvedValue([
      { identifier: 'x', language: 'pt-BR', name: 'x', quality: 'Default' },
    ]);

    const capacidades = await verificarCapacidades();

    expect(capacidades.microfone.disponivel).toBe(false);
    expect(capacidades.microfone.motivo).toEqual(expect.any(String));
    expect(capacidades.microfone.motivo).not.toBe('');
  });

  it('permissão de microfone negada permanentemente (canAskAgain=false) informa que precisa ir em Configurações', async () => {
    getRecordingPermissionsAsyncMock.mockResolvedValue({
      status: 'denied',
      granted: false,
      canAskAgain: false,
      expires: 'never',
    });
    getAvailableVoicesAsync.mockResolvedValue([
      { identifier: 'x', language: 'pt-BR', name: 'x', quality: 'Default' },
    ]);

    const capacidades = await verificarCapacidades();

    expect(capacidades.microfone.disponivel).toBe(false);
    expect(capacidades.microfone.motivo?.toLowerCase()).toEqual(
      expect.stringContaining('configura'),
    );
  });

  it('permissão ainda não pedida (undetermined) NÃO é tratada como indisponível — só nega quando o aparelho de fato negou', async () => {
    getRecordingPermissionsAsyncMock.mockResolvedValue({
      status: 'undetermined',
      granted: false,
      canAskAgain: true,
      expires: 'never',
    });
    getAvailableVoicesAsync.mockResolvedValue([
      { identifier: 'x', language: 'pt-BR', name: 'x', quality: 'Default' },
    ]);

    const capacidades = await verificarCapacidades();

    expect(capacidades.microfone.disponivel).toBe(true);
    expect(capacidades.microfone.motivo).toBeNull();
  });

  it('sem nenhuma voz em português instalada, retorna disponivel=false com motivo legível', async () => {
    getRecordingPermissionsAsyncMock.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
    getAvailableVoicesAsync.mockResolvedValue([
      { identifier: 'x', language: 'en-US', name: 'x', quality: 'Default' },
    ]);

    const capacidades = await verificarCapacidades();

    expect(capacidades.vozPortugues.disponivel).toBe(false);
    expect(capacidades.vozPortugues.motivo).toEqual(expect.any(String));
    expect(capacidades.vozPortugues.motivo).not.toBe('');
  });

  it('com voz pt-BR instalada e microfone concedido, os dois recursos ficam disponíveis e sem motivo', async () => {
    getRecordingPermissionsAsyncMock.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
      expires: 'never',
    });
    getAvailableVoicesAsync.mockResolvedValue([
      { identifier: 'x', language: 'pt-BR', name: 'x', quality: 'Enhanced' },
    ]);

    const capacidades = await verificarCapacidades();

    expect(capacidades.microfone).toEqual({ disponivel: true, motivo: null });
    expect(capacidades.vozPortugues).toEqual({ disponivel: true, motivo: null });
  });
});
