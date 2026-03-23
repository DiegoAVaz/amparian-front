import { notFound } from "next/navigation";

import { OrganizerEventDetail } from "@/components/dashboard/my-events/organizer-event-detail";
import { getOrganizerEventById } from "@/components/dashboard/my-events/my-events-data";

type Props = { params: Promise<{ eventId: string }> };

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;
  const event = getOrganizerEventById(eventId);
  if (!event) return { title: "Evento" };
  return { title: event.title };
}

export default async function OrganizerEventPage({ params }: Props) {
  const { eventId } = await params;
  const event = getOrganizerEventById(eventId);
  if (!event) notFound();
  return <OrganizerEventDetail event={event} />;
}
