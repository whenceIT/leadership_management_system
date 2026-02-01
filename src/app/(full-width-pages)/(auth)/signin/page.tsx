import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whence Finacial Services | DSS",
  description: "Beyond the familia",
};

export default function SignIn() {
  return <SignInForm />;
}
