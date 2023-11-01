import * as React from "react";
import { useContext } from "react";
import "@/less/app.less";
import appContext from "@/stores/appContext";
import appStore from "@/stores/appStore";
import Provider from "@/lib/Provider";
import { appRouterSwitch } from "@/routers";

interface Props {
}

const App: React.FC<Props> = () => {

    const {
        locationState: {pathname},
    } = useContext(appContext);

    console.log(appStore);


    return (
        <>
            <Provider store={appStore} context={appContext}>
                {appRouterSwitch(pathname)}
            </Provider>

        </>
    );
};

export default App;
