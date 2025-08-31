import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <div className="h-screen flex justify-center items-center">
      <SignedOut>
        <SignInButton>
          <div className="px-8 py-4 rounded-xl bg-gradient-to-t from-purple-900 to-purple-500 border-2 border-purple-500 shadow-[inset_0_3px_0px_0px_#ffffff25,0_0_20px_5px_rgba(168,85,247,0.6)] text-2xl text-white cursor-pointer">
            Sign In
          </div>
        </SignInButton>
      </SignedOut>

      <SignedIn>{redirect("/arena")}</SignedIn>
    </div>
  );
}
