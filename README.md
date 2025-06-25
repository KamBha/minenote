# Minenote
This project is an exploration of the functionality of [Milanote](https://www.milanote.com). It is NOT meant as an alternative to Milanote, but as a fun side project that I can use to show off my web development skills and explore some interesting libraries.

## Development
To run locally:-
```
npm run dev
```

To run tests:-
```
npm run test
```

Note that there are two different strategies for testing in this project. Any test suffixed with .browser.test will employ an actual browser. These tests are necessary as drag and drop is not adequately supported in JSDOM and there are browser specific bugs related to drag and drop that rely on a real browser. However, I try to limit these tests as much as possible as they are slow to run, hard to debug and prone to breaking for no good reason.
