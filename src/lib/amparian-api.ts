import { apiJson } from "@/lib/api";

export type Plan = "basic" | "pro";
export type EventTimeFilter = "upcoming" | "past" | "ongoing";
export type RegistrationStatus = "pending" | "confirmed" | "cancelled";
export type ComputedEventStatus = "draft" | "cancelled" | "active" | "ongoing" | "ended";

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
  statusLabel: "Ativo" | "Encerrado" | "Em andamento";
  description: string;
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

export type SubscriberRecord = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  cityUf: string;
  registrationDate: string;
  status: RegistrationStatus;
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
  highlightSkill: string | null;
  coverImageUrl: string | null;
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
    avatarUrl: string | null;
  }>,
): Promise<UserProfile> {
  return apiJson<UserProfile>("/me", { method: "PATCH", json: patch });
}

export async function getMyStats(): Promise<UserStats> {
  return apiJson<UserStats>("/me/stats");
}

export async function getPublicEvents(q?: string): Promise<PublicEventSummary[]> {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  params.set("limit", "20");
  const path = `/events${params.size > 0 ? `?${params.toString()}` : ""}`;
  const res = await apiJson<Paginated<PublicEventSummary>>(path);
  return res.data;
}

export async function getPublicEvent(eventId: number | string): Promise<PublicEventDetail> {
  return apiJson<PublicEventDetail>(`/events/${eventId}`);
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

export async function getAgenda(year: number, month: number): Promise<AgendaItem[]> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const res = await apiJson<{ data: AgendaItem[] }>(`/me/agenda?${params.toString()}`);
  return res.data;
}

export async function getMyRegistrations(limit = 20): Promise<MyRegistration[]> {
  const params = new URLSearchParams({ page: "1", limit: String(limit) });
  const res = await apiJson<Paginated<MyRegistration>>(`/me/registrations?${params.toString()}`);
  return res.data;
}

export async function getOrganizerEvents(filter?: EventTimeFilter): Promise<OrganizerEventSummary[]> {
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
  cover_image_url: string | null;
  highlight_skill: string | null;
  status: "draft" | "published" | "cancelled";
  computedStatus: ComputedEventStatus;
  types: LookupOption[];
  requirements: LookupOption[];
};

export async function getOrganizerEvent(eventId: number | string): Promise<OrganizerEventDetail> {
  const event = await apiJson<OrganizerEventApi>(`/me/events/${eventId}`);
  return mapOrganizerEvent(event);
}

export async function createOrganizerEvent(input: EventFormInput): Promise<OrganizerEventDetail> {
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

export async function deleteOrganizerEvent(eventId: number | string): Promise<void> {
  await apiJson(`/me/events/${eventId}`, { method: "DELETE" });
}

export async function getOrganizerRegistrations(eventId: number | string): Promise<SubscriberRecord[]> {
  const res = await apiJson<{ data: SubscriberRecord[] }>(`/me/events/${eventId}/registrations`);
  return res.data;
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
    coverImageUrl: event.cover_image_url,
    highlightSkill: event.highlight_skill,
    status: event.status,
    computedStatus: event.computedStatus,
    types: event.types,
    requirements: event.requirements,
  };
}
