"use server";

export async function submitUserIdentitiy(body) {
  const { email, phone } = body;
  try {
    return { email, phone };
  } catch (error) {
    return Promise.reject("Error appending row: " + error.message);
  }
}
