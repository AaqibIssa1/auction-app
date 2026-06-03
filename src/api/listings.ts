import type { Listing, ListingFilters, PaginatedListings } from "../types";
import type { Bid } from "../types";

// Old v1 function stays untouched for any consumer that needs it
export async function getListings(): Promise<Listing[]> {
	const res = await fetch("/api/listings");
	if (!res.ok) throw new Error("Failed to fetch listings");
	return res.json();
}

// New v2 function for paginated consumers
export async function getListingsPaginated(filters: ListingFilters = {}): Promise<PaginatedListings> {
	const params = new URLSearchParams();
	if (filters.page) params.set("page", String(filters.page));
	if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
	if (filters.category) params.set("category", filters.category);
	if (filters.status) params.set("status", filters.status);
	if (filters.minBid !== undefined) params.set("minBid", String(filters.minBid));
	if (filters.maxBid !== undefined) params.set("maxBid", String(filters.maxBid));
	if (filters.sort) params.set("sort", filters.sort);

	const res = await fetch(`/api/v2/listings?${params.toString()}`);
	if (!res.ok) throw new Error("Failed to fetch listings");
	return res.json();
}

export async function getListing(id: string): Promise<Listing> {
	const res = await fetch(`/api/listings/${id}`);
	if (!res.ok) throw new Error("Failed to fetch listing");
	return res.json();
}

export async function createListing(data: { title: string }): Promise<Listing> {
	const res = await fetch("/api/listings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || body.detail || "Failed to create listing");
	}
	return res.json();
}

export async function placeBid(
	listingId: string,
	bidder: string,
	amount: number,
): Promise<Listing> {
	const res = await fetch(`/api/listings/${listingId}/bids`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ bidder, amount }),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.error || data.detail || "Failed to place bid");
	}
	return res.json();
}

export async function getBidHistory(listingId: string): Promise<Bid[]> {
    const res = await fetch(`/api/listings/${listingId}/bidHistory`);
    if (!res.ok) throw new Error("Failed to fetch bid history");
    return res.json();
}
