// @ts-nocheck
'use client'

const projectId = "qyxlvb5uz3"

import { useEffect } from 'react';
export default function MicrosoftClarity() {
    useEffect(() => {
        // Your Microsoft Clarity code goes here
        // This code will only execute in the browser
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", projectId);
    }, []);

    return null; // This component doesn't render any visible UI
} 
