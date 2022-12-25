---
title: 'Building a Scheduled Auto Deletion script'
excerpt: 'How I decluttered my gmail by creating an addon that would schedule emails to be deleted or archived after some period of time (depending on the rules that we create)'
date: '2022-01-18T12:15:00-0800Z'
---

My email inbox is a mess. Especially these days. Even when I unsubscribe ruthlessly, I accumulate tonnes of emails that just stick around. Amazon confirmation emails, 2fac emails, etc etc all add up and clutter up my inbox. Those emails are important so I don't want them to unsubscribe to them, but I would like to get rid of them after some time. Sometimes, even the subject is enough, but I'm too lazy to actually delete them.

So I decided to build a Gmail plugin that would help me with this problem. My requirements was pretty simple - Allow me to easily configure a way to delete some particular types of emails after some period of time.

Google provides [AppScript](https://developers.google.com/apps-script) as an easy way to built automation around its products. I've briefly looked into it in the past (I built a email-calendar [plugin](https://github.com/heyitsaamir/sbp-booking-to-calendar) for my rock climbing gym appointments when you had to book slots during core-pandemic), so it was the natural choice. My previous experience was an extremely simple script, but here I needed to build some sort of UI to interact with my inbox as well.

AppScript has a concept of add-ons which show up on the right hand side of its apps. The addons are a convenient way to developers to have context on what's being displayed in Gmail and use that to interface with their apps.

# Rough plan

Here's the rough plan for me building this thing out.

1. Figure out how to get some sort of UI showing - This UI will help me mark a message type and select after how long I want it to be deleted (or archived)
2. Save all this information in a database
   - Bonus: How do you link a database with an add on?
3. Schedule some way for all the new threads that come along to be removed once they have been in the system for more than the allowed period
4. Have the UI also show me all the current rules, and also allow me to remove those rules.

# Just get something showing

I created a new add-on and wanted to get some sort of UI showing. Luckily, app-script docs are awesome, and they include code-snippets. There's one for building some UI [here](https://developers.google.com/apps-script/add-ons/gmail/extending-message-ui). Throwing that in my appscript and after having some trouble installing the add-on, I was pleasantly surprised to see it rendering some controls when I accessed via a Gmail message

![Just something showing up!](/assets/blog/2022-01-08-auto-cleanup/JustSomething.png)

Hurray! Now we're cooking. We have some context from the message that's opened, and also some way to perform actions. Sweeet. The code looks something like:

```jsx
function loadAddOn(event) {
  var accessToken = event.gmail.accessToken
  var messageId = event.gmail.messageId
  GmailApp.setCurrentMessageAccessToken(accessToken)
  var mailMessage = GmailApp.getMessageById(messageId)
  var from = mailMessage.getFrom()

  var openDocButton = CardService.newTextButton()
    .setText('open docs')
    .setOpenLink(
      CardService.newOpenLink().setUrl(
        'https://developers.google.com/gmail/add-ons/'
      )
    )

  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('My First Gmail Addon'))
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText('The email is from: ' + from)
        )
        .addWidget(openDocButton)
    )
    .build()

  return [card]
}
```

It uses a framework using cards using a service called [CardService](https://developers.google.com/apps-script/reference/card-service/card-service?hl=en). Glancing at the API, it seems to have major UI components for our goals.

# Database

The next problem we have is that we want to store rules for messages that we want to trash or archive somewhere. This database is going to keep a record of all the rules, and also potentially be used as a way to keep track of all the threads that get scheduled for action.

Doing a quick search lead me to [JDBC](https://developers.google.com/apps-script/guides/jdbc) which is a compliance for database types (databases include mysql, cloud sql etc). However, it is not free to use this service for free in app-scripts:

> [Google Cloud SQL](https://developers.google.com/sql) lets you create relational databases that live
> in Google's cloud. Note that, unlike Apps Script,
> [Cloud SQL is not free](https://developers.google.com/sql/pricing).

I obviously don't want to spend any money on this side project. My next thought was to just use a Google sheet as a database. I don't especially care about speed, and google sheets are easy to access and modify if needed. Appscript has a [Google Sheets api](https://developers.google.com/apps-script/reference/spreadsheet?hl=en). The main problem with google sheets is that it has has a cumbersome API that isn't really meant to be used a database, but we can work around it for our simple app.

I was thinking having two sheets, one for the rules (this will be set by the addon that we create), and one for all the scheduled deletions and archiving (this will be set by the scheduled task that will use the rules that were created).

For the `Metadata` sheet, we will have the following columns:

- Sender - the sender of the thread
- Matcher - the regex matcher that will match against the subject
- Take Action After - the time after the thread comes in to take the action (like 1 day, or 3 days, or a week)
- Action Type - Trash or Archive

For the `Pending Action` sheet, we will have the following columns:

- Thread Id - the id of the thread
- Action Time - the time after which the action should be taken (this will be set by the scheduler)
- Action Type - Trash or Archive

The db creation code looked something like this:

```jsx
const DB_NAME = 'AutoDelete-DB'
const METATDATA_SHEET = 'Metadata'
const PENDING_ACTIONS = 'Pending Actions'

function getDb() {
  var existingSheet = DriveApp.getFilesByName(DB_NAME)
  if (!existingSheet.hasNext()) {
    return null
  }

  const spreadSheet = SpreadsheetApp.open(existingSheet.next())
  return {
    metadataSheet: spreadSheet.getSheetByName(METATDATA_SHEET),
    pendingDeletionSheets: spreadSheet.getSheetByName(PENDING_DELETIONS),
  }
}

function getOrCreateDb() {
  var existingDb = getDb()
  if (existingDb == null) {
    var existingSheet = DriveApp.getFilesByName(DB_NAME)
    var newSpreadsheet = SpreadsheetApp.create(DB_NAME)
    var metadataSheet = newSpreadsheet.getSheets()[0]
    metadataSheet.setName(METATDATA_SHEET)
    metadataSheet.appendRow([
      'Sender',
      'Matcher',
      'Take Action After',
      'Action Type',
    ])

    var pendingActionsSheets = newSpreadsheet.insertSheet(PENDING_ACTIONS)
    pendingActionsSheets.appendRow(['Thread Id', 'Action Time', 'Action Type'])

    return {
      metadataSheet,
      pendingActionsSheets,
    }
  } else {
    return existingDb
  }
}
```

It feels like building a database :). I guess databases are just rows and columns at the end of the day.

# Building the Add-On

With the above framework, it was fairly simply to put together a simple addon. Here is what it ended up looking:

<video width="694" height="400" controls>
  <source
    src="/assets/blog/2022-01-08-auto-cleanup/ScreenRecording.mov"
    type="video/mp4"
  />
</video>

Using cards, I built a basic form that takes the current mail that's opened with some other options for how long the action should be taken after and the type of action, and appends a new row into the Metadata sheet of the database.

I also kept having to go back to the sheet to make sure everything was working as expected so I also built a simple card that would read all the rows of the sheet and show it as a separate card.

# Scheduled task

Once the metadata was set, it was time to actually use it and schedule some deletions and archiving for the mail that matched. Luckily, this is a first class citizen for app-script. You can simply create the functions that you want to run regularly.

I created two scheduled tasks for my purpose. I find that have multiple simple tasks with very clear goals is easier to manage than one main task that try to do too much. In this case, it was totally possible for me to combine the tasks into 1 task.

![Scheduled Tasks](/assets/blog/2022-01-08-auto-cleanup/ScheduledTasks.png)
_The two scheduled tasks. One is to schedule all the deletion / archives. The other is to actually excute the actions_

1. ScheduleForActionTask - This task evaluates the last messages that have come in against the metadata that we've set up. If there are any matches, it appends a row to the Pending Actions sheet with when the action should take place, and tags the thread with a "Scheduled for Deletion" or "Scheduled for Archive" tag. This way if I notice a thread that I don't want removed, I can fix the issue.
2. RemoveAllPendingThreadsTask - This task simply goes through the pending threads task, finds all the rows that are past due and either moves them to trash or archives them.

# That's it!

And that's it! Here are some screenshots of various parts of this project:

![Final Addon](/assets/blog/2022-01-08-auto-cleanup/AddonFinal.png)
_The gmail add on_

![Tagged Mail](/assets/blog/2022-01-08-auto-cleanup/TaggedMail.png)
_The mail is tagged with "Scheduled for Deletion" or "Scheduled for Archive"_

![Logs](/assets/blog/2022-01-08-auto-cleanup/Logs.png)
_The logs that are generated after each run. These are useful for me to debug issues when they arise._