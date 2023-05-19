import { useRef } from 'react';
import { useUser } from '@supabase/auth-helpers-react';

export default function FormAddWebsite({ callback: callback }: { callback: Function }) {
  const userDetails = useUser()

  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      url: { value: string };
      publicKey: { value: string };
    }

    const url = target.url.value;

    const data = {
      url,
      user_id: userDetails?.id
    }

    await fetch('/api/create-user-website', { method: "POST", body: JSON.stringify(data) })
    if (ref.current !== null) {
      ref.current.value = ''
    }
    callback()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-row space-x-4">
      <label htmlFor="url" className="hidden">Url</label>
      <input ref={ref} type="text" className="bg-gray-800 grow" id="url" name="url" placeholder='URL' required />

      <button type="submit" className="btn btn-green">Add website</button>
    </form>
  )
}
