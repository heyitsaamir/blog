---
title: 'Building an OAuth flow using a popup'
excerpt: 'How I built an oauth flow with less intrusion using a popup instead of in-window flow'
date: '2022-01-09T12:15:00-0800Z'
---

Recently, we had to build an oauth flow for a Slack App into our company's web app. An oauth flow is a mechanism by which an app can request a user's token to a service such as Slack (or Discord, or other). This allows the app to perform useful actions on behalf of the user. A typical oauth flow looks like this:

1. An app sets an agreement with a service. It tells the service why it wants to use it, and that it's intents are not malicious. It sets the possible scopes that it might want to request from the service. In return, the service awards the app with a specific `AppSecret` (along with a public `AppToken`). Now the service knows that this app may request.
2. When setting this up with the service, you also provide the service with a redirect url that the service redirects to along with a temporary auth code. We use this code later on.
3. On the app's website, or front end, it can create a url to the OAuth entrypoint on the service's website. The url is generally built using the app's `AppToken` from step 1.
4. Once a user decides they want to enable some specific integration between the app and the service, they may click on this link to begin the OAuth flow. They are taken to the service's OAuth entry point.
5. Usually on this page, they are prompted to log into the service, and grant access to the App requesting a specific number of scopes.
6. Once granted, the service redirects back to the App along with a temporary code (as mentioned in step 2).
7. The app then makes a call to its backend (you don't want to do this part on the front end because it requires the app's secret) with the temporary code.
8. The app now needs to make a call to the service with this temporary code to ask for the actual `oauthToken` for the user. This token is the token that needs to be used to make calls to the service on the user's behalf later on. When making this call, the app also needs to supply the service with the `AppSecret`. The service can now guarantee that this verified app should have the `oauthToken` for this user.
9. The app typically stores this oath token in some secure location (a db, or a secret storage).

As you can imagine, clicking on any url in step 4 temporarily removes a user from your website to take them to the Oauth page on the service's website. This is not a great user experience because

- Your app is unmounted from the browser and remounting the app always incurs some latency.
- If this was on a screen where the user may be working on a form, they may lose all their changes
- It leads to disorientation for the user ("where was I again"?)

To combat this, a typical flow is to pop open a popup to do the oauth flow and then close the popup once the flow is completed. There are a few pieces for this to work:

1. The user clicks on the button / link, and a popup pops up that takes them to the service's oauth entry point page.

   - Note that often the user needs to allow popups for this to work.

   In my React app, this looks something like this:

   ```tsx
   const oauthLink = getOauthLink();
   const openPopup = useCallback(() => {
     if (setupLink == null) {
       return;
     }

     const popup = window.open(
       oauthLink,
       undefined,
       `height=800,width=800,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes`
     );
   }, [onComplete, onDismiss, setupLink]);
   ```

2. Once we make this call, we are going to start listening for a particular event message on the current window. This message will be sent from our popup window to inform this window that the oauth has been completed. That code will look like this:

   ```tsx
   const OAUTH_COMPLETED_MESSAGE = 'OAUTH_COMPLETED_MESSAGE';
   const oauthLink = getOauthLink();
   const openPopup = useCallback(() => {
     if (setupLink == null) {
       return;
     }

     const origin = window.location.origin;

     const popup = window.open(
       oauthLink,
       undefined,
       `height=800,width=800,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes`
     );
     if (popup != null) {
       addEventListener(
         'message',
         (e) => {
           if (e.origin !== origin) {
             // Other websites could send messages too, we don't care about those.
             return;
           }

           if (e.data === OAUTH_COMPLETED_MESSAGE) {
             onComplete();
           }
         },
         false
       );
     }
   }, [onComplete, onDismiss, setupLink]);
   ```

3. After the user accepts the request on the service's website, they are redirected back to the app. We are still on the popup at this point.
4. As part of the redirect url, the temporary code is also returned. Our app is loaded (in the popup) and the call is made to the app's backend to authenticate (with the temporary code), get the oauth code, and save it.
5. Once this call is made, we are going to raise an event on the source of this current window. We are also going to start listening for ack from the original window to let us know that it has received our message. Once the popup gets the ack, it'll close itself.

   ```tsx
   function afterSendingOauthTokenToServer() {
     if (window.opener == null) {
       return;
     }

     window.opener.postMessage(OAUTH_COMPLETED_MESSAGE, '*');
   }
   ```

6. Our original window that was listening for this message is going to refresh the component that might need the oauth token to function.
7. It also raises an ack for the popup.

   ```tsx
   const OAUTH_COMPELTED_MESSAGE_ACK = 'OAUTH_COMPELTED_MESSAGE_ACK';
   const openPopup = useCallback(() => {
   	  ...
       if (popup != null) {
         addEventListener(
           'message',
           (e) => {
   					...
             if (e.data === OAUTH_COMPLETED_MESSAGE) {
               onComplete();

   						e.source?.postMessage(
                 OAUTH_COMPELTED_MESSAGE_ACK
               );
             }
           },
           false
         );
       }
     }, [onComplete, onDismiss, setupLink]);
   ```

8. The popup receives the ack, and closes itself.

   ```tsx
   function afterSendingOauthTokenToServer() {
   	...
   	addEventListener(
         'message',
         (e) => {
           if (e.origin !== origin) {
             return;
           }

           if (e.data === OAUTH_COMPELTED_MESSAGE_ACK) {
             window.close();
           }
         },
         false
       );
   }
   ```

And that's it! The experience is a lot less intrusive and much cleaner!
