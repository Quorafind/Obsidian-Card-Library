import React, { useContext, useEffect } from 'react';
// import { locationService, userService } from "../services";
import { homeRouterSwitch } from '@/routers';
import appContext from '@/stores/appContext';
import LibraryHeader from "@/components/containers/LibraryHeader";

function Home() {
    const {
        locationState: {pathname},
    } = useContext(appContext);

    return (
        <>
            <section id="page-wrapper" className={`card-library-view`}>
                <LibraryHeader/>
                <main className="content-wrapper">{homeRouterSwitch(pathname)}</main>
            </section>
        </>
    );
}

export default Home;
