"use client";
// import { MainButton } from "@/components/ui/button";
// import { TextField } from "@/components/ui/input/textfield";
// import Circle from "@/components/ui/loading/circle";
// import Modal from "@/components/ui/modal";
// import { HeroTitle3 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { logInService } from "@/services/auth.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isLoginFail, setIsLoginFail] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // User is already logged in, redirect to /myforms
          router.push("/login");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    // Reset error state
    setError("");

    // Validate inputs
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {

      const { data, error } = await logInService(email, password);
      if (error) {
        setLoading(false);
        setIsLoginFail(true);
        return;
      }
      if (data) {
        setLoading(false);
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>pulse here</div>;
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Modal
        isOpen={isLoginFail}
        onClose={() => setIsLoginFail(false)}
        titleColor={"text-red-400"}
        title={"Login Failed"}
        content={"Wrong email or password"}
        modalType={isLoginFail ? "error" : "success"}
        buttonTextA={"Continue"}
        buttonHandlerA={() => setIsLoginFail(false)}
      />

      <Card className="w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold ">Login</CardTitle>
          <CardDescription>
            Please enter your username and password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username">Username</label>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <p className="text-red-500">{error}</p>
          <Button
            className="cursor-pointer w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg text-white"
            onClick={handleSubmit}
          >
            {
              loading && (
                <Loader className="animate-spin" />
              )
            }
            Log In
          </Button>
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">
              Don't have an account? <Link className="hover:text-primary" href="/register">Sign up</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
