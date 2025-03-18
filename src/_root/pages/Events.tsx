import { useState, useEffect } from "react";
import { listEventsByCountry, getEventCountries, getEventImageUrl, listMyEvents } from "@/lib/appwrite/api";
import { useUserContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const EventsPage = () => {
  const { user } = useUserContext();
  const [events, setEvents] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyEvents, setShowMyEvents] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getEventCountries();
        setCountries(data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let data;
        if (showMyEvents && user) {
          data = await listMyEvents(user.id);
        } else {
          data = await listEventsByCountry(selectedCountry);
        }

        const filteredEvents = data.documents.filter((event: any) =>
          event.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setEvents(filteredEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [selectedCountry, searchQuery, showMyEvents, user]);

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="max-w-5xl mx-auto w-full py-4 px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-3xl font-bold">{showMyEvents ? "My Events" : "All Events"}</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowMyEvents(false)}
              className={`px-4 py-2 rounded-md ${!showMyEvents ? "bg-blue-600" : "bg-gray-700"}`}
            >
              All Events
            </button>
            <button
              onClick={() => setShowMyEvents(true)}
              className={`px-4 py-2 rounded-md ${showMyEvents ? "bg-blue-600" : "bg-gray-700"}`}
            >
              My Events
            </button>
          </div>
          <Link to="/create-event" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-colors">
            Create Event
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full sm:w-64 mt-4 p-3 bg-gray-800 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-16 custom-scrollbar">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <Link to={`/event/${event.$id}`} key={event.$id}>
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <img src={getEventImageUrl(event.image)} alt={event.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="text-gray-400 text-sm">{new Date(event.date).toLocaleDateString("en-US")}</p>
                    <p className="text-gray-400 font-bold">{event.country}</p>
                    <p className="text-green-400">{event.attendees?.length || 0} attending</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-xl">{showMyEvents ? "You have not created any events." : "No events found."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
