# Search Router

Per the upstream repo's words :

> DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables all of DuckDuckGo's bangs to work, but much faster.

This fork is an attempt to improve the project for my personnal use by implementing some of the good ideas provided in the project's PRs, and adding some things I would consider useful.

> [!WARNING]
> I will probably delete this fork when the original code is updated with most of these new features, I do not plan on maintaining this !

```
https://unduck.link?q=%s
```

## How is it that much faster?

DuckDuckGo does their redirects server side. Their DNS is...not always great. Result is that it often takes ages.

I solved this by doing all of the work client side. Once you've went to https://unduck.link once, the JS is all cache'd and will never need to be downloaded again. Your device does the redirects, not me.

## Getting Started

To start the project, follow these steps:

1.  Install the dependencies using pnpm:

    ```bash
    pnpm install
    ```

2.  Start the development server:

    ```bash
    pnpm run dev
    ```

    This will start the development server and open the project in your browser.

Now add this url as your search engine alias :

```
http://localhost:5173?q=%s
```

## Running locally via Docker

Build and run via docker compose

```sh
docker compose up
```

Or without compose

```sh
# build
docker build -t unduck:latest -f docker/Dockerfile .

# run
docker run --rm -p 80:80 unduck:latest
```

Now add this url as your search engine alias :

```
http://localhost:80?q=%s
```
