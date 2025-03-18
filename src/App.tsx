import { Routes, Route } from "react-router-dom"; 
import {
  CreatePost, EditPost, Events, Home, Message, PostDetails, Profile, Saved,
  UpdateProfile, Forum, CreateForum, ForumChat,
} from "@/_root/pages";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import SignupForm from "@/_auth/forms/SignupForm";
import SigninForm from "@/_auth/forms/SigninForm";
import ForgotPassword from "@/_auth/forms/ForgotPassword";
import ResetPassword from "@/_auth/forms/ResetPassword";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";
import CreateEvent from "./_root/pages/CreateEvent";
import EventDetails from "./components/shared/events/EventDetails";
import EditEvent from "./_root/pages/EditEvent";

function App() {
  return (
    <main className="flex h-screen">
      <Routes>
        {/* Public Routes (Accessible without login) */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Private Routes (Require Authentication) */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/forums" element={<Forum />} />
          <Route path="/create-forum" element={<CreateForum />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/messages" element={<Message />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
          <Route path="/forum/:forumId" element={<ForumChat />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
        </Route>
      </Routes>

      <Toaster />
    </main>
  );
}

export default App;
