import { SignedIn, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
	return (
		<div>
			Hello World
			<SignedIn>
				<div>
					<SignOutButton />
				</div>
				<div>
					<Link href="/test">Go to Events</Link>
				</div>
			</SignedIn>
		</div>
	);
}
