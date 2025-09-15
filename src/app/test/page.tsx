"use client";

import { useState } from "react";

export default function TestEventsPage() {
	const [eventId, setEventId] = useState("");
	const [form, setForm] = useState({
		title: "",
		slug: "",
		description: "",
		category: "",
		startDate: "",
		endDate: "",
		location: "",
		capacity: 0,
		price: 0,
	});
	const [response, setResponse] = useState(null);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const createEvent = async () => {
		console.log("form", form);
		const res = await fetch("/api/events", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});
		setResponse(await res.json());
	};

	const getEvent = async () => {
		const res = await fetch(`/api/events/${eventId}`);
		setResponse(await res.json());
	};

	const deleteEvent = async () => {
		const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
		setResponse(await res.json());
	};

	return (
		<div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
			<h1>⚡ Event API Tester</h1>

			<h2>Create Event</h2>
			<input
				name="title"
				placeholder="Title"
				value={form.title}
				onChange={handleChange}
			/>
			<input
				name="slug"
				placeholder="Slug"
				value={form.slug}
				onChange={handleChange}
			/>
			<textarea
				name="description"
				placeholder="Description"
				value={form.description}
				onChange={handleChange}
			/>
			<input
				name="category"
				placeholder="Category"
				value={form.category}
				onChange={handleChange}
			/>
			{/* <select name="Event status" id="status">
				<option value={EventStatus.UPCOMING}>Upcoming</option>
				<option value={EventStatus.COMPLETED}>Completed</option>
				<option value={EventStatus.CANCELLED}>Cancelled</option>
			</select> */}
			<input
				type="datetime-local"
				name="startDate"
				value={form.startDate}
				onChange={handleChange}
			/>
			<input
				type="datetime-local"
				name="endDate"
				value={form.endDate}
				onChange={handleChange}
			/>
			<input
				name="location"
				placeholder="Location"
				value={form.location}
				onChange={handleChange}
			/>
			<input
				type="number"
				name="capacity"
				placeholder="Capacity"
				value={form.capacity}
				onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
			/>
			<input
				type="number"
				name="price"
				placeholder="Price"
				value={form.price}
				onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
			/>
			<button type="button" onClick={createEvent}>
				Create Event
			</button>

			<h2>Get/Delete Event</h2>
			<input
				placeholder="Event ID"
				value={eventId}
				onChange={(e) => setEventId(e.target.value)}
			/>
			<button type="button" onClick={getEvent}>
				Get Event
			</button>

			<button type="button" onClick={deleteEvent}>
				Delete Event
			</button>

			<h2>Response</h2>
			<pre style={{ background: "#f4f4f4", padding: "1rem" }}>
				{response ? JSON.stringify(response, null, 2) : "No response yet"}
			</pre>
		</div>
	);
}
