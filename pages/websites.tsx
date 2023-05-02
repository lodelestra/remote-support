import { useState, useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
// import {
//   // createServerSupabaseClient,
//   // createBrowserSupabaseClient
// } from '@supabase/auth-helpers-nextjs';
// import { UserContext, useUser } from '@/utils/useUser';
// import Link from 'next/link';
import { Website } from 'types';
import {
  createServerSupabaseClient,
  User
} from '@supabase/auth-helpers-nextjs';

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
// import { GetServerSidePropsContext } from 'next';


// interface Props {
//   websites: Website[];
// }

function Loader({isLoading}: {isLoading: boolean|undefined}) {
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return <div>User is loaded</div>;
}


export default function Page({userWebsites}: {userWebsites: Array<Website>}) {
  const supabaseClient = useSupabaseClient()
  // const { userDetails } = useUser()
  const  userDetails  = useUser()
  const [ websites, setWebsites] = useState< Website[] | null >(null)

  // const user = useContext(UserContext)

  useEffect(() => {
    async function loadData(){
      const { data: websites } = await supabaseClient.from('websites').select('*');
      setWebsites(websites as Website[]);
    }


    if(userDetails){
      loadData()
    }
  }, [userDetails])

  if(websites) {
  return (
    <>
      <h3>
        list sites
      </h3>
      {websites.map((s) => (<li key={s.id}> {s.url} </li>))}
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

// export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
//   const supabase = createServerSupabaseClient(ctx);
  
//   const {
//     data: { session }
//   } = await supabase.auth.getSession();
//   console.log(session?.user)

//   const websites = await getUserWebsitesSupa(session?.user?.id, supabase);

//   if (!session)
//     return {
//       redirect: {
//         destination: '/signin',
//         permanent: false
//       }
//     };

//   return {
//     props: {
//       initialSession: session,
//       user: session.user,
//       userWebsites: websites
//     }
//   };
// };

