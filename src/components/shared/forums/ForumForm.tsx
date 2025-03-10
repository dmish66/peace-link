import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createForum } from "@/lib/appwrite/api";

const forumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  theme: z.string().min(1, "Theme is required"),
});

const ForumForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();

  const form = useForm({
    resolver: zodResolver(forumSchema),
    defaultValues: {
      title: "",
      description: "",
      theme: "",
    },
  });

  const handleCreateForum = async (values: z.infer<typeof forumSchema>) => {
    try {
      await createForum(values.title, values.description, values.theme, user.id);
      toast({ title: "Forum created successfully!" });
      navigate("/forums");
    } catch (error) {
      console.error("Error creating forum:", error);
      toast({ title: "Failed to create forum. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateForum)} className="max-w-2xl mx-auto space-y-6 p-6 bg-gray-900 text-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Create a New Forum
        </h1>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={5} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Theme</FormLabel>
              <FormControl>
                <select {...field} className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50">
                  <option value="" disabled>Choose a theme</option>
                  <option value="Refugee crises">Refugee crises</option>
                  <option value="Cultural conflicts">Cultural conflicts</option>
                  <option value="Social problems">Social problems</option>
                  <option value="International relations">International relations</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
          Create Forum
        </Button>
      </form>
    </Form>
  );
};

export default ForumForm;
