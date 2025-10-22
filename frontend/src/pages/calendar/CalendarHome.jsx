import React, { useEffect, useState } from "react";
import {getEvents} from "../../api/calendar.js"

export default function CalendarHome() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      const fetchEvents = async () => {
        try {
          setLoading(true);
          const data = await getEvents();
          // Assuming your backend returns { items: [...] }
          setEvents(data.items || []); 
        } catch (err) {
          console.error("Failed to fetch calendar events:", err);
          setError("Failed to load calendar events.");
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();
    }, []); // Run only once

    const isToday = (dateString) => {
      const today = new Date();
      const date = new Date(dateString);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    };

    const isUpcoming = (dateString) => {
      const now = new Date();
      const eventStart = new Date(dateString);  

      return eventStart > now;
    };    

    const todayEvents = events.filter(e => isToday(e.startsAt));

    const upcomingEvents = events.filter(e => isUpcoming(e.startsAt)).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));

    if (loading) {
      return <div className="p-6 text-center text-primary/70">Loading calendar...</div>;
    }
    if (error) {
      return <div className="p-6 text-center text-red-600">{error}</div>;
    }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-heading text-primary">Calendar</h1>
      <p className="font-sans text-primary-900">
        This is your calendar home. Hook this to <code>/api/calendar</code> later.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded bg-white border border-primary/10 p-4">
          <div className="font-heading text-primary">Today</div>
          <div className="text-sm font-sans text-primary-900">Today ({todayEvents.length})</div>
          <div className="text-sm font-sans text-primary-900 mt-2 space-y-2">
          {todayEvents.length > 0 ? (
            todayEvents.map((e) => (
              <div key={e._id} className="border-l-4 border-pink-400 pl-2">
                <div className="font-semibold">{e.title}</div>
                <div className="text-xs text-primary/70">
                  {new Date(e.startsAt).toLocaleTimeString()} - {new Date(e.endsAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          ) : (
            <div>No events scheduled for today.</div>
          )}
        </div>
        </div>
        <div className="rounded bg-white border border-primary/10 p-4">
          <div className="font-heading text-primary">Upcoming ({upcomingEvents.length})</div>
            <div className="text-sm font-sans text-primary-900 mt-2 space-y-2">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((e) => (
                  <div key={e._id} className="border-l-4 border-blue-400 pl-2"> {/* Changed color for distinction */}
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-xs text-primary/70">
                      {new Date(e.startsAt).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div>No events currently scheduled.</div>
              )}
            </div>
        </div>
        <div className="rounded bg-white border border-primary/10 p-4">
          <div className="font-heading text-primary">Reminders</div>
          <div className="text-sm font-sans text-primary-900">Add notifications later.</div>
        </div>
      </div>
    </div>
  );
}
