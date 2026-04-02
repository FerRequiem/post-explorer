import { css } from "lit";

export const resetStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    line-height: 1.5;
    font-family: inherit;
    color: inherit;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
    color: inherit;
    background: transparent;
  }

  button {
    cursor: pointer;
    border: none;
    padding: 0;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  img,
  picture {
    display: block;
    max-width: 100%;
  }

  ul,
  ol {
    list-style: none;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
`;
