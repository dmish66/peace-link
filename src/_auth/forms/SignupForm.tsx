import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/utils/Loader";
import { useToast } from "@/components/ui/use-toast";

import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";

// Nationalities List
const nationalities = ["United Kingdom", "Bulgaria", "Germany", "Russia", "France", "Spain", "Italy", "Netherlands", "Poland", "Greece", "Portugal", "Sweden", "Denmark", "Norway", "Finland", "Japan", "China", "Brazil", "Mexico", "United States", "Canada", "India"];


// Signup Form Validation Schema
export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  nationality: z.enum(nationalities as [string, ...string[]], {
    required_error: "Please select your nationality.",
  }),
});

const SignupForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      nationality: "United Kingdom", // Default nationality
    },
  });

  // Queries for user creation and sign-in
  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isPending: isSigningInUser } = useSignInAccount();

  // Handle form submission
  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    try {
      const newUser = await createUserAccount(user);

      if (!newUser) {
        toast({ title: "Sign up failed. Please try again." });
        return;
      }

      const session = await signInAccount({
        email: user.email,
        password: user.password,
      });

      if (!session) {
        toast({ title: "Something went wrong. Please login your new account" });
        navigate("/sign-in");
        return;
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        toast({ title: "Login failed. Please try again." });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          Create a new account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          To use snapgram, Please enter your details
        </p>

        <form
          onSubmit={form.handleSubmit(handleSignup)}
          className="flex flex-col gap-5 w-full mt-4"
        >
          {/* Name Input */}
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Name</FormLabel>
              <FormControl><Input type="text" className="shad-input" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Username Input */}
          <FormField control={form.control} name="username" render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Username</FormLabel>
              <FormControl><Input type="text" className="shad-input" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Email Input */}
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Email</FormLabel>
              <FormControl><Input type="email" className="shad-input" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Password Input */}
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Password</FormLabel>
              <FormControl><Input type="password" className="shad-input" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Nationality Dropdown */}
          <FormField control={form.control} name="nationality" render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Country</FormLabel>
              <FormControl>
                <select className="shad-input" {...field}>
                  {nationalities.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Submit Button */}
          <Button type="submit" className="shad-button_primary">
            {isCreatingAccount || isSigningInUser || isUserLoading ? (
              <div className="flex-center gap-2"><Loader /> Loading...</div>
            ) : (
              "Sign Up"
            )}
          </Button>

          {/* Redirect to Login */}
          <p className="text-small-regular text-light-2 text-center mt-2">
            Already have an account?
            <Link to="/sign-in" className="text-primary-500 text-small-semibold ml-1">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;
