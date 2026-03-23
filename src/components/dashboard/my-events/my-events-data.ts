export type EventTimeFilter = "upcoming" | "past" | "ongoing";

export type SubscriberStatus = "Confirmado" | "Pendente";

export type SubscriberRecord = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  cityUf: string;
  registrationDate: string;
  status: SubscriberStatus;
};

export type OrganizerEventRecord = {
  id: string;
  title: string;
  filter: EventTimeFilter;
  statusLabel: "Ativo" | "Encerrado" | "Em andamento";
  description: string;
  /** Gradiente CSS para o card / hero quando não há imagem */
  imageClassName: string;
};

const SUBS_WORKSHOP: SubscriberRecord[] = [
  {
    id: "s1",
    name: "Ana Paula Silva",
    role: "Designer",
    email: "ana.silva@email.com",
    phone: "(21) 98765-4321",
    cityUf: "Rio de Janeiro / RJ",
    registrationDate: "12/03/2025",
    status: "Confirmado",
  },
  {
    id: "s2",
    name: "Carlos Mendes",
    role: "Voluntário",
    email: "carlos.m@email.com",
    phone: "(21) 97654-3210",
    cityUf: "Niterói / RJ",
    registrationDate: "10/03/2025",
    status: "Pendente",
  },
  {
    id: "s3",
    name: "Mariana Costa",
    role: "Estudante",
    email: "mari.costa@email.com",
    phone: "(21) 96543-2109",
    cityUf: "São Gonçalo / RJ",
    registrationDate: "08/03/2025",
    status: "Confirmado",
  },
];

const SUBS_MUTIRAO: SubscriberRecord[] = [
  {
    id: "m1",
    name: "João Ferreira",
    role: "Engenheiro",
    email: "joao.f@email.com",
    phone: "(21) 91234-5678",
    cityUf: "Rio de Janeiro / RJ",
    registrationDate: "01/03/2025",
    status: "Confirmado",
  },
  {
    id: "m2",
    name: "Luiza Almeida",
    role: "Voluntária",
    email: "luiza.a@email.com",
    phone: "(21) 92345-6789",
    cityUf: "Duque de Caxias / RJ",
    registrationDate: "02/03/2025",
    status: "Pendente",
  },
];

const SUBS_SARAU: SubscriberRecord[] = [
  {
    id: "z1",
    name: "Pedro Santos",
    role: "Músico",
    email: "pedro.s@email.com",
    phone: "(21) 93456-7890",
    cityUf: "Rio de Janeiro / RJ",
    registrationDate: "20/03/2025",
    status: "Confirmado",
  },
];

const EVENTS: OrganizerEventRecord[] = [
  {
    id: "workshop-design",
    title: "Workshop de Design",
    filter: "upcoming",
    statusLabel: "Ativo",
    description:
      "Oficina prática de design thinking aplicado a projetos sociais. Trazer notebook; materiais de desenho serão fornecidos. Certificado para participantes presentes.",
    imageClassName: "from-teal-600 to-cyan-500",
  },
  {
    id: "mutirao-plantio",
    title: "Mutirão de plantio urbano",
    filter: "upcoming",
    statusLabel: "Ativo",
    description:
      "Ação de arborização em praça comunitária. Inclui capacitação rápida sobre espécies nativas e cuidados pós-plantio. Use roupas confortáveis e protetor solar.",
    imageClassName: "from-emerald-600 to-teal-400",
  },
  {
    id: "sarau-ao-vivo",
    title: "Sarau beneficente ao vivo",
    filter: "ongoing",
    statusLabel: "Em andamento",
    description:
      "Evento cultural em andamento com leituras, música e exposição de artesanato. Todas as contribuições revertem em cestas básicas para famílias atendidas pela ONG.",
    imageClassName: "from-amber-600 to-orange-500",
  },
];

const SUBSCRIBERS_BY_EVENT: Record<string, SubscriberRecord[]> = {
  "workshop-design": SUBS_WORKSHOP,
  "mutirao-plantio": SUBS_MUTIRAO,
  "sarau-ao-vivo": SUBS_SARAU,
};

export function listOrganizerEvents(filter: EventTimeFilter): OrganizerEventRecord[] {
  return EVENTS.filter((e) => e.filter === filter);
}

export function getOrganizerEventById(id: string): OrganizerEventRecord | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function getSubscribersForEvent(eventId: string): SubscriberRecord[] {
  return SUBSCRIBERS_BY_EVENT[eventId] ?? [];
}
