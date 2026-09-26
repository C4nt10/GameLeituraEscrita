describe('abertura — só na abertura a frio (A-30)', () => {
  it('fica pendente até ser marcada como mostrada e não volta a aparecer na mesma sessão', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { aberturaPendente, marcarAberturaMostrada } = require('../../screens/abertura/estado');

      expect(aberturaPendente()).toBe(true);
      marcarAberturaMostrada();
      expect(aberturaPendente()).toBe(false);
    });
  });

  it('uma sessão nova (módulo recarregado, como numa abertura a frio) volta a mostrar', () => {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { aberturaPendente } = require('../../screens/abertura/estado');
      expect(aberturaPendente()).toBe(true);
    });
  });
});
