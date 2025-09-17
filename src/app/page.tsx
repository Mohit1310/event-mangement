import { SignedIn, SignOutButton } from "@clerk/nextjs";

export default function Home() {
	return (
		<div>
			Hello World
			<SignedIn>
				<div>
					<SignOutButton />
				</div>
			</SignedIn>
		</div>
	);
}
