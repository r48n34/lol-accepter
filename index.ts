import { authenticate, createHttp1Request, createWebSocketConnection } from 'league-connect'

( async () => {
    const ws = await createWebSocketConnection({
      authenticationOptions: {
        awaitConnection: true
      },
      pollInterval: 2500,
      maxRetries: 10
    })
    
    ws.subscribe('/lol-chat/v1/conversations/active', (data, event) => {
      // data: deseralized json object from the event payload
      // event: the entire event (see EventResponse<T>)
    
      console.log(data)
    })

    ws.subscribe('/lol-matchmaking/v1/ready-check', async (data, event) => {
        // data: deseralized json object from the event payload
        // event: the entire event (see EventResponse<T>)
        // console.log('/lol-matchmaking/v1/ready-check')

        if(data && data.playerResponse && data.playerResponse === "Declined"){
            return
        }

        // console.log(data)
        // console.log(event)

        const credentials = await authenticate()
        await createHttp1Request({
            method: 'POST',
            url: '/lol-matchmaking/v1/ready-check/decline'
        }, credentials);

    })
})()

