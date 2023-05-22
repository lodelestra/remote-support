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
  const { data: websites } = await supabaseClient.from('websites').select('*, sessions(*)');
  setWebsites(websites as Website[]);
}

export default function Page({ userWebsites }: { userWebsites: Array<Website> }) {
  const supabaseClient = useSupabaseClient()
  const userDetails = useUser()
  const [websites, setWebsites] = useState<Website[] | null>(null)

  const loadDataClosure = () => { loadData(setWebsites, supabaseClient) }


  useEffect(() => {
    if (userDetails) {
      loadData(setWebsites, supabaseClient)
    }
  }, [userDetails])


  if (websites) {
    const websitesRows =
      websites.map((website) => (
        <tr key={website.id}>
          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
            {website.url}
          </td>
          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{website.public_key}</td>
          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{website?.sessions?.length}</td>
          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
            <a href="#" className="text-indigo-400 hover:text-indigo-300">
              Edit<span className="sr-only">, {website.public_key}</span>
            </a>
            <br />
            <a href="#" onClick={() => { handleDeleteWebsite(supabaseClient, website.id, loadDataClosure) }} className="text-indigo-400 hover:text-indigo-300">
              Delete<span className="sr-only">, {website.public_key}</span>
            </a>
          </td>
        </tr>
      ))

    return (
      <>
        <div className="bg-zinc-900">
          <div className="mx-auto max-w-7xl">
            <div className="bg-zinc-900 py-10">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h1 className="text-base font-semibold leading-6 text-white">Websites</h1>
                    <p className="mt-2 text-sm text-gray-300">
                      A list of all the websites managed by your support account
                    </p>
                  </div>
                  <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">

                  </div>
                </div>
                <div className="mt-8 flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">

                      <table className="min-w-full divide-y divide-gray-700">

                        <thead>
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                              URL
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                              Public key
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                              Number of sessions
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                              <span className="sr-only">Edit</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {websitesRows}
                        </tbody>
                      </table>
                      <FormAddWebsite callback={loadDataClosure} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
