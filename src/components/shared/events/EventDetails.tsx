import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEventById, getEventImageUrl, attendEvent, unattendEvent, deleteEvent, getUserById } from "@/lib/appwrite/api";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    console.error("Event ID is undefined");
    return <p className="text-red">Error: Event not found.</p>;
  }
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isAttending, setIsAttending] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const data = await getEventById(id);
        const organizerData = await getUserById(data.organizer);
        data.organizerName = organizerData?.name || "Unknown";
        setEvent(data);
        setIsAttending(data.attendees?.includes(user.id));
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    fetchEvent();
  }, [id, user.id]);

  const handleAttend = async () => {
    if (!user) return alert("You must be logged in.");
    if (event.organizer === user.id) return; // ✅ Prevent self-attendance

    try {
      const updatedEvent = await attendEvent(id, user.id);
      setEvent(updatedEvent);
      setIsAttending(true);
    } catch (error) {
      console.error("Error attending event:", error);
    }
  };

  const handleUnattend = async () => {
    try {
      const updatedEvent = await unattendEvent(id, user.id);
      setEvent(updatedEvent);
      setIsAttending(false);
    } catch (error) {
      console.error("Error unattending event:", error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteEvent(id);
      alert("Event deleted successfully!");
      navigate("/events"); // ✅ Redirect after deletion
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  if (!event) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white w-full flex justify-center p-6">
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg overflow-y-auto max-h-screen">
        <h1 className="text-4xl font-bold mb-6">{event.title}</h1>
  
        {/* Large Event Image */}
        <img
          src={getEventImageUrl(event.image)}
          alt={event.title}
          className="w-full h-96 object-cover rounded-lg mb-6"
        />

        <p className="text-yellow-400 text-lg mt-2">
          <strong>Organizer:</strong> {event.organizerName || "Unknown"}
        </p>
  
        {/* Event Info */}
        <p className="text-gray-400 text-lg">
          {new Date(event.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
        <p className="text-gray-300 mt-4 text-lg">{event.country}</p>
  
        <p className="text-blue-400 text-lg">{event.location}</p>
  
        {/* Full Description - FIXED TEXT WRAPPING & SCROLLING */}
        <div className="overflow-y-auto max-h-[500px]">
          <p className="text-gray-300 mt-4 text-lg break-words whitespace-pre-line">
            {event.description}
          </p>
        </div>
  
        {/* Attendees Count */}
        <p className="text-green-400 mt-2">
          <strong>Attendees:</strong> {event.attendees?.length || 0}
        </p>
  
        {/* Attend/Unattend Button (Only if NOT the organizer) */}
        {user.id !== event.organizer && (
          <div className="mt-4">
            {isAttending ? (
              <Button onClick={handleUnattend} className="bg-red-600">Unattend</Button>
            ) : (
              <Button onClick={handleAttend} className="bg-green-600">Attend</Button>
            )}
          </div>
        )}
  
        {/* Edit & Delete (Only for Organizer) */}
        {user?.id && event?.organizer && user.id === event.organizer && (
          <div className="mt-6 flex gap-4">
            <Button onClick={() => navigate(`/edit-event/${id}`)} className="bg-yellow-600">Edit</Button>
            <Button onClick={handleDelete} className="bg-red-600">Delete</Button>
          </div>
        )}
      </div>
    </div>
  );  
};

export default EventDetailsPage;
