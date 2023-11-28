import React, { useEffect, useState } from "react";
import { Window, View, Text, CheckBox, useEventHandler, Button } from "@nodegui/react-nodegui"
import { QCheckBoxSignals } from "@nodegui/nodegui";

import { createWebSocketConnection, authenticate, createHttp1Request, LeagueClient } from "league-connect";
import { userLabelStyle, cbStyle, labelStyle } from "./style/app.style";

const timer = (t: number = 1000) => { return new Promise( rec => setTimeout( () => rec(true), t))}

function App() {

    const [ userPresentName, setUserPresentName ] = useState<string>("");
    const [ isAutoAccept, setIsAutoAccept ] = useState<boolean>(true);

    async function getCurrentUserInfo(){

        try {
            setUserPresentName("@loading...@");
            await timer(5000)

            const credentials = await authenticate()
            const response = await createHttp1Request({
                method: 'GET',
                url: '/lol-summoner/v1/current-summoner'
            }, credentials)

            const result = response.json();

            const username = `${result.gameName} ${result.tagLine}`
            setUserPresentName(username)
        } 
        catch (error) {
            return
        }
        
    }

    async function main(){
        
        const ws = await createWebSocketConnection({
            authenticationOptions: {
                awaitConnection: true
            },
            pollInterval: 2000,
            maxRetries: 10
        })

        getCurrentUserInfo();

        ws.subscribe('/lol-matchmaking/v1/ready-check', async (data) => {

            if (data && data.playerResponse && data.playerResponse === "Declined") {
                return
            }

            const credentials = await authenticate()

            if (isAutoAccept) {
                await createHttp1Request({
                    method: 'POST',
                    url: '/lol-matchmaking/v1/ready-check/accept'
                    // url: '/lol-matchmaking/v1/ready-check/decline'
                }, credentials);
            }

        })

        ws.subscribe('/lol-login/v1/session', async (data) => {
            if(data && data.state && data.state === 'SUCCEEDED'){
                getCurrentUserInfo();
            }
            else if(data && data.state && data.state === 'LOGGING_OUT'){
                setUserPresentName("")
            }
        })

        return () => {
            ws.close()
        }

    }

    useEffect(() => {
        main()
    }, [])

    const checkHandler = useEventHandler<QCheckBoxSignals>(
        {
            clicked: (checked: boolean) => {
                setIsAutoAccept(checked)
            }
        },[]
    );

    const buttonHandler = useEventHandler<QCheckBoxSignals>(
        {
            clicked: () => {
                getCurrentUserInfo();
            }
        },[]
    );

    return (
        <Window windowTitle="LOL accepter">
            <View>
               
                <Text style={userLabelStyle}>
                    { 
                        userPresentName === "" 
                        ? "Offline" 
                        : userPresentName === "@loading...@" 
                        ? "Loading ..." 
                        : `Welcome ${userPresentName}`
                    }
                </Text>

                <CheckBox
                    style={cbStyle}
                    text={"Auto accept"}
                    on={checkHandler}
                    checked={isAutoAccept}
                />

                <Text id="label" style={labelStyle}>
                    System is {isAutoAccept ? "enable" : "disable"} now
                </Text>

                <Button text={"Reload status"} on={buttonHandler} />
            </View>
        </Window>
    )
};

export default App