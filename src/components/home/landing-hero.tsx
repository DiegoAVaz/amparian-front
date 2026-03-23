import Image from "next/image";

import fundoLandingPage from "@/assets/fundoLandingPage.png";
import { MutedUnderlineLink, PrimaryLink } from "@/components/ui";

export function LandingHero() {
  return (
    <section className="relative flex min-h-screen flex-col" aria-labelledby="landing-heading">
      <div className="absolute inset-0">
        <Image
          src={fundoLandingPage}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative mt-auto flex min-h-[45vh] w-full flex-col items-center justify-center bg-white/70 px-4 py-10 text-center backdrop-blur-[2px] sm:min-h-[50vh] sm:px-6 sm:py-16">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
          <h1
            id="landing-heading"
            className="text-3xl font-bold leading-tight tracking-tight text-brand-teal sm:text-4xl md:text-5xl"
          >
            Conectando corações.
            <br />
            Criando impacto.
          </h1>
          <p className="text-base text-brand-teal sm:text-lg">
            Amparian: a plataforma de quem ampara e cuida
          </p>
          <div className="mt-2 flex flex-col items-center gap-3">
            <PrimaryLink href="/criar-conta">Junte-se a nós</PrimaryLink>
            <MutedUnderlineLink href="/login">Já tenho cadastro</MutedUnderlineLink>
          </div>
        </div>
      </div>
    </section>
  );
}
