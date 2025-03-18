import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { createEvent } from "@/lib/appwrite/api";
import { useState } from "react";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  country: z.string().min(1, "Country is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Address is required"),
});

const EventForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    accept: {"image/*": [".png", ".jpg", ".jpeg"]},
    onDrop: (acceptedFiles) => setImageFile(acceptedFiles[0]),
  });

  const handleCreateEvent = async (values: z.infer<typeof eventSchema>) => {
    if (!imageFile) {
      toast({ title: "Please upload an event image", variant: "destructive" });
      return;
    }

    try {
      await createEvent(
        values.title,
        values.description,
        values.country,
        values.date,
        imageFile,
        values.location,
        user.id
      );
      toast({ title: "Event created successfully!" });
      navigate("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({ title: "Failed to create event. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateEvent)} className="max-w-2xl mx-auto space-y-6 p-6 bg-gray-900 text-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Create New Event
        </h1>

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
            ) : (
              <>
                <p className="text-gray-400">
                  Drag & drop event image here, or click to select
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
                <Input {...field} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500/50" />
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
                <Textarea 
                  {...field} 
                  rows={4} 
                  className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500/50" 
                />
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
                <select
                  {...field}
                  className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500/50"
                >
                <option value="" disabled>Select Country</option> 
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Spain">Spain</option>
                <option value="Italy">Italy</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Poland">Poland</option>
                <option value="Greece">Greece</option>
                <option value="Portugal">Portugal</option>
                <option value="Sweden">Sweden</option>
                <option value="Denmark">Denmark</option>
                <option value="Norway">Norway</option>
                <option value="Finland">Finland</option>
                <option value="Japan">Japan</option>
                <option value="China">China</option>
                <option value="Russia">Russia</option>
                <option value="Brazil">Brazil</option>
                <option value="Mexico">Mexico</option>
                <option value="Canada">Canada</option>
                <option value="India">India</option>
                <option value="Bulgaria">Bulgaria</option>
                  {/* Add more countries with full names */}
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
                  <Input
                    type="datetime-local"
                    {...field}
                    className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500/50"
                  />
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
                <Input {...field} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Create Event
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;