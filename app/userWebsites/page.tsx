'use client'
import { ReactNode } from 'react';
import { getUserWebsites } from '@/utils/supabase-client';
// import Link from 'next/link';
import { Website } from 'types';

// interface Props {
//   websites: Website[];
// }

export default async function Page() {
  const userWebsites = await getUserWebsites()

  return (
    <div>
      <h3>
        list sites
      </h3>
      {userWebsites.map((s) => (<li> {s.url} </li>))}
    </div>
  );
}

function WebsiteItem(website: Website) {
  return <li>{website.url}</li>;
}