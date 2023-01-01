---
title: 'Using Branded types in Typescript'
excerpt: 'Adding additional type-safety to distinguish same data-types'
date: '2023-01-01T00:29:32.431Z'
---

Javascript is inherently not a type-safe language. You don't get compile-time errors when you are doing potentially unsafe operations between incompatible types. Typescript has become a defacto way of improving javascript's shortcomings when it comes to type-safety and has actually made javascript a viable language to build large scale applications.

Let's take an example:

```
const foo = 5;
const bar = 'five';

...

if (foo !== bar) {
	console.log('foo is not bar');
} else {
	console.log('foo is bar');
}
```

With pure javascript, this piece of code compiles, and logs `foo is not bar` as expected. However, in any non trivial piece of code, the compiler should tell us that this operation is moot, and we might be breaking some assumptions. Let's update thie code with typescript:

```
const foo: number = 5;
const bar: string = 'five';

...

if (foo !== bar) {
	^^^^^^^^^^^ "This comparison appears to be unintentional because the types 'number' and 'string' have no overlap."
	console.log('foo is not bar');
} else {
	console.log('foo is bar');
}
```

Here typescript gives us a nice helpful message saying, hey you might be doing something wrong comparing two different types.
But what happens when two variables are of the same data type:

```
function convertToDate(isoDateString: string): Date {
	return new Date(isoString);
}
```

In this example, `convertToDate` takes in an isoString and converts it to a date object. This is an extremely common operation in javascript. Many APIs will return json results with iso dates typed as strings and it's the responsbility of the client to convert the value to a `Date` object if the client needs to use it as a date. The `convertToDate` function here takes _any_ string as an input which can lead to a false sense of security that the code we're writing is unsafe. Take this code for example:

```
const apiDateString: string = '2023-01-01T00:29:32.431Z';

let convertedDate = convertToDate(apiDateString); // okay!

...

const userInputDateString = 'January 1st, 2023';

convertedDate =  convertToDate(poorlyNamedVariable); // type-safe but invalid
```

Here, our code doesn't provide any typesafety that `userInputDateString` is infact an isoDate. It's a `string` so javascript and typescript are both happy. As you can imagine in a large scale application, if a developer is unaware of how `convertToDate` works, they are going to have to dive into the implementation and understand how the code works before calling it.

Is it possible for us to differentiate the types of `apiDateString` and `userInputDateString` such that we get typesfety? This is where brand types come in. A brand type adds another layer of safety to distinguish vales of the same data type. If we modify the above to something like this:

```
function convertToDate(isoDateString: ISODateString): Date {
	return new Date(isoDateString);
}

const apiDateString = '2023-01-01T00:29:32.431Z' as ISODateString;

let convertedDate = convertToDate(apiDateString); // okay!

const userInputDateString = 'January 1st, 2023';

convertedDate = convertToDate(userInputDateString);
                           // ^^^^^^^^^^^^^^^^^^^
                           // Type 'string' is not assignable to type '{ _brand: "ISODateStriong"; }'
```

If we could create completely new type safe data types, the above would give us a compile time error. The `convertToDate` function only accepts `ISODateString` types. If you (or an api) is providing some guarantee that the value being supplied _is_ an `ISODateString` type, then the code will compile. Otherwise, it'll throw a compile-time error. This is in fact possible with typescript. Here is what a generic string `Brand` type looks like:

```
export type BrandedString<TName extends string> = string & { _brand: TName };

export type ISODateString = BrandedString<'ISODateStriong'>;
```

If a variable is assigned to an `ISODateString` type then, it's safe to be sent to `convertToDate`. Ofcourse, you can use [Narrowing and type-predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) to perform validation from a regular string to assert that the string _is_ in fact a branded string.

```
const isISODateString = (input: string): input is ISODateString {
  // Really naiive way to do validation, lol
	return !isNaN((new Date(input)).getTime());
}

if (isISODateString(userInputDateString)) {
	const date = convertToDate(userInputDateString) // okay!
}
```

We use this technique across the codebase at my company. We use it for:

1. entity ids (there is no point in comparing `UserId` and `CompanyId` since they are always a disjoineted set).
2. data that has a unique format for data transmission (like date strings)
3. metrics (weight metrics should never really be compared against spatial metrics)

In fact, as I was building out the [bookmarks](http://www.aamirj.com/bookmarks) page, the API (I use [Raindrop.Io](https://developer.raindrop.io/)) returned a format that resembled fields that contained some of the above types of data. I had to build a type for the json anyway, so my type looks something like this:

```
export type BookmarkId = BrandedNumber<'BookmarkId'>
export type ISODateString = BrandedString<'ISODateString'>;
export type Url = BrandedString<'Url'>;

export interface Bookmark {
	note: string
	_id: BookmarkId
	title: string
	link: Url
	created: ISODate
	lastUpdate: ISODate
}
```

Now we can have additional typesafety with the `created`, `lastUpdate`, `link` and `_id` fields. Here is a typescript [playground](https://www.typescriptlang.org/play?ssl=25&ssc=2&pln=19&pc=1#code/KYDwDg9gTgLgBDAnmYcBCUCGA7AJsXAZRigEtsBzAHgBUA5TAW1VBmDwGc4OTyKA+OAF5uvSnABkcAN5wA+gCMseAFxx6TVAF8A3ACg9oSLATJUASUIB5ACKY2xMuJEYc+ImOoByS7fvBHUghKL359PQAzAFdsAGMYIOw4WOCAN2BYGgg7NgAKUg5s-0DKNV8cgM8ASjUKmT0ASChgGCioJOxgAHc4CvzCipKKKv0tAxTsHjhMMFJBz2E4LwAmAAZlgGYAWlWARh3dmlXVlWWAThUN5YA6ABYN3YAtL2mucuLPcIAbFuS0jLYuDqIgm6UyRTyMzmHycwx0cAA9Ai4BAANaYRAAQnGwSmUQ4GXM2DAURg81hiy8ACkcFFMFBEHBdjwADRwNabLzhUEAgjAuB-bBgmBZPr4wnE0nkvgjPQC+UKxVK5WI5EAPQ1mq12q1cpV+oNSPUZiWPFhLwKcGwEHgmA4HFIFGwmAUPwQEFMKCWskUylwagARO8HLxghQA-CtF4cZN4AVg5UKSJ8pKYGozTK1OQSXG3tZpeJpI1mq12nACgw6Llcp0en0vHbcBFGxEvFUqtcKC0aKRmLl26MDKQInB+gmhrlxVAiTmC8MqvUGhMprh-IseeCxQTp6m5wujWiMditEA) with the above concepts.
