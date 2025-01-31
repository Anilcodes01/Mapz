import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const industry = searchParams.get("industry")?.toLowerCase();

  if (!lat || !lng || !industry) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const industryMappings: { [key: string]: string[] } = {
    tech: [
      "computer",
      "technology",
      "software",
      "it_services",
      "electronics",
      "electronics_repair",
      "telecommunication",
      "office",
    ],
    restaurant: ["restaurant", "food", "cafe", "fast_food"],
    cafe: ["cafe", "coffee_shop", "coffee"],
    shop: ["shop", "store", "retail"],
  };

  const searchTerms = industryMappings[industry] || [industry];

  try {
    const searchConditions = searchTerms
      .map(
        (term) => `
        node["name"](around:5000, ${lat}, ${lng})[~"."~".", i][~"name|brand|operator"~"${term}", i];
        node(around:5000, ${lat}, ${lng})[~"office|company|shop|amenity"~"${term}", i];
        way["name"](around:5000, ${lat}, ${lng})[~"office|company|shop|amenity"~"${term}", i];
        relation["name"](around:5000, ${lat}, ${lng})[~"office|company|shop|amenity"~"${term}", i];
      `
      )
      .join("");

    const overpassQuery = `
      [out:json][timeout:25];
      (
        ${searchConditions}
        // Additional general business searches
        node["office"="it"](around:5000, ${lat}, ${lng});
        node["office"="company"](around:5000, ${lat}, ${lng});
        node["amenity"="office"](around:5000, ${lat}, ${lng});
      );
      out body;
      >;
      out skel qt;
    `;

    const { data } = await axios.get(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        overpassQuery
      )}`
    );

    const companies = data.elements
      .filter((place: any) => {
        const hasValidCoords =
          place.lat &&
          place.lon &&
          !isNaN(place.lat) &&
          !isNaN(place.lon) &&
          place.lat >= -90 &&
          place.lat <= 90 &&
          place.lon >= -180 &&
          place.lon <= 180;

        return place.tags && place.tags.name && hasValidCoords;
      })
      .map((place: any) => {
        const addressParts = [];
        const tags = place.tags;

        if (tags["addr:housenumber"])
          addressParts.push(tags["addr:housenumber"]);
        if (tags["addr:street"]) addressParts.push(tags["addr:street"]);
        if (tags["addr:suburb"]) addressParts.push(tags["addr:suburb"]);
        if (tags["addr:city"]) addressParts.push(tags["addr:city"]);
        if (tags["addr:postcode"]) addressParts.push(tags["addr:postcode"]);

        const businessType =
          tags.office || tags.shop || tags.amenity || tags.company || industry;
        const website = tags.website || tags["contact:website"] || "";

        return {
          name: tags.name,
          lat: Number(place.lat),
          lng: Number(place.lon),
          address:
            addressParts.length > 0
              ? addressParts.join(", ")
              : tags["addr:full"] || "No address available",
          type: businessType,
          website: website,
          phone: tags.phone || tags["contact:phone"] || "",
          opening_hours: tags.opening_hours || "",
        };
      });

    interface Company {
      name: string;
      lat: number;
      lng: number;
      address: string;
      type: string;
      website: string;
      phone: string;
      opening_hours: string;
    }

    const uniqueCompanies: Company[] = Array.from(
      new Map<string, Company>(
        companies.map((company: Company) => [
          `${company.name}-${company.lat}-${company.lng}`,
          company,
        ])
      ).values()
    );

    return NextResponse.json(uniqueCompanies);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
