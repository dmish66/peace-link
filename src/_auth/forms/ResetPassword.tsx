import React from "react";
import { useForm } from "react-hook-form"; // Import useForm
import { useLocation, useNavigate } from "react-router-dom";
import { account } from "@/lib/appwrite/config";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { Link } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Extract query parameters from the URL (e.g., ?userId=xxx&secret=yyy)
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, control, formState: { isSubmitting } } = form;

  const handleResetPassword = async (data: { newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({ title: "Passwords do not match" });
      return;
    }

    if (!userId || !secret) {
      toast({ title: "Missing recovery credentials" });
      return;
    }

    try {
      await account.updateRecovery(userId, secret, data.newPassword);
      toast({ title: "Password reset successful. Please log in." });
      navigate("/sign-in");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({ title: "Failed to reset password. Please try again." });
    }
  };

  return (
    <div className="sm:w-420 flex-center flex-col">
      <img src="/assets/images/logo.svg" alt="logo" />

      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Reset Password</h2>
      <p className="text-light-3 small-medium md:base-regular mt-2">
        Enter a new password for your account.
      </p>

      <Form {...form}>
        <form onSubmit={handleSubmit(handleResetPassword)} className="flex flex-col gap-5 w-full mt-4">
          {/* New Password Field */}
          <FormField
            control={control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter new password" {...field} className="shad-input" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm New Password Field */}
          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm new password" {...field} className="shad-input" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex-center gap-2">
                <Loader /> Resetting...
              </div>
            ) : (
              "Reset Password"
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

export default ResetPassword;
