import { SignedIn, SignOutButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      Hello World
      <SignedIn>
        <SignOutButton />
      </SignedIn>
    </div>
  );
}
