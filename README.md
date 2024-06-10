
# Agama Puppeteer

:warning: This is just an experimental project and a proof of concept!

This is an integration test which uses the [Puppeteer](https://pptr.dev/)
framework.

Currently there is only one simple test which only selects the product to
install and sets the root password.

## Run Test

The test can be started from a Git checkout or from a Live ISO.

### Git

To run the test directly from Git checkout:

```sh
AGAMA_SERVER=https://agama.local ./agama-puppeteer tests/test.js
```

The `AGAMA_SERVER` points to a real running Agama instance. If it is not set
then the `http://localhost` URL is used by default.

At the first run it installs Puppeteer and the dependant NPM packages. You can
install them manually by this command:

```sh
PUPPETEER_SKIP_DOWNLOAD=true npm install --omit=optional
```

### Live ISO

To run the test from Live ISO:

```sh
agama-puppeteer /usr/share/agama/puppeteer/tests/test.js
```

## Options

Additionally you can use the `AGAMA_HEADLESS=false` to open the browser window
and see what the test is actually doing. When runnign the test from the Live ISO
you need to use the X forwarding (`ssh -X` option).

Because the browser is controlled by a script the actions might be too fast to
watch. Use `AGAMA_SLOWMO=50` to add a delay between the actions, the value is
the delay in miliseconds.
