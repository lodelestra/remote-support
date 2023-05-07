import { NextApiHandler } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

import { createUserWebsite } from '@/utils/supabase-admin';

const CreateUserWebsite: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    const { url } = JSON.parse(req.body);

    try {
      const supabase = createServerSupabaseClient({ req, res });
      const {
        data: { user }
      } = await supabase.auth.getUser();

      const website = await createUserWebsite({
        url: url,
        uuid: user?.id || ''
        // email: user?.email || ''
      });


      return res.status(200).json({ website: website });
    } catch (err: any) {
      console.log(err);
      res
        .status(500)
        .json({ error: { statusCode: 500, message: err.message } });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default CreateUserWebsite;
