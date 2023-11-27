import React, { useEffect, useState } from "react";
import { Window, View, Text, CheckBox, useEventHandler } from "@nodegui/react-nodegui"
// import { Direction } from "@nodegui/nodegui";

import { createWebSocketConnection, authenticate, createHttp1Request } from "league-connect";
import { QCheckBoxSignals } from "@nodegui/nodegui";

function App() {

    // const [id, setId] = useState<string>("");
    const [isAutoAccept, setIsAutoAccept] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            const ws = await createWebSocketConnection({
                authenticationOptions: {
                    awaitConnection: true
                },
                pollInterval: 2000,
                maxRetries: 10
            })

            // ws.subscribe('/lol-chat/v1/conversations/active', (data, event) => {
            //     // data: deseralized json object from the event payload
            //     // event: the entire event (see EventResponse<T>)

            //     // console.log(data)

            //     // if (data && data.id) {
            //     //     setId(data.id)
            //     // }
            // })

            ws.subscribe('/lol-matchmaking/v1/ready-check', async (data, event) => {
                // data: deseralized json object from the event payload
                // event: the entire event (see EventResponse<T>)
                // console.log('/lol-matchmaking/v1/ready-check')

                if (data && data.playerResponse && data.playerResponse === "Declined") {
                    return
                }

                const credentials = await authenticate()

                if (isAutoAccept) {
                    await createHttp1Request({
                        method: 'POST',
                        url: '/lol-matchmaking/v1/ready-check/accept'
                        // url: '/lol-matchmaking/v1/ready-check/accept'
                    }, credentials);
                }

                // await createHttp1Request({
                //     method: 'POST',
                //     url: '/lol-matchmaking/v1/ready-check/decline'
                // }, credentials);

            })
        })()
    }, [])

    const checkHandler = useEventHandler<QCheckBoxSignals>(
        {
            clicked: (checked: boolean) => {
                setIsAutoAccept(checked)
            }
        },
        []
    );

    return (
        <Window windowTitle="LOL accepter">
            <View>
                <CheckBox
                    style={cbStyle}
                    text={"Auto accept"}
                    on={checkHandler}
                    checked={isAutoAccept}
                />

                <Text id="label" style={labelStyle}>
                    System is {isAutoAccept ? "enable" : "disable"} now
                </Text>
            </View>
        </Window>
    )
};

const cbStyle = `
    margin-top:4px;
    margin-left:50%;
    margin-right:50%;
    font-size:38px;
`;

const labelStyle = `
    margin-top:8px;
    margin-left:50%;
    margin-right:50%;
    font-size: 24px;
    color: "#6e6e6e";
`;

export default App