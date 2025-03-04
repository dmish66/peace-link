import { useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queries";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React Leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
};

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) return <Loader />;
  if (searchedPosts && searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  }
  return <p className="text-light-4 mt-10 text-center w-full">No results found</p>;
};

const Explore = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedSearch);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const countryInfoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue]);

  useEffect(() => {
    if (selectedCountry && countryInfoRef.current && containerRef.current) {
      const container = containerRef.current;
      const infoElement = countryInfoRef.current;
      const scrollPosition = infoElement.offsetTop - container.offsetTop - 20;
      
      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedCountry]);

  if (!posts) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts = !shouldShowSearchResults && posts.pages.every((item) => item.documents.length === 0);

  const countryData: Record<
    string,
    { name: string; capital: string; population: string; language: string; currency: string; famousFor: string }
  > = {
    Germany: {
      name: "Germany",
      capital: "Berlin",
      population: "83 million",
      language: "German",
      currency: "Euro (€)",
      famousFor: "Beer, Autobahn, and Castles",
    },
    Bulgaria: {
      name: "Bulgaria",
      capital: "Sofia",
      population: "7 million",
      language: "Bulgarian",
      currency: "Bulgarian Lev (лв)",
      famousFor: "Rose oil, Yogurt, and Ancient History",
    },
    UK: {
      name: "United Kingdom",
      capital: "London",
      population: "67 million",
      language: "English",
      currency: "British Pound (£)",
      famousFor: "Royal Family, Tea, and Football",
    },
  };

  return (
    <div 
      ref={containerRef}
      className="explore-container" 
      style={{ overflowY: "auto", minHeight: selectedCountry ? "130vh" : "100vh" }}
    >
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img src="/assets/icons/search.svg" width={24} height={24} alt="search" />
          <Input
            type="text"
            placeholder="Search"
            className="explore-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Popular Today</h3>
        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img src="/assets/icons/filter.svg" width={20} height={20} alt="filter" />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults isSearchFetching={isSearchFetching} searchedPosts={searchedPosts} />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          posts.pages.map((item, index) => <GridPostList key={`page-${index}`} posts={item.documents} />)
        )}
      </div>

      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}

      <div style={{ marginTop: "40px", height: "700px", width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <h3 className="h3-bold md:h2-bold w-full">Map of the World</h3>
        </div>
        <MapContainer center={[54.526, 15.2551]} zoom={5} style={{ height: "500px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

          <Marker position={[51.1657, 10.4515]}>
            <Popup>
              <strong>Germany</strong>
              <br />
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCountry("Germany");
                }} 
                style={{ color: "blue", textDecoration: "underline" }}
              >
                Click Here for More Information
              </a>
            </Popup>
          </Marker>

          <Marker position={[42.7339, 25.4858]}>
            <Popup>
              <strong>Bulgaria</strong>
              <br />
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCountry("Bulgaria");
                }} 
                style={{ color: "blue", textDecoration: "underline" }}
              >
                Click Here for More Information
              </a>
            </Popup>
          </Marker>

          <Marker position={[55.3781, -3.4360]}>
            <Popup>
              <strong>United Kingdom</strong>
              <br />
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCountry("UK");
                }} 
                style={{ color: "blue", textDecoration: "underline" }}
              >
                Click Here for More Information
              </a>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {selectedCountry && countryData[selectedCountry] && (
        <div 
          ref={countryInfoRef}
          className="country-info" 
          style={{ marginTop: "20px", padding: "20px", backgroundColor: "#1e1e1e", color: "#fff", borderRadius: "10px" }}
        >
          <h2>{countryData[selectedCountry].name}</h2>
          <p><strong>Capital:</strong> {countryData[selectedCountry].capital}</p>
          <p><strong>Population:</strong> {countryData[selectedCountry].population}</p>
          <p><strong>Language:</strong> {countryData[selectedCountry].language}</p>
          <p><strong>Currency:</strong> {countryData[selectedCountry].currency}</p>
          <p><strong>Famous for:</strong> {countryData[selectedCountry].famousFor}</p>
        </div>
      )}
    </div>
  );
};

export default Explore;