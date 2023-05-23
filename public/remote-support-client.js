import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

function getUniqueSelector(element) {
  // if the element has an ID, return it as the selector
  if (element.id) {
    return `#${element.id}`;
  }

  // Recursive case: build the selector by climbing up the DOM tree
  const path = [];
  let node = element;
  while (node.parentNode) {
    let tag = node.tagName.toLowerCase();
    // let siblings = Array.from(node.parentNode.children).filter(child => child.tagName === tag);
    let siblings = Array.from(node.parentNode.children);

    let index = siblings.indexOf(node);

    path.unshift(`${tag}:nth-child(${index + 1})`);
    node = node.parentNode;
  }

  return path.join(' > ');
}

// function from @whichdam is more robuste than getUniqueSelector
// https://stackoverflow.com/questions/5728558/get-the-dom-path-of-the-clicked-a/66143123#66143123
function getDomPath(el) {
  const stack = []

  while (el.parentNode !== null) {
    let sibCount = 0
    let sibIndex = 0
    for (let i = 0; i < el.parentNode.childNodes.length; i += 1) {
      const sib = el.parentNode.childNodes[i]
      if (sib.nodeName === el.nodeName) {
        if (sib === el) {
          sibIndex = sibCount
          break
        }
        sibCount += 1
      }
    }

    const nodeName = CSS.escape(el.nodeName.toLowerCase())

    // Ignore `html` as a parent node
    if (nodeName === 'html') break

    if (el.hasAttribute('id') && el.id !== '') {
      stack.unshift(`#${CSS.escape(el.id)}`)
      // Remove this `break` if you want the entire path
      break
    } else if (sibIndex > 0) {
      // :nth-of-type is 1-indexed
      stack.unshift(`${nodeName}:nth-of-type(${sibIndex + 1})`)
    } else {
      stack.unshift(nodeName)
    }

    el = el.parentNode
  }

  return stack
}



function broadcastDomContent(channel, content) {
  channel.send({
    type: 'broadcast',
    event: 'dom-content',
    payload: { content }
  })
}

function broadcastDomTarget(channel, content, nodePath) {
  channel.send({
    type: 'broadcast',
    event: 'dom-target',
    payload: { content, nodePath }
  })
}


function getDomContent() {
  const dc = document.documentElement.outerHTML
  const stringifydc = JSON.stringify(dc)
  return stringifydc
}

function getTargetContent(query) {
  node = document.querySelector(query)
  return JSON.stringify(node)
}

function processDomContent(channel) {
  broadcastDomContent(channel, getDomContent())
}

function processDomTarget({ channel, target, nodePath }) {
  var s = new XMLSerializer();
  // var d = document;
  var str = s.serializeToString(target);

  broadcastDomTarget(channel, str, nodePath)

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

// window.addEventListener('load', addUniqueIds);

document.onreadystatechange = function(event) {
  if (document.readyState === "complete") {

    const dc = document.documentElement.outerHTML
    const stringifydc = JSON.stringify(dc)
    // console.log('dc', stringifydc)

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
        console.log('presence joint:', key, newPresences)
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
      .on('broadcast', { event: 'cursor-click-id' }, ({ payload: { clickedId: clickedId } }) => {
        let selector = clickedId
        if (clickedId.startsWith('#')) {
          selector = `[id='${clickedId.slice(1)}']`
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
          processDomContent(channel)
          // const bodyTarget = document.getElementById("body");

          // Options for the observer (which mutations to observe)
          const config = { attributes: true, childList: true, subtree: true };

          // Callback function to execute when mutations are observed
          const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
              console.log(mutation)
              console.log(mutation.target)

              // removed in profite of more robust getDomPath
              // const path = getUniqueSelector(mutation.target)
              // console.log("path json:", JSON.stringify(path))
              // console.log("path:", path)
              // for debug test if selector work
              // const pathres = document.querySelector(path)
              // console.log(pathres)

              const nodePath = getDomPath(mutation.target).join(" ")
              // console.log("dom path", nodePath)
              // for debug test if selector work
              // const res = document.querySelector(nodePath)
              // console.log(res)

              // processDomContent(channel)
              processDomTarget({ channel, target: mutation.target, nodePath })
              if (mutation.type === "childList") {
                console.log("A child node has been added or removed.");
              } else if (mutation.type === "attributes") {
                console.log(`The ${mutation.attributeName} attribute was modified.`);
              }
            }
          };

          // Create an observer instance linked to the callback function
          const observer = new MutationObserver(callback);

          // Start observing the target node for configured mutations
          observer.observe(document.body, config);


          // setInterval(() => { processDomContent(channel) }, 4000)
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
