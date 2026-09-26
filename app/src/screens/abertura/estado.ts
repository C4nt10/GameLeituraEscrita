/**
 * A abertura (logo caindo + "Tocar para começar") aparece **só na abertura a
 * frio** do app (A-30, D-55): quem volta pra tela inicial depois de jogar não a
 * vê de novo. O estado vive na memória do módulo — some quando o processo
 * morre, que é exatamente o que "a frio" quer dizer — e por isso não vai pro
 * banco: não é preferência da criança nem do adulto.
 */
let jaMostrada = false;

export function aberturaPendente(): boolean {
  return !jaMostrada;
}

export function marcarAberturaMostrada(): void {
  jaMostrada = true;
}
