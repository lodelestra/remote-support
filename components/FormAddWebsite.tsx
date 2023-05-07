import { useUser } from '@supabase/auth-helpers-react';

export default function FormAddWebsite({callback: callback}: {callback: Function}) {
  const  userDetails  = useUser()

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

    await fetch('/api/create-user-website', {method: "POST", body: JSON.stringify(data)})
    callback()
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="url">Url</label>
      <input type="text" className="bg-gray-800" id="url" name="url" required />

      <button type="submit">Submit</button>
    </form>
  )
}