import DirectoryView from "./DirectoryView"
import React from "react"
import {createBrowserRouter , RouterProvider} from "react-router-dom"


const router = createBrowserRouter([
    {
        path :"/*",
        element : <DirectoryView />
    }
]);

export default function App(){
        return <RouterProvider router = {router}/>
    };