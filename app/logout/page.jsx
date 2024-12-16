"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toastify

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });

        const data = await response.json();
        if (response.status === 200) {
          toast.success("Successfully logged out!", {
            position: "top-right",
          });
          router.push("/"); // Redirect after showing success toast
        } else {
          toast.error(data.message || "Logout failed!", {
            position: "top-right",
          });
        }
      } catch (error) {
        console.error("Error during logout:", error);
        toast.error("An error occurred while logging out.", {
          position: "top-right",
        });
      }
    };

    logoutUser();
  }, [router]);

  return (
    <>
      <ToastContainer /> {/* This container renders the toast messages */}
      <div>Logging out...</div>
    </>
  );
}
