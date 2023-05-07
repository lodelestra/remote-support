import { useState, useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import FormAddWebsite from '@/components/FormAddWebsite';
import { Website } from 'types';
import {
  createServerSupabaseClient,
} from '@supabase/auth-helpers-nextjs';

import { useUser, useSupabaseClient, SupabaseClient } from '@supabase/auth-helpers-react';

function WebsiteItem({ id, url, public_key, onWebsiteDelete }: {
  id: string,
  url: string,
  public_key: string,
  onWebsiteDelete: Function
}
) {
  return <li key={id}>{url} {public_key} <button className='btn btn-red' onClick={e => onWebsiteDelete()}>delete</button></li>;
}

function Loader({ isLoading }: { isLoading: boolean | undefined }) {
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <div>User is loaded</div>;
}

function handleDeleteWebsite(supabaseClient: SupabaseClient, websiteId: string, loadData: Function) {
  supabaseClient.from('websites').delete().match({ id: websiteId })
    .then((res) => loadData())
}

async function loadData(setWebsites: Function, supabaseClient: SupabaseClient) {
  const { data: websites } = await supabaseClient.from('websites').select('*');
  setWebsites(websites as Website[]);
}

export default function Page({ userWebsites }: { userWebsites: Array<Website> }) {
  const supabaseClient = useSupabaseClient()
  // const { userDetails } = useUser()
  const userDetails = useUser()
  const [websites, setWebsites] = useState<Website[] | null>(null)

  const loadDataClosure = () => { loadData(setWebsites, supabaseClient) }

  // const user = useContext(UserContext)

  useEffect(() => {
    if (userDetails) {
      loadData(setWebsites, supabaseClient)
    }
  }, [userDetails])


  if (websites) {
    const userWebsites = websites.map(ws => {
      return <WebsiteItem key={ws.id} onWebsiteDelete={() => { handleDeleteWebsite(supabaseClient, ws.id, loadDataClosure) }} {...ws} />
    })

    return (
      <>
        <h3>
          list sites
        </h3>
        <ul className="gap-">
          {userWebsites}
        </ul>
        <FormAddWebsite callback={loadDataClosure} />
      </>
    );
  }
  else {
    return (
      <>
        <h3>
          list sites
        </h3>
        <Loader isLoading={true} />
      </>
    );
  }
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: '/signin',
        permanent: false
      }
    };

  return {
    props: {
      initialSession: session,
      user: session.user
    }
  };
};