import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize, ShieldCheck, Check, Building, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Property, AgentProfile } from '@/types';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { PropertyDetailMap } from '@/components/map/PropertyDetailMap';

interface PageProps {
  params: Promise<{ token: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

async function getPrivatePropertyData(
  token: string
): Promise<{ property: Property; agentProfile?: AgentProfile; related: Property[]; isPrivateView?: boolean } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/properties/private/${token}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await getPrivatePropertyData(token);

  if (!data?.property) {
    return {
      title: 'Private Listing Expired or Not Found | RV Group Ltd',
      robots: { index: false, follow: false },
    };
  }

  const { property } = data;
  return {
    title: `[Private] ${property.title} | RV Group Ltd`,
    description: property.description.slice(0, 160),
    robots: { index: false, follow: false },
    openGraph: {
      title: `[Private Listing] ${property.title}`,
      description: property.description.slice(0, 160),
      images: property.images?.[0]?.url ? [{ url: property.images[0].url }] : [],
    },
  };
}

export default async function PrivatePropertyDetailPage({ params }: PageProps) {
  const { token } = await params;
  const data = await getPrivatePropertyData(token);

  if (!data?.property) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-950/50 dark:text-amber-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Private Listing Expired or Revoked
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          The private access link for this exclusive property is no longer active, has expired, or was revoked by the listing advisor.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore Public Properties
          </Link>
        </div>
      </div>
    );
  }

  const { property, agentProfile } = data;
  const agent =
    typeof property.agentId === 'object' && property.agentId !== null
      ? (property.agentId as { name?: string; email?: string; phone?: string; avatar?: string })
      : null;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Exclusive Private Listing Badge Banner */}
      <div className="mb-6 flex items-center gap-3.5 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 p-4.5 text-indigo-950 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/40 dark:to-purple-950/40 dark:text-indigo-200">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
          <Lock className="h-5 w-5" />
        </div>
        <div className="text-sm">
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <span>VIP Private & Off-Market Portfolio</span>
            <span className="rounded-full bg-indigo-600/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-300">
              Confidential
            </span>
          </div>
          <div className="mt-0.5 text-xs text-indigo-800/80 dark:text-indigo-300/80">
            You are viewing this off-market luxury listing via a privileged secure access link provided by {agent?.name || 'the listing agent'}.
          </div>
        </div>
      </div>

      {/* Title & Top Badges */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
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
            <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>
              {property.location.address}, {property.location.locality}, {property.location.city} - {property.location.pincode}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {formatPrice(property.price)}
            {property.listingType === 'rent' && <span className="text-sm font-normal text-slate-400"> / month</span>}
          </div>
          {property.priceNegotiable && (
            <div className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Price Negotiable
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
        {property.images && property.images.length > 0 ? (
          <>
            <div className="relative h-80 overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 md:h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={property.images[0].url}
                alt={property.title}
                className="h-full w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
            {property.images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative h-44 overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`${property.title} - ${idx + 2}`}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
              </div>
            ))}
          </>
        ) : (
          <div className="col-span-4 flex h-64 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Building className="h-12 w-12 text-slate-400" />
          </div>
        )}
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="space-y-8 lg:col-span-2">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col items-center justify-center text-center">
              <Bed className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {String(property.details?.bedrooms || property.features?.bedrooms || 'N/A')} Beds
              </span>
              <span className="text-xs text-slate-400">Bedrooms</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <Bath className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {String(property.details?.bathrooms || property.features?.bathrooms || 'N/A')} Baths
              </span>
              <span className="text-xs text-slate-400">Bathrooms</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <Maximize className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {String(property.details?.carpetArea || property.features?.carpetArea || property.details?.superBuiltUpArea || 'N/A')} sq.ft
              </span>
              <span className="text-xs text-slate-400">Carpet Area</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">About This Exclusive Property</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Amenities & Features</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Map with Land Boundary */}
          {property.location?.geo?.coordinates && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Exact Location & Cadastral Plot</h3>
              <p className="mt-1 text-xs text-slate-500">
                Satellite boundary preview and geographic pin.
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <PropertyDetailMap
                  lat={property.location.geo.coordinates[1]}
                  lng={property.location.geo.coordinates[0]}
                  title={property.title}
                  price={property.price}
                  address={property.location.address || ''}
                  city={property.location.city || ''}
                  locality={property.location.locality || ''}
                  boundary={property.location.boundary}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Inquiry & Listing Advisor */}
        <div className="space-y-6">
          {/* Agent Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Private Listing Advisor</h4>
            <div className="mt-4 flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                {agent?.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={agent.avatar} alt={agent?.name || 'Advisor'} className="h-full w-full rounded-full object-cover" />
                ) : (
                  agent?.name?.charAt(0) || 'A'
                )}
              </div>
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">{agent?.name || 'Verified Partner Advisor'}</h5>
                <p className="text-xs text-slate-500">{agentProfile?.agencyName || 'Voryxa Elite Advisors'}</p>
              </div>
            </div>

            {agentProfile?.licenseNo && (
              <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>RERA No: {agentProfile.licenseNo}</span>
              </div>
            )}
          </div>

          {/* Lead Inquiry Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <InquiryForm propertyId={property._id} propertyTitle={property.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
