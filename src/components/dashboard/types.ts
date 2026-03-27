export type EventSummary = {
  id: number;
  title: string;
  org: string;
  summary: string;
  startsAt: string;
  locationName: string | null;
  isRemote: boolean;
  capacity: number | null;
  coverImageUrl: string | null;
};
