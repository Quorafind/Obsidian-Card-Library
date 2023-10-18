import * as React from "react";
import { Button } from "@/components/ui/button";
import "@/less/app.less";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
}

const App: React.FC<Props> = () => {
    return (
        <>
            <Button variant={"default"}>Click me</Button>
            <Card size={"fix"}>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <p>Card Footer</p>
                </CardFooter>
            </Card>
        </>
    );
};

export default App;
