import { createGlobalStyle } from 'styled-components'

export const GlobalStyleCustom = createGlobalStyle`
  html {
     display: flex;
    height: 100%;
  }

  body {
    line-height: 1.5;
  }

  body,
  #__next,
  #__laa {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .loader__overlay {
    align-items: center;
    display: flex;
    flex-grow: 1;
    justify-content: center;
    padding: 2rem;
  }
  .loader__box {
    height: 3rem;
    perspective: 600px;
    position: relative;
    transform-style: preserve-3d;
    width: 3rem;
  }
  .loader__arc-first,
  .loader__arc-second,
  .loader__arc-third {
    border-bottom: 2px solid ${p => p.theme.color.primary.default};
    border-radius: 50%;
    content: '';
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
  .loader__arc-first {
    animation: loader__rotate-first 1.15s linear infinite;
    animation-delay: -0.8s;
  }
  .loader__arc-second {
    animation: loader__rotate-second 1.15s linear infinite;
    animation-delay: -0.4s;
  }
  .loader__arc-third {
    animation: loader__rotate-third 1.15s linear infinite;
    animation-delay: 0s;
  }

  @keyframes loader__rotate-first {
    from {
      transform: rotateX(35deg) rotateY(-45deg) rotateZ(0);
    }
    to {
      transform: rotateX(35deg) rotateY(-45deg) rotateZ(1turn);
    }
  }
  @keyframes loader__rotate-second {
    from {
      transform: rotateX(50deg) rotateY(10deg) rotateZ(0);
    }
    to {
      transform: rotateX(50deg) rotateY(10deg) rotateZ(1turn);
    }
  }
  @keyframes loader__rotate-third {
    from {
      transform: rotateX(35deg) rotateY(55deg) rotateZ(0);
    }
    to {
      transform: rotateX(35deg) rotateY(55deg) rotateZ(1turn);
    }
  }
`
