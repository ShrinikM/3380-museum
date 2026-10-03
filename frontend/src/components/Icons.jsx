const I = ({ d, size = 16, ...p })=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {Array.isArray(d) ? d.map((path, i)=> <path key={i} d={path} />) : <path d={d} />}
  </svg>
)

export const DashboardIcon = (p)=> <I {...p} d={['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', 'M9 22V12h6v10']} />
export const ArtistIcon = (p)=> <I {...p} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
export const ArtworkIcon = (p)=> <I {...p} d={['M2 6l3-3 16 16-3 3', 'M6 2l16 16-3 3L3 5', 'M3 9h1M9 3v1M20.5 3.5l-1 1M14.5 9.5l1 1']} />
export const CollectionIcon = (p)=> <I {...p} d={['M4 19.5A2.5 2.5 0 016.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z']} />
export const ExhibitionIcon = (p)=> <I {...p} d={['M3 3h18v18H3z', 'M3 9h18', 'M9 21V9']} />
export const TicketIcon = (p)=> <I {...p} d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z" />
export const MemberIcon = (p)=> <I {...p} d={['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 11a4 4 0 100-8 4 4 0 000 8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75']} />
export const GiftIcon = (p)=> <I {...p} d={['M20 12v10H4V12', 'M2 7h20v5H2z', 'M12 22V7', 'M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z', 'M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z']} />
export const CafeIcon = (p)=> <I {...p} d={['M18 8h1a4 4 0 010 8h-1', 'M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z', 'M6 1v3', 'M10 1v3', 'M14 1v3']} />
export const DonationIcon = (p)=> <I {...p} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
export const StaffIcon = MemberIcon
export const SearchIcon = (p)=> <I {...p} d={['M11 19a8 8 0 100-16 8 8 0 000 16z', 'M21 21l-4.35-4.35']} />
export const PlusIcon = (p)=> <I {...p} d={['M12 5v14', 'M5 12h14']} />
export const EditIcon = (p)=> <I {...p} d={['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z']} />
export const TrashIcon = (p)=> <I {...p} d={['M3 6h18', 'M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2']} />
export const ChevronRightIcon = (p)=> <I {...p} d="M9 18l6-6-6-6" />
export const FilterIcon = (p)=> <I {...p} d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
export const BellIcon = (p)=> <I {...p} d={['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0']} />