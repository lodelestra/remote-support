import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

function getUniqueSelector(element) {
  // if the element has an ID return it as the selector
  if (element.id) {
    return `#${element.id}`;
  }

  const path = [];
  let node = element;
  while (node.parentNode) {
    let tag = node.tagName.toLowerCase();
    let siblings = Array.from(node.parentNode.children).filter(child => child.tagName === tag);
    let index = siblings.indexOf(node) + 1;
    path.unshift(`${tag}:nth-child(${index})`);
    node = node.parentNode;
  }

  // Return the selector as a string
  return path.join(' ');
}

document.onreadystatechange = function(event) {
  if (document.readyState === "complete") {
    document.getElementById("remote-support-container").innerHTML = '<p>Remote Support from client.js. Loading...</p>'
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
        // presence: {
        //   key: 'support-admin'
        // },
      },
    })

    // broadcastChannel
    // .on('broadcast', { event: 'cursor-pos' }, payload => {
    //   console.log('Cursor position received!', payload)
    // })
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
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('presence state:', state)
      })

    channel
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('presence joint:', key, newPresences)
      })

    channel
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('presence leave', key, leftPresences)
      })

    channel
      .on('broadcast', { event: 'cursor-pos' }, payload => {
        console.log('Cursor position received!', payload)
      })

    channel
      .on('broadcast', { event: 'dom-content' }, payload => {
        console.log('dom content received!', payload.payload.content)
        const innerHTML = JSON.parse(payload.payload.content)
        document.getElementById("remote-support-container").innerHTML = innerHTML
      })

    channel
      .on('broadcast', { event: 'dom-target' }, payload => {
        console.log('dom target received')
        // console.log('dom target received!', payload.payload.content)
        console.log('payload:', payload)
        // const { content, nodeId, nodePath } = payload.payload
        var { content, nodeId, nodePath } = payload.payload
        console.log('nodePath: ', nodePath)
        console.log('nodeId:', nodeId)
        // console.debug(content)

        // var toReplace = document.getElementById(nodeId)
        // Replace the root of the page Dom
        nodePath = nodePath.replace("#body", "#remote-support-container")
        // const containerRoot = document.getElementById("#remote-support-container")
        var toReplace = document.querySelector(nodePath)

        const parser = new DOMParser();
        const doc = parser.parseFromString(payload.payload.content, "application/xml");
        console.log(doc.firstChild)
        toReplace.replaceWith(doc.firstChild)
        console.log(toReplace)

        // const node = JSON.parse(payload.payload.content)
        // console.log(node.k)
        // 
        // document.getElementById(node_id) = node
      })


    document.addEventListener('click', function(event) {
      event.preventDefault();
      const selector = getUniqueSelector(event.target);
      console.log(selector);
      channel.send({ type: 'broadcast', event: 'cursor-click-id', payload: { clickedId: selector } })

    });


    channel
      .subscribe(async (status, err) => {
        if (status === 'SUBSCRIBED') {
          const presenceTrackStatus = await channel.track({
            user_name: "jean-support"
            // online_at: new Date().toISOString(),
          })
          console.log('presencetrackstatus', presenceTrackStatus)

          channel.send({
            type: 'broadcast',
            event: 'cursor-pos',
            payload: { x: Math.random(), y: Math.random() },
          })
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
