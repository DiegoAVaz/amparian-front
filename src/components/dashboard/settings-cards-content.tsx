"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button, FormAlert } from "@/components/ui";

import { DashboardShell } from "./dashboard-shell";

type MockPaymentCard = {
  id: string;
  brand: "Visa";
  last4: string;
  isPrimary: boolean;
};

const INITIAL_MOCK_PAYMENT_CARDS: MockPaymentCard[] = [
  { id: "card-primary", brand: "Visa", last4: "9999", isPrimary: true },
  { id: "card-secondary-1", brand: "Visa", last4: "9999", isPrimary: false },
  { id: "card-secondary-2", brand: "Visa", last4: "9999", isPrimary: false },
  { id: "card-secondary-3", brand: "Visa", last4: "9999", isPrimary: false },
];

export function SettingsCardsContent() {
  const [cards, setCards] = useState(INITIAL_MOCK_PAYMENT_CARDS);
  const [addCardNotice, setAddCardNotice] = useState("");
  const primaryCard = cards.find((card) => card.isPrimary);
  const otherCards = cards.filter((card) => !card.isPrimary);

  function handleMakePrimary(cardId: string) {
    setAddCardNotice("");
    setCards((current) =>
      current.map((card) => ({
        ...card,
        isPrimary: card.id === cardId,
      })),
    );
  }

  function handleRemove(cardId: string) {
    setAddCardNotice("");
    setCards((current) => current.filter((card) => card.id !== cardId));
  }

  function handleAddCard() {
    setAddCardNotice("A inclusão de cartão ainda está mockada nesta versão.");
  }

  return (
    <DashboardShell activeNav="settings">
      <main className="flex flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <nav
            aria-label="Caminho de navegação"
            className="flex flex-wrap items-center gap-3 text-xs"
          >
            <Link
              href="/home/configuracoes"
              className="rounded-full bg-white px-5 py-1.5 font-medium text-brand-teal/75 shadow-sm transition-colors hover:bg-white hover:text-brand-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
            >
              Configurações
            </Link>
            <span className="font-semibold text-brand-teal/50" aria-hidden>
              /
            </span>
            <span className="rounded-full border border-brand-teal/15 bg-surface-accent px-5 py-1.5 font-medium text-brand-teal shadow-sm">
              Meus cartões
            </span>
          </nav>

          <section className="flex w-full flex-col rounded-xl border border-gray-100 bg-white px-5 py-6 shadow-sm sm:px-8 lg:px-12">
            <header className="pb-5">
              <h1 className="text-xl font-semibold text-brand-teal">
                Gerenciar cartões
              </h1>
              <div className="mt-4 h-px w-full bg-gray-200" />
            </header>

            <div className="flex flex-col gap-8 py-2">
              <div className="flex justify-start sm:justify-end">
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={handleAddCard}
                  variant="success"
                  leftIcon={
                    <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                  }
                >
                  Adicionar cartão
                </Button>
              </div>

              <FormAlert className="max-w-2xl" variant="info">
                {addCardNotice}
              </FormAlert>

              <section
                aria-labelledby="primary-card-heading"
                className="flex max-w-2xl flex-col gap-4"
              >
                <h2
                  id="primary-card-heading"
                  className="text-base font-semibold text-brand-teal"
                >
                  Cartão principal
                </h2>
                {primaryCard ? (
                  <PaymentCardRow
                    card={primaryCard}
                    isPrimary
                    onRemove={handleRemove}
                  />
                ) : (
                  <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-5 text-sm text-gray-500">
                    Nenhum cartão principal definido.
                  </p>
                )}
              </section>

              <section
                aria-labelledby="other-cards-heading"
                className="flex max-w-2xl flex-col gap-4"
              >
                <h2
                  id="other-cards-heading"
                  className="text-base font-semibold text-brand-teal"
                >
                  Outros cartões
                </h2>
                <div className="flex flex-col gap-3">
                  {otherCards.length > 0 ? (
                    otherCards.map((card) => (
                      <PaymentCardRow
                        key={card.id}
                        card={card}
                        onMakePrimary={handleMakePrimary}
                        onRemove={handleRemove}
                      />
                    ))
                  ) : (
                    <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-5 text-sm text-gray-500">
                      Nenhum cartão adicional cadastrado.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}

function PaymentCardRow({
  card,
  isPrimary = false,
  onMakePrimary,
  onRemove,
}: {
  card: MockPaymentCard;
  isPrimary?: boolean;
  onMakePrimary?: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}) {
  return (
    <article
      className="flex min-h-14 flex-col gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-5"
      aria-label={`${card.brand} final ${card.last4}`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span
          className="h-10 w-10 shrink-0 rounded-full bg-surface-accent"
          aria-hidden
        />
        <p className="truncate text-sm font-medium text-gray-950">
          {card.brand} ****** {card.last4}
        </p>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        {!isPrimary && (
          <Button
            type="button"
            size="sm"
            className="w-full whitespace-nowrap sm:w-auto"
            onClick={() => onMakePrimary?.(card.id)}
            variant="primary"
          >
            Tornar principal
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          className="w-full whitespace-nowrap sm:w-auto"
          onClick={() => onRemove(card.id)}
          variant="danger"
        >
          Remover
        </Button>
      </div>
    </article>
  );
}
