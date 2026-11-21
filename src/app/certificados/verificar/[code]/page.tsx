import type { Metadata } from "next";

import { CertificateVerification } from "@/components/certificate-verification";

// A página mostra o nome completo de quem participou (RC-08): fica fora dos buscadores, para o nome
// não ser encontrado pesquisando a pessoa. Quem confere chega pelo QR ou pelo código impresso.
export const metadata: Metadata = {
  title: "Verificação de certificado",
  robots: { index: false, follow: false },
};

export default async function VerificarCodigoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <CertificateVerification code={safeDecode(code)} />;
}

// O código pode chegar digitado à mão na barra de endereço, com espaços ("%20"). Um "%" solto não
// decodifica; aí segue como veio, e a tela o trata como código inválido.
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
