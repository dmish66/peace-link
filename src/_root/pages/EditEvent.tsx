import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getEventById, updateEvent, getEventImageUrl } from "@/lib/appwrite/api";
import { useUserContext } from "@/context/AuthContext";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  country: z.string().min(1, "Country is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Address is required"),
});

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      country: "",
      date: "",
      location: "",
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    onDrop: (acceptedFiles) => setImageFile(acceptedFiles[0]),
  });

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const data = await getEventById(id);
        if (!data || data.organizer !== user.id) {
          alert("You can only edit your own events.");
          navigate("/events");
          return;
        }

        form.reset({
          title: data.title,
          description: data.description,
          country: data.country,
          date: new Date(data.date).toISOString().slice(0, 16),
          location: data.location,
        });

        setCurrentImage(getEventImageUrl(data.image));
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user, navigate, form]);

  const handleUpdate = async (values: z.infer<typeof eventSchema>) => {
    try {
      await updateEvent(id!, {
        ...values,
        image: imageFile,
        date: new Date(values.date).toISOString(),
      });

      alert("Event updated successfully!");
      navigate(`/event/${id}`);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  if (loading) return <p className="text-white text-center">Loading...</p>;

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white flex justify-center items-center p-10">
      <div className="w-full max-w-6xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
          Edit Event
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-6">
            {/* Image Upload */}
            <div
              {...getRootProps()}
              className={`p-6 border-2 border-dashed rounded-xl cursor-pointer ${
                isDragActive ? "border-blue-500 bg-blue-900/20" : "border-gray-700"
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                {imageFile ? (
                  <p className="text-gray-300">{imageFile.name}</p>
                ) : currentImage ? (
                  <img
                    src={currentImage}
                    alt="Current"
                    className="mx-auto h-64 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <p className="text-gray-400">
                      Drag & drop a new image here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      (PNG, JPG, JPEG up to 5MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full p-3 bg-gray-700 rounded-xl border border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} className="w-full p-3 bg-gray-700 rounded-xl border border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Country Field */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full p-3 bg-gray-700 rounded-xl border border-gray-600">
                        <option value="" disabled>Select Country</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Field */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} className="w-full p-3 bg-gray-700 rounded-xl border border-gray-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Field */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full p-3 bg-gray-700 rounded-xl border border-gray-600" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="submit" className="py-3 bg-blue-600 rounded-xl hover:bg-blue-700">
                Update Event
              </Button>
              <Button type="button" onClick={() => navigate(-1)} className="py-3 bg-gray-600 rounded-xl hover:bg-gray-700">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditEvent;
