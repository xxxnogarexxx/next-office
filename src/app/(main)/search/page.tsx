import { cardListings } from "@/lib/listings";
import { SearchListingsClient } from "@/components/search-listings-client";

export default function SearchPage() {
  return <SearchListingsClient listings={cardListings} />;
}
