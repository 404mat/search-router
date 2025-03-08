# Search Router

Checkout the parent repo to see the original motivations.

This fork is an attempt to improve the project for my personnal use by implementing some of the good ideas provided in the project's PRs, and adding some things I would consider useful.

> [!WARNING]
> I will probably delete this fork when the original code is updated with most of these new features, I do not plan on maintaining this !

```
https://search-router-ten.vercel.app?q=%s
```

## How is it that much faster?

DuckDuckGo does their redirects server side. Their DNS is...not always great. Result is that it often takes ages.

To solve this, once you've went to https://search-router-ten.vercel.app once, the JS is all cache'd and will never need to be downloaded again. Your device does the redirects, not the server.

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
docker build -t searchrouter:latest -f docker/Dockerfile .

# run
docker run --rm -p 80:80 searchrouter:latest
```

Now add this url as your search engine alias :

```
http://localhost:80?q=%s
```
