import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Session } from 'types';

import { useUser, useSupabaseClient, SupabaseClient } from '@supabase/auth-helpers-react';

async function loadSessions(setSessions: Function, supabaseClient: SupabaseClient, { website_id }: { website_id: string }) {
  const variable: number = parseInt(website_id)

  const { data: sessions } = await supabaseClient
    .from('sessions')
    .select('*')
    .eq('website_id', variable);

  setSessions(sessions)
}

function handleDeleteSession(supabaseClient: SupabaseClient, sessionId: string, loadData: Function) {
  supabaseClient.from('websites').delete().match({ id: sessionId })
    .then((res) => {
      if (res.error) {
        console.log(res);
      }
      loadData();
    })
}

function handleOpenSession(supabaseClient: SupabaseClient, sessionId: string, loadData: Function) {
  supabaseClient.from('sessions').update({ status: 'open' }).eq('id', sessionId)
    .then((res) => {
      if (res.error) {
        console.log(res);
      }
      loadData();
    })
}

function handleRequestSession(supabaseClient: SupabaseClient, sessionId: string, loadData: Function) {
  supabaseClient.from('sessions').update({ status: 'requested' }).eq('id', sessionId)
    .then((res) => {
      if (res.error) {
        console.log(res);
      }
      loadData();
    })
}



export default function Page() {
  const router = useRouter()
  const supabaseClient = useSupabaseClient()
  const userDetails = useUser()

  const [sessions, setSessions] = useState<Session[] | null>(null)

  const website_id = router.query?.website_id

  const loadData = () => {
    loadSessions(setSessions, supabaseClient, { website_id: router.query.website_id as string })
  }

  useEffect(() => {
    if (userDetails && website_id) {
      loadData()
      // loadSessions(setSessions, supabaseClient, { website_id: router.query.website_id as string })

    }

  }, [userDetails, website_id])

  if (sessions) {
    const sessionsRows = sessions.map((session) => (
      <tr key={"session" + session.id}>
        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
          {session.client_name}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{session.key}</td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{session.status}</td>
        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
          <a href="#" className="text-indigo-400 hover:text-indigo-300"
            onClick={() => { handleOpenSession(supabaseClient, session.id, loadData) }}
          >
            Open<span className="sr-only">, {session.key}</span>
          </a>
          <br />
          <a href="#" className="text-indigo-400 hover:text-indigo-300"
            onClick={() => { handleRequestSession(supabaseClient, session.id, loadData) }}
          >
            Request<span className="sr-only">, {session.key}</span>
          </a>
          <br />
          <a href="#" onClick={() => { handleDeleteSession(supabaseClient, session.id, loadData) }} className="text-indigo-400 hover:text-indigo-300">
            Delete<span className="sr-only">, {session.key}</span>
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
                              Client name
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                              key
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                              status
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                              <span className="sr-only">Edit</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {sessionsRows}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )


  }
  else {

    return (<div>loading...</div>)
  }


}
