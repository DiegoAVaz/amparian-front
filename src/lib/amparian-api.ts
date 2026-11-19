import { ApiError, apiBlob, apiFetch, apiJson, type ApiFile } from "@/lib/api";
import {
  formatVerificationCode,
  normalizeVerificationCode,
} from "@/lib/verification-code";

export type Plan = "basic" | "pro";
export type EventTimeFilter = "upcoming" | "past" | "ongoing";
export type RegistrationStatus = "pending" | "confirmed" | "cancelled";
export type ComputedEventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "upcoming"
  | "ongoing"
  | "past";

type ApiComputedEventStatus = ComputedEventStatus | "active" | "ended";

export type UserProfile = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  plan: Plan;
  publicOrganizationName: string | null;
  avatarUrl: string | null;
};

export type UserStats = {
  hoursDonated: number;
  causesSupported: number;
  eventsAttended: number;
  eventsCreated: number;
};

export type PublicEventSummary = {
  id: number;
  title: string;
  summary: string;
  org: string;
  startsAt: string;
  locationName: string | null;
  isRemote: boolean;
  capacity: number | null;
  coverImageUrl: string | null;
};

export type PublicEventDetail = PublicEventSummary & {
  description: string | null;
  rulesTerms: string | null;
  organizerId: number;
  endsAt: string | null;
  highlightSkill: string | null;
  types: LookupOption[];
  requirements: LookupOption[];
  computedStatus: ComputedEventStatus;
};

export type OrganizerEventSummary = {
  id: string;
  title: string;
  filter: EventTimeFilter;
  statusLabel: string;
  description: string;
  coverImageUrl: string | null;
  imageClassName: string;
  startsAt: string;
  status: "draft" | "published" | "cancelled";
};

export type OrganizerEventDetail = {
  id: string;
  organizerId: number;
  title: string;
  summary: string;
  description: string | null;
  rulesTerms: string | null;
  startsAt: string;
  endsAt: string | null;
  locationName: string | null;
  isRemote: boolean;
  capacity: number | null;
  workloadHours: number | null;
  coverImageUrl: string | null;
  highlightSkill: string | null;
  status: "draft" | "published" | "cancelled";
  computedStatus: ComputedEventStatus;
  types: LookupOption[];
  requirements: LookupOption[];
};

export type LookupOption = {
  code: string;
  label: string;
};

export type AgendaItem = {
  eventId: number;
  title: string;
  org: string;
  startsAt: string;
  dayLabel: string;
};

export type MyRegistration = {
  id: number;
  status: RegistrationStatus;
  event: {
    id: number;
    title: string;
    org: string;
    startsAt: string;
  };
};

export type AttendanceStatus = "present" | "absent";

export type SubscriberRecord = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  cityUf: string;
  registrationDate: string;
  status: RegistrationStatus;
  // Presença registrada pelo organizador; `null` sem marcação ou quando a inscrição não está
  // confirmada (a API não devolve presença de inscrição pendente ou cancelada).
  attendance: AttendanceStatus | null;
  // O voluntário já emitiu o certificado: a presença dele não muda mais (RC-04).
  certificateIssued: boolean;
};

export type EventFormInput = {
  title: string;
  summary: string;
  description: string | null;
  rulesTerms: string | null;
  startsAt: string;
  endsAt: string | null;
  locationName: string | null;
  isRemote: boolean;
  capacity: number | null;
  // Carga horária informada pelo organizador; `null` quando não informada (RC-03: aí a API usa a
  // duração, em evento de um dia, ou o certificado mostra só o período). Omitida, a API mantém o
  // valor gravado.
  workloadHours?: number | null;
  highlightSkill: string | null;
  typeCodes: string[];
  requirementCodes: string[];
  publish: boolean;
};

type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export async function getLookups(): Promise<{
  eventTypes: LookupOption[];
  requirementOptions: LookupOption[];
}> {
  return apiJson("/lookups", { auth: false });
}

export async function getMyProfile(): Promise<UserProfile> {
  return apiJson<UserProfile>("/me");
}

export async function updateMyProfile(
  patch: Partial<{
    name: string;
    phone: string | null;
    city: string | null;
    state: string | null;
    bio: string | null;
    publicOrganizationName: string | null;
  }>,
): Promise<UserProfile> {
  return apiJson<UserProfile>("/me", { method: "PATCH", json: patch });
}

export async function getMyStats(): Promise<UserStats> {
  return apiJson<UserStats>("/me/stats");
}

export async function getPublicEvents(
  q?: string,
): Promise<PublicEventSummary[]> {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  params.set("limit", "20");
  const path = `/events${params.size > 0 ? `?${params.toString()}` : ""}`;
  const res = await apiJson<Paginated<PublicEventSummary>>(path);
  return res.data;
}

export async function getPublicEvent(
  eventId: number | string,
): Promise<PublicEventDetail> {
  const event = await apiJson<PublicEventDetailApi>(`/events/${eventId}`);
  return mapPublicEventDetail(event);
}

export async function registerForPublicEvent(
  eventId: number | string,
  input: { participantRole?: string; agreedResponsibility: boolean },
): Promise<void> {
  await apiJson(`/events/${eventId}/registrations`, {
    method: "POST",
    json: input,
  });
}

export async function getAgenda(
  year: number,
  month: number,
): Promise<AgendaItem[]> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const res = await apiJson<{ data: AgendaItem[] }>(
    `/me/agenda?${params.toString()}`,
  );
  return res.data;
}

export async function getMyRegistrations(
  limit = 20,
): Promise<MyRegistration[]> {
  const params = new URLSearchParams({ page: "1", limit: String(limit) });
  const res = await apiJson<Paginated<MyRegistration>>(
    `/me/registrations?${params.toString()}`,
  );
  return res.data;
}

export async function getOrganizerEvents(
  filter?: EventTimeFilter,
): Promise<OrganizerEventSummary[]> {
  const params = new URLSearchParams();
  if (filter) params.set("filter", filter);
  const path = `/me/events${params.size > 0 ? `?${params.toString()}` : ""}`;
  const res = await apiJson<{ data: OrganizerEventSummary[] }>(path);
  return res.data;
}

type OrganizerEventApi = {
  id: number;
  organizer_id: number;
  title: string;
  summary: string;
  description: string | null;
  rules_terms: string | null;
  starts_at: string;
  ends_at: string | null;
  location_name: string | null;
  is_remote: boolean;
  capacity: number | null;
  workload_hours: number | null;
  cover_image_url: string | null;
  highlight_skill: string | null;
  status: "draft" | "published" | "cancelled";
  computedStatus: ApiComputedEventStatus;
  types: LookupOption[];
  requirements: LookupOption[];
};

type PublicEventDetailApi = Omit<PublicEventDetail, "computedStatus"> & {
  computedStatus: ApiComputedEventStatus;
};

export async function getOrganizerEvent(
  eventId: number | string,
): Promise<OrganizerEventDetail> {
  const event = await apiJson<OrganizerEventApi>(`/me/events/${eventId}`);
  return mapOrganizerEvent(event);
}

export async function createOrganizerEvent(
  input: EventFormInput,
): Promise<OrganizerEventDetail> {
  const event = await apiJson<OrganizerEventApi>("/me/events", {
    method: "POST",
    json: input,
  });
  return mapOrganizerEvent(event);
}

export async function updateOrganizerEvent(
  eventId: number | string,
  input: Partial<EventFormInput>,
): Promise<OrganizerEventDetail> {
  const event = await apiJson<OrganizerEventApi>(`/me/events/${eventId}`, {
    method: "PATCH",
    json: input,
  });
  return mapOrganizerEvent(event);
}

export async function deleteOrganizerEvent(
  eventId: number | string,
): Promise<void> {
  await apiJson(`/me/events/${eventId}`, { method: "DELETE" });
}

export async function getOrganizerRegistrations(
  eventId: number | string,
): Promise<SubscriberRecord[]> {
  const res = await apiJson<{ data: SubscriberRecord[] }>(
    `/me/events/${eventId}/registrations`,
  );
  return res.data;
}

// Grava em lote a lista de chamada (PUT /me/events/:eventId/attendance). A lista de inscritos traz
// o `id` como texto, mas a API exige número: a conversão fica aqui, para nenhuma tela esquecê-la.
// A resposta traz só as inscrições confirmadas com presença gravada, sem ordem garantida — quem
// chama deve casar por id, e a ausência na resposta quer dizer "sem marcação".
export async function recordAttendance(
  eventId: number | string,
  items: Array<{ registrationId: string; status: AttendanceStatus }>,
): Promise<Map<string, AttendanceStatus>> {
  const res = await apiJson<{
    data: Array<{ registrationId: number; status: AttendanceStatus }>;
  }>(`/me/events/${eventId}/attendance`, {
    method: "PUT",
    json: {
      items: items.map((item) => ({
        registrationId: Number(item.registrationId),
        status: item.status,
      })),
    },
  });
  return new Map(res.data.map((row) => [String(row.registrationId), row.status]));
}

// Quando a gravação da presença é recusada com `ATTENDANCE_LOCKED`, quais linhas estão travadas
// porque já têm certificado (RC-04). A API manda os ids como número e a lista usa texto: a
// conversão fica aqui pelo mesmo motivo de `recordAttendance`. Lista vazia para qualquer outro erro.
export function getAttendanceLockedIds(error: unknown): string[] {
  if (!(error instanceof ApiError) || !error.hasCode("ATTENDANCE_LOCKED")) return [];
  const details = error.details;
  if (!details || typeof details !== "object" || Array.isArray(details)) return [];
  const context = (details as { context?: { registrationIds?: unknown } }).context;
  const ids = context?.registrationIds;
  if (!Array.isArray(ids)) return [];
  return ids
    .filter((id): id is number => typeof id === "number" && Number.isInteger(id))
    .map(String);
}

export async function updateOrganizerRegistrationStatus(
  eventId: number | string,
  registrationId: number | string,
  status: RegistrationStatus,
): Promise<void> {
  await apiJson(`/me/events/${eventId}/registrations/${registrationId}`, {
    method: "PATCH",
    json: { status },
  });
}

function mapOrganizerEvent(event: OrganizerEventApi): OrganizerEventDetail {
  return {
    id: String(event.id),
    organizerId: Number(event.organizer_id),
    title: event.title,
    summary: event.summary,
    description: event.description,
    rulesTerms: event.rules_terms,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    locationName: event.location_name,
    isRemote: Boolean(event.is_remote),
    capacity: event.capacity === null ? null : Number(event.capacity),
    workloadHours:
      event.workload_hours === null || event.workload_hours === undefined
        ? null
        : Number(event.workload_hours),
    coverImageUrl: event.cover_image_url,
    highlightSkill: event.highlight_skill,
    status: event.status,
    computedStatus: normalizeComputedEventStatus(event.computedStatus),
    types: event.types,
    requirements: event.requirements,
  };
}

function mapPublicEventDetail(event: PublicEventDetailApi): PublicEventDetail {
  return {
    ...event,
    computedStatus: normalizeComputedEventStatus(event.computedStatus),
  };
}

function normalizeComputedEventStatus(
  status: ApiComputedEventStatus,
): ComputedEventStatus {
  if (status === "active") return "upcoming";
  if (status === "ended") return "past";
  return status;
}

const UPLOAD_FIELD_NAME = "file";

function imageFormData(file: File): FormData {
  const form = new FormData();
  form.append(UPLOAD_FIELD_NAME, file);
  return form;
}

export async function uploadMyAvatar(file: File): Promise<UserProfile> {
  return apiJson<UserProfile>("/me/avatar", {
    method: "POST",
    body: imageFormData(file),
  });
}

export async function deleteMyAvatar(): Promise<UserProfile> {
  return apiJson<UserProfile>("/me/avatar", { method: "DELETE" });
}

export async function uploadEventCover(
  eventId: number | string,
  file: File,
): Promise<OrganizerEventDetail> {
  const event = await apiJson<OrganizerEventApi | undefined>(
    `/me/events/${eventId}/cover`,
    { method: "POST", body: imageFormData(file) },
  );
  if (!event) throw new Error("A API não devolveu o evento após o envio.");
  return mapOrganizerEvent(event);
}

export async function deleteEventCover(
  eventId: number | string,
): Promise<OrganizerEventDetail> {
  const event = await apiJson<OrganizerEventApi | undefined>(
    `/me/events/${eventId}/cover`,
    { method: "DELETE" },
  );
  if (!event)
    throw new Error("A API não devolveu o evento após remover a capa.");
  return mapOrganizerEvent(event);
}

// ---------------------------------------------------------------------------------------------
// Certificados de participação
// ---------------------------------------------------------------------------------------------

// Os estados de um evento em "Meus certificados" (decididos na API):
//   - issued: o certificado existe — "Baixar PDF".
//   - available: presença registrada, ainda sem certificado — "Emitir e baixar".
//   - awaiting_attendance: o organizador ainda pode lançar a presença — "Aguardando o organizador",
//     até `attendanceClosesAt`.
//   - attendance_not_recorded: o prazo da presença fechou sem lançamento — "Sem presença".
// Inscrição com falta registrada não aparece.
export type CertificateListStatus =
  | "issued"
  | "available"
  | "awaiting_attendance"
  | "attendance_not_recorded";

export type CertificateListItem = {
  registrationId: number;
  status: CertificateListStatus;
  eventTitle: string;
  eventStartsAt: string;
  eventEndsAt: string | null;
  // No emitido, a carga impressa; nos demais, a que sairia se fosse emitido agora. `null` quando o
  // certificado mostra só o período — a tela não deve escrever "0 h".
  workloadHours: number | null;
  // Só em `awaiting_attendance`.
  attendanceClosesAt: string | null;
  // Só em `issued`. O código já vem formatado ("R4WT-8HZN-2QKC").
  certificate: {
    id: number;
    verificationCode: string;
    issuedAt: string;
  } | null;
};

export type CertificateList = {
  // Do evento mais recente para o mais antigo, como a API ordena.
  items: CertificateListItem[];
  summary: { issuedCount: number; certifiedHours: number };
};

export type Certificate = {
  id: number;
  registrationId: number;
  verificationCode: string;
  issuedAt: string;
  eventTitle: string;
  eventStartsAt: string;
  eventEndsAt: string | null;
  workloadHours: number | null;
};

// O que a verificação pública mostra: só o que está impresso no certificado (RC-08).
export type PublicCertificate = {
  verificationCode: string;
  participantName: string;
  eventTitle: string;
  organizerName: string;
  // A linha "Responsável:" do certificado; `null` quando o papel não a traz.
  responsiblePersonName: string | null;
  eventStartsAt: string;
  eventEndsAt: string | null;
  eventLocationName: string | null;
  eventIsRemote: boolean;
  workloadHours: number | null;
  issuedAt: string;
};

export async function getMyCertificates(): Promise<CertificateList> {
  const res = await apiJson<{
    data: CertificateListItem[];
    summary: CertificateList["summary"];
  }>("/me/certificates");
  return { items: res.data, summary: res.summary };
}

// Emite o certificado da inscrição (RC-05). A API responde 201 na primeira emissão e 200 quando o
// certificado já existia, com o mesmo corpo; `created` diz qual dos dois aconteceu.
//
// Dois pedidos ao mesmo tempo (clique duplo, duas abas) podem receber 409
// `CERTIFICATE_ISSUE_CONFLICT`: o outro pedido acabou de emitir. Pedir de novo devolve esse
// certificado, então a função tenta uma vez mais antes de mostrar erro a quem já tem o certificado.
export async function issueCertificate(
  registrationId: number,
): Promise<{ certificate: Certificate; created: boolean }> {
  const path = `/me/registrations/${registrationId}/certificate`;
  let res: Response;
  try {
    res = await apiFetch(path, { method: "POST" });
  } catch (error) {
    if (!(error instanceof ApiError) || !error.hasCode("CERTIFICATE_ISSUE_CONFLICT")) {
      throw error;
    }
    res = await apiFetch(path, { method: "POST" });
  }
  return {
    certificate: (await res.json()) as Certificate,
    created: res.status === 201,
  };
}

// Baixa o PDF pela API, com o token (RC-09): o arquivo fica num armazenamento privado e não tem
// URL pública. Se a API não mandar o nome do arquivo, monta o mesmo nome a partir do código — com
// hífens, como o da API, venha o código formatado ou não.
export async function downloadCertificatePdf(
  certificateId: number,
  verificationCode: string,
): Promise<ApiFile & { fileName: string }> {
  const file = await apiBlob(`/me/certificates/${certificateId}/pdf`);
  const normalized = normalizeVerificationCode(verificationCode);
  const code = normalized ? formatVerificationCode(normalized) : verificationCode;
  return {
    blob: file.blob,
    fileName: file.fileName ?? `certificado-amparian-${code}.pdf`,
  };
}

export type CertificateVerification =
  | { status: "valid"; certificate: PublicCertificate }
  | { status: "not_found" }
  | { status: "invalid" };

// Verificação pública por código (RC-08): sem token, porque quem confere não tem conta — e um
// visitante logado não deve mandar o dele para nada. O que não pode ser um código é recusado aqui,
// sem gastar uma das consultas limitadas por IP. "Não encontrado" e "inválido" voltam como
// resultado; o resto (429, falha de rede, erro interno, API mal configurada) é lançado para a tela
// mostrar a mensagem.
export async function verifyCertificate(
  input: string,
): Promise<CertificateVerification> {
  const code = normalizeVerificationCode(input);
  if (!code) return { status: "invalid" };

  try {
    const certificate = await apiJson<PublicCertificate>(
      `/certificates/verify/${encodeURIComponent(code)}`,
      { auth: false },
    );
    return { status: "valid", certificate };
  } catch (error) {
    if (error instanceof ApiError) {
      // Só o código da API diz "não encontrado". Um 404 sem ele é um caminho que a API não conhece
      // (deploy desatualizado, URL errada): mostrar "não encontrado" faria um certificado
      // verdadeiro parecer falso, então esse caso segue como erro.
      if (error.hasCode("CERTIFICATE_NOT_FOUND")) return { status: "not_found" };
      if (error.status === 400) return { status: "invalid" };
    }
    throw error;
  }
}
