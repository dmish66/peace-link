import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"; // Import useForm
import { forgotPassword } from "@/lib/appwrite/api";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/utils/Loader";
import { Link } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const form = useForm({ defaultValues: { email: "" } }); // Initialize useForm
  const { handleSubmit, control } = form; // Extract methods
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (data: { email: string }) => {
    if (!data.email) {
      toast({ title: "Please enter your email." });
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(data.email);
      toast({ title: "Recovery email sent! Check your inbox." });
      navigate("/sign-in");
    } catch (error) {
      console.error("Error sending recovery email:", error);
      toast({ title: "Failed to send recovery email. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:w-420 flex-center flex-col">
      <img src="/assets/images/logo.svg" alt="logo" />

      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Forgot Password</h2>
      <p className="text-light-3 small-medium md:base-regular mt-2">
        Enter your email to reset your password.
      </p>

      <Form {...form}>
        <form onSubmit={handleSubmit(handleForgotPassword)} className="flex flex-col gap-10 w-full mt-4">
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} className="shad-input" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary" disabled={loading}>
            {loading ? (
              <div className="flex-center gap-2">
                <Loader /> Sending...
              </div>
            ) : (
              "Send Recovery Email"
            )}
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            Remember your password?{" "}
            <Link to="/sign-in" className="text-primary-500 text-small-semibold ml-1">
              Sign in
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPassword;
