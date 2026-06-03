import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import express, { type Request, type Response } from "express";

const PORT = 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================
// Types
// ============================================================

type Category = "tractor" | "combine" | "implement" | "attachment";
type Status = "active" | "closed" | "pending";

interface Listing {
	id: string;
	title: string;
	description: string;
	category: Category;
	startingPrice: number;
	currentBid: number;
	currentBidder: string | null;
	status: Status;
	endsAt: string;
	imageUrl: string;
}

interface BidRequest {
	bidder: string;
	amount: number;
}

interface Bid {
    bidder: string;
    amount: number;
    placedAt: string;
}

interface CreateListingRequest {
	title: string;
}

// ============================================================
// In-memory store — seeded from data/listings.json
// ============================================================

const listings: Listing[] = JSON.parse(
	readFileSync(join(__dirname, "data", "listings.json"), "utf-8"),
);

const bidHistory: Record<string, Bid[]> = {};

// ============================================================
// App
// ============================================================

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// GET /api/listings
app.get("/api/listings", (_req: Request, res: Response) => {
	console.log("HELLOdfsdf")
	res.json(listings);
});

// GET /api/v2/listings - creating new API so old API doesn't break for existing consumers of it
app.get("/api/v2/listings", (req: Request, res: Response) => {
	console.log("HELLO")
	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 5));

	const category = req.query.category as string | undefined;
	const status = req.query.status as string | undefined;
	const minBid = parseFloat(req.query.minBid as string);
	const maxBid = parseFloat(req.query.maxBid as string);
	const sort = req.query.sort as string | undefined;

	let filtered = [...listings];

	if (category) filtered = filtered.filter((l) => l.category === category);
	if (status) filtered = filtered.filter((l) => l.status === status);
	if (!isNaN(minBid)) filtered = filtered.filter((l) => l.currentBid >= minBid);
	if (!isNaN(maxBid)) filtered = filtered.filter((l) => l.currentBid <= maxBid);

	if (sort === "bid_asc") filtered.sort((a, b) => a.currentBid - b.currentBid);
	else if (sort === "bid_desc") filtered.sort((a, b) => b.currentBid - a.currentBid);

	const total = filtered.length;
	const totalPages = Math.ceil(total / pageSize);
	const data = filtered.slice((page - 1) * pageSize, page * pageSize);

	res.json({
		data,
		pagination: {
			page,
			pageSize,
			total,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		},
	});
});

// POST /api/listings
app.post("/api/listings", (req: Request, res: Response) => {
	const { title } = req.body as CreateListingRequest;

	if (!title || typeof title !== "string" || title.trim() === "") {
		return res.status(400).json({ error: "Title is required" });
	}

	const listing: Listing = {
		id: randomUUID(),
		title: title.trim(),
		description: "",
		category: "implement",
		startingPrice: 0,
		currentBid: 0,
		currentBidder: null,
		status: "active",
		endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
		imageUrl: "",
	};

	listings.push(listing);
	return res.status(201).json(listing);
});

// GET /api/listings/:id
app.get("/api/listings/:id", (req: Request, res: Response) => {
	const listing = listings.find((l) => l.id === req.params.id);
	if (!listing) {
		return res.status(404).json({ error: "Listing not found" });
	}
	return res.json(listing);
});

// POST /api/listings/:id/bids
app.post("/api/listings/:id/bids", (req: Request, res: Response) => {
	const listing = listings.find((l) => l.id === req.params.id);
	if (!listing) {
		return res.status(404).json({ error: "Listing not found" });
	}

	if (listing.status !== "active") {
		return res
			.status(400)
			.json({ error: "This listing is not currently active" });
	}

	const bid = req.body as BidRequest;

	if (
		!bid.bidder ||
		typeof bid.bidder !== "string" ||
		bid.bidder.trim() === ""
	) {
		return res.status(400).json({ error: "Bidder name is required" });
	}

	if (typeof bid.amount !== "number" || isNaN(bid.amount) || bid.amount <= 0) {
		return res
			.status(400)
			.json({ error: "Bid amount must be a positive number" });
	}

	if (bid.amount <= listing.currentBid) {
		return res.status(400).json({
			error: `Bid must be greater than the current bid of $${listing.currentBid.toLocaleString()}`,
		});
	}

	listing.currentBid = bid.amount;
	listing.currentBidder = bid.bidder.trim();

	if (!bidHistory[listing.id]) {
		bidHistory[listing.id] = [];
	}
	bidHistory[listing.id].unshift({
		bidder: bid.bidder.trim(),
		amount: bid.amount,
		placedAt: new Date().toISOString(),
	});

	return res.status(201).json(listing);
});

// GET /api/listings/:id/bidHistory
app.get("/api/listings/:id/bidHistory", (req: Request, res: Response) => {
    const listing = listings.find((l) => l.id === req.params.id);
    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }
    return res.json(bidHistory[listing.id] ?? []);
});

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
