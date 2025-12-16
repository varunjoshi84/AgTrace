// Smooth scroll utility functions

export const scrollToTop = (behavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: behavior
  });
};

export const scrollToElement = (elementId, behavior = 'smooth') => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: behavior,
      block: 'start'
    });
  }
};

export const scrollToPosition = (top, left = 0, behavior = 'smooth') => {
  window.scrollTo({
    top: top,
    left: left,
    behavior: behavior
  });
};