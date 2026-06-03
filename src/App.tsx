import { useEffect, useState } from "react";
import { getListingsPaginated  } from "./api/listings";
import CreateListingForm from "./components/CreateListingForm";
import ListingCard from "./components/ListingCard";
import ListingDetail from "./components/ListingDetail";
import type { Listing, ListingFilters, PaginatedListings } from "./types";

export default function App() {
	const [result, setResult] = useState<PaginatedListings | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<ListingFilters>({ page: 1, pageSize: 5 });

	useEffect(() => {
		setLoading(true);
		getListingsPaginated(filters)
			.then(setResult)
			.catch((err) =>
				setError(
					err instanceof Error ? err.message : "Failed to load listings",
				),
			)
			.finally(() => setLoading(false));
	}, [filters]);

	const listings = result?.data ?? [];
	const pagination = result?.pagination;
	const selectedListing = listings.find((l) => l.id === selectedId) ?? null;

	const handleBidSuccess = (updated: Listing) => {
		setResult((prev) =>
			prev ? { ...prev, data: prev.data.map((l) => (l.id === updated.id ? updated : l)) } : prev
		);
	};

	const handleListingCreated = (listing: Listing) => {
		setFilters((f) => ({ ...f, page: 1 }));
		setSelectedId(listing.id);
		setShowCreateForm(false);
	};

	const setFilter = (key: keyof ListingFilters, value: any) => {
		setFilters((f) => ({ ...f, page: 1, [key]: value || undefined }));
	};

	return (
		<div className="app">
			<header className="app-header">
				<h1>Interview Auctions</h1>
				<p className="app-header__subtitle">Farm Equipment Marketplace</p>
			</header>
			<div className="app-body">
				<aside className="panel panel--left">
					<div className="panel__heading-row">
						<h2 className="panel__heading">Listings</h2>
						<button
							type="button"
							className="panel__heading-action"
							onClick={() => {
								setShowCreateForm(true);
								setSelectedId(null);
							}}
						>
							+ New
						</button>
					</div>
					{/* Filters */}
					<div className="filters">
						<select onChange={(e) => setFilter("category", e.target.value)} value={filters.category ?? ""}>
							<option value="">All Categories</option>
							<option value="tractor">Tractor</option>
							<option value="combine">Combine</option>
							<option value="implement">Implement</option>
							<option value="attachment">Attachment</option>
						</select>
						<select onChange={(e) => setFilter("status", e.target.value)} value={filters.status ?? ""}>
							<option value="">All Statuses</option>
							<option value="active">Active</option>
							<option value="closed">Closed</option>
							<option value="pending">Pending</option>
						</select>
						<select onChange={(e) => setFilter("sort", e.target.value)} value={filters.sort ?? ""}>
							<option value="">Default Sort</option>
							<option value="bid_asc">Price: Low to High</option>
							<option value="bid_desc">Price: High to Low</option>
						</select>
					</div>
					<br/>
					{loading && <div className="state-message">Loading listings…</div>}
					{error && (
						<div className="state-message state-message--error">{error}</div>
					)}
					{!loading && !error && (
						<>
							<div className="listing-grid">
								{listings.map((listing) => (
									<ListingCard
										key={listing.id}
										listing={listing}
										isSelected={listing.id === selectedId}
										onClick={() => setSelectedId(listing.id)}
									/>
								))}
							</div>
							<br/>
							{/* Pagination */}
							{pagination && pagination.totalPages > 1 && (
								<div className="pagination">
									<button
										disabled={!pagination.hasPrevPage}
										onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
									>
										← Prev
									</button>{' '}
									<span>Page {pagination.page} of {pagination.totalPages}</span>{' '}
									<button
										disabled={!pagination.hasNextPage}
										onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
									>
										Next →
									</button>
								</div>
							)}

						</>
					)}
				</aside>
				<main className="panel panel--right">
					{showCreateForm ? (
						<CreateListingForm onSuccess={handleListingCreated} />
					) : selectedListing ? (
						<ListingDetail
							listing={selectedListing}
							onBidSuccess={handleBidSuccess}
						/>
					) : (
						<div className="empty-state">
							<p>Select a listing to view details and place a bid.</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
