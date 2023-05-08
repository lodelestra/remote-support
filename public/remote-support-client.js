import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";


function broadcastDomContent(channel, content) {
  channel.send({
    type: 'broadcast',
    event: 'dom-content',
    payload: {content}
  })
}

function getDomContent() {
  const dc = document.documentElement.outerHTML
  const stringifydc = JSON.stringify(dc)
  return stringifydc
}

function processDomContent(channel) {
  broadcastDomContent(channel, getDomContent())
}

function addUniqueIds() {
  // Select all elements without an ID
  const elements = document.querySelectorAll('*:not([id])');
  
  // Generate a unique ID for each element and add it
  elements.forEach(element => {
    const id = Math.random().toString(36).substring(2, 14);
    element.id = id;
  });
}

window.addEventListener('load', addUniqueIds);

document.onreadystatechange = function(event) {
    if (document.readyState === "complete") {

        const dc = document.documentElement.outerHTML
        const stringifydc = JSON.stringify(dc)
        console.log('dc', stringifydc)

        const supabase = createClient(
          "https://wxkxjqxtlxxloidgfxal.supabase.co",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4a3hqcXh0bHh4bG9pZGdmeGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI1MDA5NzcsImV4cCI6MTk5ODA3Njk3N30.QsZD_wKNbWbOVY6xAYXaCcL7_VhMxhM25phoUrGgsXE",
          {
            realtime: {
              params: {
                eventsPerSecond: 100,
              }
            }
          }
        )
        const channels = supabase.getChannels()
        console.log('channel', channels)

        // const broadcastChannel = supabase.channel('broadcast-any')
        const channel = supabase.channel('presence-any', {
          config: {
            // use unique key for each user
            // presence: {
            //   key: 'Unknown_user'
            // },
          },
        })

        channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState()
          console.log('presence state:', state)
        })
        // .subscribe()


        channel
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('presence joint:',key, newPresences)
        })
        // .subscribe() 

        channel
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('presence leave', key, leftPresences)
        })

        channel
        .on('broadcast', { event: 'cursor-pos' }, payload => {
          console.log('Cursor position received!', payload)
        })

        channel
        .on('broadcast', { event: 'cursor-click-id' }, ({payload: {clickedId: clickedId}}) => {
          let selector = clickedId
          if (clickedId.startsWith('#')) {
            selector =  `[id='${clickedId.slice(1)}']`
          }
          const element = document.querySelector(selector)
          // simulate click
          element.style.border = "2px solid red";
          element.click()
        })

        // .subscribe((status) => {
        //   if (status === 'SUBSCRIBED') {
        //     broadcastChannel.send({
        //       type: 'broadcast',
        //       event: 'cursor-pos',
        //       payload: { x: Math.random(), y: Math.random() },
        //     })
        //   }
        // })

        channel
        .subscribe(async (status, err) => {
          if (status === 'SUBSCRIBED') {
            // const presenceTrackStatus = await channel.track({
            //   user: `user-1 ${Math.random()}`,
            //   online_at: new Date().toISOString(),
            // })
            const presenceTrackStatus = await channel.track({
              user_name: "pierre-client"
              // online_at: new Date().toISOString(),
            })
            console.log('presencetrackstatus', presenceTrackStatus)

            // channel.send({
            //   type: 'broadcast',
            //   event: 'cursor-pos',
            //   payload: { x: Math.random(), y: Math.random() },
            // })

            // channel.send({
            //   type: 'broadcast',
            //   event: 'dom-content',
            //   payload: {content: 'test'}
            // })

            // processDomContent(channel)
            // setTimeout(() => {processDomContent(channel)}, 2000)
            setInterval(() => {processDomContent(channel)}, 4000)
          }
          if (status === 'CHANNEL_ERROR') {
            console.log(`There was an error subscribing to channel: ${err}`)
          }
        
          if (status === 'TIMED_OUT') {
            console.log('Realtime server did not respond in time.')
          }
        
          if (status === 'CLOSED') {
            console.log('Realtime channel was unexpectedly closed.')
          }
          console.log('err', err)
        })


        // console.log('res', res)
        // supabase.removeAllChannels()
    }
};