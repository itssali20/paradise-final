import Link from "next/link";
import EventForm from "@/components/admin/EventForm";
import { createEvent } from "@/actions/admin";

export const metadata = { title: "New event" };

export default async function NewEvent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <div className="admin__head"><div><Link className="caps caps--dim" href="/admin/events">← Events</Link><h1>New Paradise event</h1></div></div>
      {sp.error && <p className="notice notice--warn" style={{ marginBottom: 16 }}>{sp.error}</p>}
      <p className="muted" style={{ marginBottom: 16 }}>Tip: for next month at a new hotel, open an existing event and use <b>Duplicate → next month</b> to copy its rooms, prices and activities.</p>
      <EventForm action={createEvent} submit="Create event" />
    </>
  );
}
