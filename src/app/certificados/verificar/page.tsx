import type { Metadata } from "next";

import { CertificateVerification } from "@/components/certificate-verification";

export const metadata: Metadata = {
  title: "Verificação de certificado",
  robots: { index: false, follow: false },
};

// Sem código na URL: quem chegou aqui digitando o endereço impresso no certificado.
export default function VerificarCertificadoPage() {
  return <CertificateVerification code={null} />;
}
