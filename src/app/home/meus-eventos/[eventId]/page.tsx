import { OrganizerEventDetail } from "@/components/dashboard/my-events/organizer-event-detail";

type Props = { params: Promise<{ eventId: string }> };

export async function generateMetadata({ params }: Props) {
  const { eventId } = await params;
  return { title: `Evento ${eventId}` };
}

export default async function OrganizerEventPage({ params }: Props) {
  const { eventId } = await params;
  return <OrganizerEventDetail eventId={eventId} />;
}
