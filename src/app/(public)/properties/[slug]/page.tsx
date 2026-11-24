import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Bed, Bath, Maximize, ShieldCheck, Check, Building } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Property, AgentProfile } from '@/types';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { PropertyDetailMap } from '@/components/map/PropertyDetailMap';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPropertyData(slug: string): Promise<{ property: Property; agentProfile?: AgentProfile; related: Property[] } | null> {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/v1/properties/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPropertyData(slug);
  if (!data?.property) {
    return { title: 'Property Not Found' };
  }

  const { property } = data;
  return {
    title: `${property.title} | RV Group Ltd`,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: property.images?.[0]?.url ? [{ url: property.images[0].url }] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPropertyData(slug);

  if (!data?.property) {
    notFound();
  }

  const { property, agentProfile } = data;
  const agent = typeof property.agentId === 'object' && property.agentId !== null 
    ? (property.agentId as { name?: string; email?: string; phone?: string }) 
    : null;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title & Top Badges */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
              For {property.listingType}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {property.category} &bull; {property.propertyType}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {property.title}
          </h1>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            <span>
              {property.location.address}, {property.location.locality}, {property.location.city} - {property.location.pincode}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {formatPrice(property.price)}
          </div>
          {property.priceNegotiable && (
            <span className="text-xs font-medium text-emerald-600">Price Negotiable</span>
          )}
          {property.maintenance ? (
            <p className="text-xs text-slate-400">+ ₹{property.maintenance}/mo maintenance</p>
          ) : null}
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative h-80 overflow-hidden rounded-3xl bg-slate-100 sm:col-span-2 dark:bg-slate-800">
          {property.images?.[0]?.url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex flex-col gap-4">
          {property.images?.slice(1, 3).map((img, i) => (
            <div key={i} className="h-[9.5rem] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={`${property.title} - ${i + 2}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Specs, Description, Amenities */}
        <div className="space-y-8">
          {/* Key Specs Card */}
          <div className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
            {Boolean(property.details?.bedrooms) && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Bed className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Bedrooms</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {String(property.details.bedrooms)} BHK
                  </div>
                </div>
              </div>
            )}

            {Boolean(property.details?.bathrooms) && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Bath className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Bathrooms</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {String(property.details.bathrooms)}
                  </div>
                </div>
              </div>
            )}

            {Boolean(property.details?.carpetArea) && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Maximize className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Carpet Area</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {String(property.details.carpetArea)} sq ft
                  </div>
                </div>
              </div>
            )}

            {Boolean(property.details?.furnishing) && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Furnishing</div>
                  <div className="text-sm font-bold capitalize text-slate-900 dark:text-white">
                    {String(property.details.furnishing)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Property Overview</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Society Amenities */}
          {property.amenities?.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Amenities & Features</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                  >
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Location Map & Landmark Distances */}
          <PropertyDetailMap
            lat={property.location?.geo?.coordinates?.[1] || 23.0298}
            lng={property.location?.geo?.coordinates?.[0] || 72.5293}
            title={property.title}
            price={property.price}
            address={property.location?.address || ''}
            city={property.location?.city || ''}
            locality={property.location?.locality || ''}
            boundary={property.location?.boundary}
          />
        </div>

        {/* Right Sticky Column: Agent Card & Contact Form */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-950">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {agent?.name || 'Verified Agent'}
                </h3>
                <p className="text-xs text-slate-500">
                  {agentProfile?.agencyName || 'RV Group Ltd Network'}
                </p>
              </div>
            </div>

            {agentProfile?.licenseNo && (
              <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>RERA Verified: {agentProfile.licenseNo}</span>
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
              <InquiryForm propertyId={property._id} propertyTitle={property.title} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
