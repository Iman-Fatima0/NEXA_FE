import { redirect } from "next/navigation";

/** OTP step removed — reset uses email link only. */
export default function ForgotPasswordVerifyRedirect() {
  redirect("/forgot-password");
}
