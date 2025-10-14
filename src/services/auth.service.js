"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUpService(
  email,
  password,
  fullName
) {
  const supabase = await createClient();
  const signUpResult = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpResult.error) {
    console.error("Signup error:", signUpResult.error);
    return { data: null, error: signUpResult.error.message, status: 400 };
  }

  const usersInsert = await supabase
    .schema("public")
    .from("Users")
    .insert([
      {
        user_type: "user",
        fullName,
        credit: 0,
        account_id: signUpResult?.data?.user?.id,
      },
    ])
    .select();

  if (usersInsert.error) {
    console.error("Signup error:", usersInsert.error);
    return {
      data: null,
      error: usersInsert.error.message,
      status: 400,
    };
  }

  return {
    message: "Signup successful",
    data: {
      account: signUpResult.data.user,
      userData: usersInsert.data,
    },
    error: null,
    status: 201,
  };
}

export async function logInService(
  email,
  password
) {
  const supabase = await createClient();
  const result = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return result;
}
