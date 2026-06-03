import { useEffect, useState } from "react";
import { getBidHistory } from "../api/listings";
import type { Bid } from "../types";

interface Props {
    listingId: string;
    refreshTrigger: number;
}

export default function BidHistory({ listingId, refreshTrigger }: Props) {
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getBidHistory(listingId)
        .then((data) => setBids(data))
            .catch((err) => 
                setError(
                    err instanceof Error ? err.message : "Failed to load bid history",
                ),
            )
            .finally(() => setLoading(false));
    }, [listingId, refreshTrigger]);

    if (loading) return <div className="state-message">Loading bid history…</div>;
    if (error) return <div className="state-message state-message--error">{error}</div>;

    return (
        <div className="bid-history">
            <h4 className="bid-history__title">Bid History</h4>
            {bids.length === 0 ? (
                <p className="bid-history__empty">No bids have been placed yet.</p>
            ) : (
            <div className="listing-detail__meta">
                {bids.map((bid, i) => (
                    <div key={i} className="meta-row">
                        <span className="meta-label">{bid.bidder}</span>
                        <span className="meta-value">
                            ${bid.amount.toLocaleString()}{' '}
                            ({new Date(bid.placedAt).toLocaleString()})
                        </span>
                    </div>
                ))}
            </div>
            )}
        </div>
    );
}