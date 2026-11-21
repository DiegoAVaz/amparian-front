// Entrega ao navegador um arquivo que chegou pela API, com o nome escolhido.
//
// O PDF do certificado não tem URL pública: ele chega como `Blob` por uma rota com token,
// e um link `<a href>` comum não mandaria o token. Então o arquivo vira uma URL `blob:` local e um
// link temporário com `download` faz o navegador salvar.

// Tempo até liberar a URL `blob:`. Revogar logo depois do clique pode cancelar o download em alguns
// navegadores, que só leem a URL depois que o clique termina.
const REVOKE_DELAY_MS = 10_000;

export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  // Fora do documento, o Firefox ignora o clique programático.
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
