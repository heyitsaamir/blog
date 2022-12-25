---
title: 'Windowed pagination with Relay'
excerpt: 'How we changed our pagination from infinite scroll to windowed pagination using relay.'
date: '2021-12-11T12:15:00-0800Z'
---

# Windowed Pagination with Relay

Relay-style pagination is a popular option for paginating graphql queries. It differs from offset-style pagination in the sense that it uses cursors to keep track of the start and end of pages as opposed to offsets. This allows you to begin pagination at a particular node as opposed to a particular offset. There are a number of tradeoffs between the two styles of pagination. More details can be found [here](https://dev.to/mandiwise/graphql-pagination-primer-offset-vs-cursor-vs-relay-style-pagination-1a60).

As mentioned in the article above, relay style pagination is uni-directional by design. This means that it's especially apt to infinite-scroll UI, but not so much for classical windowed-style pagination. That's not to say that that's not possible.

## Problem

Our systems were initially built with infinite-scroll, but over time we realized that infinite scroll did not make sense for our systems. Infinite scroll UI is more suitable for data that's changing quickly, and less suitable for tools where you may want to pick-up where you left off, and have the page be bookmarkable. Additionally, we are not a social media app, and we are not optimizing our data for discoverability, but rather for organization (sorting, filtering, etc). For this, we wanted to move toward a window-ed paginated approach.

## New UI

This is what our new UI looks like.

```jsx
1 of 20 of 1000 | 'Prev' < > 'Next'
```

The components we need to get this to work are on top of relay's spec

- total count
- current page offset

Relay-style spec states that the graphql response looks like:

```jsx
fragment MyConnection on Connection {
  edges {
    cursor
    node {
      ...NodeDetails
    }
  }
  pageInfo {
    hasPrevious
    hasNext
    startCursor
    endCursor
  }
}
```

Additionally, `hasPrevious` can be set to `false` if `first` or `after` parameters are set if it's too expensive to calculate. (Inversely, `hasNext` can be set to `false` if `last` or `before` parameters are set if it's too expensive to calculate). Formally, this looks like the following ([verbatim from the spec](https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo.Fields)):

> `hasPreviousPage` is used to indicate whether more edges
> exist prior to the set defined by the clients arguments. If the client
> is paginating with `last`/`before`, then the server must return true if prior edges exist, otherwise false. If the client is paginating with `first`/`after`, then the client may return true if edges prior to `after` exist, if it can do so efficiently, otherwise may return false.

Our existing systems implemented infinite-scroll so the relay pagination and so they only had `hasNext`field implemented. The values for `hasPrevious` was stubbed to `false`since it wasn't used.

## Schema changes

To implement the new style of pagination we'll need to modify our connection schema. Relay spec says that we are allowed to modify the connection schema as long as they have `edges` and `pageInfo`:

> Connection types must have fields named `edges` and `pageInfo`. They may have additional fields related to the connection, as the schema designer sees fit.

Here are the changes we are going to implement to get the desired result:

```jsx
fragment MyConnection on Connection {
  edges {
    cursor
    node {
      ...NodeDetails
    }
  }
  pageInfo {
    hasPrevious
    hasNext
    startCursor
    endCursor
  }
  count
  edgeRange {
    start
    end
  }
}
```

Other options I had considered was adding an `index` field to edges (hard to get this value because it's not trivial to compute)

We are going to add fields `count`which will be the total count of all the nodes in the query, and `offset` which is the count of nodes after the page that's requested. These two fields also allow us to more accurately calculate `hasPrevious` (for forward pagination) and `hasNext` (for backward pagination). Here's how we'll calculate this value:

`hasPrevious` = `offset` > 0

The relay connection code will look something like this:

```tsx
type RelayConnection<Node, Cursor> = {
  edges: Node[];
  pageInfo: {
    startCursor: Cursor | null;
    endCursor: Cursor | null;
    hasNext: boolean;
    hasPrevious: boolean;
  }
  totalCount: number;
  edgeRange?: {
		start: number;
		end: number;
	};
}

const getRelayConnection<Node, Cursor> = async ({
  first,
  after,
  before,
  last
}: args): RelayConnection<Node, Cursor> => {
  // Direction here is 'forward' or 'backward'
	const paginationArgs = getPaginationArgs(after, before, first, last);
  let edges = paginator.edges(paginationArgs);
  const totalCount = paginator.count(paginationArgs);
  const remainingCount = paginator.countRemaining(paginationArgs);

  const { direction } = paginationArgs;

  const hasNext = direction === 'forward' ? remainingCount > edges.length : remainingCount < totalCount;
  const hasPrevious = direction === 'backward' ? remainingCount > edges.length : remainingCount < totalCount;

  const startOfPage = direction === 'forward' ? totalCount - remainingCount : remainingCount - edges.length;
  const endOfPage = (direction === 'forward' ? startOfPage + edges.length : remainingCount) - 1;

  return {
    edges,
    pageInfo: {
      hasNext,
      hasPrevious,
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor
    },
    count: totalCount,
    edgeRange: {
      start: startOfPage,
      end: endOfPage
    },
  }
}
```

[Here](https://infinite-to-windowed-pagination.netlify.app/)'s an example that implements both inifinite scroll pagination and windowed pagination with relay using this method. Source code can be found [here](https://github.com/heyitsaamir/InfiniteToWindowedPagination).
