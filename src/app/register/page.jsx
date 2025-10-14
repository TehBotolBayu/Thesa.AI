"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { HeroTitle3 } from "@/components/ui/typography";
import { signUpService } from "@/services/auth.service";
import { Loader } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isRegisterDone, setIsRegisterDone] = useState(false);
  const [registerErrorMessage, setRegisterErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    setIsRegisterDone(false);
    setLoading(true);
    e.preventDefault();
    // Reset error state
    setError("");

    // Validate inputs
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error, status } = await signUpService(
        email,
        password,
        fullname
      );
      if (status != 201) {
        setLoading(false);
        setRegisterErrorMessage(error ?? "SignUp failed");
        throw new Error(error ?? "SignUp failed");
      }
      if (data) {
        setIsRegisterDone(true);
        setLoading(false);
        setRegisterErrorMessage('');
      }
      // setTimeout(() => {
      //   router.push("/verification?email=" + email);
      // }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        if (
          err?.message.includes("violates foreign key constraint") ||
          err?.message.includes(
            `duplicate key value violates unique constraint "Users_email_key`
          )
        ) {
          setError("Email already registered");
        }
      } else {
        setRegisterErrorMessage("An error occurred");
      }
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Modal
        isOpen={registerErrorMessage}
        onClose={() => setRegisterErrorMessage('')}
        titleColor={"text-red-400"}
        title={"Sign Up Failed"}
        content={registerErrorMessage}
        modalType={registerErrorMessage ? "error" : "success"}
        buttonTextA={"Continue"}
        buttonHandlerA={() => setRegisterErrorMessage('')}
      />

      <Modal
        isOpen={isRegisterDone}
        onClose={() => setIsRegisterDone(false)}
        titleColor={"text-green-400"}
        title={"Sign Up Success"}
        content={"Please check your email for verification"}
        modalType={"success"}
        buttonTextA={"Continue"}
        buttonHandlerA={() => router.push("/login")}
      />

      <Card className="w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold ">Sign Up</CardTitle>
          <CardDescription>
            Please enter your email and password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="text"
              placeholder="Email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="fullname">Full Name</label>
            <Input
              id="fullname"
              type="text"
              placeholder="Full Name"
              required
              onChange={(e) => setFullname(e.target.value)}
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
            className="cursor-pointer w-full   text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg"
            onClick={handleSubmit}
          >
            {loading && <Loader className="animate-spin" />}
            Sign Up
          </Button>
          <div className="flex items-center justify-center">
            <p className="text-sm text-gray-500">
              Already have an account? <Link className="hover:text-primary" href="/login">Login</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
